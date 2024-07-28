import { getElementById } from "./utils";

interface HTMLElements {
    tabTitle: HTMLElement;
    main: HTMLElement;
    pages: {
        cards: HTMLElement;
        detail: HTMLElement;
        watch: HTMLElement;
    };
    buttons: {
        [key: string]: HTMLButtonElement;
    };
}

const elements: HTMLElements = {
    tabTitle: getElementById<HTMLElement>("tabTitle"),
    main: getElementById<HTMLElement>("main"),
    pages: {
        cards: getElementById<HTMLElement>("cardsSettings"),
        detail: getElementById<HTMLElement>("detailSettings"),
        watch: getElementById<HTMLElement>("watchSettings"),
    },
    buttons: {
        btnCards: getElementById<HTMLButtonElement>("btnCards"),
        btnDetail: getElementById<HTMLButtonElement>("btnDetail"),
        btnWatch: getElementById<HTMLButtonElement>("btnWatch"),
        btnBackFromCards: getElementById<HTMLButtonElement>("btnBackFromCards"),
        btnBackFromDetail: getElementById<HTMLButtonElement>("btnBackFromDetail"),
        btnBackFromWatch: getElementById<HTMLButtonElement>("btnBackFromWatch"),
    },
};

const pageTitles = {
    cards: chrome.i18n.getMessage("cardsPageButtonText"),
    detail: chrome.i18n.getMessage("detailPageButtonText"),
    watch: chrome.i18n.getMessage("watchPageButtonText"),
    goBack: chrome.i18n.getMessage("title"),
};

function toggleVisibility(showElement: HTMLElement) {
    Object.values(elements.pages)
        .concat(elements.main)
        .forEach((el) => {
            el.classList.toggle("hidden", el !== showElement);
            el.classList.toggle("flex", el === showElement);
        });
}

function changePage(showElement: HTMLElement, title: string) {
    toggleVisibility(showElement);
    elements.tabTitle.innerText = title;
}

export function initializeNavigation() {
    Object.entries(elements.buttons).forEach(([key, button]) => {
        if (key.startsWith("btnBack")) {
            button.addEventListener("click", () => changePage(elements.main, pageTitles.goBack));
        } else {
            const section = key.replace("btn", "").toLowerCase() as keyof typeof elements.pages;
            button.addEventListener("click", () => changePage(elements.pages[section], pageTitles[section]));
        }
    });
}
