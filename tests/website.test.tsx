import { test, expect } from "vitest";
import { renderToString } from "@cajoa/server";
import { App } from "../website/src/App";
import { highlight } from "../website/src/highlight";
import { routeMeta } from "../website/src/pages";

test.each(routeMeta.map((route) => [route.path]))(
  "%s renders on the server",
  (path) => {
    const html = renderToString(() => <App />, {
      url: path,
      hydratable: false,
    });
    expect(html).toContain("<h1");
    expect(html).not.toContain("Page not found");
  },
);

test("an unknown address shows the not found page", () => {
  const html = renderToString(() => <App />, {
    url: "/nope",
    hydratable: false,
  });
  expect(html).toContain("Page not found");
});

test("highlight wraps keywords, strings and comments", () => {
  const html = renderToString(
    () => <pre>{highlight('const a = "<b>"; // hi', "ts")}</pre>,
    {
      hydratable: false,
    },
  );
  expect(html).toBe(
    '<pre><span class="tok-k">const</span> a = <span class="tok-s">"&lt;b&gt;"</span>; <span class="tok-c">// hi</span></pre>',
  );
});
