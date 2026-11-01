import { test, expect } from "vitest";
import { createSignal, For, render } from "cajoa";

test("For shows its fallback when the list is empty", () => {
  const [items, setItems] = createSignal<string[]>([]);
  const root = document.createElement("div");

  render(
    () => (
      <ul>
        <For each={items} fallback={<li>none</li>}>
          {(item: string) => <li>{item}</li>}
        </For>
      </ul>
    ),
    root
  );
  expect(root.textContent).toBe("none");

  setItems(["a", "b"]);
  expect(root.textContent).toBe("ab");

  setItems([]);
  expect(root.textContent).toBe("none");
});