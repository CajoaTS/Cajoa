import type { HeadData } from "cajoa";
import { renderToStringAsync } from "cajoa/server";
import { App } from "./App";
import { routeMeta } from "./pages";

// The prerender script reads these
export const routes = routeMeta;

export async function render(path: string): Promise<{ html: string; head: HeadData }> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const head: HeadData = {};
  // hydratable: false, because the browser replaces the page with render(), not hydrate()
  const html = await renderToStringAsync(() => <App />, { url: base + path, hydratable: false, head });
  return { html, head };
}