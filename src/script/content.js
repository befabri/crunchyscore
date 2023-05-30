const BASE_URL = "https://api.crunchyscore.app/api/anime/scores";
const config = {};
updateConfig();

function restore() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["color", "text", "layout", "order", "decimal"], function (data) {
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
    config.color = data.color !== undefined ? data.color : config.color;
    config.option = data.option !== undefined ? data.option : config.option;
    config.text = data.text !== undefined ? data.text : config.text;
    config.layout = data.layout !== undefined ? data.layout : config.layout;
    config.order = data.order !== undefined ? data.order : config.order;
    config.decimal = data.decimal !== undefined ? data.decimal : config.decimal;
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
  if (targetElem && !document.getElementById(".score")) {
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

function insertScoreIntoHero(card, score) {
  if (card.querySelector(".score")) {
    return;
  }
  const scoreElement = document.createElement("span");
  scoreElement.textContent = ` ${config.text} ${roundScore(score, config.decimal)}`;
  scoreElement.style.color = config.color;
  scoreElement.classList.add("id", "score");
  card.querySelector("h1").appendChild(scoreElement);
}

function getDataFromCard(card, animes) {
  const { name, alternativeName, id } = getSearchFromCard(card);
  return animes.find((obj) => obj.id === id);
}

function getSearchFromCard(card) {
  const href = card.querySelector('a[tabindex="0"]');
  const animeName = href ? getLastPartUrl(href.getAttribute("href")) : null;
  const id = extractIdFromUrl(href);
  const title = card.querySelector("h4");
  const animeNametwo = title ? title.textContent : null;
  return { name: animeName, alternativeName: animeNametwo, id: id };
}

function getDataFromHero(card, animes) {
  const { name, alternativeName, id } = getSearchFromHero(card);
  return animes.find((obj) => obj.id === id);
}

function getSearchFromHero(card) {
  const href = location.href;
  const animeName = href ? getLastPartUrl(href) : null;
  const id = extractIdFromUrl(href);
  const title = card.querySelector("h1");
  const animeNametwo = title ? title.textContent : null;
  return { name: animeName, alternativeName: animeNametwo, id: id };
}

async function getStorageAnimeData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["datas"], (result) => {
      const animes = result.datas || [];
      resolve(animes);
    });
  });
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

function updateNotFoundCache(id, data) {
  let cacheData = getnotFoundCache();
  cacheData[id] = data;
  setNotFoundCache(cacheData);
}

async function handleVideoPage() {
  if (isDetailPage(location.href)) {
    return;
  }
  let data = await getStorageAnimeData();
  const animeNotFound = await insertScoreController(data);
  if (animeNotFound) {
    const notFoundCache = getnotFoundCache();
    let urls = getUrlsFromNotFound(animeNotFound);
    urls = urls.filter((url) => !notFoundCache[url.id]);
    if (urls.length > 0) {
      const animeFetch = await fetchandSaveAnimeScores(urls);
      if (animeFetch) {
        await saveData(animeFetch.filter((anime) => anime.score !== 0));
        data = await getStorageAnimeData();
        await insertScoreController(data);
      }
    }
  }
}

async function fetchandSaveAnimeScores(urls) {
  const animeFetch = await fetchAnimeScores(urls);
  if (animeFetch) {
    animeFetch.forEach((anime) => {
      if (anime.score === 0) {
        updateNotFoundCache(anime.id, anime);
      }
    });
    return animeFetch;
  }
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
  if (!isSimulcastPage() || config.order === "order1") {
    pastURL = location.href;
    return notFound;
  }
  const sortChildren = (node) => {
    const sorted = Array.from(node.children)
      .map((card) => {
        const scoreElement = card.querySelector(".score");
        return {
          node: card,
          score: scoreElement ? parseFloat(scoreElement.getAttribute("data-numberscore")) : 0,
        };
      })
      .sort((a, b) => (config.order === "order2" ? a.score - b.score : b.score - a.score));

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
  return document.querySelectorAll('[data-t="series-card "]'); //document.querySelectorAll(".browse-card:not(.browse-card-placeholder--6UpIg):not(.hidden-mobile)");
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
  if (card.querySelector(".score")) {
    return;
  }
  const scoreElement = document.createElement("span");
  scoreElement.textContent = ` ${config.text} ${roundScore(score, config.decimal)}`;
  scoreElement.style.color = config.color;
  scoreElement.classList.add("id", "score");
  scoreElement.setAttribute("data-textscore", config.text);
  scoreElement.setAttribute("data-numberscore", roundScore(score, config.decimal));
  insertToLayout(scoreElement, card, config.layout);
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

function getUrlsFromNotFound(notFound) {
  const urls = [];
  for (const search of notFound) {
    if (search.name) {
      urls.push({ name: search.name, id: search.id });
    }
    if (search.alternativeName) {
      urls.push({ name: search.alternativeName, id: search.id });
    }
  }
  return urls;
}

async function saveData(animeFetch) {
  chrome.storage.local.get(["datas"], async function (result) {
    let animeData = result.datas || [];
    animeFetch.forEach((anime) => {
      if (anime && !animeData.some((a) => a && a.id === anime.id) && anime.score) {
        animeData.push(anime);
      }
    });
    chrome.storage.local.set({ datas: animeData }, function () {
      console.log("Data saved to chrome storage.");
    });
  });
}

function getLastPartUrl(url) {
  const parts = url.split("/");
  return parts[parts.length - 1].replace(/-/g, " ");
}

function findAnimeByName(animes, pageName, animeName) {
  return animes.find((entry) => entry.name === pageName || entry.name === animeName);
}

function findFirstNonNull(data) {
  return data.find((entry) => entry !== null) || null;
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
    let elements = document.getElementsByClassName("score");
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.color = request.color;
      let numberScore = parseFloat(elements[i].getAttribute("data-numberscore"));
      let roundedScore = roundScore(numberScore, request.decimal);
      elements[i].textContent = ` ${request.text} ${roundedScore}`;
      const card = elements[i].closest(".browse-card__body--yGjzX");
      insertToLayout(elements[i], card, request.layout);
    }
    updateConfig();
    if (request.order != config.order) {
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
