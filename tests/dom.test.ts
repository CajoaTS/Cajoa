import { test, expect } from "vitest";
import { createSignal } from "../src/reactivity/signal";
import { h } from "../src/dom/h";
import { render } from "../src/dom/render";

test("text updates when signal changes", () => {
  const [count, setCount] = createSignal(0);
  const root = document.createElement("div");

  render(() => h("p", null, "Count: ", count), root);
  expect(root.textContent).toBe("Count: 0");

  setCount(5);
  expect(root.textContent).toBe("Count: 5");
});

test("click handler updates the UI", () => {
  const [count, setCount] = createSignal(0);
  const btn = h("button", { onClick: () => setCount(count() + 1) }, count);

  btn.click();
  btn.click();
  expect(btn.textContent).toBe("2");
});
