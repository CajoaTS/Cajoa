import { test, expect } from "vitest";
import { createEffect, createStore, render, For } from "cajoa";

test("reads are tracked per property", () => {
  const [state, setState] = createStore({ user: { name: "Ada", age: 30 } });
  let nameRuns = 0;
  let ageRuns = 0;

  createEffect(() => {
    state.user.name;
    nameRuns++;
  });
  createEffect(() => {
    state.user.age;
    ageRuns++;
  });

  setState("user", "name", "Grace");
  expect([nameRuns, ageRuns]).toEqual([2, 1]);
});

test("setState: a path, an updater function, and merging objects", () => {
  const [state, setState] = createStore({
    count: 0,
    user: { name: "Ada", age: 30 },
  });

  setState("count", 1);
  expect(state.count).toBe(1);

  setState("count", (c) => c + 1);
  expect(state.count).toBe(2);

  setState("user", { age: 31 });
  expect(state.user.name).toBe("Ada");
  expect(state.user.age).toBe(31);

  setState({ count: 10 });
  expect(state.count).toBe(10);
  expect(state.user.age).toBe(31);
});

test("setState with a function edits a draft, as one update", () => {
  const [state, setState] = createStore({ count: 0, user: { name: "Ada" } });
  const seen: string[] = [];

  createEffect(() => {
    seen.push(`${state.user.name}:${state.count}`);
  });

  setState((draft) => {
    draft.user.name = "Linus";
    draft.count++;
  });

  expect(state.user.name).toBe("Linus");
  expect(state.count).toBe(1);
  expect(seen).toEqual(["Ada:0", "Linus:1"]);
});

test("arrays: push through a draft, index paths, and updater functions", () => {
  const [state, setState] = createStore({
    todos: [{ text: "a", done: false }],
  });
  const lengths: number[] = [];
  let labels = "";

  createEffect(() => {
    lengths.push(state.todos.length);
  });
  createEffect(() => {
    labels = state.todos.map((t) => t.text).join(",");
  });

  setState((draft) => {
    draft.todos.push({ text: "b", done: false });
  });
  expect(lengths).toEqual([1, 2]);
  expect(labels).toBe("a,b");

  setState("todos", 1, "text", "B");
  expect(labels).toBe("a,B");
  expect(lengths).toEqual([1, 2]);

  setState("todos", (list) => list.filter((t) => t.text !== "a"));
  expect(labels).toBe("B");
  expect(state.todos.length).toBe(1);
});

test("setting undefined removes a key from an object", () => {
  const [state, setState] = createStore<{
    user: { name: string; age?: number };
  }>({
    user: { name: "Ada", age: 30 },
  });
  let keys = "";

  createEffect(() => {
    keys = Object.keys(state.user).join(",");
  });
  expect(keys).toBe("name,age");

  setState("user", "age", undefined);
  expect(keys).toBe("name");
  expect("age" in state.user).toBe(false);
});

test("changing the store directly throws", () => {
  const [state] = createStore({ count: 0, list: [1] });

  expect(() => {
    (state as { count: number }).count = 1;
  }).toThrow(/setState/);
  expect(() => {
    state.list.push(2);
  }).toThrow(/setState/);
});

test("one setState call is one update", () => {
  const [state, setState] = createStore({ a: 0, b: 0 });
  let runs = 0;

  createEffect(() => {
    state.a;
    state.b;
    runs++;
  });

  setState({ a: 1, b: 2 });
  expect(runs).toBe(2);
});

test("items keep their identity when the list changes", () => {
  const [state, setState] = createStore({ list: [{ n: 1 }] });
  const first = state.list[0];

  expect(state.list[0]).toBe(first);

  setState("list", (l) => [...l, { n: 2 }]);
  expect(state.list[0]).toBe(first);
  expect(state.list.length).toBe(2);
});

test("a value read from the store can be stored in it again", () => {
  const [state, setState] = createStore({
    todos: [{ text: "a" }],
    selected: undefined as { text: string } | undefined,
  });

  setState("selected", state.todos[0]);
  expect(state.selected).toBe(state.todos[0]);

  setState("todos", 0, "text", "b");
  expect(state.selected?.text).toBe("b");
});

test("only plain objects and arrays are made reactive", () => {
  const [state, setState] = createStore({ when: new Date(0), list: [1, 2] });

  expect(state.when instanceof Date).toBe(true);
  expect(Array.isArray(state.list)).toBe(true);

  setState("when", new Date(1));
  expect(state.when.getTime()).toBe(1);
});

test("a store drives the DOM through the Vite plugin", () => {
  const [state, setState] = createStore({
    count: 0,
    todos: [
      { id: 1, text: "one" },
      { id: 2, text: "two" },
    ],
  });
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <p id="count">{state.count}</p>
        <ul>
          <For each={state.todos}>
            {(t: { id: number; text: string }) => <li>{t.text}</li>}
          </For>
        </ul>
      </div>
    ),
    root,
  );
  expect(root.querySelector("#count")!.textContent).toBe("0");
  expect(root.querySelectorAll("li").length).toBe(2);

  const firstItem = root.querySelector("li")!;
  setState("todos", 0, "text", "uno");
  expect(root.querySelector("li")).toBe(firstItem);
  expect(firstItem.textContent).toBe("uno");

  setState("count", 5);
  expect(root.querySelector("#count")!.textContent).toBe("5");

  setState((draft) => {
    draft.todos.push({ id: 3, text: "three" });
  });
  expect(root.querySelectorAll("li").length).toBe(3);

  setState("todos", (list) => list.filter((t) => t.id !== 2));
  expect(root.querySelectorAll("li").length).toBe(2);
  expect(root.querySelector("li")).toBe(firstItem);
});
