document.addEventListener("DOMContentLoaded", function () {
  let elements = document.querySelectorAll("[data-i18n]");

  elements.forEach((element) => {
    let message = chrome.i18n.getMessage(element.dataset.i18n);
    element.textContent = message;
  });

  // Tab functionality
  let tabs = document.querySelectorAll(".tab");
  let contents = document.querySelectorAll(".tabcontent");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      contents.forEach((content) => {
        if (content.id === "content" + tab.id.charAt(tab.id.length - 1)) {
          content.classList.add("active");
        } else {
          content.classList.remove("active");
        }
      });
    });
  });

  // Color choice for Tab 1
  document.getElementById("colorChoice1").addEventListener("input", function () {
    document.getElementById("colorText1").value = this.value;
  });

  document.getElementById("colorText1").addEventListener("input", function () {
    const colorCode = this.value;
    if (/^#[0-9A-F]{6}$/i.test(colorCode)) {
      document.getElementById("colorChoice1").value = colorCode;
    }
  });

  // Color choice for Tab 2
  document.getElementById("colorChoice2").addEventListener("input", function () {
    document.getElementById("colorText2").value = this.value;
  });

  document.getElementById("colorText2").addEventListener("input", function () {
    const colorCode = this.value;
    if (/^#[0-9A-F]{6}$/i.test(colorCode)) {
      document.getElementById("colorChoice2").value = colorCode;
    }
  });

  document.querySelectorAll(".saveButton").forEach(function (button) {
    button.addEventListener("click", function () {
      console.log("SAVING");
      const colorChoice = document.getElementById("colorChoice1").value;
      const layoutChoice = document.getElementById("layoutChoice1").value;
      const textChoice = document.getElementById("textChoice1").value;
      const decimalChoice = document.getElementById("decimalChoice1").value;
      const orderChoice = document.getElementById("orderChoice1").value;

      const colorChoiceTab2 = document.getElementById("colorChoice2").value;
      const layoutChoiceTab2 = document.getElementById("layoutChoice2").value;
      const textChoiceTab2 = document.getElementById("textChoice2").value;
      const decimalChoiceTab2 = document.getElementById("decimalChoice2").value;

      const tab1 = {
        color: colorChoice,
        layout: layoutChoice,
        text: textChoice,
        order: orderChoice,
        decimal: decimalChoice,
      };

      const tab2 = {
        color: colorChoiceTab2,
        layout: layoutChoiceTab2,
        text: textChoiceTab2,
        decimal: decimalChoiceTab2,
      };

      chrome.storage.local.set({ tab1, tab2 }, function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "popupSaved",
            tab1,
            tab2,
          });
        });
      });
    });
  });
  // Load tab 1 data
  chrome.storage.local.get(["tab1"], function (data) {
    let tab1Data = data.tab1;
    if (tab1Data) {
      document.getElementById("colorChoice1").value = tab1Data.color;
      document.getElementById("colorText1").value = tab1Data.color;
      document.getElementById("layoutChoice1").value = tab1Data.layout;
      document.getElementById("textChoice1").value = tab1Data.text;
      document.getElementById("orderChoice1").value = tab1Data.order;
      document.getElementById("decimalChoice1").value = tab1Data.decimal;
    }
  });

  // Load tab 2 data
  chrome.storage.local.get(["tab2"], function (data) {
    let tab2Data = data.tab2;
    if (tab2Data) {
      document.getElementById("colorChoice2").value = tab2Data.color;
      document.getElementById("colorText2").value = tab2Data.color;
      document.getElementById("layoutChoice2").value = tab2Data.layout;
      document.getElementById("textChoice2").value = tab2Data.text;
      document.getElementById("decimalChoice2").value = tab2Data.decimal;
    }
  });
});
