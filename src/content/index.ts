import { handleScoreUpdate, updateScoreByClassName } from "../helpers/score";
import { ScoreType } from "../helpers/types";
import { config, RequestType, updateConfig } from "../services/configService";
import { getStorageAnimeData } from "../services/dataService";
import { refreshNotFoundCache } from "../services/notFoundCacheService";
import { isHTMLElement } from "../utils/utils";
import {
    isCardsPage,
    getCardsFromGridPage,
    handleCardPage,
    isSimulcastPage,
    insertScoreController,
} from "./pages/card";
import { isDetailPage, getDetailContainer, handleDetailPage } from "./pages/detail";
import { isWatchPage, getWatchContainer, handleWatchPage } from "./pages/watch";

updateConfig();

let globalObserver: MutationObserver | null = null;

chrome.runtime.onMessage.addListener(function (request: RequestType) {
    try {
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
                        await insertScoreController(data, request.tab1.order);
                    })();
                }
            }
        }

        if (request.type == "changeUrl") {
            let intervalId = setInterval(function () {
                if (
                    isCardsPage() &&
                    Array.from(getCardsFromGridPage()).length > 0 &&
                    isSimulcastPage(location.href)
                ) {
                    updateConfig();
                    handleCardPage();
                    clearInterval(intervalId);
                }
            }, 600);
        }
    } catch (error) {
        console.error("Error SendOnMessage");
    }
});

const targetNode = document.body;
if (!targetNode) {
    console.error("Target node (document.body) not found");
}

const configObserver = { attributes: true, childList: true, subtree: true };

globalObserver = new MutationObserver(async (mutationsList, _) => {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            const node = mutation.addedNodes[0];
            if (
                node instanceof Element &&
                node.tagName.toLowerCase() === "div" &&
                node.className &&
                !["tooltip-content"].includes(node.getAttribute("data-t") || "")
            ) {
                if (
                    !isSimulcastPage(location.href) &&
                    isCardsPage() &&
                    Array.from(getCardsFromGridPage()).length > 0
                ) {
                    await updateConfig();
                    await handleCardPage();
                    return;
                }
                if (isWatchPage(location.href) && getWatchContainer()) {
                    await updateConfig();
                    await handleWatchPage();
                    return;
                }

                if (isDetailPage(location.href) && getDetailContainer()) {
                    await updateConfig();
                    await handleDetailPage();
                    return;
                }
            }
        }
    }
});

globalObserver.observe(targetNode, configObserver);
