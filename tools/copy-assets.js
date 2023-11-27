import ncp from "ncp";

// Define source and destination directories
const copyOperations = [
    { src: "./src/assets", dest: "./dist/assets" },
    { src: "./src/_locales", dest: "./dist/_locales" },
    { src: "./src/manifest.json", dest: "./dist/manifest.json" },
];

// Copy each directory
copyOperations.forEach(({ src, dest }) => {
    ncp(src, dest, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log(`Copied ${src} to ${dest}`);
    });
});
