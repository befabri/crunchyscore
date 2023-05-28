let oldDecimalChoice = document.getElementById("decimalChoice").value;

document.getElementById("colorChoice").addEventListener("input", function () {
  document.getElementById("colorText").value = this.value;
});

document.getElementById("colorText").addEventListener("input", function () {
  const colorCode = this.value;
  if (/^#[0-9A-F]{6}$/i.test(colorCode)) {
    document.getElementById("colorChoice").value = colorCode;
  }
});

document.getElementById("saveButton").addEventListener("click", function () {
  const colorChoice = document.getElementById("colorChoice").value;
  const layoutChoice = document.getElementById("layoutChoice").value;
  const textChoice = document.getElementById("textChoice").value;
  const decimalChoice = document.getElementById("decimalChoice").value;
  const orderChoice = document.getElementById("orderChoice").value;
  if (decimalChoice !== oldDecimalChoice) {
    oldDecimalChoice = decimalChoice;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.reload(tabs[0].id);
    });
  }
  chrome.storage.local.set(
    {
      color: colorChoice,
      layout: layoutChoice,
      text: textChoice,
      order: orderChoice,
      decimal: decimalChoice,
    },
    function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "colorChanged",
          color: colorChoice,
          layout: layoutChoice,
          text: textChoice,
          order: orderChoice,
          decimal: decimalChoice,
        });
      });
    }
  );
});

chrome.storage.local.get(["color", "layout", "text", "order", "decimal"], function (data) {
  if (data.color) {
    document.getElementById("colorChoice").value = data.color;
    document.getElementById("colorText").value = data.color;
  }
  if (data.layout) {
    document.getElementById("layoutChoice").value = data.layout;
  }
  if (data.text) {
    document.getElementById("textChoice").value = data.text;
  }
  if (data.order) {
    document.getElementById("orderChoice").value = data.order;
  }
  if (data.decimal) {
    document.getElementById("decimalChoice").value = data.decimal;
  }
});
