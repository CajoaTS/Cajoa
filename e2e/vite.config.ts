import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { cajoa } from "../packages/cajoa/src/vite";

const p = (f: string) => fileURLToPath(new URL(f, import.meta.url));

export default defineConfig({
  root: p("./app"),
  plugins: [cajoa()],
  resolve: {
    alias: [
      {
        find: /^cajoa\/jsx(-dev)?-runtime$/,
        replacement: p("../packages/core/src/jsx-runtime.ts"),
      },
      { find: /^cajoa$/, replacement: p("../packages/cajoa/src/index.ts") },
      {
        find: /^@cajoa\/core$/,
        replacement: p("../packages/core/src/index.ts"),
      },
      { find: /^@cajoa\/dom$/, replacement: p("../packages/dom/src/index.ts") },
    ],
  },
  server: { fs: { allow: [p("..")] } },
});
