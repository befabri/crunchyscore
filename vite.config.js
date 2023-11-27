import { defineConfig } from "vite";

export default defineConfig({
    root: "src",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        minify: false,
        rollupOptions: {
            input: {
                background: "src/background/background.js",
                content: "src/content/index.ts",
                popup: "src/popup/popup.ts",
                popupHtml: "src/popup/popup.html",
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name === "popup" || chunkInfo.name === "popupHtml") {
                        return "popup/[name].js";
                    }
                    return "[name].js";
                },
                chunkFileNames: "popup/[name].js",
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name.endsWith(".css")) {
                        return "popup/[name].[ext]";
                    }
                    return "[name].[ext]";
                },
            },
        },
    },
});
