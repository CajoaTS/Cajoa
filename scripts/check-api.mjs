import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const write = process.argv.includes("--write");

// The public types of each package, as built. `api/` has the committed snapshots.
const targets = [
  ["core", "packages/core/dist/index.d.ts"],
  ["dom", "packages/dom/dist/index.d.ts"],
  ["server", "packages/server/dist/index.d.ts"],
  ["vite-plugin", "packages/cajoa/dist/vite.d.ts"],
];

const normalize = (text) => text.replace(/\r\n/g, "\n").trim() + "\n";
let failed = false;

mkdirSync("api", { recursive: true });

for (const [name, file] of targets) {
  if (!existsSync(file)) {
    console.error(`${file} does not exist. Run "npm run build" first.`);
    process.exit(1);
  }
  const current = normalize(readFileSync(file, "utf8"));
  const snapshot = join("api", name + ".d.ts");

  if (write) {
    writeFileSync(snapshot, current);
    console.log("Wrote " + snapshot);
    continue;
  }

  const saved = existsSync(snapshot)
    ? normalize(readFileSync(snapshot, "utf8"))
    : null;
  if (saved === current) continue;

  failed = true;
  console.error(`\nThe public API of "${name}" changed.`);
  if (saved === null) {
    console.error(
      `  There is no snapshot yet (${snapshot}). Run: npm run api:update`,
    );
    continue;
  }
  const before = new Set(saved.split("\n"));
  const after = new Set(current.split("\n"));
  const removed = [...before].filter((line) => !after.has(line));
  const added = [...after].filter((line) => !before.has(line));
  for (const line of removed.slice(0, 15)) console.error("  - " + line);
  for (const line of added.slice(0, 15)) console.error("  + " + line);
  if (removed.length > 15 || added.length > 15)
    console.error("  ... (see the full diff with git after api:update)");
}

if (failed) {
  console.error(
    "\nIf this change is on purpose: run `npm run api:update`, commit the api/ folder, and explain the change in the PR.",
  );
  process.exit(1);
}
if (!write) console.log("Public API matches the snapshots.");
