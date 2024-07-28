import { getElementById, sendMessageToActiveTab } from "./utils";

export enum Provider {
    MyAnimeList = 1,
    AniList = 2,
}

export const PROVIDER_IDS = {
    [Provider.MyAnimeList]: "provider-myanimelist",
    [Provider.AniList]: "provider-anilist",
};

const buttonTabsProvider = Object.values(PROVIDER_IDS).map((id) => document.getElementById(id) as HTMLElement);
const decimalChoices = ["decimalChoice1", "decimalChoice2", "decimalChoice3"].map(
    getElementById<HTMLInputElement>
);

function setProviderVisualState(activeProviderId: string) {
    buttonTabsProvider.forEach((button) => {
        const isSelected = button.id === activeProviderId;
        button.setAttribute("aria-selected", String(isSelected));
        button.classList.toggle("bg-white", isSelected);
        button.classList.toggle("bg-gray-200", !isSelected);
    });
    updateDecimalChoices(activeProviderId === PROVIDER_IDS[Provider.AniList]);
}

function updateDecimalChoices(disable: boolean) {
    decimalChoices.forEach((input) => (input.disabled = disable));
}

function storeAndSendMessageTab(providerId: Provider): void {
    chrome.storage.local.set({ provider: providerId }, () => {
        sendMessageToActiveTab("changeProvider");
    });
}

export function initializeProvider() {
    chrome.storage.local.get(["provider"], ({ provider }) => {
        const initialProviderId =
            provider === Provider.AniList ? PROVIDER_IDS[Provider.AniList] : PROVIDER_IDS[Provider.MyAnimeList];
        setProviderVisualState(initialProviderId);
    });

    buttonTabsProvider.forEach((providerButton) => {
        providerButton.addEventListener("click", () => {
            const providerId =
                providerButton.id === PROVIDER_IDS[Provider.MyAnimeList] ? Provider.MyAnimeList : Provider.AniList;
            if (providerButton.getAttribute("aria-selected") === "false") {
                setProviderVisualState(providerButton.id);
                storeAndSendMessageTab(providerId);
            }
        });
    });
}
