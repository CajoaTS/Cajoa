import { defineConfig } from "vite";
import { cajoa } from "cajoa/vite";

// DOCS_BASE is "/Cajoa/" on GitHub Pages, and "/" everywhere else
export default defineConfig({
  base: process.env.DOCS_BASE ?? "/",
  plugins: [cajoa()],
});
