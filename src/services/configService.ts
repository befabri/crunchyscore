export type TabConfig = {
    color: string;
    layout: string;
    text: string;
    decimal: string;
    order?: string;
};

export enum Provider {
    MyAnimeList = 1,
    AniList = 2,
}

type Config = {
    provider: Provider;
    tab1: TabConfig;
    tab2: TabConfig;
};

type StorageData = {
    provider?: Provider;
    tab1?: TabConfig;
    tab2?: TabConfig;
};

export interface PopupSavedMessage {
    type: "popupSaved";
    tab1: TabConfig;
    tab2: TabConfig;
}

interface ForceRefreshCacheMessage {
    type: "forceRefreshCache";
}

interface ChangeProvider {
    type: "changeProvider";
}

export type RequestType = PopupSavedMessage | ForceRefreshCacheMessage | ChangeProvider;

export const defaultConfig: Config = {
    provider: Provider.MyAnimeList,
    tab1: {
        color: "#f47521",
        layout: "layout4",
        text: "Score",
        order: "order1",
        decimal: "decimal1",
    },
    tab2: {
        color: "#a0a0a0",
        layout: "layout3",
        text: "| Score",
        decimal: "decimal2",
    },
};

export let config: Config = defaultConfig;

export function restore(): Promise<StorageData> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["provider", "tab1", "tab2"], function (data: StorageData) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(data);
            }
        });
    });
}

export async function updateConfig(): Promise<void> {
    try {
        const data = await restore();
        config.provider = data.provider !== undefined ? data.provider : defaultConfig.provider;
        config.tab1 = data.tab1 !== undefined ? data.tab1 : defaultConfig.tab1;
        config.tab2 = data.tab2 !== undefined ? data.tab2 : defaultConfig.tab2;
    } catch (error) {
        console.error(error);
    }
}