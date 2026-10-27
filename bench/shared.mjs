import { fileURLToPath } from "node:url";
import { join } from "node:path";

export const root = fileURLToPath(new URL("..", import.meta.url));
export const outDir = join(root, "bench", ".out");

const map = {
  "@cajoa/core": join(root, "packages/core/src/index.ts"),
  "@cajoa/dom": join(root, "packages/dom/src/index.ts"),
  cajoa: join(root, "packages/cajoa/src/index.ts"),
  "cajoa/jsx-runtime": join(root, "packages/core/src/jsx-runtime.ts"),
  "cajoa/jsx-dev-runtime": join(root, "packages/core/src/jsx-runtime.ts"),
};

/** Source code ng repo ang ginagamit (hindi ang dist), kaya hindi kailangang mag-build muna. */
export const aliasPlugin = {
  name: "cajoa-source-alias",
  setup(build) {
    build.onResolve(
      { filter: /^(cajoa|@cajoa\/core|@cajoa\/dom)(\/jsx-(dev-)?runtime)?$/ },
      (args) => (map[args.path] ? { path: map[args.path] } : undefined),
    );
  },
};
