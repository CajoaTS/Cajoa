import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const p = (f: string) => fileURLToPath(new URL(f, import.meta.url));

export default defineConfig({
  oxc: { jsx: { runtime: "automatic", importSource: "cajoa" } },
  resolve: {
    alias: [
      {
        find: /^cajoa\/jsx(-dev)?-runtime$/,
        replacement: p("./packages/core/src/jsx-runtime.ts"),
      },
      { find: /^cajoa$/, replacement: p("./packages/cajoa/src/index.ts") },
      {
        find: /^@cajoa\/core$/,
        replacement: p("./packages/core/src/index.ts"),
      },
      { find: /^@cajoa\/dom$/, replacement: p("./packages/dom/src/index.ts") },
    ],
  },
  test: { environment: "jsdom" },
});
