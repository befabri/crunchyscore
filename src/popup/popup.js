document.addEventListener("DOMContentLoaded", function () {
    let elements = document.querySelectorAll("[data-i18n]");

    elements.forEach((element) => {
        let message = chrome.i18n.getMessage(element.dataset.i18n);
        element.textContent = message;
    });

    const tabTitle = document.getElementById("tabTitle");

    const btnGlobal = document.getElementById("btnGlobal");
    const btnIndividual = document.getElementById("btnIndividual");
    const btnBackFromGlobal = document.getElementById("btnBackFromGlobal");
    const btnBackFromIndividual = document.getElementById("btnBackFromIndividual");
    const home = document.getElementById("home");
    const globalSettings = document.getElementById("globalSettings");
    const individualSettings = document.getElementById("individualSettings");
    const colorChoice1 = document.getElementById("colorChoice1");
    const colorText1 = document.getElementById("colorText1");
    const colorChoice2 = document.getElementById("colorChoice2");
    const colorText2 = document.getElementById("colorText2");

    function showGlobalSettings() {
        home.style.display = "none";
        globalSettings.style.display = "block";
        tabTitle.innerText = chrome.i18n.getMessage("cardDisplaySettingsButton");
    }

    function showIndividualSettings() {
        home.style.display = "none";
        individualSettings.style.display = "block";
        tabTitle.innerText = chrome.i18n.getMessage("individualPageSettingsButton");
    }

    function goBack() {
        home.style.display = "block";
        globalSettings.style.display = "none";
        individualSettings.style.display = "none";
        tabTitle.innerText = chrome.i18n.getMessage("title");
    }

    btnGlobal.addEventListener("click", showGlobalSettings);
    btnIndividual.addEventListener("click", showIndividualSettings);
    btnBackFromGlobal.addEventListener("click", goBack);
    btnBackFromIndividual.addEventListener("click", goBack);

    [colorChoice1, colorChoice2].forEach((colorChoice, index) => {
        colorChoice.addEventListener("input", function () {
            document.getElementById(`colorText${index + 1}`).value = this.value;
        });
    });

    [colorText1, colorText2].forEach((colorText, index) => {
        colorText.addEventListener("input", function () {
            const colorCode = this.value;
            if (/^#[0-9A-F]{6}$/i.test(colorCode)) {
                document.getElementById(`colorChoice${index + 1}`).value = colorCode;
            }
        });
    });

    document.querySelectorAll(".saveButton").forEach((button) => {
        button.addEventListener("click", function () {
            button.disabled = true;
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
            setTimeout(function () {
                button.disabled = false;
            }, 800);
        });
    });
    ["tab1", "tab2"].forEach((tab, index) => {
        chrome.storage.local.get([tab], function (data) {
            let tabData = data[tab];
            if (tabData) {
                document.getElementById(`colorChoice${index + 1}`).value = tabData.color;
                document.getElementById(`colorText${index + 1}`).value = tabData.color;
                document.getElementById(`layoutChoice${index + 1}`).value = tabData.layout;
                document.getElementById(`textChoice${index + 1}`).value = tabData.text;
                document.getElementById(`decimalChoice${index + 1}`).value = tabData.decimal;
            }
            if (tabData.hasOwnProperty("order")) {
                document.getElementById(`orderChoice${index + 1}`).value = tabData.order;
            }
        });
    });
});
