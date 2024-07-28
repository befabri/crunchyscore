import { HexColorPicker } from "vanilla-colorful";
import { getElementById, isValidHexColor } from "./utils";

const ids = [1, 2, 3];

export function initializeColorPickerChrome() {
    const colorChoices = ids.map((id) => getElementById<HTMLInputElement>(`colorChoice${id}`));
    const colorTexts = ids.map((id) => getElementById<HTMLInputElement>(`colorText${id}`));

    // Update color text when HTML input color changes
    colorChoices.forEach((colorChoice, index) => {
        colorChoice.addEventListener("input", function () {
            colorTexts[index].value = this.value;
        });
    });

    // Update HTML input color when color text changes
    colorTexts.forEach((colorText, index) => {
        colorText.addEventListener("input", function () {
            const colorCode = this.value;
            if (isValidHexColor(colorCode)) {
                colorChoices[index].value = colorCode;
            }
        });
    });
}

export function initializeColorPickerFirefox() {
    const colorPreviews = ids.map((id) => getElementById<HTMLInputElement>(`colorPreview${id}`));
    const colorChoices = ids.map((id) => getElementById<HexColorPicker>(`colorChoice${id}`));
    const colorTexts = ids.map((id) => getElementById<HTMLInputElement>(`colorText${id}`));

    // Hide modal of HexColorPicker when clicking outside of it
    window.onclick = (event) => {
        const colorModals = ids.map((id) => getElementById<HTMLInputElement>(`colorModal${id}`));
        colorChoices.forEach((preview, index) => {
            if (event.target !== preview && !colorModals[index].classList.contains("hidden")) {
                const modal = colorModals[index];
                modal.classList.remove("flex");
                modal.classList.add("hidden");
            }
        });
    };

    // Toggle modal display when clicking on color preview
    colorPreviews.forEach((colorPreview: HTMLElement, index: number) => {
        colorPreview.addEventListener("click", () => {
            const modal = getElementById<HTMLInputElement>(`colorModal${index + 1}`);
            if (modal) {
                modal.classList.toggle("hidden");
                modal.classList.toggle("flex");
            }
            event?.stopPropagation();
        });
    });

    // Update preview & text color when HexColorPicker color changes
    colorChoices.forEach((colorChoice: HexColorPicker, index: number) => {
        colorChoice.addEventListener("color-changed", (event) => {
            const detail = (event as CustomEvent).detail;
            getElementById<HTMLInputElement>(`colorText${index + 1}`).value = detail.value;
            getElementById<HTMLInputElement>(`colorPreview${index + 1}`).style.backgroundColor = detail.value;
        });
    });

    // Update preview & HexColorPicker color when text color changes
    colorTexts.forEach((colorText: HTMLInputElement, index: number) => {
        colorText.addEventListener("input", function () {
            const colorCode = this.value;
            if (isValidHexColor(colorCode)) {
                getElementById<HexColorPicker>(`colorChoice${index + 1}`).color = colorCode;
                getElementById<HTMLElement>(`colorPreview${index + 1}`).style.backgroundColor = colorCode;
            }
        });
    });
}
