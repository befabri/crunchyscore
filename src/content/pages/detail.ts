import { ScoreType, insertScore } from "../../helpers/dom";
import { fetchAnimeScores, isBlacklisted } from "../../services/apiService";
import { getStorageAnimeData, saveData } from "../../services/dataService";
import { findAnimeById, getAnimeFromCurrentUrl } from "../../utils/utils";

export async function handleDetailPage(): Promise<void> {
    const targetElem = document.querySelector("div.hero-heading-line") as HTMLElement;
    if (targetElem && !document.querySelector(".score-hero")) {
        const animesStorage = await getStorageAnimeData();
        const anime = getAnimeFromCurrentUrl();
        if (anime !== null) {
            const animeScore = findAnimeById(anime, animesStorage);
            if (animeScore) {
                insertScore(targetElem, animeScore.score, ScoreType.DETAIL);
            } else {
                if (!isBlacklisted(anime.id)) {
                    const animeFetch = await fetchAnimeScores([anime]);
                    if (animeFetch && animeFetch.length > 0) {
                        insertScore(targetElem, animeFetch[0].score, ScoreType.DETAIL);
                        await saveData(animeFetch);
                    }
                }
            }
        }
    }
}
