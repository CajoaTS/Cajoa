# Cajoa

A small, beginner-friendly frontend framework built on **signals** and **JSX**.
No virtual DOM, no hooks rules, no re-rendering components.

> ⚠️ **Early stage.** The API may still change before 1.0.

## Why Cajoa?

- **Components run once.** A component is just a function that builds DOM. Only the parts that depend on a signal update.
- **Plain JSX.** Write `<button onClick={...}>`, no special syntax to learn.
- **Tiny and readable.** The core is small enough to read in one sitting.
- **Renderer-agnostic core.** `@cajoa/core` has no DOM dependency, so other targets (native, SSR) can plug in their own renderer.
- **TypeScript-first**, ESM + CommonJS, zero runtime dependencies.

## Get started

The fastest way is the starter:

```bash
npm create cajoa@latest my-app
cd my-app
npm install
npm run dev
```

Or add Cajoa to an existing project:

```bash
npm install cajoa
```

### Manual setup

Add the plugin to `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import { cajoa } from "cajoa/vite";

export default defineConfig({ plugins: [cajoa()] });
```

And set the JSX types in `tsconfig.json`:

```json
{ "compilerOptions": { "jsx": "react-jsx", "jsxImportSource": "cajoa" } }
```

The plugin also sets Vite's JSX transform for you. Without the plugin, set `oxc: { jsx: { runtime: "automatic", importSource: "cajoa" } }` (Vite 8) or `esbuild: { jsx: "automatic", jsxImportSource: "cajoa" }` (older Vite) yourself.

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

## Reactive JSX

With the Vite plugin, write plain JSX. Calls to signals are reactive wherever they appear in a DOM element, and `Show` children are created lazily:

```tsx
<p>Double: {count() * 2}</p>
<p class={count() % 2 ? "odd" : "even"} style={{ color: color() }}>…</p>

<Show when={count() > 3} fallback={<p>Keep clicking</p>}>
  <p>More than 3!</p>
</Show>

<For each={todos()}>{(todo) => <li>{todo.text}</li>}</For>
```

The plugin rewrites your JSX at build time. When an expression contains a function call, it wraps it in a function (`{count() * 2}` becomes `{() => (count() * 2)}`) for:

- children and attributes of DOM elements (but not `ref`, `key` and `on*` props)
- children of your own components
- `when` and `each` of `Show` and `For`, and the `fallback` and children of `Show`

It does **not** change the props of your own components. They receive plain values. To pass a live value, pass the signal itself (`<Greeting name={name} />`) or a function.

Without the plugin, two rules apply:

1. **Pass the signal, don't call it.** `{count}` is reactive, `{count()}` is read once. For computed values, pass a function: `{() => count() * 2}`.
2. **`Show` children are a function:** `<Show when={on}>{() => <p>Hello</p>}</Show>`.

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

## Forms, styles and events

````tsx
const [name, setName] = createSignal("");
const [agree, setAgree] = createSignal(false);

<form>
  <input
    placeholder="Name"
    value={name}
    onInput={(e) => setName(e.target.value)}
  />
  <label>
    <input
      type="checkbox"
      checked={agree}
      onChange={(e) => setAgree(e.target.checked)}
    />
    I agree
  </label>
  <p style={() => ({ color: agree() ? "green" : "gray", fontSize: "18px" })}>
    Hello, {() => name() || "stranger"}!
  </p>
</form>;

## Refs and SVG

```tsx
function SearchBox() {
  let input: HTMLInputElement | undefined;

  return (
    <div>
      <input ref={(el: HTMLInputElement) => (input = el)} />
      <button onClick={() => input?.focus()}>Focus</button>
    </div>
  );
}

````

- `value`, `checked` and `selected` are set as DOM properties, so they stay in sync even after the user typed. Write `value` after `type`, `min` and `max`.
- `style` takes a string or an object (camelCase keys, kebab-case keys, or custom properties like `--accent`). Numbers are not converted to `px`, so write `"12px"`. For a reactive style, pass a function: `style={() => ({ color: color() })}`. An object with signals inside, like `style={{ color: color() }}`, is read once.
- Events are native DOM events. `onChange` fires when a field loses focus, so use `onInput` for every keystroke. `onDoubleClick` listens to `dblclick`.
- `className` and `htmlFor` work. Inline string handlers like `onclick="..."` are ignored.
- `ref` is a function that receives the element once it is created. Its props and children are ready, but it is not in the page yet, so use `onMount` if you need to measure it right away. Signals read inside `ref` are not tracked.
- SVG works: `<svg>`, `<path>`, `<circle>`, gradients, filters and the other SVG tags are created in the SVG namespace. Write attributes as `stroke-width="2"` or `strokeWidth="2"`.

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

## Packages

| Package        | What it is                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------ |
| `cajoa`        | The package most apps install (core + DOM)                                                 |
| `@cajoa/core`  | Renderer-agnostic core: signals, JSX runtime, `Show`, `For`, context, `Renderer` interface |
| `@cajoa/dom`   | DOM renderer and router                                                                    |
| `create-cajoa` | Project starter (`npm create cajoa@latest`)                                                |

## API

### Reactivity

| Function              | What it does                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `createSignal(value)` | Returns `[get, set]`. Reading `get()` inside an effect subscribes to it. `set` accepts a value or an updater function. |
| `createEffect(fn)`    | Runs `fn` now and again whenever a signal it read changes.                                                             |
| `createMemo(fn)`      | Cached computed value. Only notifies when the result changes.                                                          |
| `batch(fn)`           | Groups several `set` calls into one update.                                                                            |
| `untrack(fn)`         | Runs `fn` without subscribing to signals.                                                                              |

### Components

| Component              | What it does                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `<Show when fallback>` | Conditional rendering. `children` and `fallback` are functions.                                           |
| `<For each key?>`      | List rendering. Reuses DOM nodes for unchanged items. The child is a function that returns a single node. |
| `<>...</>` (Fragment)  | Groups siblings without a wrapper element.                                                                |

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

### Renderer

| Function                | What it does                                                       |
| ----------------------- | ------------------------------------------------------------------ |
| `setRenderer(renderer)` | Swaps the renderer (default: DOM). Used to target other platforms. |
| `getRenderer()`         | Returns the current renderer.                                      |
| `domRenderer`           | The built-in DOM renderer.                                         |

## Good to know

- `For` uses the item itself as the key by default. If you pass `key`, items with the same key are **not** re-rendered when their data changes, so keys must be unique and the item should hold its own signals if it needs to update.
- Inside `<For>`, return a single element (not a fragment), because `For` reuses that node.
- `useContext` and `useParams` only work while a component is being created (or inside `onMount` / effects). Read them at the top of your component and use the value later in handlers.
- Updating an object in place will not trigger effects. Set a new object instead.

## Known limitations

- No SSR.
- Router: pathname only (no query/hash handling), no nested routes, no `base` path.
- `<Show>` and `<Router>` return a function, so they must sit inside an element, not be the root returned by `render`.
- Single-page apps need a server fallback to `index.html` for unknown paths.
- `<select value>` works only when the `<option>` elements are direct children of the `<select>`.
- `createMemo` can show a brief inconsistent state when memos depend on each other.
- `set` calls are not batched automatically inside event handlers. Wrap them in `batch()`.
- Types in the core use a loose `HostNode` type for now.
- Inside `<svg>`, the tags `<a>`, `<title>`, `<style>` and `<script>` are created as HTML elements (they share their names with HTML tags).
- The compiler works on `.tsx` and `.jsx` files in Vite projects. `Show` and `For` are recognised only when imported from `cajoa` or `@cajoa/core`.

## Roadmap

- [x] Signals, effects, memo, batch
- [x] DOM bindings, `Show`, keyed `For`, Fragments
- [x] Lifecycle, context
- [x] JSX support and the Vite plugin (reactive JSX)
- [x] Router
- [x] Renderer abstraction, split into packages
- [x] Automated releases
- [x] Form, style and event handling in the DOM renderer
- [x] SVG and `ref` support
- [ ] Router: base path, query and hash, nested routes
- [ ] Docs site
- [ ] Error boundaries, async data (`createResource`), portals
- [ ] Animation helpers (`createTween`, transitions)
- [ ] Real-browser tests and benchmarks
- [ ] Native renderers (mobile, desktop)
- [ ] SSR
- [ ] 1.0 (stable API)

## Development

```bash
npm install
npm test          # run tests
npm run dev       # open the playground
npm run verify    # typecheck, tests, build, sync and package checks
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the release flow.

## License

[Apache-2.0](./LICENSE)
