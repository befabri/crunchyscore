import "./popup.css";
import { initializeColorPickerChrome } from "../script/colorPicker";
import { initializeForceRefreshCache } from "../script/forceRefreshCache";
import { initialize18n } from "../script/i18n";
import { initializeNavigation } from "../script/navigation";
import { initializeProvider } from "../script/provider";
import { initializeSaveManagerChrome, loadTabSettingsChrome } from "../script/saveManager";

document.addEventListener("DOMContentLoaded", () => {
    initialize18n();
    initializeForceRefreshCache();
    initializeSaveManagerChrome();
    initializeProvider();
    initializeNavigation();
    initializeColorPickerChrome();
    loadTabSettingsChrome();
});
