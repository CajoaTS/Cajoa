import { test, expect } from "vitest";
import {
  createSignal,
  For,
  h,
  hydrate,
  render,
  Show,
  type JSX,
} from "cajoa";
import { renderToString } from "@cajoa/server";

function makeApp() {
  const [name, setName] = createSignal("Ada");
  const [items, setItems] = createSignal(["a", "b", "c"]);
  const [open, setOpen] = createSignal(true);
  const [count, setCount] = createSignal(0);

  const App = () => (
    <main class="app">
      <h1>Hello {() => name()}!</h1>
      <input id="input" value="x" />
      <button id="button" onClick={() => setCount((n) => n + 1)}>
        clicked {() => count()}
      </button>
      <ul>
        <For each={() => items()}>{(item: string) => <li>{item}</li>}</For>
      </ul>
      <Show when={() => open()} fallback={() => <p>closed</p>}>
        {() => <p id="shown">open {() => name()}</p>}
      </Show>
    </main>
  );
  return { App, setName, setItems, setOpen };
}

const clean = (html: string) => html.replace(/<!--.*?-->/g, "");

// The server writes value, checked and selected as attributes, and the browser sets them as
// properties. Compare the markup without them, and check them as properties.
function snapshot(container: Element) {
  const copy = container.cloneNode(true) as Element;
  copy.querySelectorAll("*").forEach((element) => {
    for (const name of ["value", "checked", "selected"]) {
      element.removeAttribute(name);
    }
  });
  return clean(copy.innerHTML);
}

function serverHtml(App: () => JSX.Element | unknown) {
  return renderToString(App as () => unknown, { hydratable: true });
}

test("hydrate() reuses the elements that the server wrote", () => {
  const container = document.createElement("div");
  container.innerHTML = serverHtml(makeApp().App);

  const before = [...container.querySelectorAll("*")];
  const { App, setName, setItems, setOpen } = makeApp();
  const dispose = hydrate(App, container);

  const after = [...container.querySelectorAll("*")];
  expect(after).toHaveLength(before.length);
  after.forEach((element, i) => expect(element).toBe(before[i]));

  // No markers are left in the DOM
  expect(container.innerHTML).not.toContain("data-cj");
  expect(container.innerHTML).not.toMatch(/<!--[mt]\d+-->/);

  // It is alive: events, signals, lists and <Show> work
  container.querySelector<HTMLButtonElement>("#button")!.click();
  expect(container.querySelector("#button")!.textContent).toBe("clicked 1");

  setName("Bob");
  expect(container.querySelector("h1")!.textContent).toBe("Hello Bob!");
  expect(container.querySelector("#shown")!.textContent).toBe("open Bob");

  setItems(["c", "a", "d"]);
  expect(container.querySelector("ul")!.textContent).toBe("cad");

  setOpen(false);
  expect(container.querySelector("#shown")).toBeNull();
  expect(container.textContent).toContain("closed");

  dispose();
  expect(container.innerHTML).toBe("");
});

test("hydrate() gives the same result as render()", () => {
  const hydrated = document.createElement("div");
  hydrated.innerHTML = serverHtml(makeApp().App);
  hydrate(makeApp().App, hydrated);

  const rendered = document.createElement("div");
  render(makeApp().App, rendered);

  expect(snapshot(hydrated)).toBe(snapshot(rendered));
  expect(hydrated.querySelector<HTMLInputElement>("#input")!.value).toBe("x");
  expect(rendered.querySelector<HTMLInputElement>("#input")!.value).toBe("x");
});

test("hydrate() removes server nodes that the browser does not make", () => {
  const server = () => (
    <div>
      <p>keep</p>
      <p id="extra">server only</p>
    </div>
  );
  const client = () => (
    <div>
      <p>keep</p>
    </div>
  );

  const container = document.createElement("div");
  container.innerHTML = serverHtml(server);
  hydrate(client, container);

  expect(clean(container.innerHTML)).toBe("<div><p>keep</p></div>");
});

test("hydrate() uses what the browser renders when the text differs", () => {
  const container = document.createElement("div");
  container.innerHTML = serverHtml(() => <p>time 1</p>);
  const paragraph = container.querySelector("p");

  hydrate(() => <p>time 2</p>, container);

  expect(container.querySelector("p")).toBe(paragraph);
  expect(container.textContent).toBe("time 2");
});

test("hydrate() renders from scratch when there are no markers", () => {
  const container = document.createElement("div");
  container.innerHTML = "<p>old</p>";

  hydrate(() => <p>new</p>, container);

  expect(container.innerHTML).toBe("<p>new</p>");
});

test("hydrate() works on an empty container", () => {
  const container = document.createElement("div");
  const dispose = hydrate(() => <p>hi</p>, container);
  expect(container.innerHTML).toBe("<p>hi</p>");
  dispose();
  expect(container.innerHTML).toBe("");
});

test("hydrate() does not move elements inside nested blocks", () => {
  const makeNested = () => {
    const [on] = createSignal(true);
    return () =>
      h(
        "div",
        null,
        Show({
          when: () => on(),
          children: () =>
            Show({
              when: () => on(),
              children: () =>
                h("section", { id: "deep" }, h("i", null, "deep")),
            }),
        }),
        h("footer", null, "end"),
      );
  };

  const container = document.createElement("div");
  container.innerHTML = serverHtml(makeNested());
  const section = container.querySelector("#deep");

  const observer = new MutationObserver(() => {});
  observer.observe(container, { childList: true, subtree: true });
  hydrate(makeNested(), container);
  const records = observer.takeRecords();
  observer.disconnect();

  // Moving an element in the page counts as removing it. An <iframe> that moves loads again.
  const removed = records.flatMap((record) => [...record.removedNodes]);
  expect(removed.filter((node) => node.nodeType === 1)).toHaveLength(0);
  expect(container.querySelector("#deep")).toBe(section);
});

test("hydrate() does not write attributes that are already right", () => {
  const container = document.createElement("div");
  container.innerHTML = serverHtml(makeApp().App);

  // Writing an attribute again, even with the same value, can reload an <iframe> or a <video>
  const writes: string[] = [];
  const original = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name: string, value: string) {
    writes.push(name);
    return original.call(this, name, value);
  };
  try {
    hydrate(makeApp().App, container);
  } finally {
    Element.prototype.setAttribute = original;
  }

  expect(writes).not.toContain("class");
  expect(writes).not.toContain("id");
});

test("hydrate() keeps text typed in a field that the app does not control", () => {
  const app = () =>
    h(
      "div",
      null,
      h("input", { id: "free" }),
      h("input", { id: "controlled", value: "start" }),
    );

  const container = document.createElement("div");
  container.innerHTML = serverHtml(app);
  container.querySelector<HTMLInputElement>("#free")!.value = "typed";
  container.querySelector<HTMLInputElement>("#controlled")!.value = "typed";

  hydrate(app, container);

  expect(container.querySelector<HTMLInputElement>("#free")!.value).toBe("typed");
  // The app says the value is "start", so that is the value
  expect(container.querySelector<HTMLInputElement>("#controlled")!.value).toBe(
    "start",
  );
});
