import { Anime, AnimeScore } from "../models/model";
import { fetchAndSaveAnimeScores } from "./apiService";

const TIMESTAMP_REFRESH_ANIME_CACHE = "lastRefreshTimeAnime";

export async function saveData(animeFetch: AnimeScore[]): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.get(["datas"], function (result) {
            let animeData: AnimeScore[] = result.datas || [];
            animeFetch.forEach((anime) => {
                if (anime && typeof anime.score === "number" && typeof anime.anilist_score === "number") {
                    const existingAnimeIndex = animeData.findIndex((a) => a && a.id === anime.id);
                    if (existingAnimeIndex !== -1) {
                        if (anime.score !== 0) {
                            animeData[existingAnimeIndex] = anime;
                        }
                    } else if (anime.score) {
                        animeData.push(anime);
                    }
                }
            });
            chrome.storage.local.set({ datas: animeData }, function () {
                resolve();
            });
        });
    });
}

export async function getStorageAnimeData(): Promise<AnimeScore[]> {
    return new Promise((resolve) => {
        chrome.storage.local.get(["datas"], (result) => {
            const animes: AnimeScore[] = result.datas || [];
            resolve(animes);
        });
    });
}

export async function refreshAnime(): Promise<void> {
    const animesScore = await getStorageAnimeData();
    const animes: Anime[] = animesScore.map((animeScore) => {
        return {
            id: animeScore.id,
        };
    });
    const animeFetch = await fetchAndSaveAnimeScores(animes);
    if (animeFetch) {
        await saveData(animeFetch.filter((anime) => anime.score !== 0));
    }
    localStorage.setItem(TIMESTAMP_REFRESH_ANIME_CACHE, Date.now().toString());
}

export function getTimestampAnimeRefresh(): number {
    const storedValue = localStorage.getItem(TIMESTAMP_REFRESH_ANIME_CACHE) ?? "";
    return parseInt(storedValue, 10) || 0;
}
