export const appendStyledElement = (
    parent: HTMLElement,
    elementType: string,
    classNames: string[] = [],
    styles: Record<string, string> = {}
) => {
    const element = document.createElement(elementType) as HTMLElement;
    classNames.forEach((className) => element.classList.add(className));
    Object.keys(styles).forEach((key) => (element.style[key as any] = styles[key]));
    parent.appendChild(element);
    return element;
};

export const addTextStyleClasses = (element: HTMLElement, target: HTMLElement) => {
    element.classList.forEach((className) => {
        if (className.startsWith("text--")) {
            target.classList.add(className);
        }
    });
};

export function removeExistingSeparator(context: HTMLElement | Element) {
    const existingSeparator = context.querySelector(".score-watch-separator");
    if (existingSeparator && existingSeparator.parentNode) {
        existingSeparator.parentNode.removeChild(existingSeparator);
    }
}
