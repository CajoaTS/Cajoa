import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const budgetFile = join(root, "size-budget.json");
const write = process.argv.includes("--write");

// Bawat entry ay maliit na app na gumagamit ng ilang bahagi ng framework.
// Ang dist (ang talagang ina-publish) ang sinusukat, kaya kailangang naka-build.
const entries = {
  "@cajoa/core: signals": `
    import { createSignal, createEffect, createMemo } from "@cajoa/core";
    const [n, setN] = createSignal(0);
    const double = createMemo(() => n() * 2);
    createEffect(() => console.log(double()));
    setN(1);`,
  "@cajoa/core: everything": `import * as core from "@cajoa/core"; console.log(core);`,
  "cajoa: counter app": `
    import { createSignal, render } from "cajoa";
    const [n, setN] = createSignal(0);
    render(() => {
      const b = document.createElement("button");
      b.onclick = () => setN(n() + 1);
      return b;
    }, document.body);`,
  "cajoa: with router": `import { render, Router, Route, Link } from "cajoa"; console.log(render, Router, Route, Link);`,
  "cajoa: everything": `import * as cajoa from "cajoa"; console.log(cajoa);`,
};

async function measure(code) {
  const result = await build({
    stdin: { contents: code, resolveDir: root, loader: "js" },
    bundle: true,
    minify: true,
    format: "esm",
    platform: "browser",
    write: false,
    logLevel: "silent",
  });
  return gzipSync(result.outputFiles[0].contents, { level: 9 }).length;
}

const sizes = {};
try {
  for (const [name, code] of Object.entries(entries))
    sizes[name] = await measure(code);
} catch (error) {
  console.error("Could not bundle the packages. Run `npm run build` first.\n");
  console.error(error.message);
  process.exit(1);
}

if (write) {
  const next = {};
  // 8% na espasyo, naka-round up sa 50 bytes
  for (const [name, size] of Object.entries(sizes))
    next[name] = Math.ceil((size * 1.08) / 50) * 50;
  writeFileSync(budgetFile, JSON.stringify(next, null, 2) + "\n");
  console.log("Wrote size-budget.json\n");
}

const budget = existsSync(budgetFile)
  ? JSON.parse(readFileSync(budgetFile, "utf8"))
  : {};
let failed = false;
const rows = [];

for (const [name, size] of Object.entries(sizes)) {
  const limit = budget[name];
  let status = "ok";
  if (limit === undefined) {
    status = "NO BUDGET";
    failed = true;
  } else if (size > limit) {
    status = "OVER BUDGET";
    failed = true;
  }
  rows.push({
    entry: name,
    "gzip (B)": size,
    "budget (B)": limit ?? "-",
    status,
  });
}

console.table(rows);

if (failed) {
  console.error(
    "\nA bundle is over its budget (or has none). If the growth is on purpose, run `npm run size:update` and commit size-budget.json.",
  );
  process.exit(1);
}
