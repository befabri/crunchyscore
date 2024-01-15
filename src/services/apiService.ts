import { Anime, AnimeScore } from "../models/model";
import { updateNotFoundCache } from "./notFoundCacheService";

const BASE_URL = "https://api.crunchyscore.app/api/crunchyroll/score";
const BLACKLIST_IDS: string[] = [
    "GY1XXXPQY",
    "G6EXH7VKM",
    "G6190VXEY",
    "GR19JEWQ6",
    "GREX5KEXY",
    "GR24X90E6",
    "GR19MD406",
    "G6NQK7Z36",
    "G3KHEV0Q1",
    "G6JQ1Q8WR",
    "G24H1NWV7",
    "G6WE4W0N6",
    "GDKHZENQ0",
    "GYWE2G8JY",
    "G6JQ14Q2R",
    "GR1XP20GR",
    "G65PV1NE6",
    "G24H1N898",
    "G8DHV7D17",
    "GRVNE7N4Y",
    "GZJH3DXQD",
    "GR09G930R",
    "GRQW4DPPR",
    "G69PV5EVY",
    "GRWEQ4ZNR",
    "G6NQV80X6",
    "GYP5E27KY",
    "G6X03JPMY",
    "GEXH3WGNX",
    "GY49P88ER",
    "GYK5X214R",
    "GYVD2XZXY",
];

export function isBlacklisted(animeId: string): boolean {
    return BLACKLIST_IDS.includes(animeId);
}

export async function fetchAnimeScores(crunchyrollList: Anime[]): Promise<AnimeScore[] | null> {
    try {
        const response = await fetch(BASE_URL, {
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
