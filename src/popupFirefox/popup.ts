import "vanilla-colorful";
import { HexColorPicker } from "vanilla-colorful";
import "./popup.css";

type TabConfig = {
    color: string;
    layout: string;
    text: string;
    decimal: string;
    order?: string;
};

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
    const btnWatch = document.getElementById("btnWatch") as HTMLButtonElement;
    const btnBackFromCards = document.getElementById("btnBackFromCards") as HTMLButtonElement;
    const btnBackFromDetail = document.getElementById("btnBackFromDetail") as HTMLButtonElement;
    const btnBackFromWatch = document.getElementById("btnBackFromWatch") as HTMLButtonElement;
    const btnForceRefreshCache = document.getElementById("btnCache") as HTMLButtonElement;
    const main = document.getElementById("main") as HTMLElement;
    const cardsSettings = document.getElementById("cardsSettings") as HTMLElement;
    const detailSettings = document.getElementById("detailSettings") as HTMLElement;
    const watchSettings = document.getElementById("watchSettings") as HTMLElement;
    const colorModal1 = document.getElementById("colorModal1") as HTMLElement;
    const colorModal2 = document.getElementById("colorModal2") as HTMLElement;
    const colorModal3 = document.getElementById("colorModal3") as HTMLElement;
    const colorChoice1 = document.getElementById("colorChoice1") as HexColorPicker;
    const colorChoice2 = document.getElementById("colorChoice2") as HexColorPicker;
    const colorChoice3 = document.getElementById("colorChoice3") as HexColorPicker;
    const colorText1 = document.getElementById("colorText1") as HTMLInputElement;
    const colorText2 = document.getElementById("colorText2") as HTMLInputElement;
    const colorText3 = document.getElementById("colorText3") as HTMLInputElement;
    const colorPreview1 = document.getElementById("colorPreview1") as HTMLElement;
    const colorPreview2 = document.getElementById("colorPreview2") as HTMLElement;
    const colorPreview3 = document.getElementById("colorPreview3") as HTMLElement;
    const spinner = document.getElementById("spinner") as HTMLElement;
    const successIcon = document.getElementById("successIcon") as HTMLElement;
    const buttonTabProviderMal = document.getElementById("provider-myanimelist") as HTMLElement;
    const buttonTabProviderAni = document.getElementById("provider-anilist") as HTMLElement;
    const buttonTabsProvider = [buttonTabProviderMal, buttonTabProviderAni];

    function toggleVisibility(showElement: HTMLElement) {
        const elements = [main, cardsSettings, detailSettings, watchSettings];
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
        tabTitle.innerText = chrome.i18n.getMessage("cardsPageButtonText");
    }

    function showDetailSettings() {
        toggleVisibility(detailSettings);
        tabTitle.innerText = chrome.i18n.getMessage("detailPageButtonText");
    }

    function showWatchSettings() {
        toggleVisibility(watchSettings);
        tabTitle.innerText = chrome.i18n.getMessage("watchPageButtonText");
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
    btnWatch.addEventListener("click", showWatchSettings);
    btnBackFromCards.addEventListener("click", goBack);
    btnBackFromDetail.addEventListener("click", goBack);
    btnBackFromWatch.addEventListener("click", goBack);

    buttonTabsProvider.forEach((providerButton) => {
        providerButton.addEventListener("click", () => {
            const providerId =
                providerButton.id === PROVIDER_IDS.MYANIMELIST ? Provider.MyAnimeList : Provider.AniList;
            setProviderVisualState(providerButton.id);
            changeProvider(providerId);
            if (providerButton.id === PROVIDER_IDS.ANILIST) {
                (document.getElementById("decimalChoice1") as HTMLInputElement).disabled = true;
                (document.getElementById("decimalChoice2") as HTMLInputElement).disabled = true;
                (document.getElementById("decimalChoice3") as HTMLInputElement).disabled = true;
            } else {
                (document.getElementById("decimalChoice1") as HTMLInputElement).disabled = false;
                (document.getElementById("decimalChoice2") as HTMLInputElement).disabled = false;
                (document.getElementById("decimalChoice3") as HTMLInputElement).disabled = false;
            }
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
        if (result.provider === Provider.AniList) {
            (document.getElementById("decimalChoice1") as HTMLInputElement).disabled = true;
            (document.getElementById("decimalChoice2") as HTMLInputElement).disabled = true;
            (document.getElementById("decimalChoice3") as HTMLInputElement).disabled = true;
        }
    });

    function setProviderVisualState(activeProviderId: string) {
        buttonTabsProvider.forEach((button) => {
            const isSelected = button.id === activeProviderId;
            button.setAttribute("aria-selected", String(isSelected));
            button.classList.toggle("bg-white", isSelected);
            button.classList.toggle("bg-gray-200", !isSelected);
        });
    }

    window.onclick = (event) => {
        const previews = [colorChoice1, colorChoice2, colorChoice3];
        const modals = [colorModal1, colorModal2, colorModal3];
        previews.forEach((preview, index) => {
            if (event.target !== preview && !modals[index].classList.contains("hidden")) {
                const modal = modals[index];
                modal.classList.remove("flex");
                modal.classList.add("hidden");
            }
        });
    };

    [colorPreview1, colorPreview2, colorPreview3].forEach((colorPreview: HTMLElement, index: number) => {
        colorPreview.addEventListener("click", () => {
            const modal = document.getElementById(`colorModal${index + 1}`) as HTMLInputElement;
            if (modal) {
                modal.classList.toggle("hidden");
                modal.classList.toggle("flex");
            }
            event?.stopPropagation();
        });
    });

    [colorChoice1, colorChoice2, colorChoice3].forEach((colorChoice: HexColorPicker, index: number) => {
        colorChoice.addEventListener("color-changed", (event) => {
            const detail = (event as CustomEvent).detail;
            (document.getElementById(`colorText${index + 1}`) as HTMLInputElement).value = detail.value;
            (document.getElementById(`colorPreview${index + 1}`) as HTMLInputElement).style.backgroundColor =
                detail.value;
        });
    });

    [colorText1, colorText2, colorText3].forEach((colorText: HTMLInputElement, index: number) => {
        colorText.addEventListener("input", function () {
            const colorCode = this.value;
            if (/^#[0-9A-F]{6}$/i.test(colorCode)) {
                (document.getElementById(`colorChoice${index + 1}`) as HexColorPicker).color = colorCode;
                (document.getElementById(`colorPreview${index + 1}`) as HTMLElement).style.backgroundColor =
                    colorCode;
            }
        });
    });

    document.querySelectorAll(".saveButton").forEach((element: Element) => {
        const button = element as HTMLButtonElement;
        button.addEventListener("click", function () {
            this.disabled = true;
            const colorChoice = (document.getElementById("colorChoice1") as HexColorPicker).color;
            const layoutChoice = (document.getElementById("layoutChoice1") as HTMLInputElement).value;
            const textChoice = (document.getElementById("textChoice1") as HTMLInputElement).value;
            const decimalChoice = (document.getElementById("decimalChoice1") as HTMLInputElement).value;
            const orderChoice = (document.getElementById("orderChoice1") as HTMLInputElement).value;

            const colorChoiceTab2 = (document.getElementById("colorChoice2") as HexColorPicker).color;
            const layoutChoiceTab2 = (document.getElementById("layoutChoice2") as HTMLInputElement).value;
            const textChoiceTab2 = (document.getElementById("textChoice2") as HTMLInputElement).value;
            const decimalChoiceTab2 = (document.getElementById("decimalChoice2") as HTMLInputElement).value;

            const colorChoiceTab3 = (document.getElementById("colorChoice3") as HexColorPicker).color;
            const layoutChoiceTab3 = (document.getElementById("layoutChoice3") as HTMLInputElement).value;
            const textChoiceTab3 = (document.getElementById("textChoice3") as HTMLInputElement).value;
            const decimalChoiceTab3 = (document.getElementById("decimalChoice3") as HTMLInputElement).value;

            const tab1: TabConfig = {
                color: colorChoice,
                layout: layoutChoice,
                text: textChoice,
                order: orderChoice,
                decimal: decimalChoice,
            };

            const tab2: TabConfig = {
                color: colorChoiceTab2,
                layout: layoutChoiceTab2,
                text: textChoiceTab2,
                decimal: decimalChoiceTab2,
            };

            const tab3: TabConfig = {
                color: colorChoiceTab3,
                layout: layoutChoiceTab3,
                text: textChoiceTab3,
                decimal: decimalChoiceTab3,
            };

            chrome.storage.local.set({ tab1, tab2, tab3 }, () => {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
                    if (tabs[0].id !== undefined) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            type: "popupSaved",
                            tab1,
                            tab2,
                            tab3,
                        });
                    }
                });
            });
            setTimeout(() => {
                (this as HTMLButtonElement).disabled = false;
            }, 800);
        });
    });

    ["tab1", "tab2", "tab3"].forEach((tab: string, index: number) => {
        chrome.storage.local.get([tab], (data: { [key: string]: TabConfig }) => {
            let tabData = data[tab];
            if (tabData) {
                (document.getElementById(`colorPreview${index + 1}`) as HTMLElement).style.backgroundColor =
                    tabData.color;
                (document.getElementById(`colorChoice${index + 1}`) as HexColorPicker).color = tabData.color;
                (document.getElementById(`colorText${index + 1}`) as HTMLInputElement).value = tabData.color;
                (document.getElementById(`layoutChoice${index + 1}`) as HTMLInputElement).value = tabData.layout;
                (document.getElementById(`textChoice${index + 1}`) as HTMLInputElement).value = tabData.text;
                (document.getElementById(`decimalChoice${index + 1}`) as HTMLInputElement).value = tabData.decimal;
                if (tabData.hasOwnProperty("order")) {
                    if (tabData.order == undefined) {
                        (document.getElementById(`orderChoice${index + 1}`) as HTMLInputElement).value = "order1";
                    } else {
                        (document.getElementById(`orderChoice${index + 1}`) as HTMLInputElement).value =
                            tabData.order;
                    }
                }
            }
        });
    });
});
