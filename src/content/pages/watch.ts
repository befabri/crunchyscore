import { insertScore } from "../../helpers/score";
import { ScoreType } from "../../helpers/types";
import { fetchAnimeScores, isBlacklisted } from "../../services/apiService";
import { Provider, config } from "../../services/configService";
import { getStorageAnimeData, saveData } from "../../services/dataService";
import { findAnimeById, getAnimeFromMetaProperty, isPageTypeByUrl } from "../../utils/utils";

export async function handleWatchPage(): Promise<void> {
    console.log("watch page");
    const targetElem = document.querySelector("div.erc-current-media-info") as HTMLElement;
    if (targetElem && !document.querySelector(".score-watch")) {
        const animesStorage = await getStorageAnimeData();
        const anime = getAnimeFromMetaProperty();
        if (anime !== null) {
            const animeScore = findAnimeById(anime, animesStorage);
            if (animeScore) {
                if (config.provider === Provider.AniList) {
                    insertScore(targetElem, animeScore.anilist_score, ScoreType.WATCH);
                } else {
                    insertScore(targetElem, animeScore.score, ScoreType.WATCH);
                }
            } else {
                if (!isBlacklisted(anime.id)) {
                    const animeFetch = await fetchAnimeScores([anime]);
                    if (animeFetch && animeFetch.length > 0) {
                        insertScore(targetElem, animeFetch[0].score, ScoreType.WATCH);
                        await saveData(animeFetch);
                    }
                }
            }
        }
    }
}

export function getWatchContainer() {
    return (
        document.querySelector("div.erc-current-media-info") &&
        !document.querySelector("div.erc-watch-hero-placeholder")
    );
}

export function isWatchPage(url: string): boolean {
    return isPageTypeByUrl(url, "watch", 3);
}
