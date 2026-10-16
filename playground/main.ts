import { createSignal, h, render, Show, For, onMount, onCleanup } from "../src";

// Counter  - signal
function Counter() {
  const [count, setCount] = createSignal(0);
  return h(
    "section",
    null,
    h("h2", null, "Counter"),
    h("p", null, "Count: ", count),
    h("button", { onClick: () => setCount((c) => c + 1) }, "+1"),
    " ",
    h("button", { onClick: () => setCount(0) }, "Reset"),
  );
}

// Todo: Show + For
interface Todo {
  id: number;
  text: string;
  done: boolean;
}

function Todos() {
  const [todos, setTodos] = createSignal<Todo[]>([]);
  let nextId = 1;

  const add = (e: KeyboardEvent) => {
    if (e.key !== "Enter") return;
    const input = e.target as HTMLInputElement;
    const text = input.value.trim();
    if (!text) return;
    setTodos((list) => [...list, { id: nextId++, text, done: false }]);
    input.value = "";
  };

  const toggle = (id: number) =>
    setTodos((list) =>
      list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );

  const remove = (id: number) =>
    setTodos((list) => list.filter((t) => t.id !== id));

  return h(
    "section",
    null,
    h("h2", null, "Todo list"),
    h("input", {
      placeholder: "Mag-type at pindutin ang Enter",
      onKeydown: add,
    }),
    Show({
      when: () => todos().length > 0,
      fallback: () => h("p", null, "Walang tasks pa."),
      children: () =>
        h(
          "ul",
          null,
          For({
            each: todos,
            children: (item) =>
              h(
                "li",
                { className: item.done ? "done" : "" },
                h("span", { onClick: () => toggle(item.id) }, item.text),
                h("button", { onClick: () => remove(item.id) }, "x"),
              ),
          }),
        ),
    }),
    h("p", null, () => `${todos().filter((t) => !t.done).length} natitira`),
  );
}

// Ticker: onMount + onCleanup
function Ticker() {
  const [secs, setSecs] = createSignal(0);

  onMount(() => {
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    onCleanup(() => {
      clearInterval(id);
      console.log("Ticker: nilinis ang interval");
    });
  });

  return h("p", null, "Tumatakbo na ng ", secs, " segundo");
}

function TickerDemo() {
  const [visible, setVisible] = createSignal(true);
  return h(
    "section",
    null,
    h("h2", null, "Lifecycle"),
    h(
      "button",
      { onClick: () => setVisible((v) => !v) },
      "I-toggle ang ticker",
    ),
    Show({ when: visible, children: () => Ticker() }),
  );
}

// App
function App() {
  return h(
    "div",
    null,
    h("h1", null, "Cajoa"),
    Counter(),
    Todos(),
    TickerDemo(),
  );
}

render(App, document.getElementById("app")!);

