import { test, expect } from "vitest";
import { createSignal, render, Show } from "cajoa";

test("fragment renders siblings without a wrapper", () => {
  const root = document.createElement("div");
  render(
    () => (
      <>
        <h1>Title</h1>
        <p>Body</p>
      </>
    ),
    root,
  );
  expect(root.innerHTML).toBe("<h1>Title</h1><p>Body</p>");
});

test("reactive child directly inside a fragment", () => {
  const [n, setN] = createSignal(0);
  const root = document.createElement("div");
  render(
    () => (
      <>
        {n}
        <b>!</b>
      </>
    ),
    root,
  );
  expect(root.textContent).toBe("0!");

  setN(3);
  expect(root.textContent).toBe("3!");
});

test("Show can return a fragment", () => {
  const [on, setOn] = createSignal(false);
  const root = document.createElement("div");
  render(
    () => (
      <div>
        <Show when={on}>
          {() => (
            <>
              <i>x</i>
              <i>y</i>
            </>
          )}
        </Show>
      </div>
    ),
    root,
  );
  expect(root.querySelectorAll("i").length).toBe(0);

  setOn(true);
  expect(root.querySelectorAll("i").length).toBe(2);

  setOn(false);
  expect(root.querySelectorAll("i").length).toBe(0);
});
