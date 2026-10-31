import { createEffect, createMemo, createSignal, createStore, For } from "cajoa";

export function CounterDemo() {
  const [count, setCount] = createSignal(0);

  return (
    <div class="demo-row">
      <button onClick={() => setCount((n) => n - 1)} aria-label="Decrease">
        -
      </button>
      <span class="count">{count()}</span>
      <button onClick={() => setCount((n) => n + 1)} aria-label="Increase">
        +
      </button>
    </div>
  );
}

/** The hero demo: only the value that changed flashes, and the component never runs again. */
export function ReactivityDemo() {
  const [count, setCount] = createSignal(0);
  const double = createMemo(() => count() * 2);
  const [updates, setUpdates] = createSignal(0);
  let countEl: HTMLElement | undefined;
  let doubleEl: HTMLElement | undefined;
  let ready = false;

  const flash = (el: HTMLElement | undefined) => {
    if (!el || typeof el.animate !== "function") return;
    el.animate([{ backgroundColor: "var(--signal)" }, { backgroundColor: "transparent" }], {
      duration: 800,
      easing: "ease-out",
    });
  };

  // Each effect runs when its own value changes. The first run happens before the page exists, so skip it.
  createEffect(() => {
    count();
    if (!ready) return;
    flash(countEl);
    setUpdates((n) => n + 1);
  });
  createEffect(() => {
    double();
    if (!ready) return;
    flash(doubleEl);
    setUpdates((n) => n + 1);
  });

  const view = (
    <div class="window">
      <div class="window-bar">
        <span class="dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>live: only what changed updates</span>
      </div>
      <div class="window-body">
        <div class="metric">
          <span class="metric-label">count</span>
          <span class="metric-value" ref={(el) => (countEl = el)}>
            {count()}
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">double (memo)</span>
          <span class="metric-value" ref={(el) => (doubleEl = el)}>
            {double()}
          </span>
        </div>
        <div class="demo-row">
          <button onClick={() => setCount((n) => n - 1)} aria-label="Decrease">
            -
          </button>
          <button class="primary" onClick={() => setCount((n) => n + 1)}>
            Add one
          </button>
          <button class="ghost" onClick={() => setCount(0)}>
            Reset
          </button>
        </div>
        <p class="window-stats">
          <span>
            <b>1</b> component run
          </span>
          <span>
            <b>{updates()}</b> DOM updates
          </span>
        </p>
      </div>
    </div>
  );

  ready = true;
  return view;
}

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export function TodoDemo() {
  const [state, setState] = createStore({
    items: [
      { id: 1, text: "Read the docs", done: true },
      { id: 2, text: "Build something", done: false },
    ] as Todo[],
    draft: "",
  });
  let nextId = 3;

  const add = () => {
    const text = state.draft.trim();
    if (!text) return;
    setState((s) => {
      s.items.push({ id: nextId++, text, done: false });
      s.draft = "";
    });
  };

  return (
    <div>
      <div class="demo-row">
        <input
          value={state.draft}
          placeholder="What needs doing?"
          onInput={(e) => setState("draft", e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
        />
        <button onClick={add}>Add</button>
      </div>
      <ul class="todos">
        <For each={state.items}>
          {(todo: Todo) => (
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() =>
                    setState("items", state.items.findIndex((t) => t.id === todo.id), "done", (d) => !d)
                  }
                />
                <span class={todo.done ? "done" : ""}>{todo.text}</span>
              </label>
              <button
                class="link"
                aria-label={"Remove " + todo.text}
                onClick={() => setState("items", (list) => list.filter((t) => t.id !== todo.id))}
              >
                x
              </button>
            </li>
          )}
        </For>
      </ul>
      <p class="muted">{state.items.filter((t) => !t.done).length} left</p>
    </div>
  );
}