import { AnimeScore } from "../models/model";
import { fetchAndSaveAnimeScores } from "./apiService";

const TIMESTAMP_REFRESH_CACHE = "lastRefreshTime";
const NOT_FOUND_CACHE = "notFoundCache";

export async function refreshNotFoundCache(): Promise<void> {
    const notFoundCache = getNotFoundCache();
    const urls = Object.values(notFoundCache);
    await fetchAndSaveAnimeScores(urls);
    localStorage.setItem(TIMESTAMP_REFRESH_CACHE, Date.now().toString());
}

export function getNotFoundCache(): Record<string, AnimeScore> {
    const notFoundCache = localStorage.getItem(NOT_FOUND_CACHE);
    if (notFoundCache) {
        return JSON.parse(notFoundCache);
    } else {
        return {};
    }
}

export function getTimestampFromLocalStorage(): number {
    const storedValue = localStorage.getItem(TIMESTAMP_REFRESH_CACHE) ?? "";
    return parseInt(storedValue, 10) || 0;
}

export function setNotFoundCache(cacheData: Record<string, AnimeScore>): void {
    localStorage.setItem(NOT_FOUND_CACHE, JSON.stringify(cacheData));
}

export function updateNotFoundCache(fetchedAnime: AnimeScore[]): void {
    let cacheData: Record<string, AnimeScore> = getNotFoundCache();
    fetchedAnime.forEach((anime) => {
        if (anime.id && anime.score && anime.score > 0) {
            delete cacheData[anime.id];
        } else {
            cacheData[anime.id] = anime;
        }
    });
    setNotFoundCache(cacheData);
}
