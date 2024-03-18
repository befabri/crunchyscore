import "./popup.css";

enum Provider {
    MyAnimeList = 1,
    AniList = 2,
}

const PROVIDER_IDS = {
    MYANIMELIST: "provider-myanimelist",
    ANILIST: "provider-anilist",
};

document.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        const i18nKey = htmlElement.dataset.i18n;
        if (i18nKey) {
            const message = chrome.i18n.getMessage(i18nKey);
            htmlElement.textContent = message;
        }
    });

    const tabTitle = document.getElementById("tabTitle") as HTMLElement;
    const btnCards = document.getElementById("btnCards") as HTMLButtonElement;
    const btnDetail = document.getElementById("btnDetail") as HTMLButtonElement;
    const btnBackFromCards = document.getElementById("btnBackFromCards") as HTMLButtonElement;
    const btnBackFromDetail = document.getElementById("btnBackFromDetail") as HTMLButtonElement;
    const btnForceRefreshCache = document.getElementById("btnCache") as HTMLButtonElement;
    const main = document.getElementById("main") as HTMLElement;
    const cardsSettings = document.getElementById("cardsSettings") as HTMLElement;
    const detailSettings = document.getElementById("detailSettings") as HTMLElement;
    const colorChoice1 = document.getElementById("colorChoice1") as HTMLInputElement;
    const colorText1 = document.getElementById("colorText1") as HTMLInputElement;
    const colorChoice2 = document.getElementById("colorChoice2") as HTMLInputElement;
    const colorText2 = document.getElementById("colorText2") as HTMLInputElement;
    const spinner = document.getElementById("spinner") as HTMLElement;
    const successIcon = document.getElementById("successIcon") as HTMLElement;
    const buttonTabProviderMal = document.getElementById("provider-myanimelist") as HTMLElement;
    const buttonTabProviderAni = document.getElementById("provider-anilist") as HTMLElement;
    const buttonTabsProvider = [buttonTabProviderMal, buttonTabProviderAni];

    function toggleVisibility(showElement: HTMLElement) {
        const elements = [main, cardsSettings, detailSettings];
        elements.forEach((el) => {
            el.classList.add("hidden");
            el.classList.remove("flex");
        });
        if (showElement) {
            showElement.classList.remove("hidden");
            showElement.classList.add("flex");
        }
    }

    function showCardsSettings() {
        toggleVisibility(cardsSettings);
        tabTitle.innerText = chrome.i18n.getMessage("cardDisplaySettingsButton");
    }

    function showDetailSettings() {
        toggleVisibility(detailSettings);
        tabTitle.innerText = chrome.i18n.getMessage("detailPageSettingsButton");
    }
    function goBack() {
        toggleVisibility(main);
        tabTitle.innerText = chrome.i18n.getMessage("title");
    }

    function forceRefreshCache(): void {
        btnForceRefreshCache.disabled = true;
        spinner.style.display = "";
        successIcon.style.display = "none";
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
            if (tabs[0].id !== undefined) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "forceRefreshCache",
                });
            }
        });
        setTimeout(() => {
            spinner.style.display = "none";
            successIcon.style.display = "";
            setTimeout(() => {
                btnForceRefreshCache.disabled = false;
                successIcon.style.display = "none";
            }, 2000);
        }, 1600);
    }

    btnForceRefreshCache.addEventListener("click", forceRefreshCache);
    btnCards.addEventListener("click", showCardsSettings);
    btnDetail.addEventListener("click", showDetailSettings);
    btnBackFromCards.addEventListener("click", goBack);
    btnBackFromDetail.addEventListener("click", goBack);

    buttonTabsProvider.forEach((providerButton) => {
        providerButton.addEventListener("click", () => {
            const providerId =
                providerButton.id === PROVIDER_IDS.MYANIMELIST ? Provider.MyAnimeList : Provider.AniList;
            setProviderVisualState(providerButton.id);
            changeProvider(providerId);
        });
    });

    function changeProvider(providerId: Provider): void {
        chrome.storage.local.set({ provider: providerId }, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
                const tabId = tabs[0]?.id;
                if (tabId !== undefined) {
                    chrome.tabs.sendMessage(tabId, { type: "changeProvider" });
                }
            });
        });
    }

    chrome.storage.local.get(["provider"], (result) => {
        const initialProviderId =
            result.provider === Provider.AniList ? PROVIDER_IDS.ANILIST : PROVIDER_IDS.MYANIMELIST;
        setProviderVisualState(initialProviderId);
    });

    function setProviderVisualState(activeProviderId: string) {
        buttonTabsProvider.forEach((button) => {
            const isSelected = button.id === activeProviderId;
            button.setAttribute("aria-selected", String(isSelected));
            button.classList.toggle("bg-white", isSelected);
            button.classList.toggle("bg-gray-200", !isSelected);
        });
    }

    [colorChoice1, colorChoice2].forEach((colorChoice: HTMLInputElement, index: number) => {
        colorChoice.addEventListener("input", function () {
            (document.getElementById(`colorText${index + 1}`) as HTMLInputElement).value = this.value;
        });
    });

    [colorText1, colorText2].forEach((colorText: HTMLInputElement, index: number) => {
        colorText.addEventListener("input", function () {
            const colorCode = this.value;
            if (/^#[0-9A-F]{6}$/i.test(colorCode)) {
                (document.getElementById(`colorChoice${index + 1}`) as HTMLInputElement).value = colorCode;
            }
        });
    });

    document.querySelectorAll(".saveButton").forEach((element: Element) => {
        const button = element as HTMLButtonElement;
        button.addEventListener("click", function () {
            this.disabled = true;
            const colorChoice = (document.getElementById("colorChoice1") as HTMLInputElement).value;
            const layoutChoice = (document.getElementById("layoutChoice1") as HTMLInputElement).value;
            const textChoice = (document.getElementById("textChoice1") as HTMLInputElement).value;
            const decimalChoice = (document.getElementById("decimalChoice1") as HTMLInputElement).value;
            const orderChoice = (document.getElementById("orderChoice1") as HTMLInputElement).value;

            const colorChoiceTab2 = (document.getElementById("colorChoice2") as HTMLInputElement).value;
            const layoutChoiceTab2 = (document.getElementById("layoutChoice2") as HTMLInputElement).value;
            const textChoiceTab2 = (document.getElementById("textChoice2") as HTMLInputElement).value;
            const decimalChoiceTab2 = (document.getElementById("decimalChoice2") as HTMLInputElement).value;

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

            chrome.storage.local.set({ tab1, tab2 }, () => {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
                    if (tabs[0].id !== undefined) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            type: "popupSaved",
                            tab1,
                            tab2,
                        });
                    }
                });
            });
            setTimeout(() => {
                (this as HTMLButtonElement).disabled = false;
            }, 800);
        });
    });

    ["tab1", "tab2"].forEach((tab: string, index: number) => {
        chrome.storage.local.get([tab], (data: { [key: string]: any }) => {
            let tabData = data[tab];
            if (tabData) {
                (document.getElementById(`colorChoice${index + 1}`) as HTMLInputElement).value = tabData.color;
                (document.getElementById(`colorText${index + 1}`) as HTMLInputElement).value = tabData.color;
                (document.getElementById(`layoutChoice${index + 1}`) as HTMLInputElement).value = tabData.layout;
                (document.getElementById(`textChoice${index + 1}`) as HTMLInputElement).value = tabData.text;
                (document.getElementById(`decimalChoice${index + 1}`) as HTMLInputElement).value = tabData.decimal;
                if (tabData.hasOwnProperty("order")) {
                    (document.getElementById(`orderChoice${index + 1}`) as HTMLInputElement).value = tabData.order;
                }
            }
        });
    });
});
