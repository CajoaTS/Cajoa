import { copyFileSync, existsSync, readFileSync } from "node:fs";

const check = process.argv.includes("--check");
const read = (f) => readFileSync(f, "utf8").replace(/\r\n/g, "\n");

const targets = [
  ["README.md", "packages/cajoa/README.md"],
  ["LICENSE", "packages/cajoa/LICENSE"],
  ["LICENSE", "packages/core/LICENSE"],
  ["LICENSE", "packages/dom/LICENSE"],
  ["LICENSE", "create-cajoa/LICENSE"],
];

let outOfSync = false;
for (const [from, to] of targets) {
  if (existsSync(to) && read(from) === read(to)) continue;
  if (check) {
    console.error(`Out of sync: ${to} (run: npm run sync)`);
    outOfSync = true;
  } else {
    copyFileSync(from, to);
    console.log(`Synced ${to}`);
  }
}
if (outOfSync) process.exit(1);
