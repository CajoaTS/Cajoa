import { build } from "esbuild";
import { chromium } from "@playwright/test";
import { join } from "node:path";
import { aliasPlugin, outDir, root } from "./shared.mjs";

const outfile = join(outDir, "browser.js");

await build({
  entryPoints: [join(root, "bench", "browser", "app.tsx")],
  outfile,
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
  jsxImportSource: "cajoa",
  plugins: [aliasPlugin],
  logLevel: "warning",
});

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("pageerror", (error) => {
  console.error(error);
  process.exitCode = 1;
});

await page.setContent('<!doctype html><div id="app"></div>');
await page.addScriptTag({ path: outfile });

const names = await page.evaluate(() => window.__scenarios);
const rows = [];
for (const name of names) {
  const samples = await page.evaluate(
    ([n, i]) => window.__measure(n, i),
    [name, 15],
  );
  samples.sort((a, b) => a - b);
  rows.push({
    scenario: name,
    "median ms": +samples[Math.floor(samples.length / 2)].toFixed(2),
    "min ms": +samples[0].toFixed(2),
  });
}

console.table(rows);
await browser.close();
