import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const base = (process.env.DOCS_BASE ?? "/").replace(/\/?$/, "/"); // always ends with a slash
const site = (process.env.DOCS_SITE ?? "https://cajoats.github.io").replace(
  /\/$/,
  "",
);

const entry = ["entry-server.js", "entry-server.mjs"]
  .map((file) => join(root, "dist-ssr", file))
  .find(existsSync);
if (!entry)
  throw new Error(
    "dist-ssr/entry-server.js was not found. Run the server build first.",
  );

const template = readFileSync(join(dist, "index.html"), "utf8");
const { render, routes } = await import(pathToFileURL(entry).href);

const escapeHtml = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// The replacers are functions on purpose: the HTML has "$" characters in it
function page({ title, description }, html) {
  let out = template.replace("<!--app-->", () => html);
  out = out.replace(
    /<title>[^<]*<\/title>/,
    () => "<title>" + escapeHtml(title) + "</title>",
  );
  if (description) {
    out = out.replace(
      /(<meta name="description" content=")[^"]*(")/,
      (_, start, end) => start + escapeHtml(description) + end,
    );
  }
  return out;
}

for (const route of routes) {
  const html = await render(route.path);
  const file =
    route.path === "/"
      ? join(dist, "index.html")
      : join(dist, ...route.path.split("/").filter(Boolean), "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(route, html));
  console.log("prerendered " + route.path);
}

// GitHub Pages shows this file for unknown addresses. The browser then renders the "not found" page.
writeFileSync(
  join(dist, "404.html"),
  page({ title: "Page not found | Cajoa", description: "" }, ""),
);

const urls = routes
  .map((r) => {
    const path = r.path === "/" ? "" : r.path.replace(/^\//, "") + "/";
    return "  <url><loc>" + site + base + path + "</loc></url>";
  })
  .join("\n");
writeFileSync(
  join(dist, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls +
    "\n</urlset>\n",
);
