import { PopupSavedMessage, Provider, TabConfig, config } from "../services/configService";
import { isHTMLElement, roundScore } from "../utils/utils";
import { removeExistingSeparator } from "./dom";
import { insertToLayout } from "./insertLayout";
import { ScoreSelector, ScoreType } from "./types";

export function insertScore(spanElement: HTMLElement, score: number, scoreType: ScoreType) {
    if (scoreType !== ScoreType.CARD && scoreType !== ScoreType.DETAIL && scoreType !== ScoreType.WATCH) {
        return;
    }
    if (score <= 0) {
        return;
    }

    const classSelector = ScoreSelector[scoreType.toUpperCase() as keyof typeof ScoreSelector];
    if (spanElement.querySelector(classSelector)) {
        return;
    }

    const tabMap = {
        [ScoreType.CARD]: config.tab1,
        [ScoreType.DETAIL]: config.tab2,
        [ScoreType.WATCH]: config.tab3,
    };

    const scoreElement = createScoreElement(
        score,
        tabMap[scoreType],
        config.provider === Provider.AniList,
        classSelector
    );
    insertToLayout(scoreElement, spanElement, tabMap[scoreType].layout, scoreType);
}

export function updateScoreByClassName(
    className: string,
    request: PopupSavedMessage,
    parentSelector: string,
    scoreType: ScoreType
) {
    const parentElem = document.querySelector(parentSelector);
    if (!parentElem) return;

    const elements = document.getElementsByClassName(className);
    const elementsArray = Array.from(elements);
    for (let element of elementsArray) {
        if (isHTMLElement(element)) {
            handleScoreUpdate(parentElem, request, scoreType);
        }
    }
}

export function handleScoreUpdate(
    element: HTMLElement | Element,
    request: PopupSavedMessage,
    scoreType: ScoreType
) {
    if (scoreType !== ScoreType.CARD && scoreType !== ScoreType.DETAIL && scoreType !== ScoreType.WATCH) {
        return;
    }

    const tabMap = {
        [ScoreType.CARD]: request.tab1,
        [ScoreType.DETAIL]: request.tab2,
        [ScoreType.WATCH]: request.tab3,
    };
    const classSelector = ScoreSelector[scoreType.toUpperCase() as keyof typeof ScoreSelector];
    const scoreElement = updateScoreElement(classSelector, element, tabMap[scoreType]);
    if (!scoreElement) {
        return;
    }
    removeExistingSeparator(element);
    insertToLayout(scoreElement, element, tabMap[scoreType].layout, scoreType);
}

function updateScoreElement(selector: string, context: HTMLElement | Element, tab: TabConfig) {
    const scoreElement = context.querySelector(selector);
    if (!isHTMLElement(scoreElement)) return;

    scoreElement.style.color = tab.color;
    const numberScoreAttr = scoreElement.getAttribute("data-numberscore");
    if (numberScoreAttr === null) return;

    const numberScore = parseFloat(numberScoreAttr);
    const roundedScore = roundScore(numberScore, tab.decimal);
    scoreElement.setAttribute("data-textscore", tab.text);
    scoreElement.setAttribute("data-numberscore", roundedScore.toString());
    const isAnilist = config.provider === Provider.AniList;
    scoreElement.textContent = ` ${tab.text} ${roundedScore}${isAnilist ? "%" : ""}`;
    return scoreElement;
}

function createScoreElement(
    score: number,
    tabConfig: TabConfig,
    isAnilist: boolean,
    selector: ScoreSelector
): HTMLElement {
    const scoreElement = document.createElement("span");
    const scoreNumber = roundScore(score, tabConfig.decimal);
    scoreElement.textContent = ` ${tabConfig.text} ${scoreNumber}${isAnilist ? "%" : ""}`;
    scoreElement.style.color = tabConfig.color;
    scoreElement.classList.add(selector.substring(1));
    scoreElement.setAttribute("data-textscore", tabConfig.text);
    scoreElement.setAttribute("data-numberscore", scoreNumber.toString());
    return scoreElement;
}
