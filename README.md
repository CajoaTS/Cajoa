# Cajoa

A small, beginner-friendly frontend framework built on **signals** and **JSX**.
No virtual DOM, no hooks rules, no re-rendering components.

> ⚠️ **v0.4 (early stage).** The API may still change. Not production-ready yet.

## Why Cajoa?

- **Components run once.** A component is just a function that builds DOM. Only the parts that depend on a signal update.
- **Plain JSX.** Write `<button onClick={...}>`, no special syntax to learn.
- **Tiny and readable.** The whole core is small enough to read in one sitting.
- **TypeScript-first**, ESM + CommonJS, zero runtime dependencies.

## Install

```bash
npm install cajoa
```

## Setup (JSX)

In your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "cajoa"
  }
}
```

If you use Vite and your JSX is not transformed, also set it in `vite.config.ts`
(`oxc: { jsx: { runtime: "automatic", importSource: "cajoa" } }` on newer Vite,
or `esbuild: { jsx: "automatic", jsxImportSource: "cajoa" }` on older ones).

## Quick start

```tsx
import { createSignal, render } from "cajoa";

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Clicked {count} times
    </button>
  );
}

render(Counter, document.getElementById("app")!);
```

## Two rules to remember

Cajoa has no compiler, so JSX expressions run exactly once. That gives two rules:

1. **Pass the signal, don't call it.**
   `{count}` is reactive. `{count()}` is read once and never updates.
   For computed values, pass a function: `{() => count() * 2}`.
2. **`Show` children are a function.**
   `<Show when={on}>{() => <p>Hello</p>}</Show>`
   Otherwise the element is created even when it is hidden.

## Lists and conditions

```tsx
import { createSignal, Show, For } from "cajoa";

const [todos, setTodos] = createSignal([{ id: 1, text: "Learn Cajoa" }]);

<Show when={() => todos().length > 0} fallback={() => <p>Nothing to do.</p>}>
  {() => (
    <ul>
      <For each={todos}>{(todo) => <li>{todo.text}</li>}</For>
    </ul>
  )}
</Show>;
```

## Routing

```tsx
import { render, Router, Route, Link, useParams } from "cajoa";

const User = () => <h1>User {useParams().id}</h1>;

render(
  () => (
    <div>
      <nav>
        <Link href="/">Home</Link> <Link href="/users/7">User 7</Link>
      </nav>
      <Router>
        <Route path="/" component={() => <h1>Home</h1>} />
        <Route path="/users/:id" component={User} />
        <Route path="*" component={() => <h1>Not found</h1>} />
      </Router>
    </div>
  ),
  document.getElementById("app")!,
);
```

Routes are matched in order, so put `path="*"` last.

## API

### Reactivity

| Function              | What it does                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `createSignal(value)` | Returns `[get, set]`. Reading `get()` inside an effect subscribes to it. `set` accepts a value or an updater function. |
| `createEffect(fn)`    | Runs `fn` now and again whenever a signal it read changes.                                                             |
| `createMemo(fn)`      | Cached computed value. Only notifies when the result changes.                                                          |
| `batch(fn)`           | Groups several `set` calls into one update.                                                                            |

### Components

| Component              | What it does                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `<Show when fallback>` | Conditional rendering. `children` and `fallback` are functions.                                      |
| `<For each key?>`      | List rendering. Reuses DOM nodes for unchanged items. The child is a function that returns a `Node`. |

### Rendering

| Function                       | What it does                                      |
| ------------------------------ | ------------------------------------------------- |
| `render(component, container)` | Mounts a component. Returns a `dispose` function. |
| `h(tag, props, ...children)`   | Low-level element creator. JSX compiles to this.  |

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

### Router

| Function                     | What it does                                               |
| ---------------------------- | ---------------------------------------------------------- |
| `<Router>`                   | Renders the first `<Route>` that matches the current path. |
| `<Route path component>`     | Maps a path (`/users/:id`, `*`) to a component.            |
| `<Link href>`                | An `<a>` that navigates without reloading the page.        |
| `navigate(to, { replace? })` | Navigates programmatically.                                |
| `useParams()`                | Reads the route params (`{ id: "7" }`).                    |
| `usePath()`                  | Returns a signal getter for the current pathname.          |
| `untrack(fn)`                | Runs `fn` without subscribing to signals.                  |

## Good to know

- `For` uses the item itself as the key by default. If you pass `key`, items with the same key are **not** re-rendered when their data changes, so keys must be unique and the item should hold its own signals if it needs to update.
- `useContext` only works while a component is being created (or inside `onMount` / effects). Read it at the top of your component and use the value later in handlers.
- Updating an object in place will not trigger effects. Set a new object instead.
- Fragments (`<>...</>`) work anywhere, but inside `<For>` the child must be a single element, because `For` reuses that node.

## Known limitations

- No SSR.
- Router: pathname only (no query/hash handling), no nested routes, no `base` path.
- `<Show>` and `<Router>` return a function, so they must sit inside an element, not be the root returned by `render`.
- Single-page apps need a server fallback to `index.html` for unknown paths.
- `createMemo` can show a brief inconsistent state when memos depend on each other.
- `set` calls are not batched automatically inside event handlers. Wrap them in `batch()`.

## Roadmap

- [x] Signals and effects
- [x] DOM bindings and `render`
- [x] `Show`, `For` (keyed)
- [x] Lifecycle and disposal
- [x] `createMemo`, `batch`
- [x] Context
- [x] JSX support
- [x] Fragments
- [ ] Vite plugin (removes the two rules above)
- [x] Router
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
