import { test, expect } from "vitest";
import { createSignal, render, Show } from "../src";

test("Show does not re-create children while truthiness is unchanged", () => {
  const [n, setN] = createSignal(1);
  let creates = 0;
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Show when={n}>
          {() => {
            creates++;
            return <p>{n}</p>;
          }}
        </Show>
      </div>
    ),
    root,
  );

  setN(2);
  expect(creates).toBe(1);
  expect(root.textContent).toBe("2");
});
