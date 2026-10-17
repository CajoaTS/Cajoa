# Cajoa

A small, beginner-friendly frontend framework built on **signals**.
No virtual DOM, no hooks rules, no re-rendering components.

> ⚠️ **v0.2 (early stage).** The API may still change. Not production-ready yet.

## Why Cajoa?

- **Components run once.** A component is just a function that builds DOM. Only the parts that depend on a signal update.
- **Tiny and readable.** The whole core is small enough to read in one sitting.
- **TypeScript-first**, ESM + CommonJS, zero runtime dependencies.

## Install

```bash
npm install cajoa
```

## Quick start

```ts
import { createSignal, h, render } from "cajoa";

function Counter() {
  const [count, setCount] = createSignal(0);

  return h(
    "button",
    { onClick: () => setCount((c) => c + 1) },
    "Clicked ",
    count,
    " times",
  );
}

render(Counter, document.getElementById("app")!);
```

Passing `count` (the function itself, not `count()`) is what makes that part of the DOM reactive.

## Lists and conditions

```ts
import { createSignal, h, Show, For } from "cajoa";

const [todos, setTodos] = createSignal([{ id: 1, text: "Learn Cajoa" }]);

h(
  "div",
  null,
  Show({
    when: () => todos().length > 0,
    fallback: () => h("p", null, "Nothing to do."),
    children: () =>
      h(
        "ul",
        null,
        For({
          each: todos,
          children: (todo) => h("li", null, todo.text),
        }),
      ),
  }),
);
```

## API

### Reactivity

| Function              | What it does                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `createSignal(value)` | Returns `[get, set]`. Reading `get()` inside an effect subscribes to it. `set` accepts a value or an updater function. |
| `createEffect(fn)`    | Runs `fn` now and again whenever a signal it read changes.                                                             |
| `createMemo(fn)`      | Cached computed value. Only notifies when the result changes.                                                          |
| `batch(fn)`           | Groups several `set` calls into one update.                                                                            |

### DOM

| Function                             | What it does                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| `h(tag, props, ...children)`         | Creates a real DOM element. Function props/children are reactive.                      |
| `render(component, container)`       | Mounts a component. Returns a `dispose` function.                                      |
| `Show({ when, children, fallback })` | Conditional rendering.                                                                 |
| `For({ each, children, key? })`      | List rendering. Reuses DOM nodes for unchanged items. `children` must return a `Node`. |

### Lifecycle

| Function         | What it does                                                      |
| ---------------- | ----------------------------------------------------------------- |
| `onMount(fn)`    | Runs `fn` after the component is rendered.                        |
| `onCleanup(fn)`  | Runs `fn` before an effect re-runs or when its owner is disposed. |
| `createRoot(fn)` | Creates a top-level owner you can dispose manually.               |

### Context

| Function                  | What it does                                           |
| ------------------------- | ------------------------------------------------------ |
| `createContext(default)`  | Creates a context with a default value.                |
| `provide(ctx, value, fn)` | Runs `fn`; everything created inside can read `value`. |
| `useContext(ctx)`         | Reads the nearest provided value (or the default).     |

## Good to know

- `For` uses the item itself as the key by default. If you pass `key`, items with the same key are **not** re-rendered when their data changes, so keys must be unique and the item should hold its own signals if it needs to update.
- `useContext` only works while a component is being created (or inside `onMount` / effects). Read it at the top of your component and use the value later in handlers.
- Updating an object in place will not trigger effects. Set a new object instead.

## Known limitations

- No JSX support yet (`h()` only).
- No SSR.
- `createMemo` can show a brief inconsistent state when memos depend on each other.
- `set` calls are not batched automatically inside event handlers. Wrap them in `batch()`.

## Roadmap

- [x] Signals and effects
- [x] DOM bindings (`h`, `render`)
- [x] `Show`, `For`
- [x] Lifecycle (`onMount`, `onCleanup`) and disposal
- [x] `createMemo`, `batch`
- [x] Keyed `For`
- [x] Context
- [ ] JSX support
- [ ] Router
- [ ] SSR

## Development

```bash
npm install
npm test          # run tests
npm run dev       # open the playground
npm run build     # build to dist/
```

## License

[Apache-2.0](./LICENSE)
