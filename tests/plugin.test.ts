import { test, expect } from "vitest";
import { cajoa } from "../packages/cajoa/src/vite";

test("the plugin sets the dev flag on the dev server only", () => {
  const hook = cajoa().transformIndexHtml as unknown as (
    html: string,
    ctx: { server?: unknown },
  ) => unknown;

  expect(hook("", {})).toBeUndefined();
  expect(hook("", { server: {} })).toEqual([
    {
      tag: "script",
      children: "globalThis.__CAJOA_DEV__ = true;",
      injectTo: "head-prepend",
    },
  ]);
});
