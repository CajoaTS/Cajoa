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

// ---------- 4. Form: value, checked, select, style, events ----------
function FormDemo() {
  const [name, setName] = createSignal("");
  const [agree, setAgree] = createSignal(false);
  const [color, setColor] = createSignal("tomato");
  const [size, setSize] = createSignal(18);

  const reset = () => {
    setName("");
    setAgree(false);
    setColor("tomato");
    setSize(18);
  };

  return (
    <section>
      <h2>Form</h2>

      <input
        placeholder="Pangalan"
        onInput={(e: Event) => setName((e.target as HTMLInputElement).value)}
        value={name}
      />

      <p style={() => ({ color: color(), fontSize: `${size()}px` })}>
        Hello, {() => name() || "stranger"}!
      </p>

      <label>
        <input
          type="checkbox"
          onChange={(e: Event) =>
            setAgree((e.target as HTMLInputElement).checked)
          }
          checked={agree}
        />
        Sumasang-ayon ako
      </label>
      <p>{() => (agree() ? "Salamat!" : "Hindi pa sumasang-ayon")}</p>

      <select
        onChange={(e: Event) => setColor((e.target as HTMLSelectElement).value)}
        value={color}
      >
        <option value="tomato">Tomato</option>
        <option value="royalblue">Royal blue</option>
        <option value="seagreen">Sea green</option>
      </select>

      <input
        type="range"
        min="12"
        max="40"
        onInput={(e: Event) =>
          setSize(Number((e.target as HTMLInputElement).value))
        }
        value={size}
      />

      <button onClick={reset}>Reset</button>
    </section>
  );
}

// ---------- 5. ref at SVG ----------
function RefSvgDemo() {
  const [radius, setRadius] = createSignal(20);
  let field: HTMLInputElement | undefined;

  return (
    <section>
      <h2>Ref at SVG</h2>
      <input
        placeholder="Pindutin ang button para mag-focus"
        ref={(el: HTMLInputElement) => (field = el)}
      />
      <button onClick={() => field?.focus()}>I-focus ang input</button>
      <p>
        <svg width="100" height="100" viewBox="0 0 100 100" className="icon">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="royalblue"
            stroke="white"
            strokeWidth="3"
          />
        </svg>
      </p>
      <button onClick={() => setRadius((v) => Math.min(48, v + 6))}>
        Palakihin
      </button>{" "}
      <button onClick={() => setRadius(20)}>Reset</button>
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
      <FormDemo />
      <RefSvgDemo />
      <TickerDemo />
    </div>
  );
}

render(App, document.getElementById("app")!);
