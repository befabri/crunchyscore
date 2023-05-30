chrome.runtime.onInstalled.addListener(function (details) {
  let defaultData = {
    colorTab1: "#6AD271",
    layoutTab1: "layout1",
    textTab1: "Score:",
    orderTab1: "order1",
    decimalTab1: "decimal1",
    colorTab2: "#6AD271",
    layoutTab2: "layout1",
    textTab2: "Score:",
    decimalTab2: "decimal1",
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
