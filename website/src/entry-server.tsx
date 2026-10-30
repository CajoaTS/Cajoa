import { renderToStringAsync } from "cajoa/server";
import { App } from "./App";
import { routeMeta } from "./pages";

// The prerender script reads these
export const routes = routeMeta;

export function render(path: string): Promise<string> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  // hydratable: false, because the browser replaces the page with render(), not hydrate()
  return renderToStringAsync(() => <App />, {
    url: base + path,
    hydratable: false,
  });
}
