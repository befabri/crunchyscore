import { insertToLayoutHero, insertToLayoutCard } from "../helpers/dom";
import { config, updateConfig } from "../services/configService";
import { getStorageAnimeData } from "../services/dataService";
import { refreshNotFoundCache } from "../services/notFoundCacheService";
import { roundScore, isVideoPage, isSimulcastPage, isHTMLElement } from "../utils/utils";
import { getCardsFromVideoPage, handleCardPage, insertScoreController } from "./pages/card";
import { handleDetailPage } from "./pages/detail";

updateConfig();

let check = false;
chrome.runtime.onMessage.addListener(function (request) {
    if (request.type != "popupSaved" && request.type != "forceRefreshCache") {
        check = false;
    }
    if (request.type === "forceRefreshCache") {
        refreshNotFoundCache();
    }
    if (request.type === "popupSaved") {
        const cards = document.querySelectorAll('[data-t="series-card "]');
        cards.forEach((card) => {
            let scoreCard = card.querySelector(".score-card");
            console.log("ca work ou pas ? Y");
            if (isHTMLElement(scoreCard)) {
                console.log("YYYYYYYYYYYYYYYYYYYY");
                scoreCard.style.color = request.tab1.color;
                let numberScoreAttr = scoreCard.getAttribute("data-numberscore");
                if (numberScoreAttr !== null) {
                    const numberScore = parseFloat(numberScoreAttr);
                    let roundedScore = roundScore(numberScore, request.tab1.decimal);
                    scoreCard.setAttribute("data-textscore", request.tab1.text);
                    scoreCard.setAttribute("data-numberscore", roundedScore.toString());
                    scoreCard.textContent = ` ${request.tab1.text} ${roundedScore}`;
                    insertToLayoutCard(scoreCard, card, request.tab1.layout);
                }
            }
        });
        let elements = document.getElementsByClassName("score-hero");
        const parentElem = document.querySelector(".erc-series-hero");
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            if (isHTMLElement(element)) {
                element.style.color = request.tab2.color;
                let numberScoreAttr = element.getAttribute("data-numberscore");
                if (numberScoreAttr !== null) {
                    let numberScore = parseFloat(numberScoreAttr);
                    let roundedScore = roundScore(numberScore, request.tab2.decimal);
                    element.setAttribute("data-textscore", request.tab2.text);
                    element.setAttribute("data-numberscore", `${roundedScore}`);
                    element.textContent = ` ${request.tab2.text} ${roundedScore}`;
                    if (parentElem !== null) {
                        insertToLayoutHero(element, parentElem, request.tab2.layout);
                    }
                }
            }
        }
        if (request.tab1.order != config.tab1.order) {
            updateConfig();
            if (request.tab1.order === "order1") {
                location.reload();
            } else {
                (async () => {
                    let data = await getStorageAnimeData();
                    await insertScoreController(data);
                })();
            }
        }
        if (request.tab1.decimal != config.tab1.decimal || request.tab2.decimal != config.tab2.decimal) {
            updateConfig();
            location.reload();
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
