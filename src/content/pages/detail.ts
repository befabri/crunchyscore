import { updateScoreByClassName } from "../../helpers/score";
import { ScoreSelector, ScoreType } from "../../helpers/types";
import { PopupSavedMessage } from "../../services/configService";
import { getAnimeFromCurrentUrl, isPageTypeByUrl } from "../../utils/utils";
import { PageHandler } from "./page";

export class DetailPageHandler extends PageHandler {
    constructor() {
        super();
    }

    getTargetElement(): HTMLElement | null {
        return document.querySelector('div[data-t="series-hero-body"]') as HTMLElement;
    }

    getScoreSelector(): string {
        return ScoreSelector.DETAIL;
    }

    getAnime(): any {
        return getAnimeFromCurrentUrl();
    }

    getScoreType(): ScoreType {
        return ScoreType.DETAIL;
    }

    getContainer(): boolean {
        return (
            !!document.querySelector('div[data-t="series-hero-body"]') &&
            !!document.querySelector('div[data-t="series-hero-container"]') &&
            !document.querySelector("div.erc-series-hero-placeholder")
        );
    }

    isPage(url: string): boolean {
        return isPageTypeByUrl(url, "series", 3);
    }

    updateScores(request: PopupSavedMessage): void {
        updateScoreByClassName("score-detail", request, 'div[data-t="series-hero-body"]', ScoreType.DETAIL);
    }
}
