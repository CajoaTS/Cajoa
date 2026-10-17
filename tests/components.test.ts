import { test, expect } from "vitest";
import { createSignal } from "cajoa";
import { h } from "cajoa";
import { render } from "cajoa";
import { Show } from "cajoa";
import { For } from "cajoa";

test("Show swaps content", () => {
  const [on, setOn] = createSignal(true);
  const root = document.createElement("div");

  render(
    () =>
      h(
        "div",
        null,
        Show({
          when: on,
          children: () => h("p", null, "Hello"),
          fallback: () => h("p", null, "Bye"),
        }),
      ),
    root,
  );
  expect(root.textContent).toBe("Hello");

  setOn(false);
  expect(root.textContent).toBe("Bye");
});

test("For renders a list", () => {
  const [items, setItems] = createSignal(["a", "b"]);
  const root = document.createElement("div");

  render(
    () =>
      h("ul", null, For({ each: items, children: (x) => h("li", null, x) })),
    root,
  );
  expect(root.querySelectorAll("li").length).toBe(2);

  setItems(["a", "b", "c"]);
  expect(root.querySelectorAll("li").length).toBe(3);
});
