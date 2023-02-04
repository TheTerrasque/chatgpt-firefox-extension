const openaiChatURL = "https://chat.openai.com/backend-api/conversation";
const openaiSessionURL = "https://chat.openai.com/api/auth/session";

browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        if (details.method === "POST" && details.url === openaiChatURL) {
            browser.tabs.sendMessage(details.tabId, { action: "openaiChatRequest" });
        }
    },
    { urls: [openaiChatURL] },
    ["blocking"]
);



browser.webRequest.onCompleted.addListener(
    function (details) {
        if (details.method === "POST" && details.url === openaiChatURL) {
            browser.tabs.sendMessage(details.tabId, { action: "openaiAnswerReceivedComplete", status: details.statusCode });
        }
        if (details.method === "GET" && details.url === openaiSessionURL) {
            if (details.statusCode === 200) {
                browser.tabs.sendMessage(details.tabId, { action: "sessionDataReceived" });
            }
            if (details.statusCode === 403) {
                browser.tabs.sendMessage(details.tabId, { action: "sessionDataError", status: details.statusCode });
            }
        }
    },
    { urls: [openaiChatURL, openaiSessionURL] }
);

browser.webRequest.onResponseStarted.addListener(
    details => {
        if (details.method === "POST" && details.url === openaiChatURL) {
            browser.tabs.sendMessage(details.tabId, { action: "openaiAnswerStarted" });
        }
    },
    { urls: [openaiChatURL] }
);

browser.webRequest.onErrorOccurred.addListener(
    details => {
        if (details.method === "POST" && details.url === openaiChatURL) {
            browser.tabs.sendMessage(details.tabId, { action: "openaiAnswerReceived", status: details.error });
        }
        if (details.method === "GET" && details.url === openaiSessionURL) {
            browser.tabs.sendMessage(details.tabId, { action: "sessionDataError", status: details.error });
        }
    },
    { urls: [openaiChatURL, openaiSessionURL] }
);

function listener(details) {
    let filter = browser.webRequest.filterResponseData(details.requestId);
    let decoder = new TextDecoder("utf-8");
  
    filter.ondata = (event) => {
        console.log(`filter.ondata received ${event.data.byteLength} bytes`);
        let str = decoder.decode(event.data, {stream: true});
        let json = JSON.parse(str);
        browser.tabs.sendMessage(details.tabId, { action: "sessionData", data: json.user });
        filter.write(event.data);
      };
      filter.onstop = (event) => {
        // The extension should always call filter.close() or filter.disconnect()
        // after creating the StreamFilter, otherwise the response is kept alive forever.
        // If processing of the response data is finished, use close. If any remaining
        // response data should be processed by Firefox, use disconnect.
        console.log("filter.onstop", event);
        filter.close();
      };
  
    return {};
  }


browser.webRequest.onBeforeRequest.addListener(listener,
    { urls: [openaiSessionURL] },
    ["blocking"]
);