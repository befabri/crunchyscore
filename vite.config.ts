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
                // popupHtml: "popup/popup.html", // Consider handling HTML differently if needed
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name === "popup") { // Adjusted based on actual needs
                        return "popup/[name].js";
                    }
                    return "[name].js";
                },
                chunkFileNames: "chunks/[name].[hash].js", // Adjusted for clarity and to avoid conflict
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith(".css")) {
                        return "popup/[name].[ext]";
                    }
                    return "[name].[ext]";
                },
            },
        },
    },
});
