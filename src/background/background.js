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
                    color: "#ffffff",
                    layout: "layout4",
                    text: "✯",
                    decimal: "decimal1",
                },
                tab3: {
                    color: "#ffffff",
                    layout: "layout1",
                    text: "✯",
                    decimal: "decimal1",
                },
            };
            chrome.storage.local.set(defaultData);
        }
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "complete") {
        chrome.tabs.sendMessage(tabId, { type: "changeUrl", url: changeInfo.url }, function () {
            if (chrome.runtime.lastError) {
                return;
            }
        });
    }
});
