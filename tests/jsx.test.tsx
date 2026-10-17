import { test, expect } from "vitest";
import { createSignal, render, Show, For } from "../src";

test("reactive text in JSX", () => {
  const [count, setCount] = createSignal(0);
  const root = document.createElement("div");

  render(() => <p>Count: {count}</p>, root);
  expect(root.textContent).toBe("Count: 0");

  setCount(5);
  expect(root.textContent).toBe("Count: 5");
});

test("onClick in JSX", () => {
  const [n, setN] = createSignal(0);
  const btn = (
    <button onClick={() => setN((c) => c + 1)}>{n}</button>
  ) as HTMLButtonElement;

  btn.click();
  btn.click();
  expect(btn.textContent).toBe("2");
});

test("components run only once", () => {
  const [n, setN] = createSignal(0);
  let runs = 0;
  const Counter = () => {
    runs++;
    return <p>{n}</p>;
  };
  const root = document.createElement("div");

  render(() => <Counter />, root);
  setN(1);
  setN(2);
  expect(runs).toBe(1);
  expect(root.textContent).toBe("2");
});

test("Show and For as JSX components", () => {
  const [on, setOn] = createSignal(false);
  const [items, setItems] = createSignal(["a", "b"]);
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Show when={on} fallback={() => <p>off</p>}>
          {() => (
            <ul>
              <For each={items}>{(x: string) => <li>{x}</li>}</For>
            </ul>
          )}
        </Show>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("off");

  setOn(true);
  expect(root.querySelectorAll("li").length).toBe(2);

  setItems(["a", "b", "c"]);
  expect(root.querySelectorAll("li").length).toBe(3);
});
