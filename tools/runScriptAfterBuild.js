import { exec } from "child_process";

const scriptToRun = "node tools/copy-assets.js";

export default function runScriptAfterBuild() {
    return {
        name: "run-script-after-build",
        buildEnd() {
            exec(scriptToRun, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                if (stdout) {
                    console.log(stdout);
                }
                if (stderr) {
                    console.error(stderr);
                }
            });
        },
    };
}
