import { test, expect } from "vitest";
import { createSignal } from "cajoa";
import { h } from "cajoa";
import { render } from "cajoa";

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
