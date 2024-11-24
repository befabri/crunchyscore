import { DataAttributes } from "../constants/constants";
import { AnimeScore } from "../models/model";
import { PopupSavedMessage, Provider, TabConfig, config, decimalType } from "../services/configService";
import { isHTMLElement, roundScore } from "../utils/utils";
import { removeExistingSeparator } from "./dom";
import { insertToLayout } from "./insertLayout";
import { ScoreSelector, ScoreType } from "./types";

interface ProviderObj {
    name: string;
    baseUrl: string;
    icon: string;
    formatScore: (score: number, text: string, decimal: decimalType) => string;
    getUrl: (id: number) => string;
}

const providers: Record<Provider, ProviderObj> = {
    [Provider.MyAnimeList]: {
        name: "MyAnimeList",
        baseUrl: "https://myanimelist.net/anime/",
        icon: "myanimelist",
        formatScore: (score, text, decimal) => `${text} ${roundScore(score, decimal)}`,
        getUrl: function (id: number) {
            return `${this.baseUrl}${id}`;
        },
    },
    [Provider.AniList]: {
        name: "Anilist",
        baseUrl: "https://anilist.co/anime/",
        icon: "anilist",
        formatScore: (score, text, decimal) => `${text} ${roundScore(score, decimal)}%`,
        getUrl: function (id: number) {
            return `${this.baseUrl}${id}`;
        },
    },
};

export function insertScore(spanElement: HTMLElement, animeScore: AnimeScore, scoreType: ScoreType) {
    if (scoreType !== ScoreType.CARD && scoreType !== ScoreType.DETAIL && scoreType !== ScoreType.WATCH) {
        return;
    }
    const score = config.provider === Provider.AniList ? animeScore.anilist_score : animeScore.score;
    let id = config.provider === Provider.AniList ? animeScore.anilist_id : animeScore.myanimelist_id;
    if (!id) {
        id = 0;
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

    const scoreElement = createHrefScoreElement(score, tabMap[scoreType], config.provider, classSelector, id);
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
    Array.from(elements).forEach((element) => {
        if (isHTMLElement(element)) {
            handleScoreUpdate(parentElem, request, scoreType);
        }
    });
}

export function handleScoreUpdate(
    context: HTMLElement | Element,
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
    const scoreElement = context.querySelector(classSelector);

    if (!isHTMLElement(scoreElement)) return;
    updateHrefScoreElement(scoreElement as HTMLAnchorElement, tabMap[scoreType]);
    removeExistingSeparator(context);
    insertToLayout(scoreElement, context, tabMap[scoreType].layout, scoreType);
}

function createImgIcon(icon: string): HTMLImageElement {
    const imgIcon = document.createElement("img");
    imgIcon.src = chrome.runtime.getURL(`assets/${icon}.svg`);
    imgIcon.alt = icon.toString();
    imgIcon.style.width = "20px";
    imgIcon.style.height = "20px";
    imgIcon.style.display = "inline-block";
    imgIcon.style.verticalAlign = "middle";
    return imgIcon;
}

function createTextSpan(content: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.textContent = content;
    return span;
}

function getProviderUrl(provider: ProviderObj, id: number): string {
    return `${provider.baseUrl}${id}`;
}

function applyCommonStyles(element: HTMLAnchorElement, color: string): void {
    element.style.display = "flex";
    element.style.alignItems = "center";
    element.style.gap = "4px";
    element.style.color = color;
}

function setAnchorAttributes(
    element: HTMLAnchorElement,
    provider: ProviderObj,
    id: number,
    selector: ScoreSelector
): void {
    if (id != 0) {
        element.href = getProviderUrl(provider, id);
        element.target = "_blank";
        element.rel = "noopener noreferrer";
    } else {
        element.removeAttribute("href");
        element.style.cursor = "default";
        element.style.pointerEvents = "none";
    }
    element.classList.add(selector.substring(1));
}

function setDataAttributes(
    element: HTMLAnchorElement,
    providerKey: Provider,
    id: number,
    score: number,
    tabConfig: TabConfig
): void {
    element.setAttribute(DataAttributes.ProviderKey, providerKey.toString());
    element.setAttribute(DataAttributes.Id, id.toString());
    element.setAttribute(DataAttributes.ScoreNumber, score.toString());
    element.setAttribute(DataAttributes.ScoreText, tabConfig.text);
}

function createHrefScoreElement(
    score: number,
    tabConfig: TabConfig,
    providerKey: Provider,
    selector: ScoreSelector,
    id: number
): HTMLAnchorElement {
    const provider = providers[providerKey];
    if (!provider) {
        throw new Error(`Unsupported provider: ${providerKey}`);
    }

    const scoreElement = document.createElement("a");
    applyCommonStyles(scoreElement, tabConfig.color);

    if (tabConfig.iconProvider) {
        const iconElement = createImgIcon(provider.icon);
        scoreElement.appendChild(iconElement);
    }

    const textNode = createTextSpan(` ${provider.formatScore(score, tabConfig.text, tabConfig.decimal)}`);
    scoreElement.appendChild(textNode);

    setAnchorAttributes(scoreElement, provider, id, selector);
    setDataAttributes(scoreElement, providerKey, id, score, tabConfig);

    return scoreElement;
}

function updateHrefScoreElement(scoreElement: HTMLAnchorElement, tabConfig: TabConfig): void {
    const providerStr = scoreElement.getAttribute(DataAttributes.ProviderKey);
    const idStr = scoreElement.getAttribute(DataAttributes.Id);
    const decimalStr = scoreElement.getAttribute(DataAttributes.ScoreNumber);

    if (!providerStr || !idStr || !decimalStr) {
        return;
    }

    const id = parseInt(idStr, 10);
    const score = parseFloat(decimalStr);
    const providerKey = parseInt(providerStr, 10) as Provider;

    const provider = providers[providerKey];
    if (!provider) {
        return;
    }

    const newUrl = provider.getUrl(id);
    if (scoreElement.getAttribute(DataAttributes.Id) !== id.toString()) {
        scoreElement.href = newUrl;
        scoreElement.setAttribute(DataAttributes.Id, id.toString());
    }

    const imageElement = scoreElement.querySelector("img");
    if (imageElement) {
        imageElement.style.display = tabConfig.iconProvider ? "inline-block" : "none";
    } else if (tabConfig.iconProvider) {
        const iconElement = createImgIcon(provider.icon);
        scoreElement.insertBefore(iconElement, scoreElement.firstChild);
    }

    const textSpan = scoreElement.querySelector("span") as HTMLSpanElement | null;
    if (textSpan) {
        textSpan.textContent = ` ${provider.formatScore(score, tabConfig.text, tabConfig.decimal)}`;
    }

    applyCommonStyles(scoreElement, tabConfig.color);
    setDataAttributes(scoreElement, providerKey, id, score, tabConfig);
}
