import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const p = (f: string) => fileURLToPath(new URL(f, import.meta.url));

export default defineConfig({
  oxc: { jsx: { runtime: "automatic", importSource: "cajoa" } },
  resolve: {
    alias: [
      {
        find: /^cajoa\/jsx(-dev)?-runtime$/,
        replacement: p("./src/jsx-runtime.ts"),
      },
      { find: /^cajoa$/, replacement: p("./src/index.ts") },
    ],
  },
  test: { environment: "jsdom" },
});
