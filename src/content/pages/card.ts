import { DataAttributes, REFRESH_DELAY, REFRESH_DELAY_CACHE_NOT_FOUND } from "../../constants/constants";
import { handleScoreUpdate, insertScore } from "../../helpers/score";
import { ScoreSelector, ScoreType } from "../../helpers/types";
import { Anime, AnimeScore } from "../../models/model";
import { fetchAndSaveAnimeScores } from "../../services/apiService";
import { config, orderType } from "../../services/configService";
import { getStorageAnimeData, getTimestampAnimeRefresh, refreshAnime, saveData } from "../../services/dataService";
import {
    getNotFoundCache,
    getTimestampNotFoundCache,
    refreshNotFoundCache,
} from "../../services/notFoundCacheService";
import { extractIdFromUrl, findAnimeById, isHTMLElement, isPageTypeByUrl } from "../../utils/utils";
import { PageHandler } from "./page";

type SortableCard = {
    node: Element;
    score: number;
};

export class CardPageHandler extends PageHandler {
    constructor() {
        super();
    }

    getTargetElement(): HTMLElement | null {
        return null;
    }

    getScoreSelector(): string {
        return ScoreSelector.CARD;
    }

    getAnime(): any {
        return null;
    }

    getScoreType(): ScoreType {
        return ScoreType.CARD;
    }

    async handlePage(): Promise<void> {
        const lastRefreshTimeNotFound = getTimestampNotFoundCache();
        if (Date.now() - lastRefreshTimeNotFound >= REFRESH_DELAY_CACHE_NOT_FOUND) {
            await refreshNotFoundCache();
        }
        const lastRefreshTime = getTimestampAnimeRefresh();
        if (Date.now() - lastRefreshTime >= REFRESH_DELAY) {
            await refreshAnime();
        }

        let animesStorage = await getStorageAnimeData();
        const animeNotFound = await this.insertScoreController(animesStorage);
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
                await this.insertScoreController(animesStorage);
            }
        }
    }

    getContainer(): boolean {
        return this.isPage("");
    }

    isPage(_: string): boolean {
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

    isSimulcastPage(url: string): boolean {
        return isPageTypeByUrl(url, "seasons", 2);
    }

    updateScores(request: any): void {
        const cards = this.getCardsFromGridPage();
        cards.forEach((card) => {
            if (isHTMLElement(card)) {
                handleScoreUpdate(card, request, ScoreType.CARD);
            }
        });
    }

    getCardsFromGridPage(): HTMLElement[] {
        return Array.from(
            document.querySelectorAll('[data-t="series-card "]') ||
                document.querySelectorAll(".browse-card--esJdT")
        );
    }

    getAnimeNotInserted(animes: AnimeScore[]): Anime[] {
        const cards = this.getCardsFromGridPage();
        return cards.reduce<Anime[]>((acc, card) => {
            const animeScore = this.getDataFromCard(card, animes);
            if (animeScore) {
                insertScore(card, animeScore, ScoreType.CARD);
            } else {
                const notFoundAnime = this.getSearchFromCard(card);
                if (notFoundAnime && notFoundAnime.id) {
                    acc.push(notFoundAnime);
                }
            }
            return acc;
        }, []);
    }

    async insertScoreController(animes: AnimeScore[], order?: orderType): Promise<Anime[] | null> {
        if (!order) {
            order = config.tab1.order;
        }
        const notFound = this.getAnimeNotInserted(animes);
        if (!this.isSimulcastPage(location.href) || order === "order1") {
            return notFound;
        }
        const parentContainer = document.querySelector(".erc-browse-cards-collection");
        if (parentContainer) {
            this.sortCardsByScore(parentContainer, order as orderType);
        }
        this.replacePreviewWithOriginal("original-image", "1");
        this.replacePreviewWithOriginal("preview-image", "0");
        return notFound;
    }

    private sortCardsByScore(node: Element, order: orderType): void {
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
    }

    private replacePreviewWithOriginal(dataAttr: string, opacity: string) {
        const images = document.querySelectorAll(`img[data-t="${dataAttr}"]`);
        images.forEach(function (image) {
            if (image instanceof HTMLImageElement) {
                image.style.opacity = opacity;
            }
        });
    }

    private getDataFromCard(card: HTMLElement, animes: AnimeScore[]): AnimeScore | undefined {
        const anime = this.getSearchFromCard(card);
        if (!anime) {
            return;
        }
        return findAnimeById(anime, animes);
    }

    private getSearchFromCard(card: HTMLElement): Anime | undefined {
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
}
