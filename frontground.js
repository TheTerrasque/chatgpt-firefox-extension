const defaultIcon = browser.extension.getURL("resources/favicon-32x32.png");
const redIcon = browser.extension.getURL("resources/favicon-32x32-red.png");
const blueIcon = browser.extension.getURL("resources/favicon-32x32-blue.png");
const yellowIcon = browser.extension.getURL("resources/favicon-32x32-yellow.png");

const requestsLogKey = "requestsLog";

let reloadNeeded = false;
let userEmail = "";

function loadRequestList() {
    let data = window.localStorage.getItem(requestsLogKey);
    if (data) {
        var ddata = JSON.parse(data);
        //create date objects
        for (let i = 0; i < ddata.length; i++) {
            ddata[i] = new Date(ddata[i]);
        }
        return ddata;
    }
    return [];
}

function saveRequestList() {
    window.localStorage.setItem(requestsLogKey, JSON.stringify(requestList));
}

let requestList = [];

function frontendReceiver(request, sender, sendResponse) {
    if (request.action === "openaiAnswerReceived") {
        console.log("openaiAnswerReceived");
        setTabIcon(defaultIcon);
    }
    if (request.action === "openaiAnswerStarted") {
        setTabIcon(blueIcon);
        logRequest();
        console.log("openaiAnswerStarted");
    }
    if (request.action === "openaiChatRequest") {
        setTabIcon(yellowIcon);
        console.log("openaiChatRequest");
    }
    if (request.action === "sessionDataReceived") {
        console.log("sessionDataReceived");
    }
    if (request.action === "sessionDataError") {
        console.log("sessionDataError");
        setTabIcon(redIcon);
        reloadNeeded = true;
    }
    if (request.action === "sessionData") {
        console.log("sessionData:", request.data);
        userData = request.data;
    }
    if (request.action === "openaiAnswerReceivedComplete") {
        console.log("openaiAnswerReceivedComplete");
        if (request.status === 403) {
            console.log("Refresh needed");
            reloadNeeded = true;
            setTabIcon(redIcon);
        }
        if (request.status === 429) {
            setTabIcon(redIcon);
            console.log("Too many requests");
        }
        // 403 = refresh needed
        // 429 = too many requests
        if (request.status === 200) {
            console.log("Answer received");
            setTabIcon(defaultIcon);
        }
    }
}
browser.runtime.onMessage.addListener(frontendReceiver);
  
function setTabIcon(icon) {
    //set the favicon to the icon
    // find all link elements with rel="icon"
    var icons = document.querySelectorAll("head link[rel='icon']");

    // loop through the elements and change their href
    for (var i = 0; i < icons.length; i++) {
        icons[i].href = icon;
    }
}

function logRequest() {
    requestList.push(new Date());
    saveRequestList();
}

// get all requests from the last hour
function getRequestsLastHour() {
    const now = new Date();
    const oneHourAgo = now.setHours(now.getHours() - 1);
    let newrequestLog = requestList.filter(request => request > oneHourAgo);

    if (newrequestLog.length != newrequestLog.length) {
        requestList = newrequestLog;
        saveRequestList();
    }

    return newrequestLog.length;
}

// Create a ui element to show the number of requests
function createUIElement() {
    const uiElement = document.createElement("div");
    uiElement.classList.add("bg-gray-50");
    uiElement.classList.add("text-gray-800");
    uiElement.classList.add("border-black/10");
    uiElement.classList.add("dark:bg-gray-800");
    uiElement.classList.add("dark:text-gray-100");
    uiElement.classList.add("dark:border-gray-900/50");
    uiElement.classList.add("ext-ff-chatgpt");

    const uiElementText = document.createElement("span");
    uiElementText.innerHTML = "Requests last hour";
    uiElementText.classList.add("ext-ff-chatgpt-rph-text");
    uiElement.appendChild(uiElementText);

    const uiElementNumber = document.createElement("span");
    uiElementNumber.classList.add("ext-ff-chatgpt-number");
    uiElement.appendChild(uiElementNumber);

    const uiElementMessage = document.createElement("div");
    uiElementMessage.classList.add("ext-ff-chatgpt-message");
    uiElement.appendChild(uiElementMessage);

    return {
        root: uiElement,
        number: uiElementNumber,
        message: uiElementMessage
    }
}

function AddStyleCss() {
    // Create a new link element
    var link = document.createElement("link");

    // Set the link's attributes
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = browser.extension.getURL("resources/style.css");

    // Attach the link to the page's head
    document.head.appendChild(link);
}

window.onload = function () {
    AddStyleCss()
    requestList = loadRequestList();
    const uiElement = createUIElement();
    document.body.appendChild(uiElement.root);

    uiElement.number.innerHTML = getRequestsLastHour();
    setInterval(() => {
        uiElement.number.innerHTML = getRequestsLastHour();
        if (reloadNeeded) {
            uiElement.message.innerHTML = "Refresh needed";
        }
    }, 1000);
}