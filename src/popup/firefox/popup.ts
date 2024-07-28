import "./popup.css";
import "vanilla-colorful";
import { initializeColorPickerFirefox } from "../script/colorPicker";
import { initializeForceRefreshCache } from "../script/forceRefreshCache";
import { initialize18n } from "../script/i18n";
import { initializeNavigation } from "../script/navigation";
import { initializeProvider } from "../script/provider";
import { initializeSaveManagerFirefox, loadTabSettingsFirefox } from "../script/saveManager";

document.addEventListener("DOMContentLoaded", () => {
    initializeColorPickerFirefox();
    initialize18n();
    initializeForceRefreshCache();
    initializeSaveManagerFirefox();
    initializeProvider();
    initializeNavigation();
    loadTabSettingsFirefox();
});
