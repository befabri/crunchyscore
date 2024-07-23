import { defineConfig } from "vite";
import runScriptAfterBuild from "./tools/runScriptAfterBuild";

export default defineConfig({
    root: "src",
    plugins: [runScriptAfterBuild()],
    build: {
        outDir: "../dist/tmp",
        emptyOutDir: true,
        minify: false,
        rollupOptions: {
            input: {
                background: "src/background/background.js",
                content: "src/content/index.ts",
                popup: "src/popup/popup.ts",
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
    },
});
