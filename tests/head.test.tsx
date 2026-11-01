import { test, expect } from "vitest";
import { createSignal, Meta, render, Title, type HeadData } from "cajoa";
import { headToString, renderToStringAsync } from "@cajoa/server";

test("Title sets document.title and puts the old one back", () => {
  document.title = "Site";
  const [name, setName] = createSignal("A");
  const root = document.createElement("div");

  const dispose = render(
    () => (
      <div>
        <Title>{name()} page</Title>
      </div>
    ),
    root
  );
  expect(document.title).toBe("A page");

  setName("B");
  expect(document.title).toBe("B page");

  dispose();
  expect(document.title).toBe("Site");
});

test("Meta adds a tag, updates it and removes it", () => {
  const [text, setText] = createSignal("Hi");
  const root = document.createElement("div");
  const tag = () => document.head.querySelector('meta[name="description"]');

  const dispose = render(
    () => (
      <div>
        <Meta name="description" content={text} />
      </div>
    ),
    root
  );
  expect(tag()?.getAttribute("content")).toBe("Hi");

  setText("Hello");
  expect(tag()?.getAttribute("content")).toBe("Hello");

  dispose();
  expect(tag()).toBeNull();
});

test("on the server, Title and Meta fill the head object", async () => {
  const [name] = createSignal("Ada");
  const head: HeadData = {};

  const html = await renderToStringAsync(
    () => (
      <main>
        <Title>Hello {name()}</Title>
        <Meta name="description" content="About" />
        <Meta property="og:title" content="Hello" />
        <p>x</p>
      </main>
    ),
    { head, hydratable: false }
  );

  expect(html).toBe("<main><p>x</p></main>");
  expect(head.title).toBe("Hello Ada");
  expect(headToString(head)).toBe(
    '<title>Hello Ada</title>\n<meta name="description" content="About">\n<meta property="og:title" content="Hello">'
  );
});