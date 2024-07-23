import { exec } from "child_process";

export default function runScriptAfterBuild(mode) {
    return {
        name: "run-script-after-build",
        buildEnd() {
            const scriptToRun = `node tools/copy-assets.js ${mode}`;
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
