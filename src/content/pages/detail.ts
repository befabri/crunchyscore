import { insertScore } from "../../helpers/score";
import { ScoreType } from "../../helpers/types";
import { fetchAnimeScores, isBlacklisted } from "../../services/apiService";
import { getStorageAnimeData, saveData } from "../../services/dataService";
import { findAnimeById, getAnimeFromCurrentUrl, isPageTypeByUrl } from "../../utils/utils";

export async function handleDetailPage(): Promise<void> {
    const targetElem = document.querySelector("div.erc-series-hero") as HTMLElement;
    if (targetElem && !document.querySelector(".score-detail")) {
        const animesStorage = await getStorageAnimeData();
        const anime = getAnimeFromCurrentUrl();
        if (anime !== null) {
            const animeScore = findAnimeById(anime, animesStorage);
            if (animeScore) {
                insertScore(targetElem, animeScore, ScoreType.DETAIL);
            } else {
                if (!isBlacklisted(anime.id)) {
                    const animeFetch = await fetchAnimeScores([anime]);
                    if (animeFetch && animeFetch.length > 0) {
                        insertScore(targetElem, animeFetch[0], ScoreType.DETAIL);
                        await saveData(animeFetch);
                    }
                }
            }
        }
    }
}

export function getDetailContainer() {
    return (
        document.querySelector("div.erc-series-hero") &&
        document.querySelector("div.hero-heading-line") &&
        !document.querySelector("div.erc-series-hero-placeholder") &&
        !document.querySelector("div.loading--9nt-6")
    );
}

export function isDetailPage(url: string): boolean {
    return isPageTypeByUrl(url, "series", 3);
}
