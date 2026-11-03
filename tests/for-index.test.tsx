import { test, expect } from "vitest";
import { createSignal, For, render } from "cajoa";

test("the index of a For item is a function that follows the item", () => {
  const [items, setItems] = createSignal(["a", "b", "c"]);
  const root = document.createElement("div");

  render(
    () => (
      <ul>
        <For each={items}>
          {(item: string, index: () => number) => (
            <li>
              {index()}:{item}
            </li>
          )}
        </For>
      </ul>
    ),
    root,
  );
  expect(root.textContent).toBe("0:a1:b2:c");

  const first = root.querySelector("li");
  setItems(["c", "a", "b"]);
  expect(root.textContent).toBe("0:c1:a2:b");
  expect(root.querySelectorAll("li")[1]).toBe(first); // the node for "a" was reused
});
