import { DEBOUNCE_DURATION } from "../constants/constants";
import { config, RequestType, updateConfig } from "../services/configService";
import { getStorageAnimeData } from "../services/dataService";
import { refreshNotFoundCache } from "../services/notFoundCacheService";
import { CardPageHandler } from "./pages/card";
import { DetailPageHandler } from "./pages/detail";
import { WatchPageHandler } from "./pages/watch";

updateConfig();

const detailPage = new DetailPageHandler();
const watchPage = new WatchPageHandler();
const cardPage = new CardPageHandler();
const pageHandlers = [cardPage, detailPage, watchPage];

let globalObserver: MutationObserver | null = null;
let debounceTimeout: number;
let isHandlingPage = false;

chrome.runtime.onMessage.addListener(function (request: RequestType) {
    try {
        switch (request.type) {
            case "forceRefreshCache":
                (async () => {
                    await refreshNotFoundCache();
                })();
                break;
            case "changeProvider":
                (async () => {
                    await updateConfig();
                })();
                location.reload();
                break;
            case "popupSaved":
                for (const handler of pageHandlers) {
                    handler.updateScores(request);
                }
                (async () => {
                    await updateConfig();
                })();
                if (request.tab1.order != config.tab1.order) {
                    if (request.tab1.order === "order1") {
                        location.reload();
                    } else {
                        (async () => {
                            const data = await getStorageAnimeData();
                            await cardPage.insertScoreController(data, request.tab1.order);
                        })();
                    }
                }
                break;
            default:
                break;
        }
    } catch (error) {
        console.error("Error SendOnMessage");
    }
});

const targetNode = document.body;
if (!targetNode) {
    console.error("Target node (document.body) not found");
}

async function debounceCallback() {
    for (const handler of pageHandlers) {
        if (handler.isPage(location.href) && handler.getContainer()) {
            isHandlingPage = true;
            await updateConfig();
            await handler.handlePage();
            isHandlingPage = false;
        }
    }
}

const configObserver = { attributes: true, childList: true, subtree: true };
globalObserver = new MutationObserver(async (mutationsList, _) => {
    let debounce = false;
    for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0 && !isHandlingPage) {
            const node = mutation.addedNodes[0];
            if (
                node instanceof Element &&
                node.tagName.toLowerCase() === "div" &&
                node.className &&
                !["tooltip-content"].includes(node.getAttribute("data-t") || "")
            ) {
                const mutationTarget = mutation.target instanceof Element ? mutation.target : null;
                const conditions = [
                    () => mutationTarget && mutationTarget.matches("div.erc-browse-cards-collection"),
                    () => node.matches("div.erc-browse-collection"),
                    () => node.matches("div.erc-browse-new"),
                    () => node.matches("div.erc-genres-collection"),
                    () => mutationTarget && mutationTarget.matches("div.erc-genres-collection"),
                    () => node.classList.contains("erc-watch-episode"),
                    () =>
                        mutationTarget &&
                        mutationTarget.getAttribute("data-t")?.endsWith("series-hero-background"),
                ];
                for (const condition of conditions) {
                    if (condition()) {
                        debounce = true;
                        break;
                    }
                }
            }
        }
    }
    if (debounce) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(debounceCallback, DEBOUNCE_DURATION);
    }
});

globalObserver.observe(targetNode, configObserver);
