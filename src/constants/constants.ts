export const DataAttributes = {
    ProviderKey: "data-provider-key",
    Id: "data-id",
    ScoreNumber: "data-score-number",
    ScoreText: "data-score-text",
} as const;

export type DataAttributeKeys = keyof typeof DataAttributes;
