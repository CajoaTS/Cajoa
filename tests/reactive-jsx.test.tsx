import { test, expect } from "vitest";
import { createSignal, render, Show, For } from "cajoa";

test("calls in children and attributes are reactive without a wrapper function", () => {
  const [n, setN] = createSignal(1);
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <p class={n() % 2 ? "odd" : "even"}>Double: {n() * 2}</p>
      </div>
    ),
    root,
  );
  const p = root.querySelector("p")!;
  expect(p.textContent).toBe("Double: 2");
  expect(p.getAttribute("class")).toBe("odd");

  setN(2);
  expect(p.textContent).toBe("Double: 4");
  expect(p.getAttribute("class")).toBe("even");
});

test("a style object with signals inside is reactive", () => {
  const [color, setColor] = createSignal("red");
  const box = (<div style={{ color: color() }} />) as HTMLElement;
  expect(box.style.color).toBe("red");

  setColor("blue");
  expect(box.style.color).toBe("blue");
});

test("Show children are created lazily, with no wrapper function", () => {
  const [on, setOn] = createSignal(false);
  let created = 0;
  const Heavy = () => {
    created++;
    return <b>heavy</b>;
  };
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Show when={on}>
          <Heavy />
        </Show>
      </div>
    ),
    root,
  );
  expect(created).toBe(0);
  expect(root.textContent).toBe("");

  setOn(true);
  expect(created).toBe(1);
  expect(root.textContent).toBe("heavy");

  setOn(false);
  expect(root.textContent).toBe("");
});

test("Show accepts a condition with calls and an element fallback", () => {
  const [count, setCount] = createSignal(0);
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Show when={count() > 1} fallback={<i>small</i>}>
          <b>big</b>
        </Show>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("small");

  setCount(2);
  expect(root.textContent).toBe("big");
});

test("For accepts a call in each", () => {
  const [items, setItems] = createSignal(["a", "b"]);
  const root = document.createElement("div");

  render(
    () => (
      <ul>
        <For each={items()}>{(x: string) => <li>{x}</li>}</For>
      </ul>
    ),
    root,
  );
  expect(root.querySelectorAll("li").length).toBe(2);

  setItems(["a", "b", "c"]);
  expect(root.querySelectorAll("li").length).toBe(3);
});

test("children of your own component are reactive when they contain calls", () => {
  const [n, setN] = createSignal(1);
  const Box = (props: { children?: unknown }) => <div>{props.children}</div>;
  const root = document.createElement("div");

  render(() => <Box>Count: {n()}</Box>, root);
  expect(root.textContent).toBe("Count: 1");

  setN(2);
  expect(root.textContent).toBe("Count: 2");
});

test("props of your own components are plain values, not getters", () => {
  const [name, setName] = createSignal("A");
  const Greeting = (props: { name: string }) => <p>{props.name}</p>;
  const root = document.createElement("div");

  render(() => <Greeting name={name()} />, root);
  expect(root.textContent).toBe("A");

  setName("B");
  expect(root.textContent).toBe("A"); 
});
