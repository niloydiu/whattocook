const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const API_DIR = path.join(ROOT, "app", "api");
const gen = () =>
  spawn(process.execPath, [path.join(ROOT, "scripts", "generate-openapi.js")], {
    stdio: "inherit",
  });

let timer = null;
function scheduleGenerate() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    console.log("Regenerating openapi.json...");
    gen();
  }, 150);
}

// initial
gen();

// watch recursively
try {
  fs.watch(API_DIR, { recursive: true }, (eventType, filename) => {
    scheduleGenerate();
  });
  console.log("Watching", API_DIR, "for API changes...");
} catch (err) {
  console.error(
    "fs.watch failed, please run `npm run openapi:generate` manually",
    err
  );
}
