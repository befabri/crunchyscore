import { ScoreType, insertScore } from "../../helpers/dom";
import { fetchAnimeScores, isBlacklisted } from "../../services/apiService";
import { Provider, config } from "../../services/configService";
import { getStorageAnimeData, saveData } from "../../services/dataService";
import { findAnimeById, getAnimeFromMetaProperty } from "../../utils/utils";

export async function handleDetailPage(): Promise<void> {
    const targetElem = document.querySelector("div.erc-current-media-info") as HTMLElement;
    if (targetElem && !document.querySelector(".score-hero")) {
        const animesStorage = await getStorageAnimeData();
        const anime = getAnimeFromMetaProperty();
        if (anime !== null) {
            const animeScore = findAnimeById(anime, animesStorage);
            if (animeScore) {
                if (config.provider === Provider.AniList) {
                    insertScore(targetElem, animeScore.anilist_score, ScoreType.DETAIL);
                } else {
                    insertScore(targetElem, animeScore.score, ScoreType.DETAIL);
                }
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
