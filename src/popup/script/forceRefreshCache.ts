import { getElementById, sendMessageToActiveTab } from "./utils";

const btnForceRefreshCache = getElementById<HTMLButtonElement>("btnCache");

function forceRefreshCache(): void {
    const spinner = getElementById<HTMLElement>("spinner");
    const successIcon = getElementById<HTMLElement>("successIcon");

    btnForceRefreshCache.disabled = true;
    spinner.style.display = "";
    successIcon.style.display = "none";

    sendMessageToActiveTab("forceRefreshCache");

    setTimeout(() => {
        spinner.style.display = "none";
        successIcon.style.display = "";
        setTimeout(() => {
            btnForceRefreshCache.disabled = false;
            successIcon.style.display = "none";
        }, 2000);
    }, 1600);
}

export function initializeForceRefreshCache(): void {
    btnForceRefreshCache.addEventListener("click", forceRefreshCache);
}
