import { addTextStyleClasses, appendStyledElement } from "./dom";
import { ScoreType } from "./types";

export function insertToLayout(
    scoreElement: HTMLElement,
    context: HTMLElement | Element,
    layout: string,
    scoreType: ScoreType
) {
    switch (scoreType) {
        case ScoreType.CARD:
            insertToLayoutCard(scoreElement, context, layout);
            break;
        case ScoreType.DETAIL:
            insertToLayoutDetail(scoreElement, context, layout);
            break;
        case ScoreType.WATCH:
            insertToLayoutWatch(scoreElement, context, layout);
            break;
    }
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

function insertToLayoutDetail(score: HTMLElement, targetElement: Element, layout: string): void {
    const h1Element = targetElement.querySelector("h1");
    let parent;
    switch (layout) {
        case "layout1":
            h1Element?.appendChild(score);
            break;
        case "layout2":
            const target = targetElement.querySelector("div.hero-heading-line");
            target?.insertAdjacentElement("afterend", score);
            break;
        case "layout3":
            parent = targetElement.querySelector('div[data-t="meta-tags"]');
            if (parent && parent instanceof HTMLElement) {
                const container = appendStyledElement(parent, "span", ["score-separator"], {});
                container.textContent = " |";
                Array.from(parent.children).forEach((child) => {
                    if (child instanceof HTMLElement) {
                        addTextStyleClasses(child, container);
                    }
                });
                container.appendChild(score);
            }
            break;
        case "layout4":
            parent = targetElement.querySelector("div.star-rating--Hwjdl");
            const elementStyleToCopy = parent?.querySelector("span");
            if (parent && parent instanceof HTMLElement && elementStyleToCopy) {
                const container = appendStyledElement(elementStyleToCopy, "span", ["score-separator"], {
                    marginTop: ".75rem",
                });
                if (elementStyleToCopy instanceof HTMLElement) {
                    addTextStyleClasses(elementStyleToCopy, container);
                }
                container.appendChild(score);
                parent.appendChild(container);
            }
            break;
    }
}

function insertToLayoutWatch(score: HTMLElement, targetElement: Element, layout: string): void {
    const h1Element = targetElement.querySelector("h1");
    let parent;
    switch (layout) {
        case "layout1":
            parent = targetElement.querySelector("div.current-media-parent-ref");
            const elementStyleToCopy = parent?.querySelector("p");
            if (parent && parent instanceof HTMLElement && elementStyleToCopy) {
                const container = appendStyledElement(elementStyleToCopy, "span", ["score-separator"], {
                    marginBottom: ".25rem",
                    alignSelf: "center",
                });
                if (elementStyleToCopy instanceof HTMLElement) {
                    addTextStyleClasses(elementStyleToCopy, container);
                }
                container.appendChild(score);
                parent.appendChild(container);
            }
            break;
        case "layout2":
            h1Element?.appendChild(score);
            break;
        case "layout3":
            h1Element?.insertAdjacentElement("afterend", score);
            break;
        case "layout4":
            parent = targetElement.querySelector('div[data-t="meta-tags"]');
            if (parent && parent instanceof HTMLElement) {
                const container = appendStyledElement(parent, "span", ["score-separator"], {});
                container.textContent = " |";
                Array.from(parent.children).forEach((child) => {
                    if (child instanceof HTMLElement) {
                        addTextStyleClasses(child, container);
                    }
                });
                container.appendChild(score);
            }
            break;
    }
}
