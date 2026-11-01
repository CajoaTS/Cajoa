
import type { HeadData } from "cajoa";
import { renderToStringAsync } from "cajoa/server";
import { App } from "./App";
import { routeMeta } from "./pages";

// Routes consumed by the prerender script.
export const routes = routeMeta;

export async function render(
  path: string,
): Promise<{ html: string; head: HeadData }> {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");

  const head: HeadData = {};

  // hydratable: false because the browser renders the app separately.
  const html = await renderToStringAsync(
    () => <App />,
    {
      url: base + path,
      hydratable: false,
      head,
    },
  );

  return { html, head };
}
