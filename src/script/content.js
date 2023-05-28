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

async function handleSimulcastPage() {
  if (isDetailPage(location.href)) {
    return;
  }
  let data = await getStorageAnimeData();
  const cards = Array.from(getCardsFromVideoPage());
  const animeNotFound = await insertScoreController(cards, data);
  if (animeNotFound) {
    const notFoundCache = getnotFoundCache();
    let urls = getUrlsFromNotFound(animeNotFound);
    urls = urls.filter((url) => !notFoundCache[url.id]);
    if (urls.length > 0) {
      const animeFetch = await fetchandSaveAnimeScores(urls);
      if (animeFetch) {
        await saveData(animeFetch.filter((anime) => anime.score !== 0));
        data = await getStorageAnimeData();
        await insertScoreController(cards, data);
      }
    }
  }
}

async function insertScoreController() {
  const cards = Array.from(getCardsFromVideoPage());
  const animes = await getStorageAnimeData();
  const notFound = [];
  await Promise.all(
    cards.map(async (card) => {
      const data = getDataFromCard(card, animes);
      if (data) {
        insertScoreIntoCard(card, data.score);
      } else {
        notFound.push(getSearchFromCard(card));
      }
    })
  );
  return notFound;
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

function getCardsFromVideoPage() {
  return document.querySelectorAll(".browse-card-static--UqkrO");
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
  card.querySelector("h4").appendChild(scoreElement);
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
  return (
    document.querySelector(".browse-card:not(.browse-card-placeholder--6UpIg)") ||
    document.querySelector("#content > div > div.app-body-wrapper > div > div > div.erc-genres-header")
  );
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "colorChanged") {
    console.log(request.color, request.layout, request.text, request.decimal, request.order);
    let elements = document.getElementsByClassName("score");
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.color = request.color;
      let score = parseFloat(elements[i].textContent.replace(config.text, ""));
      let roundedScore = roundScore(score, request.decimal);
      elements[i].textContent = ` ${request.text} ${roundedScore}`;
    }
    updateConfig();
  }

  let check = false;
  setInterval(function () {
    if (check === false) {
      if (IsVideoPage()) {
        updateConfig();
        handleSimulcastPage();
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
      if (IsVideoPage()) {
        updateConfig();
        handleSimulcastPage();
      }
      throttleTimeout = null;
    }, 800);
  }
});
