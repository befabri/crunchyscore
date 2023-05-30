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

  document.getElementById("saveButton1").addEventListener("click", function () {
    const colorChoice = document.getElementById("colorChoice1").value;
    const layoutChoice = document.getElementById("layoutChoice1").value;
    const textChoice = document.getElementById("textChoice1").value;
    const decimalChoice = document.getElementById("decimalChoice1").value;
    const orderChoice = document.getElementById("orderChoice1").value;

    // Save tab 1 data to storage
    chrome.storage.local.set({
      colorTab1: colorChoice,
      layoutTab1: layoutChoice,
      textTab1: textChoice,
      orderTab1: orderChoice,
      decimalTab1: decimalChoice,
    });
  });

  document.getElementById("saveButton2").addEventListener("click", function () {
    const colorChoice = document.getElementById("colorChoice2").value;
    const layoutChoice = document.getElementById("layoutChoice2").value;
    const textChoice = document.getElementById("textChoice2").value;
    const decimalChoice = document.getElementById("decimalChoice2").value;

    // Save tab 2 data to storage
    chrome.storage.local.set({
      colorTab2: colorChoice,
      layoutTab2: layoutChoice,
      textTab2: textChoice,
      decimalTab2: decimalChoice,
    });
  });

  // Load tab 1 data
  chrome.storage.local.get(["colorTab1", "layoutTab1", "textTab1", "orderTab1", "decimalTab1"], function (data) {
    if (data.colorTab1) {
      document.getElementById("colorChoice1").value = data.colorTab1;
      document.getElementById("colorText1").value = data.colorTab1;
    }
    if (data.layoutTab1) {
      document.getElementById("layoutChoice1").value = data.layoutTab1;
    }
    if (data.textTab1) {
      document.getElementById("textChoice1").value = data.textTab1;
    }
    if (data.orderTab1) {
      document.getElementById("orderChoice1").value = data.orderTab1;
    }
    if (data.decimalTab1) {
      document.getElementById("decimalChoice1").value = data.decimalTab1;
    }
  });

  // Load tab 2 data
  chrome.storage.local.get(["colorTab2", "layoutTab2", "textTab2", "decimalTab2"], function (data) {
    if (data.colorTab2) {
      document.getElementById("colorChoice2").value = data.colorTab2;
      document.getElementById("colorText2").value = data.colorTab2;
    }
    if (data.layoutTab2) {
      document.getElementById("layoutChoice2").value = data.layoutTab2;
    }
    if (data.textTab2) {
      document.getElementById("textChoice2").value = data.textTab2;
    }
    if (data.decimalTab2) {
      document.getElementById("decimalChoice2").value = data.decimalTab2;
    }
  });
});
