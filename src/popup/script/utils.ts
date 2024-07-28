export function isUrlAllowed(url: string) {
    const allowedPatterns = ["https://*.crunchyroll.com/*"];
    return allowedPatterns.some((pattern) => new RegExp(`^${pattern.replace(/\*/g, ".*")}$`).test(url));
}

export function getElementById<T extends HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
}

export function sendMessageToActiveTab(messageType: string, additionalData?: object): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
        const tabId = tabs[0]?.id;
        const tabUrl = tabs[0]?.url;
        if (tabId && tabUrl && isUrlAllowed(tabUrl)) {
            chrome.tabs.sendMessage(tabId, { type: messageType, ...additionalData });
        }
    });
}

export function isValidHexColor(colorCode: string) {
    return /^#[0-9A-F]{6}$/i.test(colorCode);
}
