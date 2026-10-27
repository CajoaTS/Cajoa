import { build } from "esbuild";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { aliasPlugin, outDir, root } from "./shared.mjs";

const outfile = join(outDir, "reactivity.mjs");

await build({
  entryPoints: [join(root, "bench", "reactivity.ts")],
  outfile,
  bundle: true,
  minify: true,
  format: "esm",
  platform: "node", 
  plugins: [aliasPlugin],
  logLevel: "warning",
});

await import(pathToFileURL(outfile).href);
