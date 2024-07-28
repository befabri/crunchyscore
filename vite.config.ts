import { defineConfig } from "vite";
import runScriptAfterBuild from "./tools/runScriptAfterBuild";

export default ({ mode }) => {
    let browserSpecificSettings = {};
    if (mode === "chrome") {
        browserSpecificSettings = {
            root: "src",
            plugins: [runScriptAfterBuild("chrome")],
            build: {
                rollupOptions: {
                    input: {
                        background: "src/background/background.js",
                        content: "src/content/index.ts",
                        popup: "src/popup/chrome/popup.ts",
                    },
                    output: {
                        entryFileNames: (chunkInfo) => {
                            if (chunkInfo.name === "popup") {
                                return "popup/[name].js";
                            }
                            return "[name].js";
                        },
                        chunkFileNames: "chunks/[name].[hash].js",
                        assetFileNames: (assetInfo) => {
                            if (assetInfo.name && assetInfo.name.endsWith(".css")) {
                                return "popup/[name].[ext]";
                            }
                            return "[name].[ext]";
                        },
                    },
                },
                outDir: "../dist/chrome",
                emptyOutDir: true,
                minify: false,
            },
            define: {
                "process.env.MANIFEST": '"manifest.chrome.json"',
            },
        };
    } else if (mode === "firefox") {
        browserSpecificSettings = {
            root: "src",
            plugins: [runScriptAfterBuild("firefox")],
            build: {
                rollupOptions: {
                    input: {
                        background: "src/background/background.js",
                        content: "src/content/index.ts",
                        popup: "src/popup/firefox/popup.ts",
                    },
                    output: {
                        entryFileNames: (chunkInfo) => {
                            if (chunkInfo.name === "popup") {
                                return "popup/[name].js";
                            }
                            return "[name].js";
                        },
                        chunkFileNames: "chunks/[name].[hash].js",
                        assetFileNames: (assetInfo) => {
                            if (assetInfo.name && assetInfo.name.endsWith(".css")) {
                                return "popup/[name].[ext]";
                            }
                            return "[name].[ext]";
                        },
                    },
                },
                outDir: "../dist/firefox",
                emptyOutDir: true,
                minify: false,
            },
            define: {
                "process.env.MANIFEST": '"manifest.firefox.json"',
            },
        };
    }

    return defineConfig({
        ...browserSpecificSettings,
    });
};
