
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const base = (process.env.DOCS_BASE ?? "/").replace(/\/?$/, "/");
const site = (process.env.DOCS_SITE ?? "https://cajoats.github.io").replace(
  /\/+$/,
  "",
);

const entry = ["entry-server.js", "entry-server.mjs"]
  .map((file) => join(root, "dist-ssr", file))
  .find(existsSync);

if (!entry) {
  throw new Error(
    "dist-ssr/entry-server.js was not found. Run the server build first.",
  );
}

const template = readFileSync(join(dist, "index.html"), "utf8");
const { render, routes } = await import(pathToFileURL(entry).href);

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// The replacers are functions on purpose:
// the HTML may contain "$" characters.
function page({ title, description }, html) {
  let out = template.replace("<!--app-->", () => html);

  out = out.replace(
    /<title>[^<]*<\/title>/,
    () => `<title>${escapeHtml(title)}</title>`,
  );

  if (description) {
    out = out.replace(
      /(<meta name="description" content=")[^"]*(")/,
      (_, a, b) => a + escapeHtml(description) + b,
    );

    out = out.replace(
      /(<meta property="og:title" content=")[^"]*(")/,
      (_, a, b) => a + escapeHtml(title) + b,
    );

    out = out.replace(
      /(<meta property="og:description" content=")[^"]*(")/,
      (_, a, b) => a + escapeHtml(description) + b,
    );
  }

  return out;
}

// Generate an HTML file for every route.
for (const route of routes) {
  const { html, head } = await render(route.path);

  const description =
    head.meta?.find((meta) => meta.name === "description")?.content ??
    route.description ??
    "";

  const meta = {
    title: head.title ?? route.title,
    description,
  };

  // "/" becomes dist/index.html
  // "/docs" becomes dist/docs/index.html
  const relativePath = route.path.replace(/^\/+|\/+$/g, "");
  const file = relativePath
    ? join(dist, relativePath, "index.html")
    : join(dist, "index.html");

  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(meta, html));

  console.log("prerendered " + route.path);
}

// GitHub Pages uses this file for unknown addresses.
writeFileSync(
  join(dist, "404.html"),
  page(
    {
      title: "Page not found | Cajoa",
      description: "",
    },
    "",
  ),
);

// Generate sitemap.xml.
const urls = routes
  .map((route) => {
    const path =
      route.path === "/"
        ? ""
        : route.path.replace(/^\/+|\/+$/g, "") + "/";

    return `  <url><loc>${escapeHtml(site + base + path)}</loc></url>`;
  })
  .join("\n");

writeFileSync(
  join(dist, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls +
    "\n</urlset>\n",
);

console.log(`Successfully prerendered ${routes.length} routes.`);
