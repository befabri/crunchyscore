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

function isPageTypeByUrl(url: string, targetType: string, targetPosition: number): boolean {
    if (!url) {
        return false;
    }
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/");
        return pathParts[pathParts.length - targetPosition] === targetType;
    } catch (error) {
        console.error("Invalid URL:", url);
        return false;
    }
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
    returnHref,
    getLastPartUrl,
    formatScore,
    isHTMLElement,
    getAnimeFromCurrentUrl,
    getAnimeFromMetaProperty,
    isPageTypeByUrl,
};
