chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get(["tab1", "tab2", "tab3"], function (result) {
        if (Object.keys(result).length === 0) {
            let defaultData = {
                tab1: {
                    color: "#f47521",
                    layout: "layout4",
                    text: "Score",
                    order: "order1",
                    decimal: "decimal1",
                },
                tab2: {
                    color: "#a0a0a0",
                    layout: "layout3",
                    text: "| Score",
                    decimal: "decimal2",
                },
                tab3: {
                    color: "#a0a0a0",
                    layout: "layout3",
                    text: "-",
                    decimal: "decimal2",
                },
            };
            chrome.storage.local.set(defaultData);
        }
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "complete") {
        chrome.tabs.sendMessage(tabId, { url: changeInfo.url }, function () {
            if (chrome.runtime.lastError) {
                return;
            }
        });
    }
});
