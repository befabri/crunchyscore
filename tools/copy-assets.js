import fs from "fs-extra";
import process from "process";

const mode = process.argv[2];

// Define source and destination directories with dynamic paths
const copyOperations = [
    { src: "./src/assets", dest: `./dist/${mode}/assets` },
    { src: "./src/_locales", dest: `./dist/${mode}/_locales` },
    {
        src: `./src/popup/${mode}/popup.html`,
        dest: `./dist/${mode}/popup/popup.html`,
    },
    { src: `./src/manifest.${mode}.json`, dest: `./dist/${mode}/manifest.json` },
];

async function executeCopyOperations() {
    try {
        for (const operation of copyOperations) {
            await fs.copy(operation.src, operation.dest);
            console.log(`Copied from ${operation.src} to ${operation.dest}`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

executeCopyOperations();
