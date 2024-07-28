const elements = document.querySelectorAll("[data-i18n]");

export function initialize18n() {
    elements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        const i18nKey = htmlElement.dataset.i18n;
        if (i18nKey) {
            const message = chrome.i18n.getMessage(i18nKey);
            htmlElement.textContent = message;
        }
    });
}
