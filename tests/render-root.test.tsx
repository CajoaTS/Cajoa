import { test, expect } from "vitest";
import { createSignal, render, Show } from "cajoa";

test("render accepts a component that returns a function, such as Show", () => {
  const [on, setOn] = createSignal(true);
  const root = document.createElement("div");

  const dispose = render(
    () => (
      <Show when={on()} fallback={<p>off</p>}>
        <p>on</p>
      </Show>
    ),
    root,
  );
  expect(root.textContent).toBe("on");

  setOn(false);
  expect(root.textContent).toBe("off");

  dispose();
  expect(root.textContent).toBe("");
});

test("render accepts text", () => {
  const root = document.createElement("div");
  render(() => "hello", root);
  expect(root.textContent).toBe("hello");
});
