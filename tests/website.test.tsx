import { test, expect } from "vitest";
import { renderToString } from "@cajoa/server";
import { App } from "../website/src/App";
import { highlight } from "../website/src/highlight";
import { routeMeta } from "../website/src/pages";
import { search } from "../website/src/search";
import { slug } from "../website/src/site";

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

test("search finds guides and API entries", () => {
  expect(search("").length).toBeGreaterThan(5);
  expect(search("createsignal")[0].kind).toBe("API");
  expect(search("router")[0].href).toContain("/docs/");
  expect(search("zzzzzz")).toEqual([]);
});

test("slug makes safe ids", () => {
  expect(slug("createSignal(value)")).toBe("createsignal-value");
  expect(slug("  Hello, World!  ")).toBe("hello-world");
});