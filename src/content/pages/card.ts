import { DataAttributes } from "../../constants/constants";
import { insertScore } from "../../helpers/score";
import { ScoreSelector, ScoreType } from "../../helpers/types";
import { Anime, AnimeScore } from "../../models/model";
import { fetchAndSaveAnimeScores } from "../../services/apiService";
import { config } from "../../services/configService";
import { getStorageAnimeData, getTimestampAnimeRefresh, refreshAnime, saveData } from "../../services/dataService";
import {
    getNotFoundCache,
    getTimestampNotFoundCache,
    refreshNotFoundCache,
} from "../../services/notFoundCacheService";
import { extractIdFromUrl, findAnimeById, isPageTypeByUrl, returnHref } from "../../utils/utils";

type SortableCard = {
    node: Element;
    score: number;
};

const REFRESH_DELAY = 60 * 1000 * 24 * 3;
const REFRESH_DELAY_CACHE_NOT_FOUND = 60 * 1000 * 2;
let pastURL = location.href;
let parentContainer: Element | null;
let parentClonedContainer: Element | null;

export async function handleCardPage() {
    const lastRefreshTimeNotFound = getTimestampNotFoundCache();
    if (Date.now() - lastRefreshTimeNotFound >= REFRESH_DELAY_CACHE_NOT_FOUND) {
        await refreshNotFoundCache();
    }
    const lastRefreshTime = getTimestampAnimeRefresh();
    if (Date.now() - lastRefreshTime >= REFRESH_DELAY) {
        await refreshAnime();
    }
    let animesStorage = await getStorageAnimeData();
    const animeNotFound = await insertScoreController(animesStorage);
    if (!animeNotFound) {
        return;
    }
    const notFoundCache = getNotFoundCache();
    const animes = animeNotFound.filter((anime) => !notFoundCache[anime.id]);
    if (animes.length > 0) {
        const animeFetch = await fetchAndSaveAnimeScores(animes);
        if (animeFetch) {
            await saveData(animeFetch.filter((anime) => anime.score !== 0));
            animesStorage = await getStorageAnimeData();
            await insertScoreController(animesStorage);
        }
    }
}

export async function insertScoreController(animes: AnimeScore[], order?: string): Promise<Anime[] | null> {
    if (!order) {
        order = config.tab1.order;
    }
    if (isSimulcastPage(location.href) && pastURL !== location.href && parentContainer && parentClonedContainer) {
        const parentHref = returnHref(parentContainer.children);
        if (!parentHref || parentHref === returnHref(parentClonedContainer.children)) {
            location.reload();
            return null;
        }
        if (parentClonedContainer.childElementCount !== 0 && parentContainer.childElementCount !== 0) {
            parentClonedContainer.parentNode?.replaceChild(parentContainer, parentClonedContainer);
        }
    }

    const cards = Array.from(getCardsFromGridPage());
    const notFound: Anime[] = cards.reduce<Anime[]>((acc, card) => {
        const cardElement = card as HTMLElement;
        const animeScore = getDataFromCard(cardElement, animes);
        if (animeScore) {
            insertScore(cardElement, animeScore, ScoreType.CARD);
        } else {
            const notFoundAnime = getSearchFromCard(cardElement);
            if (notFoundAnime && notFoundAnime.id) {
                acc.push(notFoundAnime);
            }
        }
        return acc;
    }, []);
    if (!isSimulcastPage(location.href) || order === "order1") {
        pastURL = location.href;
        return notFound;
    }
    const sortChildren = (node: Element) => {
        const sorted = Array.from(node.children)
            .map((card: Element): SortableCard => {
                const scoreElement = card.querySelector(ScoreSelector.CARD);
                return {
                    node: card,
                    score: scoreElement
                        ? parseFloat(scoreElement.getAttribute(DataAttributes.ScoreNumber) || "0")
                        : 0,
                };
            })
            .sort((a: SortableCard, b: SortableCard) =>
                order === "order2" ? a.score - b.score : b.score - a.score
            );

        sorted.forEach(({ node: childNode }) => node.appendChild(childNode));
    };
    parentContainer = document.querySelector(".erc-browse-cards-collection");
    parentClonedContainer = parentContainer ? (parentContainer.cloneNode(true) as Element) : null;
    const unwantedChildren = parentClonedContainer?.querySelectorAll(
        ".browse-card-placeholder--6UpIg.browse-card, .browse-card-placeholder--6UpIg.browse-card.hidden-mobile"
    );
    unwantedChildren?.forEach((child) => child.parentNode?.removeChild(child));
    if (parentClonedContainer) {
        sortChildren(parentClonedContainer);
        if (parentClonedContainer.childElementCount !== 0 && parentContainer) {
            parentContainer.parentNode?.replaceChild(parentClonedContainer, parentContainer);
        }
    }
    const originalImages = document.querySelectorAll('img[data-t="original-image"]');
    originalImages.forEach(function (originalImage) {
        if (originalImage instanceof HTMLImageElement) {
            originalImage.style.opacity = "1";
        }
    });

    const previewImages = document.querySelectorAll('img[data-t="preview-image"]');
    previewImages.forEach(function (previewImage) {
        if (previewImage instanceof HTMLImageElement) {
            previewImage.style.opacity = "0";
        }
    });

    pastURL = location.href;
    return notFound;
}

export function getDataFromCard(card: HTMLElement, animes: AnimeScore[]): AnimeScore | undefined {
    const anime = getSearchFromCard(card);
    if (!anime) {
        return;
    }
    return findAnimeById(anime, animes);
}

export function getSearchFromCard(card: HTMLElement): Anime | undefined {
    const anchorElement = card.querySelector('a[tabindex="0"]');
    if (!anchorElement) {
        return;
    }
    const href = anchorElement.getAttribute("href");
    if (!href) {
        return;
    }
    const id = extractIdFromUrl(href);
    if (!id) {
        return;
    }
    return { id: id, seasonTags: null };
}

export function getCardsFromGridPage() {
    return (
        document.querySelectorAll('[data-t="series-card "]') || document.querySelectorAll(".browse-card--esJdT")
    );
}

export function isCardsPage(): boolean {
    if (!document.querySelector(".erc-browse-collection.state-loading")) {
        return (
            !!document.querySelector(".browse-card:not(.browse-card-placeholder--6UpIg)") ||
            !!document.querySelector(
                "#content > div > div.app-body-wrapper > div > div > div.erc-genres-header"
            ) ||
            !!document.querySelector(
                ".carousel-scroller__card--4Lrk-:not(.vertical-cards-carousel-placeholder__card--vAZNO)"
            )
        );
    }
    return false;
}

export function isSimulcastPage(url: string): boolean {
    return isPageTypeByUrl(url, "seasons", 2);
}
