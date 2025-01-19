import { insertScore } from "../../helpers/score";
import { ScoreType } from "../../helpers/types";
import { fetchAnimeScores, isBlacklisted } from "../../services/apiService";
import { RequestType } from "../../services/configService";
import { getStorageAnimeData, saveData } from "../../services/dataService";
import { findAnimeById } from "../../utils/utils";

export abstract class PageHandler {
    constructor() {}

    abstract getTargetElement(): HTMLElement | null;

    abstract getScoreSelector(): string;

    abstract getAnime(): any;

    abstract getScoreType(): ScoreType;

    abstract getContainer(): boolean;

    abstract isPage(url: string): boolean;

    abstract updateScores(request: RequestType): void;

    async handlePage(): Promise<void> {
        const targetElem = this.getTargetElement();
        if (targetElem && !document.querySelector(this.getScoreSelector())) {
            const animesStorage = await getStorageAnimeData();
            const anime = this.getAnime();
            if (anime !== null) {
                const animeScore = findAnimeById(anime, animesStorage);
                if (animeScore) {
                    insertScore(targetElem, animeScore, this.getScoreType());
                } else {
                    if (!isBlacklisted(anime.id)) {
                        const animeFetch = await fetchAnimeScores([anime]);
                        if (animeFetch && animeFetch.length > 0) {
                            insertScore(targetElem, animeFetch[0], this.getScoreType());
                            await saveData(animeFetch);
                        }
                    }
                }
            }
        }
    }
}
