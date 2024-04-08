import { PopupSavedMessage, Provider, TabConfig, config } from "../services/configService";
import { isHTMLElement, roundScore } from "../utils/utils";

export enum ScoreType {
    CARD = "card",
    DETAIL = "detail",
}

export function insertScore(spanElement: HTMLElement, score: number, type: ScoreType) {
    if (type !== ScoreType.CARD && type !== ScoreType.DETAIL) {
        return;
    }
    if (score <= 0) {
        return;
    }
    const classSelector = type === ScoreType.CARD ? ".score-card" : ".score-hero";
    let tabConfig: TabConfig;
    switch (type) {
        case ScoreType.CARD:
            tabConfig = config.tab1;
            break;

        case ScoreType.DETAIL:
            tabConfig = config.tab2;
            break;
    }
    if (spanElement.querySelector(classSelector)) {
        return;
    }
    const scoreElement = createScoreElement(score, type, tabConfig, config.provider === Provider.AniList);
    if (type === ScoreType.CARD) {
        insertToLayoutCard(scoreElement, spanElement, tabConfig.layout);
    } else if (type === ScoreType.DETAIL) {
        insertToLayoutHero(scoreElement, spanElement, tabConfig.layout);
    }
}

export function updateScore(
    element: HTMLElement,
    request: PopupSavedMessage,
    type: ScoreType,
    parentElem?: Element | null
) {
    if (type !== ScoreType.CARD && type !== ScoreType.DETAIL) return;

    const tab = type === ScoreType.CARD ? request.tab1 : request.tab2;
    updateElementScore(".score-card", element, tab, type);
    if (parentElem) updateElementScore(".score-hero", parentElem, tab, type, parentElem);
}

function updateElementScore(
    selector: string,
    context: HTMLElement | Element,
    tab: TabConfig,
    type: ScoreType,
    parentElem?: Element
) {
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

    if (type === ScoreType.CARD) {
        insertToLayoutCard(scoreElement, context, tab.layout);
    } else if (type === ScoreType.DETAIL && parentElem) {
        insertToLayoutHero(scoreElement, parentElem, tab.layout);
    }
}

function createScoreElement(
    score: number,
    type: ScoreType,
    tabConfig: TabConfig,
    isAnilist: boolean
): HTMLElement {
    const scoreElement = document.createElement("span");
    const scoreNumber = roundScore(score, tabConfig.decimal);
    scoreElement.textContent = ` ${tabConfig.text} ${scoreNumber}${isAnilist ? "%" : ""}`;
    scoreElement.style.color = tabConfig.color;
    scoreElement.classList.add(type === ScoreType.CARD ? "score-card" : "score-hero");
    scoreElement.setAttribute("data-textscore", tabConfig.text);
    scoreElement.setAttribute("data-numberscore", scoreNumber.toString());
    return scoreElement;
}

function insertToLayoutCard(score: Node, targetElement: Element, layout: string): void {
    const h4Element = targetElement.querySelector("h4");
    switch (layout) {
        case "layout1":
            h4Element?.appendChild(score);
            break;
        case "layout2":
            h4Element?.parentNode?.insertBefore(score, h4Element.nextElementSibling);
            break;
        case "layout3":
            targetElement.querySelector('div[data-t="meta-tags"]')?.appendChild(score);
            break;
        case "layout4":
            targetElement.appendChild(score);
            break;
    }
}

function insertToLayoutHero(score: Node, targetElement: Element, layout: string): void {
    const h1Element = targetElement.querySelector("h1");
    const tag = document.querySelector("div.erc-series-tags.tags");
    switch (layout) {
        case "layout1":
            h1Element?.appendChild(score);
            break;
        case "layout2":
            h1Element?.parentNode?.insertBefore(score, h1Element.nextElementSibling);
            break;
        case "layout3":
            tag?.querySelector('div[data-t="meta-tags"]')?.appendChild(score);
            break;
    }
}

export { insertToLayoutCard, insertToLayoutHero, createScoreElement };
