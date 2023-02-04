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