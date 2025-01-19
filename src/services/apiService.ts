import { BLACKLIST_IDS } from "../constants/blackList";
import { API_URL } from "../constants/constants";
import { Anime, AnimeScore } from "../models/model";
import { updateNotFoundCache } from "./notFoundCacheService";

export function isBlacklisted(animeId: string): boolean {
    return BLACKLIST_IDS.includes(animeId);
}

export async function fetchAnimeScores(crunchyrollList: Anime[]): Promise<AnimeScore[] | null> {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(crunchyrollList),
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}

export async function fetchAndSaveAnimeScores(animes: Anime[]): Promise<AnimeScore[] | null> {
    if (Object.keys(animes).length === 0) {
        return null;
    }
    const crunchyrollList = prepareObjectFetch(animes);
    const animeFetch = await fetchAnimeScores(crunchyrollList);
    if (animeFetch) {
        updateNotFoundCache(animeFetch);
    }
    return animeFetch;
}

export function prepareObjectFetch(animes: Anime[]): any[] {
    const list: any[] = [];
    for (const anime of Object.values(animes)) {
        if (anime.id && !isBlacklisted(anime.id)) {
            list.push({ id: anime.id, seasonTags: null });
        }
    }
    return list;
}
