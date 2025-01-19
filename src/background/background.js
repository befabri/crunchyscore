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
                    iconProvider: false,
                },
                tab2: {
                    color: "#ffffff",
                    layout: "layout4",
                    text: "",
                    decimal: "decimal1",
                    iconProvider: true,
                },
                tab3: {
                    color: "#ffffff",
                    layout: "layout1",
                    text: "",
                    decimal: "decimal1",
                    iconProvider: true,
                },
            };
            chrome.storage.local.set(defaultData);
        }
    });
});
