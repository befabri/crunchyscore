import { Anime, AnimeScore } from "../models/model";

function formatScore(score: number, config: { decimal: string; text: string }): string {
    const roundedScore = roundScore(score, config.decimal);
    return `${config.text} ${roundedScore}`;
}

function isHTMLElement(element: any): element is HTMLElement {
    return element instanceof HTMLElement;
}

function roundScore(score: number, decimalConfig: string): number {
    switch (decimalConfig) {
        case "decimal1":
            return Math.floor(score * 100) / 100;
        case "decimal2":
            return Math.floor(score * 10) / 10;
        case "decimal3":
            return Math.floor(score);
        default:
            return score;
    }
}

export const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

function extractIdFromUrl(url: string): string | null {
    if (!url) {
        return null;
    }
    const urlObj = new URL(url, window.location.origin);
    const pathParts = urlObj.pathname.split("/");
    let idIndex = pathParts[1] === "series" ? 2 : 3;
    return pathParts[idIndex];
}

export function findAnimeById(anime: Anime, animes: AnimeScore[]): AnimeScore | undefined {
    return animes.find((obj) => obj.id === anime.id);
}

function getAnimeFromCurrentUrl(): Anime | null {
    const url = location.href;
    const id = extractIdFromUrl(url);
    if (!id) {
        return null;
    }
    return { id: id, seasonTags: null };
}

function getAnimeFromMetaProperty(): Anime | null {
    const metaElement = document.querySelector('meta[property="video:series"]');
    if (!metaElement) return null;
    const ogUrlContent = metaElement.getAttribute("content");
    if (!ogUrlContent) return null;
    const match = ogUrlContent.match(/\/series\/([^\/]+)/);
    const id = match ? match[1] : null;
    if (!id) {
        return null;
    }
    return { id: id, seasonTags: null };
}

function isDetailPage(url: string): boolean {
    if (!url) {
        return false;
    }
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    return pathParts[pathParts.length - 3] === "watch";
}

function isSimulcastPage(url: string): boolean {
    const segments = url.split("/");
    return segments[segments.length - 2] === "seasons";
}

function isCardsPage(): boolean {
    if (!document.querySelector(".erc-browse-collection.state-loading")) {
        return (
            !!document.querySelector(".browse-card:not(.browse-card-placeholder--6UpIg)") ||
            !!document.querySelector("#content > div > div.app-body-wrapper > div > div > div.erc-genres-header")
        );
    }
    return false;
}

function returnHref(children: HTMLCollection): string {
    return Array.from(children)
        .map((child) => (child as HTMLAnchorElement).href)
        .sort()
        .join("|");
}

function getLastPartUrl(url: string): string {
    const parts = url.split("/");
    return parts[parts.length - 1].replace(/-/g, " ");
}

export {
    roundScore,
    extractIdFromUrl,
    isDetailPage,
    isSimulcastPage,
    isCardsPage,
    returnHref,
    getLastPartUrl,
    formatScore,
    isHTMLElement,
    getAnimeFromCurrentUrl,
    getAnimeFromMetaProperty,
};
