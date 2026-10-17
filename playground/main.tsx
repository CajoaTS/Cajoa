import { createSignal, render, Show, For, onMount, onCleanup } from "cajoa";

// ---------- 1. Counter ----------
function Counter() {
  const [count, setCount] = createSignal(0);
  return (
    <section>
      <h2>Counter</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>{" "}
      <button onClick={() => setCount(0)}>Reset</button>
    </section>
  );
}

// ---------- 2. Todo list: Show + For ----------
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

  return (
    <section>
      <h2>Todo list</h2>
      <input placeholder="Mag-type at pindutin ang Enter" onKeydown={add} />
      <Show
        when={() => todos().length > 0}
        fallback={() => <p>Walang tasks pa.</p>}
      >
        {() => (
          <ul>
            <For each={todos}>
              {(item: Todo) => (
                <li className={item.done ? "done" : ""}>
                  <span onClick={() => toggle(item.id)}>{item.text}</span>
                  <button onClick={() => remove(item.id)}>x</button>
                </li>
              )}
            </For>
          </ul>
        )}
      </Show>
      <p>{() => `${todos().filter((t) => !t.done).length} natitira`}</p>
    </section>
  );
}

// ---------- 3. Lifecycle ----------
function Ticker() {
  const [secs, setSecs] = createSignal(0);

  onMount(() => {
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    onCleanup(() => {
      clearInterval(id);
      console.log("Ticker: nilinis ang interval");
    });
  });

  return <p>Tumatakbo na ng {secs} segundo</p>;
}

function TickerDemo() {
  const [visible, setVisible] = createSignal(true);
  return (
    <section>
      <h2>Lifecycle</h2>
      <button onClick={() => setVisible((v) => !v)}>I-toggle ang ticker</button>
      <Show when={visible}>{() => <Ticker />}</Show>
    </section>
  );
}

// ---------- App ----------
function App() {
  return (
    <div>
      <h1>Cajoa</h1>
      <Counter />
      <Todos />
      <TickerDemo />
    </div>
  );
}

render(App, document.getElementById("app")!);
