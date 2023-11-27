import { updateScore, ScoreType } from "../helpers/dom";
import { RequestType, config, reloadPageAndUpdateConfig, updateConfig } from "../services/configService";
import { getStorageAnimeData } from "../services/dataService";
import { refreshNotFoundCache } from "../services/notFoundCacheService";
import { isVideoPage, isSimulcastPage, isHTMLElement } from "../utils/utils";
import { getCardsFromVideoPage, handleCardPage, insertScoreController } from "./pages/card";
import { handleDetailPage } from "./pages/detail";

updateConfig();

let check = false;
chrome.runtime.onMessage.addListener(function (request: RequestType) {
    if (request.type != "popupSaved" && request.type != "forceRefreshCache") {
        check = false;
    }
    if (request.type === "forceRefreshCache") {
        refreshNotFoundCache();
    }
    if (request.type === "popupSaved") {
        const cards = document.querySelectorAll('[data-t="series-card "]');
        cards.forEach((card) => {
            if (isHTMLElement(card)) {
                updateScore(card, request, ScoreType.CARD);
            }
        });
        let elements = document.getElementsByClassName("score-hero");
        const parentElem = document.querySelector(".erc-series-hero");
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            if (isHTMLElement(element)) {
                updateScore(element, request, ScoreType.DETAIL, parentElem);
            }
        }
        if (request.tab1.order != config.tab1.order) {
            if (request.tab1.order === "order1") {
                reloadPageAndUpdateConfig();
            } else {
                (async () => {
                    const data = await getStorageAnimeData();
                    await insertScoreController(data);
                })();
            }
        }
        if (request.tab1.decimal != config.tab1.decimal || request.tab2.decimal != config.tab2.decimal) {
            reloadPageAndUpdateConfig();
        }
        updateConfig();
    }

    setInterval(function () {
        if (check === false) {
            if (isVideoPage() && Array.from(getCardsFromVideoPage()).length > 0) {
                updateConfig();
                handleCardPage();
                check = true;
            }
        }
        if (document.querySelector(".star-rating__reviews-link--lkG9- span") && check === false) {
            updateConfig();
            handleDetailPage();
            check = true;
        }
    }, 800);
});

let throttleTimeout: number | null = null;

window.addEventListener("scroll", () => {
    if (throttleTimeout === null) {
        throttleTimeout = setTimeout(() => {
            if (isVideoPage() && !isSimulcastPage(location.href)) {
                updateConfig();
                handleCardPage();
            }
            throttleTimeout = null;
        }, 800) as unknown as number;
    }
});
