import { Anime, AnimeScore } from "../models/model";
import { decimalType } from "../services/configService";

export function isHTMLElement(element: any): element is HTMLElement {
    return element instanceof HTMLElement;
}

export function formatScore(score: number, decimalConfig: decimalType): string {
    switch (decimalConfig) {
        case "decimal1":
            return score.toFixed(2);
        case "decimal2":
            return score.toFixed(1);
        case "decimal3":
            return score.toFixed();
        default:
            return score.toFixed(2);
    }
}

export const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export function extractIdFromUrl(url: string): string | null {
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

export function getAnimeFromCurrentUrl(): Anime | null {
    const url = location.href;
    const id = extractIdFromUrl(url);
    if (!id) {
        return null;
    }
    return { id: id, seasonTags: null };
}

export function getAnimeFromMetaProperty(): Anime | null {
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

export function isPageTypeByUrl(url: string, targetType: string, targetPosition: number): boolean {
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

export function returnHref(children: HTMLCollection): string {
    return Array.from(children)
        .map((child) => (child as HTMLAnchorElement).href)
        .sort()
        .join("|");
}

export function getLastPartUrl(url: string): string {
    const parts = url.split("/");
    return parts[parts.length - 1].replace(/-/g, " ");
}
