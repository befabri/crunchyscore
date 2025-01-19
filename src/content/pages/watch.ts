import { updateScoreByClassName } from "../../helpers/score";
import { ScoreSelector, ScoreType } from "../../helpers/types";
import { PopupSavedMessage } from "../../services/configService";
import { getAnimeFromMetaProperty, isPageTypeByUrl } from "../../utils/utils";
import { PageHandler } from "./page";

export class WatchPageHandler extends PageHandler {
    constructor() {
        super();
    }

    getTargetElement(): HTMLElement | null {
        return document.querySelector("div.erc-current-media-info") as HTMLElement;
    }

    getScoreSelector(): string {
        return ScoreSelector.WATCH;
    }

    getAnime(): any {
        return getAnimeFromMetaProperty();
    }

    getScoreType(): ScoreType {
        return ScoreType.WATCH;
    }

    getContainer(): boolean {
        return (
            !!document.querySelector("div.erc-current-media-info") &&
            !document.querySelector("div.erc-watch-hero-placeholder")
        );
    }

    isPage(url: string): boolean {
        return isPageTypeByUrl(url, "watch", 3);
    }

    updateScores(request: PopupSavedMessage): void {
        updateScoreByClassName("score-watch", request, "div.erc-current-media-info", ScoreType.WATCH);
    }
}
