import { HexColorPicker } from "vanilla-colorful";
import { getElementById, sendMessageToActiveTab } from "./utils";

interface TabData {
    color: string;
    layout: string;
    text: string;
    decimal: string;
    order?: string;
    iconProvider: boolean;
}

interface ConfigData {
    [key: string]: TabData;
}

function generateTabConfig(browser: "Chrome" | "Firefox", indices: number[]): ConfigData {
    return indices.reduce((settings, index) => {
        settings[`tab${index}`] = {
            color:
                browser === "Firefox"
                    ? getElementById<HexColorPicker>(`colorChoice${index}`).color
                    : getElementById<HTMLInputElement>(`colorChoice${index}`).value,
            iconProvider: getElementById<HTMLInputElement>(`showIconCheckbox${index}`).checked,
            layout: getElementById<HTMLInputElement>(`layoutChoice${index}`).value,
            text: getElementById<HTMLInputElement>(`textChoice${index}`).value,
            decimal: getElementById<HTMLInputElement>(`decimalChoice${index}`).value,
            order: index === 1 ? getElementById<HTMLInputElement>(`orderChoice${index}`).value : undefined,
        };
        return settings;
    }, {} as ConfigData);
}

function saveTabSettings(this: HTMLButtonElement, browser: "Chrome" | "Firefox"): void {
    this.disabled = true;
    const tabConfig = generateTabConfig(browser, [1, 2, 3]);
    chrome.storage.local.set(tabConfig, () => {
        sendMessageToActiveTab("popupSaved", tabConfig);
    });

    setTimeout(() => {
        this.disabled = false;
    }, 800);
}

function loadTabSettings(browser: "Chrome" | "Firefox"): void {
    ["tab1", "tab2", "tab3"].forEach((tabId: string, index: number) => {
        chrome.storage.local.get([tabId], (data: { [key: string]: TabData }) => {
            let tabData = data[tabId];
            if (tabData) {
                if (browser === "Firefox") {
                    getElementById<HTMLElement>(`colorPreview${index + 1}`).style.backgroundColor = tabData.color;
                    getElementById<HexColorPicker>(`colorChoice${index + 1}`).color = tabData.color;
                } else {
                    getElementById<HTMLInputElement>(`colorChoice${index + 1}`).value = tabData.color;
                }
                getElementById<HTMLInputElement>(`showIconCheckbox${index + 1}`).checked = tabData.iconProvider;
                getElementById<HTMLInputElement>(`colorText${index + 1}`).value = tabData.color;
                getElementById<HTMLInputElement>(`layoutChoice${index + 1}`).value = tabData.layout;
                getElementById<HTMLInputElement>(`textChoice${index + 1}`).value = tabData.text;
                getElementById<HTMLInputElement>(`decimalChoice${index + 1}`).value = tabData.decimal;
                if (tabData.hasOwnProperty("order")) {
                    if (tabData.order && tabData.order != undefined) {
                        getElementById<HTMLInputElement>(`orderChoice${index + 1}`).value = tabData.order;
                    }
                }
            }
        });
    });
}

function initializeSaveManager(browser: "Chrome" | "Firefox"): void {
    document.querySelectorAll(".saveButton").forEach((element) => {
        const button = element as HTMLButtonElement;
        button.addEventListener("click", saveTabSettings.bind(button, browser));
    });
}

export function loadTabSettingsChrome(): void {
    loadTabSettings("Chrome");
}

export function initializeSaveManagerChrome(): void {
    initializeSaveManager("Chrome");
}

export function loadTabSettingsFirefox(): void {
    loadTabSettings("Firefox");
}

export function initializeSaveManagerFirefox(): void {
    initializeSaveManager("Firefox");
}
