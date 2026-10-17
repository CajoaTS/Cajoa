import { test, expect } from "vitest";
import { createSignal, h, render, For } from "../src";

const make = () => {
  const a = { t: "a" },
    b = { t: "b" },
    c = { t: "c" };
  const [items, setItems] = createSignal([a, b]);
  const root = document.createElement("div");
  return { a, b, c, items, setItems, root };
};

test("reuses DOM nodes of unchanged items", () => {
  const { c, a, b, items, setItems, root } = make();
  render(
    () =>
      h("ul", null, For({ each: items, children: (x) => h("li", null, x.t) })),
    root,
  );

  const first = root.querySelector("li")!;
  setItems([a, b, c]);

  expect(root.querySelector("li")).toBe(first);
  expect(root.querySelectorAll("li").length).toBe(3);
});

test("reorders without recreating", () => {
  const { a, b, items, setItems, root } = make();
  render(
    () =>
      h("ul", null, For({ each: items, children: (x) => h("li", null, x.t) })),
    root,
  );

  const [liA, liB] = Array.from(root.querySelectorAll("li"));
  setItems([b, a]);

  const after = Array.from(root.querySelectorAll("li"));
  expect(after[0]).toBe(liB);
  expect(after[1]).toBe(liA);
  expect(root.textContent).toBe("ba");
});

test("removed items stop reacting (no leak)", () => {
  const { a, b, items, setItems, root } = make();
  const [n, setN] = createSignal(0);
  let runs = 0;

  render(
    () =>
      h(
        "ul",
        null,
        For({
          each: items,
          children: (x) =>
            h("li", null, () => {
              runs++;
              return x.t + n();
            }),
        }),
      ),
    root,
  );
  expect(runs).toBe(2);

  setItems([a]); // inalis si b
  setN(1);
  expect(runs).toBe(3); // si a lang ang nag-update, hindi si b
});
