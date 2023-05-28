chrome.runtime.onInstalled.addListener(function (details) {
  let defaultData = {
    color: "#6AD271",
    layout: "layout1",
    text: "Score:",
    order: "order1",
    decimal: "decimal1",
  };

  chrome.storage.local.set(defaultData);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.tabs.sendMessage(tabId, { url: changeInfo.url }, function () {
      if (chrome.runtime.lastError) {
        return;
      }
    });
  }
});
