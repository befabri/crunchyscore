export const DataAttributes = {
    ProviderKey: "data-provider-key",
    Id: "data-id",
    ScoreNumber: "data-score-number",
    ScoreText: "data-score-text",
} as const;

export type DataAttributeKeys = keyof typeof DataAttributes;

export const REFRESH_DELAY = 60 * 1000 * 24 * 1;
export const REFRESH_DELAY_CACHE_NOT_FOUND = 60 * 1000 * 2;
export const TIMESTAMP_REFRESH_ANIME_CACHE = "lastRefreshTimeAnime";
export const TIMESTAMP_REFRESH_CACHE = "lastRefreshTime";
export const NOT_FOUND_CACHE = "notFoundCache";
