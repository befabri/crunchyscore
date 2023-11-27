import { AnimeScore } from "../models/model";

export async function saveData(animeFetch: AnimeScore[]): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.get(["datas"], function (result) {
            let animeData: AnimeScore[] = result.datas || [];
            animeFetch.forEach((anime) => {
                if (anime && !animeData.some((a) => a && a.id === anime.id) && anime.score) {
                    animeData.push(anime);
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
