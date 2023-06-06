const BASE_URL = "https://api.crunchyscore.app/api/anime/scores";
const config = {};
updateConfig();

function restore() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["tab1", "tab2"], function (data) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(data);
      }
    });
  });
}

async function updateConfig() {
  try {
    const data = await restore();
    config.tab1 = data.tab1 !== undefined ? data.tab1 : config.tab1;
    config.tab2 = data.tab2 !== undefined ? data.tab2 : config.tab2;
  } catch (error) {
    console.error(error);
  }
}

function roundScore(score, decimalConfig) {
  if (decimalConfig === "decimal1") {
    return Math.floor(score * 100) / 100;
  } else if (decimalConfig === "decimal2") {
    return Math.floor(score * 10) / 10; //
  } else if (decimalConfig === "decimal3") {
    return Math.floor(score);
  } else {
    return score;
  }
}

async function handleDetailPage() {
  const targetElem = document.querySelector("div.hero-heading-line");
  if (targetElem && !document.getElementById(".score-hero")) {
    const animes = await getStorageAnimeData();
    let data = getDataFromHero(targetElem, animes);
    if (data) {
      insertScoreIntoHero(targetElem, data.score);
    } else {
      data = getSearchFromHero(targetElem);
      const animeFetch = await fetchAnimeScores([data]);
      if (animeFetch) {
        insertScoreIntoHero(targetElem, animeFetch[0].score);
        await saveData(animeFetch);
      }
    }
  }
}

function getDataFromCard(card, animes) {
  const { id } = getSearchFromCard(card);
  return animes.find((obj) => obj.id === id);
}

function getSearchFromCard(card) {
  const href = card.querySelector('a[tabindex="0"]');
  const id = extractIdFromUrl(href);
  return { id: id };
}

function getDataFromHero(card, animes) {
  const { id } = getSearchFromHero(card);
  return animes.find((obj) => obj.id === id);
}

function getSearchFromHero(card) {
  const href = location.href;
  const id = extractIdFromUrl(href);
  return { id: id };
}

async function getStorageAnimeData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["datas"], (result) => {
      const animes = result.datas || [];
      resolve(animes);
    });
  });
}

async function refreshNotFoundCache() {
  const notFoundCache = getnotFoundCache();
  const urls = Object.values(notFoundCache);
  await fetchandSaveAnimeScores(urls);
  localStorage.setItem("lastRefreshTime", Date.now().toString());
}

function getnotFoundCache() {
  let notFoundCache = localStorage.getItem("notFoundCache");
  if (notFoundCache) {
    return JSON.parse(notFoundCache);
  } else {
    return {};
  }
}

function setNotFoundCache(cacheData) {
  localStorage.setItem("notFoundCache", JSON.stringify(cacheData));
}

function updateNotFoundCache(updates) {
  console.log("Update cache");
  let cacheData = getnotFoundCache();
  updates.forEach((anime) => (cacheData[anime.id] = anime));
  setNotFoundCache(cacheData);
}

async function handleVideoPage() {
  if (isDetailPage(location.href)) {
    return;
  }
  const lastRefreshTime = parseInt(localStorage.getItem("lastRefreshTime")) || 0;
  if (Date.now() - lastRefreshTime >= 172800000) {
    // 2 days
    await refreshNotFoundCache();
  }
  let data = await getStorageAnimeData();
  const animeNotFound = await insertScoreController(data);
  if (animeNotFound) {
    const notFoundCache = getnotFoundCache();
    const animes = animeNotFound.filter((url) => !notFoundCache[url.id]);
    if (animes.length > 0) {
      const animeFetch = await fetchandSaveAnimeScores(animes);
      if (animeFetch) {
        await saveData(animeFetch.filter((anime) => anime.score !== 0));
        data = await getStorageAnimeData();
        await insertScoreController(data);
      }
    }
  }
}

async function fetchandSaveAnimeScores(animes) {
  if (Object.keys(animes).length === 0) {
    return;
  }
  const crunchyrollList = prepareObjectFetch(animes);
  const animeFetch = await fetchAnimeScores(crunchyrollList);
  if (animeFetch) {
    const updates = animeFetch.filter((anime) => anime.score === 0);
    updateNotFoundCache(updates);
    return animeFetch;
  }
}

function prepareObjectFetch(animes) {
  const list = [];
  for (const anime of animes) {
    if (anime.id) {
      list.push({ id: anime.id });
    }
  }
  return list;
}

function returnHref(children) {
  return Array.from(children)
    .map((child) => child.href)
    .sort()
    .join("|");
}

let pastURL = location.href;
let parentContainer = null;
let parentClonedContainer = null;

async function insertScoreController(animes) {
  if (isSimulcastPage() && pastURL !== location.href && parentContainer && parentClonedContainer) {
    const parentHref = returnHref(parentContainer.children);
    if (!parentHref || parentHref === returnHref(parentClonedContainer.children)) {
      location.reload();
      return;
    }
    if (parentClonedContainer.childElementCount !== 0 && parentContainer.childElementCount !== 0) {
      parentClonedContainer.parentNode.replaceChild(parentContainer, parentClonedContainer);
    }
  }
  const cards = Array.from(getCardsFromVideoPage());
  const notFound = cards.reduce((notFoundCards, card) => {
    const data = getDataFromCard(card, animes);
    if (data) {
      insertScoreIntoCard(card, data.score);
    } else {
      notFoundCards.push(getSearchFromCard(card));
    }
    return notFoundCards;
  }, []);
  if (!isSimulcastPage() || config.tab1.order === "order1") {
    pastURL = location.href;
    return notFound;
  }
  const sortChildren = (node) => {
    const sorted = Array.from(node.children)
      .map((card) => {
        const scoreElement = card.querySelector(".score-card");
        return {
          node: card,
          score: scoreElement ? parseFloat(scoreElement.getAttribute("data-numberscore")) : 0,
        };
      })
      .sort((a, b) => (config.tab1.order === "order2" ? a.score - b.score : b.score - a.score));

    sorted.forEach(({ node: childNode }) => node.appendChild(childNode));
  };
  parentContainer = document.querySelector(".erc-browse-cards-collection");
  parentClonedContainer = parentContainer.cloneNode(true);
  const unwantedChildren = parentClonedContainer.querySelectorAll(
    ".browse-card-placeholder--6UpIg.browse-card, .browse-card-placeholder--6UpIg.browse-card.hidden-mobile"
  );
  unwantedChildren.forEach((child) => child.parentNode.removeChild(child));
  sortChildren(parentClonedContainer);
  if (parentClonedContainer.childElementCount !== 0) {
    parentContainer.parentNode.replaceChild(parentClonedContainer, parentContainer);
  }
  pastURL = location.href;
  return notFound;
}

function getCardsFromVideoPage() {
  return document.querySelectorAll('[data-t="series-card "]');
}

async function fetchAnimeScores(crunchyrollList) {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ crunchyrollList }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function extractIdFromUrl(url) {
  if (!url) {
    return null;
  }
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/");
  let idIndex = pathParts[1] === "series" ? 2 : 3;
  return pathParts[idIndex];
}

function isSimulcastPage() {
  let kiu = location.href;
  kiu = kiu.split("/");
  const lastSegment = kiu[kiu.length - 2];
  if (lastSegment === "seasons") {
    return true;
  }
  return false;
}

function isDetailPage(url) {
  if (!url) {
    return null;
  }
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/");
  if (pathParts[1] === "series" || pathParts[2] === "series") {
    return true;
  }
  return false;
}

function insertScoreIntoCard(card, score) {
  if (card.querySelector(".score-card")) {
    return;
  }
  const scoreElement = document.createElement("span");
  scoreElement.textContent = ` ${config.tab1.text} ${roundScore(score, config.tab1.decimal)}`;
  scoreElement.style.color = config.tab1.color;
  scoreElement.classList.add("score-card");
  scoreElement.setAttribute("data-textscore", config.tab1.text);
  scoreElement.setAttribute("data-numberscore", roundScore(score, config.tab1.decimal));
  insertToLayout(scoreElement, card, config.tab1.layout);
}

function insertToLayout(score, card, layout) {
  const h4Element = card.querySelector("h4");
  if (layout == "layout1") {
    card.querySelector("h4").appendChild(score);
  } else if (layout == "layout2") {
    h4Element.parentNode.insertBefore(score, h4Element.nextElementSibling);
  } else if (layout == "layout3") {
    card.querySelector('div[data-t="meta-tags"]').appendChild(score);
  } else if (layout == "layout4") {
    card.appendChild(score);
  }
}

function insertScoreIntoHero(card, score) {
  if (card.querySelector(".score-hero")) {
    return;
  }
  const scoreElement = document.createElement("span");
  scoreElement.textContent = ` ${config.tab2.text} ${roundScore(score, config.tab2.decimal)}`;
  scoreElement.style.color = config.tab2.color;
  scoreElement.classList.add("score-hero");
  scoreElement.setAttribute("data-textscore", config.tab2.text);
  scoreElement.setAttribute("data-numberscore", roundScore(score, config.tab2.decimal));
  insertToLayoutHero(scoreElement, card, config.tab2.layout);
}

function insertToLayoutHero(score, card, layout) {
  const h1Element = card.querySelector("h1");

  const tag = document.querySelector("div.erc-series-tags.tags");
  if (layout == "layout1") {
    h1Element.appendChild(score);
  } else if (layout == "layout2") {
    h1Element.parentNode.insertBefore(score, h1Element.nextElementSibling);
  } else if (layout == "layout3") {
    tag.querySelector('div[data-t="meta-tags"]').appendChild(score);
  }
}

async function saveData(animeFetch) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["datas"], function (result) {
      let animeData = result.datas || [];
      animeFetch.forEach((anime) => {
        if (anime && !animeData.some((a) => a && a.id === anime.id) && anime.score) {
          animeData.push(anime);
        }
      });
      chrome.storage.local.set({ datas: animeData }, function () {
        console.log("Data saved to chrome storage.");
        resolve();
      });
    });
  });
}

function getLastPartUrl(url) {
  const parts = url.split("/");
  return parts[parts.length - 1].replace(/-/g, " ");
}

async function addAnimeToStorage(animes, anime) {
  return new Promise((resolve, reject) => {
    animes.push(anime);
    chrome.storage.local.set({ datas: animes }, () => {
      console.log("Object pushed to array in storage");
      resolve();
    });
  });
}

function createNewElement(score, id) {
  const newElement = document.createElement("p");
  newElement.textContent = score;
  newElement.id = id;
  return newElement;
}

function IsVideoPage() {
  if (!document.querySelector(".erc-browse-collection.state-loading")) {
    return (
      document.querySelector(".browse-card:not(.browse-card-placeholder--6UpIg)") ||
      document.querySelector("#content > div > div.app-body-wrapper > div > div > div.erc-genres-header")
    );
  }
  return false;
}

let check = false;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type != "popupSaved") {
    check = false;
  }
  if (request.type === "popupSaved") {
    let elements = document.querySelectorAll(".score-card");
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.color = request.tab1.color;
      let numberScore = parseFloat(elements[i].getAttribute("data-numberscore"));
      let roundedScore = roundScore(numberScore, request.tab1.decimal);
      elements[i].textContent = ` ${request.tab1.text} ${roundedScore}`;
      insertToLayout(elements[i], elements[i].parentNode, request.tab1.layout);
    }
    elements = document.getElementsByClassName("score-hero");
    if (elements) {
      elements[i].style.color = request.tab2.color;
      let numberScore = parseFloat(elements[i].getAttribute("data-numberscore"));
      let roundedScore = roundScore(numberScore, request.tab2.decimal);
      elements[i].textContent = ` ${request.tab2.text} ${roundedScore}`;
      const card = elements[i].closest(".hero-heading-line");
      insertToLayoutHero(elements[i], card, request.tab2.layout);
    }
    updateConfig();
    if (request.tab1.order != config.tab1.order) {
      (async () => {
        let data = await getStorageAnimeData();
        await insertScoreController(data);
      })();
    }
  }

  setInterval(function () {
    if (check === false) {
      if (IsVideoPage()) {
        updateConfig();
        handleVideoPage();
        check = true;
      }
    }
    if (document.querySelector(".star-rating__reviews-link--lkG9- span") && check === false) {
      updateConfig();
      handleDetailPage();
      check = true;
    }
  }, 500);
});

let throttleTimeout = null;
window.addEventListener("scroll", () => {
  if (!throttleTimeout) {
    throttleTimeout = setTimeout(() => {
      if (IsVideoPage() && !isSimulcastPage()) {
        updateConfig();
        handleVideoPage();
      }
      throttleTimeout = null;
    }, 800);
  }
});
