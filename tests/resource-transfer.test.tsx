import { test, expect } from "vitest";
import {
  createResource,
  createSignal,
  h,
  hydrate,
  Meta,
  Show,
  Suspense,
  Title,
} from "cajoa";
import { renderToString, renderToStringAsync } from "@cajoa/server";

const later = <T,>(value: T, ms = 2) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));
const wait = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms));

// An app with a resource inside <Suspense>, and elements before and after it
function makeApp(calls: { count: number }, id = 7) {
  return () => {
    const [source] = createSignal(id);
    const [user, { refetch }] = createResource(
      () => source(),
      (n: number) => {
        calls.count++;
        return later({ name: "user " + n });
      },
    );
    (globalThis as { __refetch?: () => void }).__refetch = refetch;
    return h(
      "main",
      null,
      h("h2", null, "title"),
      h(
        "div",
        null,
        h("b", null, "before"),
        Suspense({
          fallback: () => h("p", { id: "wait" }, "wait"),
          children: () => h("p", { id: "user" }, () => user()?.name),
        }),
        h("i", null, "after"),
      ),
      h("footer", null, "foot"),
    );
  };
}

test("renderToStringAsync sends what the resources loaded with the HTML", async () => {
  const calls = { count: 0 };
  const html = await renderToStringAsync(makeApp(calls), { hydratable: true });

  expect(html).toContain(">user 7<");
  expect(html).not.toContain(">wait<");
  expect(html).toContain('<script type="application/json" data-cj-data>');
  expect(html).toContain('[["7",{"name":"user 7"}]]');
  // However many passes it takes, each fetcher runs once
  expect(calls.count).toBe(1);
});

test("without hydratable, renderToStringAsync is the same as before", async () => {
  const calls = { count: 0 };
  const html = await renderToStringAsync(makeApp(calls));

  expect(html).not.toContain("data-cj");
  expect(html).not.toContain("<script");
  expect(calls.count).toBe(1);
});

test("nothing is sent when no resource has data", async () => {
  const html = await renderToStringAsync(() => h("p", null, "hi"), {
    hydratable: true,
  });
  expect(html).toBe('<p data-cj="1"><!--t2-->hi</p>');
});

test("data cannot break out of the script tag", async () => {
  const evil = "</script><script>window.__pwn = 1</script><!-- \u2028 & <b>";
  const html = await renderToStringAsync(
    () => {
      const [data] = createResource(() => later(evil));
      return h("p", null, () => data());
    },
    { hydratable: true },
  );

  const script = html.slice(html.indexOf("<script"));
  expect(script.match(/<\/script>/g)).toHaveLength(1);
  expect(script).not.toContain("<!--");
  expect(script).not.toContain("\u2028");

  const container = document.createElement("div");
  container.innerHTML = html;
  hydrate(() => {
    const [data] = createResource(() => later(evil));
    return h("p", null, () => data());
  }, container);
  expect(container.querySelector("p")!.textContent).toBe(evil);
  expect((globalThis as { __pwn?: number }).__pwn).toBeUndefined();
});

test("a resource that depends on another loads once, and the head is not repeated", async () => {
  let fetches = 0;
  const head: { title?: string; meta?: { name?: string; content: string }[] } =
    {};
  const html = await renderToStringAsync(
    () => {
      const [first] = createResource(() => {
        fetches++;
        return later(1);
      });
      return h(
        "div",
        null,
        Title({ children: "Page" }),
        Meta({ name: "description", content: "x" }),
        Show({
          when: () => first(),
          children: () => {
            const [second] = createResource(
              () => first(),
              (n: number) => {
                fetches++;
                return later(n + 1);
              },
            );
            return h("p", null, () => second());
          },
        }),
      );
    },
    { hydratable: true, head },
  );

  expect(html).toContain(">2<");
  expect(fetches).toBe(2);
  expect(head.title).toBe("Page");
  expect(head.meta).toHaveLength(1);
});

test("hydrate() starts resources with the data from the server, without loading again", async () => {
  const html = await renderToStringAsync(makeApp({ count: 0 }), {
    hydratable: true,
  });

  const container = document.createElement("div");
  container.innerHTML = html;
  const before = [...container.querySelectorAll("*")].filter(
    (element) => element.localName !== "script",
  );

  const calls = { count: 0 };
  const dispose = hydrate(makeApp(calls), container);

  // The content is there at once: no loading state, no new fetch
  expect(container.querySelector("#user")!.textContent).toBe("user 7");
  expect(container.querySelector("#wait")).toBeNull();
  expect(calls.count).toBe(0);
  await wait();
  expect(calls.count).toBe(0);

  // The same elements, and the data script is gone
  const after = [...container.querySelectorAll("*")];
  expect(after).toHaveLength(before.length);
  after.forEach((element, i) => expect(element).toBe(before[i]));
  expect(container.querySelector("script")).toBeNull();

  // Loading again still works
  (globalThis as { __refetch?: () => void }).__refetch!();
  await wait();
  expect(calls.count).toBe(1);

  dispose();
});

test("hydrate() loads when the source is not the one that the server used", async () => {
  const html = await renderToStringAsync(makeApp({ count: 0 }, 7), {
    hydratable: true,
  });

  const container = document.createElement("div");
  container.innerHTML = html;

  const calls = { count: 0 };
  hydrate(makeApp(calls, 8), container);
  await wait();

  expect(calls.count).toBe(1);
  expect(container.querySelector("#user")!.textContent).toBe("user 8");
});

test("hydrate() works with a resource that is not in <Suspense>", async () => {
  const app = (calls: { count: number }) => () => {
    const [data] = createResource(() => {
      calls.count++;
      return later("loaded");
    });
    return h(
      "section",
      null,
      h("p", { id: "r" }, () => data() ?? "loading"),
    );
  };

  const html = await renderToStringAsync(app({ count: 0 }), {
    hydratable: true,
  });
  const container = document.createElement("div");
  container.innerHTML = html;
  const paragraph = container.querySelector("#r");

  const calls = { count: 0 };
  hydrate(app(calls), container);

  expect(container.querySelector("#r")).toBe(paragraph);
  expect(paragraph!.textContent).toBe("loaded");
  await wait();
  expect(calls.count).toBe(0);
});

test("renderToString does not send data", () => {
  const html = renderToString(makeApp({ count: 0 }), { hydratable: true });
  expect(html).not.toContain("data-cj-data");
});
