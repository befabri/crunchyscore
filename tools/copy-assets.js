import fs from "fs-extra";

// Define source and destination directories
const copyOperations = [
    { src: "./src/assets", dest: "./dist/tmp/assets" },
    { src: "./src/_locales", dest: "./dist/tmp/_locales" },
    { src: "./src/popup/popup.html", dest: "./dist/tmp/popup/popup.html" },
    { src: "./dist/tmp", dest: "./dist/chrome" },
    { src: "./dist/tmp", dest: "./dist/firefox" },
    { src: "./src/manifest.chrome.json", dest: "./dist/chrome/manifest.json" },
    { src: "./src/manifest.firefox.json", dest: "./dist/firefox/manifest.json" },
];

async function executeCopyOperations() {
    try {
        for (const operation of copyOperations) {
            await fs.copy(operation.src, operation.dest);
            console.log(`Copied from ${operation.src} to ${operation.dest}`);
        }

        await fs.remove("./dist/tmp");
        console.log("Temporary folder ./dist/tmp removed successfully.");
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

executeCopyOperations();
