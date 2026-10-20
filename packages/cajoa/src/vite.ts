import { version } from "vite";
import type { Plugin } from "vite";
import { transformJsx } from "./compiler";

export interface CajoaPluginOptions {
  importSource?: string;
}

export function cajoa(options: CajoaPluginOptions = {}): Plugin {
  const importSource = options.importSource ?? "cajoa";

  return {
    name: "cajoa",
    enforce: "pre",

    config() {
      const major = Number.parseInt(version, 10);
      return (
        major >= 8
          ? { oxc: { jsx: { runtime: "automatic", importSource } } }
          : { esbuild: { jsx: "automatic", jsxImportSource: importSource } }
      ) as never;
    },

    transform(code, id) {
      const result = transformJsx(code, id);
      return result ? { code: result.code, map: result.map as never } : null;
    },
  };
}
