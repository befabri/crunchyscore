import { handleScoreUpdate, updateScoreByClassName } from "../helpers/score";
import { ScoreType } from "../helpers/types";
import { RequestType, config, updateConfig } from "../services/configService";
import { getStorageAnimeData } from "../services/dataService";
import { refreshNotFoundCache } from "../services/notFoundCacheService";
import { isHTMLElement } from "../utils/utils";
import {
    getCardsFromGridPage,
    handleCardPage,
    insertScoreController,
    isCardsPage,
    isSimulcastPage,
} from "./pages/card";
import { getDetailContainer, handleDetailPage, isDetailPage } from "./pages/detail";
import { getWatchContainer, handleWatchPage, isWatchPage } from "./pages/watch";

updateConfig();

let check = false;
chrome.runtime.onMessage.addListener(function (request: RequestType) {
    try {
        if (
            request.type != "popupSaved" &&
            request.type != "forceRefreshCache" &&
            request.type != "changeProvider"
        ) {
            check = false;
        }
        if (request.type === "forceRefreshCache") {
            (async () => {
                await refreshNotFoundCache();
            })();
        }
        if (request.type === "changeProvider") {
            (async () => {
                await updateConfig();
            })();
            location.reload();
        }
        if (request.type === "popupSaved") {
            const cards = document.querySelectorAll('[data-t="series-card "]');
            cards.forEach((card) => {
                if (isHTMLElement(card)) {
                    handleScoreUpdate(card, request, ScoreType.CARD);
                }
            });
            updateScoreByClassName("score-detail", request, "div.erc-series-hero", ScoreType.DETAIL);
            updateScoreByClassName("score-watch", request, "div.erc-current-media-info", ScoreType.WATCH);
            (async () => {
                await updateConfig();
            })();
            if (request.tab1.order != config.tab1.order) {
                if (request.tab1.order === "order1") {
                    location.reload();
                } else {
                    (async () => {
                        const data = await getStorageAnimeData();
                        await insertScoreController(data);
                    })();
                }
            }
            if (
                request.tab1.decimal != config.tab1.decimal ||
                request.tab2.decimal != config.tab2.decimal ||
                request.tab3.decimal != config.tab3.decimal
            ) {
                location.reload();
            }
        }

        setInterval(function () {
            if (check === false) {
                if (isCardsPage() && Array.from(getCardsFromGridPage()).length > 0) {
                    updateConfig();
                    handleCardPage();
                    check = true;
                }
            }
            if (check === false) {
                if (isDetailPage(location.href) && getDetailContainer()) {
                    updateConfig();
                    handleDetailPage();
                    check = true;
                }
            }
            if (check === false) {
                if (isWatchPage(location.href) && getWatchContainer()) {
                    updateConfig();
                    handleWatchPage();
                    check = true;
                }
            }
        }, 800);
    } catch (error) {
        console.error("Error");
    }
});

let throttleTimeout: number | null = null;

window.addEventListener("scroll", () => {
    if (throttleTimeout === null) {
        throttleTimeout = setTimeout(() => {
            if (isCardsPage() && !isSimulcastPage(location.href)) {
                updateConfig();
                handleCardPage();
            }
            throttleTimeout = null;
        }, 800) as unknown as number;
    }
});
