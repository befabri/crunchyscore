import { addTextStyleClasses, appendStyledElement } from "./dom";
import { ScoreType } from "./types";

interface Separator {
    marginLeft: string;
    marginRight: string;
}

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

function createSeparator({ marginLeft, marginRight }: Separator) {
    const separator = document.createElement("span");
    Object.assign(separator.style, {
        backgroundColor: "#4a4e58",
        display: "inline-block",
        height: "1.25rem",
        marginLeft,
        marginRight,
        width: "0.0625rem",
        verticalAlign: "middle",
    });
    separator.classList.add("score-separator");
    return separator;
}

function createContainer(element: HTMLSpanElement) {
    return appendStyledElement(element, "span", ["score-separator"], {
        marginTop: ".75rem",
        display: "flex",
        alignItems: "center",
    });
}

function insertToLayoutDetail(score: HTMLElement, targetElement: Element, layout: string): void {
    const h1Element = targetElement.querySelector("h1");
    let parent;
    let elementStyleToCopy;
    switch (layout) {
        case "layout1":
            h1Element?.appendChild(score);
            break;
        case "layout2":
            parent = targetElement.querySelector('div[data-t="series-hero-ratings"]');
            elementStyleToCopy = parent?.querySelector("span");
            if (parent && parent instanceof HTMLElement && elementStyleToCopy) {
                const container = createContainer(elementStyleToCopy);
                if (elementStyleToCopy instanceof HTMLElement) {
                    addTextStyleClasses(elementStyleToCopy, container);
                }
                container.appendChild(score);
                const separator = createSeparator({ marginLeft: "0.5rem", marginRight: "0.5rem" });
                container.appendChild(separator);
                if (parent.firstChild) {
                    parent.insertBefore(container, parent.firstChild);
                }
            }
            break;
        case "layout3":
            parent = targetElement.querySelector('div[data-t="series-hero-ratings"]');
            elementStyleToCopy = parent?.querySelector("span");
            if (parent && parent instanceof HTMLElement && elementStyleToCopy) {
                const container = createContainer(elementStyleToCopy);
                if (elementStyleToCopy instanceof HTMLElement) {
                    addTextStyleClasses(elementStyleToCopy, container);
                }
                container.appendChild(score);
                const separator = createSeparator({ marginLeft: "0.75rem", marginRight: "0.5rem" });
                container.appendChild(separator);
                if (parent.firstChild && parent.firstChild.nextSibling) {
                    parent.insertBefore(container, parent.firstChild.nextSibling);
                }
            }
            break;
        case "layout4":
            parent = targetElement.querySelector('div[data-t="series-hero-ratings"]');
            elementStyleToCopy = parent?.querySelector("span");
            if (parent && parent instanceof HTMLElement && elementStyleToCopy) {
                const container = createContainer(elementStyleToCopy);
                if (elementStyleToCopy instanceof HTMLElement) {
                    addTextStyleClasses(elementStyleToCopy, container);
                }
                const separator = createSeparator({ marginLeft: "0.25rem", marginRight: "0.5rem" });
                container.appendChild(separator);
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
