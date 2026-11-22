<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/CajoaTS/Cajoa/main/website/public/logo-light.png">
    <img alt="Cajoa" src="https://raw.githubusercontent.com/CajoaTS/Cajoa/main/website/public/logo.png" width="96">
  </picture>
</p>

# Cajoa

A small, beginner-friendly frontend framework built on **signals** and **JSX**.
No virtual DOM, no hooks rules, no re-rendering components.

**Docs:** https://cajoats.github.io/Cajoa/

[![npm](https://img.shields.io/npm/v/cajoa)](https://www.npmjs.com/package/cajoa)
[![CI](https://github.com/CajoaTS/Cajoa/actions/workflows/ci.yml/badge.svg)](https://github.com/CajoaTS/Cajoa/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](./LICENSE)

## Why Cajoa?

- **Components run once.** A component is just a function that builds DOM. Only the parts that depend on a signal update.
- **Plain JSX.** Write `<button onClick={...}>`, no special syntax to learn.
- **Tiny and readable.** The core is small enough to read in one sitting.
- **Renderer-agnostic core.** `@cajoa/core` has no DOM dependency, so other targets (native, SSR) can plug in their own renderer.
- **Server-side rendering and hydration** built in: render on the server, then make the HTML interactive in the browser.
- **TypeScript-first**, ESM + CommonJS. `@cajoa/core`, `@cajoa/dom` and `@cajoa/server` have no dependencies. The Vite plugin in `cajoa` uses `@babel/parser` and `magic-string` at build time.

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

## Requirements

Node.js 20 or newer, Vite 8 for the plugin, TypeScript 5 or newer (if you use TypeScript), and a modern browser (the code is built for ES2022).

## Stability

From 1.0, Cajoa follows semantic versioning. The API in the docs is stable, except the parts marked _experimental_ (the `Renderer` interface, `ServerContext` with its `transfer` field, and hydration: `hydrate()`, the `hydratable` option, the markers it writes and the data script). See [Stability and versioning](https://cajoats.github.io/Cajoa/docs/stability/).

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
- `when` and `each` of `Show`, `Match` and `For`, and `is` of `Dynamic`
- the `fallback` and the children of `Show`, `ErrorBoundary` and `Suspense`, the children of `Match` and `Portal`, and the `fallback` of `Switch`

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

```tsx
const [selected, setSelected] = createSignal<number | null>(null);
const isSelected = createSelector(selected);

<For each={rows}>
  {(row) => <tr class={isSelected(row.id) ? "danger" : ""}>...</tr>}
</For>;
```

## Routing

```tsx
import { render, Router, Route, Outlet, NavLink, useParams } from "cajoa";

function Layout() {
  return (
    <div>
      <nav>
        <NavLink href="/" end>
          Home
        </NavLink>
        <NavLink href="/users/7">User 7</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}

const User = () => <h1>User {useParams().id}</h1>;

render(
  () => (
    <main>
      <Router>
        <Route path="/" component={Layout}>
          <Route path="" component={() => <h1>Home</h1>} />
          <Route path="users/:id" component={User} />
        </Route>
        <Route path="*" component={() => <h1>Not found</h1>} />
      </Router>
    </main>
  ),
  document.getElementById("app")!,
);
```

- Routes are matched in order, so put `path="*"` last. Child paths are relative to their parent, and `path=""` is the index route.
- `<Outlet />` renders the matching child route inside a layout. The layout stays alive while you move between its children.
- `useParams()` reads the path params. A route component is re-created when its own params change.
- `useSearchParams()` reads and writes the query string: `const [params, setParams] = useSearchParams()`, then `params().get("q")` and `setParams({ q: "cajoa", page: null })` (`null` removes a key). `useLocation()` returns `{ pathname, search, hash }`.
- Serving the app from a sub-path? Use `<Router base="/my-app">` (with Vite: `base={import.meta.env.BASE_URL}`). Keep writing app paths in `Link` and `navigate`, without the base.
- `<Link href>` is an `<a>` that navigates without reloading the page.
- `<NavLink>` adds an `active` class (`activeClass` to change it). Use `end` for an exact match.
- `<Navigate to="/login" />` redirects. `navigate(path, { replace, scroll })` navigates from code. New pages scroll to the top, or to the `#hash` target.

## Forms, styles and events

```tsx
const [name, setName] = createSignal("");
const [agree, setAgree] = createSignal(false);

<form>
  <input
    placeholder="Name"
    value={name}
    onInput={(e) => setName(e.currentTarget.value)}
  />
  <label>
    <input
      type="checkbox"
      checked={agree}
      onChange={(e) => setAgree(e.currentTarget.checked)}
    />
    I agree
  </label>
  <p style={() => ({ color: agree() ? "green" : "gray", fontSize: "18px" })}>
    Hello, {() => name() || "stranger"}!
  </p>
</form>;
```

## Refs and SVG

```tsx
function SearchBox() {
  let input: HTMLInputElement | undefined;

  return (
    <div>
      <input ref={(el) => (input = el)} />
      <button onClick={() => input?.focus()}>Focus</button>
    </div>
  );
}
```

- `value`, `checked` and `selected` are set as DOM properties, so they stay in sync even after the user typed. Write `value` after `type`, `min` and `max`.
- `style` is a string or an object (keys in camelCase or kebab-case), and the values are strings: `style={{ width: "100px" }}`. Cajoa does not add `px`, so a number would be ignored by the browser. For a reactive style, pass a function: `style={() => ({ color: color() })}`. An object with signals inside, like `style={{ color: color() }}`, is read once.
- Events are native DOM events. `onChange` fires when a field loses focus, so use `onInput` for every keystroke. `onDoubleClick` listens to `dblclick`.
- `className` and `htmlFor` work. Inline string handlers like `onclick="..."` are ignored.
- `ref` is a function that receives the element once it is created. Its props and children are ready, but it is not in the page yet, so use `onMount` if you need to measure it right away. Signals read inside `ref` are not tracked.
- SVG works: `<svg>`, `<path>`, `<circle>`, gradients, filters and the other SVG tags are created in the SVG namespace. Write attributes as `stroke-width="2"` or `strokeWidth="2"`.
- Event handlers are batched: several signal or store updates inside one handler cause a single update. This covers the part before the first `await`; after that, wrap updates in `batch(() => ...)`.

## Error handling

```tsx
import { ErrorBoundary } from "cajoa";

<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>Something went wrong: {String(error)}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )}
>
  <Dashboard />
</ErrorBoundary>;
```

- It catches errors thrown while a component is created, inside effects and memos, and in `onMount`. The nearest boundary wins. An error in a fallback goes to the next boundary up.
- It does **not** catch errors in event handlers, timers or promises. Handle those yourself.
- `fallback` is an element or a function `(error, reset)`. Calling `reset()` re-creates the children. Use `onError` to report the error (for example to a logging service).
- With the Vite plugin, the children and an element `fallback` are created lazily, like `Show`. Without it, pass functions: `<ErrorBoundary fallback={...}>{() => <Dashboard />}</ErrorBoundary>`.
- Like `Show`, it must sit inside an element, not be the root returned by `render` (`render` throws a clear error).
- `catchError(fn, handler)` is the low-level building block.

## Async data

```tsx
import { createResource, createSignal } from "cajoa";

const [userId, setUserId] = createSignal(1);
const [user, { refetch, mutate }] = createResource(userId, (id) =>
  fetchUser(id),
);

<p>{user.loading() ? "Loading…" : user()?.name}</p>;
```

- `createResource(source, fetcher)` calls `fetcher(value)` whenever `source()` changes. The fetcher can return a value or a promise. With one argument, `createResource(fetcher)` loads once, and again on `refetch()`.
- While `source()` is `false`, `null` or `undefined`, nothing is fetched and `user()` is `undefined`.
- `user()` returns the data, and keeps returning the previous data while a reload is in progress. `user.loading()` and `user.error()` are reactive.
- If the request failed, reading `user()` throws the error, so an `<ErrorBoundary>` can show a fallback. Use `user.error()` to read it without throwing.
- A response that arrives after a newer request has started, or after the owner is disposed, is ignored.
- `refetch()` loads again with the same source. `mutate(value)` sets the data directly (for example, an optimistic update).
- Inside a `<Suspense>`, the first load shows the fallback.

## Switch, Match, Dynamic and Portal

```tsx
<Switch fallback={<p>Unknown</p>}>
  <Match when={status() === "loading"}><Spinner /></Match>
  <Match when={status() === "error"}><p>Something went wrong</p></Match>
</Switch>

<Dynamic is={view} title="Hello" />

<Portal>
  <div class="modal">…</div>
</Portal>
```

- `Switch` renders the first `Match` whose `when` is truthy, otherwise `fallback`. The branches are created lazily, only when selected, and a branch is not re-created while it stays selected. `Match` must be a direct child of `Switch`.
- `Dynamic` renders a tag name or a component that can change at runtime. `is` is a function that returns a tag name (`"h2"`) or a component, for example a signal. To render one component directly, write `is={() => Page}`. The other props are passed on. When you store a component in a signal, set it with `setView(() => Page)`: `setView(Page)` would call `Page` as an updater.
- `Portal` renders its children somewhere else. `mount` is an element, and the default is `document.body`. The content is removed when the portal is disposed. DOM events bubble through the DOM tree, not the component tree.

## Stores

```tsx
import { createStore, For } from "cajoa";

const [state, setState] = createStore({
  user: { name: "Ada", age: 30 },
  todos: [{ id: 1, text: "Learn Cajoa", done: false }],
});

<p>{state.user.name}</p>
<For each={state.todos}>{(todo) => <li>{todo.text}</li>}</For>

setState("user", "name", "Grace");                 // a path, then a value
setState("todos", 0, "done", true);                // arrays work with indexes
setState("user", { age: 31 });                     // an object is merged
setState("todos", (list) => [...list, newTodo]);   // a function gets the previous value and replaces it
setState((draft) => {                              // or edit a draft
  draft.user.name = "Linus";
  draft.todos.push(newTodo);
});
```

- Reads are tracked per property: something that reads `state.user.name` does not update when `state.user.age` changes.
- `state` is read-only. Changing it directly (`state.count = 1`) throws, so you never lose reactivity by accident.
- An object is **merged** (shallow) into the existing one. A function **replaces** the value with what it returns. Setting a key to `undefined` removes it from an object.
- Only plain objects and arrays are reactive. A `Date`, a `Map` or a class instance is a value you replace as a whole.
- The store takes ownership of the object you pass in. Items keep their identity, so `<For>` reuses their DOM nodes.
- One `setState` call is one update. `unwrap(state)` gives the plain object behind the store (do not change it).

## Server-side rendering

```tsx
import { renderToString, renderToStringAsync } from "cajoa/server";

const html = renderToString(() => <App />, { url: "/users/42" });

const page = await renderToStringAsync(() => <App />, {
  url: req.url,
  onRedirect: (to, status) => res.redirect(status, to),
});
```

- On the server, `isServer()` is `true`. `onMount` does not run (so `window` is safe there), `ref` is not called, and event handlers are left out.
- `<Router>` uses the `url` of the request, and every request has its own router state, so parallel requests are safe. Put components that use `useLocation`, `NavLink` and similar **inside** `<Router>`.
- `<Navigate>` calls `onRedirect` instead of rendering.
- `renderToStringAsync` has a `timeout` (10 seconds by default) and throws when it is reached.
- `renderToString` does not wait for resources: they are still loading in its output. Use `renderToStringAsync` when the page needs its data.
- With `hydratable: true`, `renderToStringAsync` renders the app more than once: first to load the data, then again with that data, until nothing new is loaded. Each fetcher still runs once, but your components run again on the server, so keep them free of side effects.
- To make the HTML interactive in the browser, set `hydratable: true` and call `hydrate()` (see below).

### Hydration

`render()` throws away what is in the container and builds the page again. `hydrate()` keeps the HTML the server wrote and only attaches the app to it: events, signals and effects. The elements stay the same, so focus, scroll position and anything the user typed are not lost.

```tsx
// On the server
const html = renderToString(() => <App />, { url: req.url, hydratable: true });

// In the browser (the HTML is inside <div id="app">)
import { hydrate } from "cajoa";

hydrate(() => <App />, document.getElementById("app")!);
```

- `hydrate(component, container)` has the same signature as `render()`, and returns a `dispose` function.
- The server must use `hydratable: true`. This adds a `data-cj` attribute to elements and a few comments, which `hydrate()` removes again.
- **The server and the browser must render the same thing**: the same app, the same URL and the same data. If you show something that only the browser knows (the time, `window.innerWidth`, a value from `localStorage`), set it in `onMount`, which does not run on the server.
- If they differ, `hydrate()` still ends with the page the browser app describes. Text that differs is updated, elements that the server wrote and the app does not make are removed, and an element with another tag is replaced. In dev mode it warns about each difference.
- If the container has no hydration markers (or is empty), `hydrate()` does the same as `render()`.
- **Resources travel with the HTML.** With `renderToStringAsync`, the data that each resource loaded is written in a `<script type="application/json">` at the end of the HTML. `hydrate()` removes it, and the resources in the browser start with their value, so they do not load again and `Suspense` shows its content at once. After that, `refetch()` and a changing source work as usual.
- **Everything a resource returns is sent to the browser**, not only what you show. If a fetcher returns more than the page needs (an email address, a token), pick the fields inside the fetcher. Only what JSON can write is sent: a `Date` arrives as a string, and a `Map`, a class instance or `undefined` is not sent, so that resource loads in the browser.
- A resource gets the server's data only when it has the same source (the value its first function returns) as on the server. If it does not, or if the fetch failed on the server, it loads in the browser.
- Clicks before `hydrate()` runs are not remembered. Keep the script small, or load it early.
- Browsers add a `<tbody>` when they read `<table><tr>`. Write the `<tbody>` yourself, so the server HTML and the app agree.
- Elements inside nested `Show`, `Suspense` or fragment blocks are the same elements as before, but they can be moved inside the page while hydrating. An `<iframe>` or `<video>` in there may reload.

### Page title and meta tags

```tsx
import { Title, Meta } from "cajoa";

<Title>About | My site</Title>
<Meta name="description" content="What this site is about" />
```

- In the browser, `<Title>` sets `document.title` and puts the old title back when it is removed. `<Meta>` adds or updates a `<meta>` tag and removes it again. Both accept a function for a live value.
- On the server they fill an object that you pass in. Use `headToString(head)` to put it in your HTML:

```tsx
const head = {};
const html = await renderToStringAsync(() => <App />, { url: req.url, head });
const page = template
  .replace("<!--head-->", headToString(head))
  .replace("<!--app-->", html);
```

## TypeScript

JSX is typed. The editor knows every HTML and SVG element, its attributes, and what each event gives you:

```tsx
<input
  value={name()}
  onInput={(e) => setName(e.currentTarget.value)} // e.currentTarget is an HTMLInputElement
/>
```

- Every attribute accepts a value **or** a function that returns it (`class={() => ...}`). Events, `ref` and `children` do not.
- `style` is a string or an object, and the values are strings: `style={{ width: "100px" }}`. Cajoa does not add `px`, so a number would be ignored by the browser.
- ARIA booleans are strings: `aria-hidden="true"`. Use camelCase for multi-word attributes (`tabIndex`, `readOnly`, `maxLength`), and `class` or `className`, `for` or `htmlFor`.
- `data-*` attributes and custom elements (`<my-widget>`) are accepted.
- Rare SVG elements (`feGaussianBlur`, `animate`, ...) accept any attribute.
- The types live in `@cajoa/dom`; `JSX`, `CSSProperties` and `TargetedEvent` are exported from `cajoa`.

## Lazy components and Suspense

```tsx
import { lazy, Suspense } from "cajoa";

const Settings = lazy(() => import("./Settings"));

<Suspense fallback={<p>Loading…</p>}>
  <Settings />
</Suspense>;
```

- `lazy(loader)` loads a component the first time it is rendered. The loader returns a module with a default export (or the component itself). Once loaded, it renders without delay.
- `<Suspense>` shows its `fallback` until everything inside it has finished its **first** load: lazy components and `createResource` calls. Then the content stays. A reload, or something that starts loading later, does not bring the fallback back.
- The children are created right away (so loading can start) but stay hidden while the fallback shows.
- A failed load is thrown, so an `<ErrorBoundary>` can catch it.
- Like `Show`, `Suspense` must sit inside an element, not be the root returned by `render`.

### Dev mode

The Vite plugin turns on dev mode on the dev server only (it sets `globalThis.__CAJOA_DEV__ = true`). In dev mode, Cajoa warns when `onCleanup` or `useContext` is called outside a component, and when `<For>` finds duplicate keys. It also logs every error caught by an `ErrorBoundary`. Production builds log nothing. Without the plugin, set the flag yourself.

## Packages

| Package         | What it is                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| `cajoa`         | The package most apps install (core + DOM + server, and the Vite plugin as `cajoa/vite`)             |
| `@cajoa/core`   | Renderer-agnostic core: signals, JSX runtime, `Show`, `For`, context, `Renderer` interface           |
| `@cajoa/dom`    | DOM renderer, router, `hydrate()`, `<Title>` and `<Meta>`                                            |
| `@cajoa/server` | Server-side rendering: `renderToString` and `renderToStringAsync` (also available as `cajoa/server`) |
| `create-cajoa`  | Project starter (`npm create cajoa@latest`)                                                          |

## API

### Reactivity

| Function                                  | What it does                                                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `createSignal(value, { equals?, name? })` | Returns `[get, set]`. Reading `get()` inside an effect subscribes to it. `set` accepts a value or an updater function.             |
| `createEffect(fn)`                        | Runs `fn` now and again whenever a signal it read changes.                                                                         |
| `createMemo(fn)`                          | Cached computed value. It is computed when it is read, and it only notifies when the result changes.                               |
| `batch(fn)`                               | Groups several `set` calls into one update.                                                                                        |
| `untrack(fn)`                             | Runs `fn` without subscribing to signals.                                                                                          |
| `createSelector(source)`                  | Returns `isSelected(key)`. Only the old and the new key wake up when `source` changes, so picking a row in a big list stays cheap. |

### Components

| Component              | What it does                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `<Show when fallback>` | Conditional rendering. `children` and `fallback` are functions.                                           |
| `<For each key?>`      | List rendering. Reuses DOM nodes for unchanged items. The child is a function that returns a single node. |
| `<>...</>` (Fragment)  | Groups siblings without a wrapper element.                                                                |
| `<Title>` / `<Meta>`   | Set the page title and meta tags (in the browser, or in the `head` object on the server).                 |

### Rendering

| Function                        | What it does                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `render(component, container)`  | Mounts a component. Returns a `dispose` function.                                                       |
| `hydrate(component, container)` | Mounts a component on HTML that the server wrote, and keeps its elements. Returns a `dispose` function. |
| `h(tag, props, ...children)`    | Low-level element creator. JSX compiles to this.                                                        |

### Lifecycle

| Function         | What it does                                                      |
| ---------------- | ----------------------------------------------------------------- |
| `onMount(fn)`    | Runs `fn` after the component is rendered.                        |
| `onCleanup(fn)`  | Runs `fn` before an effect re-runs or when its owner is disposed. |
| `createRoot(fn)` | Creates a top-level owner you can dispose manually.               |

### Errors

| Function                            | What it does                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| `<ErrorBoundary fallback onError?>` | Shows `fallback` (an element, or `(error, reset) => …`) when something below it throws. |
| `catchError(fn, handler)`           | Runs `fn`. Errors it throws, now or later (effects, `onMount`), go to `handler`.        |

### Async data

| Function                                  | What it does                                                                                   |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `createResource(source?, fetcher)`        | Loads data (sync or async) when `source()` changes. Returns `[resource, { refetch, mutate }]`. |
| `resource()`                              | The data (the previous data while reloading). Throws if the request failed.                    |
| `resource.loading()` / `resource.error()` | Reactive loading state and error.                                                              |

### Control flow

| Component                            | What it does                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| `<Switch fallback>` / `<Match when>` | Renders the first matching branch, or the fallback.                          |
| `<Dynamic is>`                       | Renders a tag or component that can change. `is` is a function returning it. |
| `<Portal mount?>`                    | Renders its children into another element (default: `document.body`).        |
| `lazy(loader)`                       | A component loaded on first use (`() => import("./Page")`).                  |
| `<Suspense fallback>`                | Shows the fallback until the first load of everything inside has finished.   |

### Stores

| Function                     | What it does                                                                |
| ---------------------------- | --------------------------------------------------------------------------- |
| `createStore(initial)`       | Returns `[state, setState]`. `state` is read-only and tracked per property. |
| `setState(...path, value)`   | Sets a value (objects are merged, functions replace).                       |
| `setState(draft => { ... })` | Edits a draft, as one update.                                               |
| `unwrap(state)`              | The plain object behind the store.                                          |

### Context

| Function                  | What it does                                           |
| ------------------------- | ------------------------------------------------------ |
| `createContext(default)`  | Creates a context with a default value.                |
| `provide(ctx, value, fn)` | Runs `fn`; everything created inside can read `value`. |
| `useContext(ctx)`         | Reads the nearest provided value (or the default).     |

### Router

| Function                              | What it does                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `<Router base?>`                      | Renders the route that matches the current path. `base` is for apps served from a sub-path. |
| `<Route path component>`              | Maps a path (`/users/:id`, `*`, `docs/*`) to a component. Nest routes to build layouts.     |
| `<Outlet />`                          | Renders the matching child route inside a layout.                                           |
| `<Link href>`                         | An `<a>` that navigates without reloading the page.                                         |
| `<NavLink href end? activeClass?>`    | A `Link` that gets an active class on the current page.                                     |
| `<Navigate to replace?>`              | Redirects when it is rendered.                                                              |
| `navigate(to, { replace?, scroll? })` | Navigates programmatically.                                                                 |
| `useParams()`                         | Reads the route params (`{ id: "7" }`).                                                     |
| `useLocation()`                       | Returns a getter for `{ pathname, search, hash }`.                                          |
| `useSearchParams()`                   | Returns `[params, setParams]` for the query string.                                         |
| `usePath()`                           | Returns a getter for the current pathname.                                                  |

### Renderer

| Function                | What it does                                                       |
| ----------------------- | ------------------------------------------------------------------ |
| `setRenderer(renderer)` | Swaps the renderer (default: DOM). Used to target other platforms. |
| `getRenderer()`         | Returns the current renderer.                                      |
| `domRenderer`           | The built-in DOM renderer.                                         |

### Server

| Function                             | What it does                                                                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `renderToString(app, options?)`      | Renders to an HTML string (`cajoa/server`). Does not wait for resources. Options: `url`, `hydratable`, `head`, `onRedirect`. |
| `renderToStringAsync(app, options?)` | Same, but waits for `createResource` and `lazy`.                                                                             |
| `headToString(head)`                 | Turns the `head` object (title and meta tags) into HTML.                                                                     |
| `isServer()`                         | `true` while rendering on the server.                                                                                        |

## Good to know

- `For` uses the item itself as the key by default. If you pass `key`, items with the same key are **not** re-rendered when their data changes, so keys must be unique and the item should hold its own signals if it needs to update.
- Inside `<For>`, return a single element (not a fragment), because `For` reuses that node.
- `useContext` and `useParams` only work while a component is being created (or inside `onMount` / effects). Read them at the top of your component and use the value later in handlers.
- Updating an object in place will not trigger effects. Set a new object instead.
- Updates are glitch-free: when several signals or memos change together, each effect runs once, after everything it depends on is up to date, so it never sees a half-updated state. An update started inside an effect is queued and runs after that effect finishes. If an effect keeps changing a signal that it also reads, Cajoa stops with an error instead of looping forever.
- Reordering a keyed list (`<For>`) only moves the nodes that have to move: swapping two rows moves two nodes, however long the list is.

## Known limitations

- Hydration is experimental. It needs the server and the browser to render the same thing, and a resource that failed on the server loads again in the browser.
- Single-page apps need a server fallback to `index.html` for unknown paths.
- `<select value>` works only when the `<option>` elements are direct children of the `<select>`.
- There is no `innerHTML` prop. To insert raw HTML, set it yourself in a `ref`, and only from content you trust.
- The router reads its routes once, so a route list that changes later is not supported.
- Types in the core use a loose `HostNode` type for now.
- Inside `<svg>`, the tags `<a>`, `<title>`, `<style>` and `<script>` are created as HTML elements (they share their names with HTML tags).
- The compiler works on `.tsx` and `.jsx` files in Vite projects. `Show` and `For` are recognised only when imported from `cajoa` or `@cajoa/core`.
- `ErrorBoundary` does not catch errors thrown in event handlers, timers or promises.
- `Suspense` shows its fallback for the first load only. Use `resource.loading()` for later reloads.

## Roadmap

**Shipped**

- [x] Signals, effects, memo, batch
- [x] DOM bindings, `Show`, keyed `For`, Fragments
- [x] Lifecycle, context
- [x] JSX support and the Vite plugin (reactive JSX)
- [x] Router
- [x] Renderer abstraction, split into packages
- [x] Automated releases
- [x] Form, style and event handling in the DOM renderer
- [x] SVG and `ref` support
- [x] Router v2: nested routes, base path, query and hash
- [x] Real-browser tests
- [x] Error boundaries and dev-mode warnings
- [x] Async data (`createResource`)
- [x] `Portal`, `Dynamic`, `Switch`/`Match`, lazy components
- [x] Stores (`createStore`), automatic batching
- [x] Glitch-free updates (memos that always agree with each other)
- [x] Benchmarks and bundle-size budget
- [x] Server-side rendering (`@cajoa/server`)
- [x] Typed JSX (HTML attributes and events)
- [x] Docs site built with Cajoa
- [x] Page title and meta tags (`<Title>`, `<Meta>`)
- [x] Hydration (`hydrate()`), with resource data sent from the server to the browser

**Next**

- [ ] Keep elements in place while hydrating nested `Show`, `Suspense` and fragments (they are moved now)
- [ ] Developer tools: see which signals and effects run on each update
- [ ] Testing utilities

## Development

```bash
npm install
npm test          # run tests
npm run dev       # open the playground
npm run verify    # typecheck, tests, build, sync and package checks
npm run sync      # copy README.md and LICENSE into the packages (run it after editing README.md)
npm run e2e:install   # one time: download the browsers
npm run test:e2e      # run the browser tests
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the release flow.

## License

[Apache-2.0](./LICENSE)
