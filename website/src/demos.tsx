import { createSignal, createStore, For } from "cajoa";

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
                    setState(
                      "items",
                      state.items.findIndex((t) => t.id === todo.id),
                      "done",
                      (d) => !d,
                    )
                  }
                />
                <span class={todo.done ? "done" : ""}>{todo.text}</span>
              </label>
              <button
                class="link"
                aria-label={"Remove " + todo.text}
                onClick={() =>
                  setState("items", (list) =>
                    list.filter((t) => t.id !== todo.id),
                  )
                }
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
