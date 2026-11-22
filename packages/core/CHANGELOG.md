# @cajoa/core

## 1.2.0

### Minor Changes

- 43aecd3: Hydration keeps the data that resources loaded on the server. With `renderToStringAsync(app, { hydratable: true })`, the data of every resource is written at the end of the HTML in a `<script type="application/json" data-cj-data>`. `hydrate()` removes it, and `createResource` in the browser starts with that value: it does not fetch again, and `Suspense` shows its content at once instead of its fallback. `refetch()` and a changing source work as before.
  
  A resource only takes the server's data when its source (the value its first function returns) is the same as on the server. A resource that failed on the server, whose value JSON cannot write (`undefined`, `Map`, class instances; a `Date` becomes a string) or whose source JSON cannot write, loads in the browser.
  
  Everything a resource returns is sent to the browser, not only what the page shows. Pick the fields you need inside the fetcher.
  
  Behavior change: with `hydratable: true`, `renderToStringAsync` now renders the app more than once, until no new data is loaded. This is needed so that the HTML matches what `hydrate()` builds. Each fetcher still runs once, but your components run again on the server, so keep them free of side effects. `head` and `onRedirect` only get what the last pass produced. Without `hydratable`, and with `renderToString`, nothing changes.
  
  New experimental API, used by `@cajoa/server` and `hydrate()`, not by apps: `setResourceTransfer()`, the `ResourceTransfer` and `ResourceSlot` types, and the optional `transfer` field of `ServerRequest`. `hydrate()`, the markers and the data script stay experimental.

## 1.1.0

### Minor Changes

- 09957c6: Hydration. New `hydrate(component, container)` (exported from `@cajoa/dom` and `cajoa`) attaches your app to the HTML that the server wrote, instead of throwing it away like `render()` does. The elements are reused, so focus, scroll position and typed text are kept. Use it with `renderToString(app, { hydratable: true })`. If the server HTML and the browser app differ, `hydrate()` ends with the page that the browser app describes (and warns in dev mode); with no markers in the container it does the same as `render()`.
  
  Breaking, but in the experimental part: the markers that `hydratable: true` writes changed. Elements now have a `data-cj` attribute, and the comments are `<!--m…-->` and `<!--t…-->` (before, `<!--$-->` and `<!--|-->`). Nothing changes unless you set `hydratable: true`. `hydrate()` and the markers stay experimental until resource data can travel from the server to the browser. Known limits: resources load again in the browser, and the browser inserts a `<tbody>` in `<table><tr>`, so write the `<tbody>`.

## 1.0.0

### Major Changes

- 4ec2de8: Cajoa 1.0. The API in the docs is now stable and follows semantic versioning. There are no code changes since 0.21.0. The experimental parts (the `Renderer` interface, `ServerContext` and the hydration markers) are listed on the Stability page. Requires Node.js 20 or newer, and Vite 8 for the plugin.

## 0.21.0

### Minor Changes

- 6e02070: The 1.0 review. Breaking: the index that `<For>` gives to its child is now a function (`(item, i) => ... i() ...`), because a plain number went stale when the list was reordered. `renderToString` and `renderToStringAsync` no longer write hydration markers unless you pass `hydratable: true` (experimental, there is no `hydrate()` yet). The plugin now requires Vite 8 and the packages require Node 20 or newer. New: `createSignal`, `createMemo` and `createEffect` take options (`equals`, `name`), contexts have a `<Context.Provider value>` component, and `render()` accepts components that return a function, such as `<Show>` or `<Router>`, instead of throwing. The effects named in a "never settled" error are listed by name.

## 0.20.0

### Minor Changes

- 5ff2d54: Production polish. New `<Title>` and `<Meta>` set the page title and meta tags: in the browser they change the document and clean up after themselves, and on the server they fill a `head` object (pass `head` to `renderToString` or `renderToStringAsync`, then use `headToString(head)`). `<For>` has a `fallback` for empty lists. `NavLink` sets `aria-current="page"` on the current link. `<Router>` and `<Route>` now accept function children, so routes built with `map()` inside the JSX work (before, the compiler's wrapping made them disappear).

## 0.19.0

### Minor Changes

- 3afb3f0: Typed JSX. Every HTML and SVG element, its attributes and its events are now typed: `onInput={(e) => e.currentTarget.value}` knows `currentTarget` is an `HTMLInputElement`, unknown elements and attributes are errors, and every attribute accepts a value or a function. `style` values are strings (Cajoa does not add `px`) and ARIA booleans are strings (`aria-hidden="true"`). The `JSX` namespace moved from `@cajoa/core` to `@cajoa/dom`, because the DOM elements belong to the DOM renderer; `cajoa/jsx-runtime` still exposes it, so projects that use `jsxImportSource: "cajoa"` change nothing. `JSX`, `CSSProperties` and `TargetedEvent` are exported from `cajoa`. Types only: no change in behavior or bundle size.

## 0.18.0

### Minor Changes

- fb28418: Server-side rendering. New package `@cajoa/server` (also available as `cajoa/server`) with `renderToString` and `renderToStringAsync`, which waits for `createResource` and `lazy`. On the server `isServer()` is true, `onMount` does not run, refs and event handlers are skipped, and `<Navigate>` reports a redirect through `onRedirect`. The router reads the url of the request and keeps its state per request, so concurrent requests do not mix; its behavior in the browser is unchanged. The output has comment markers that the next release will use for hydration (turn them off with `hydratable: false`).

## 0.17.0

### Minor Changes

- a0ce043: Faster list reordering: a keyed `<For>` now moves only the nodes that have to move (it keeps the longest run of nodes that are already in order), so swapping two rows no longer moves almost every row. Add `createSelector` for cheap "which one is selected" checks: only the old and the new key wake up.

## 0.16.0

### Minor Changes

- d62e59f: Glitch-free updates. The scheduler is rewritten: a change marks what depends on it, and effects run once afterwards, after the memos they read are up to date, so an effect never sees a half-updated state. Memos are now computed lazily when read (the first computation is still immediate) and reading a memo inside `batch` gives the fresh value. An update started inside an effect is queued instead of running in the middle of it. If one effect throws, the other queued effects still run and the first error is rethrown afterwards. An update loop that never settles now throws a clear error after 100,000 steps instead of overflowing the stack.

## 0.15.0

### Minor Changes

- 406a4ab: Add `createStore`: a read-only proxy tracked per property, with `setState` for paths, merges, updater functions and drafts, and `unwrap`. DOM event handlers are now batched automatically: several updates in one handler cause one update. The Vite plugin now also makes property reads reactive (`{state.count}`, `{props.title}`), and `Show`, `Match` and `For` resolve nested getters (for example `when={props.open}` where `open` is a signal).

## 0.14.0

### Minor Changes

- 971c2b6: Add `Switch`/`Match`, `Dynamic`, `Portal`, `lazy` and `Suspense`. `Suspense` shows its fallback until the first load of every `lazy` component and `createResource` inside it has finished. The renderer interface gets an optional `portalRoot()` (the DOM renderer returns `document.body`). The Vite plugin makes the children of `Suspense`, `Portal` and `Match`, and the `fallback` of `Suspense` and `Switch`, lazy, and wraps `Match`'s `when` and `Dynamic`'s `is`.

## 0.13.0

### Minor Changes

- d587d69: Add `createResource` for async data: `const [user, { refetch, mutate }] = createResource(id, fetchUser)`. It loads when the source changes, ignores stale responses, keeps the previous data while reloading, exposes `loading()` and `error()`, and throws the error when the resource is read after a failure, so an `<ErrorBoundary>` can catch it.

## 0.12.1

### Patch Changes

- 7c6ee8f: Fix `<ErrorBoundary>`: a reactive component placed directly inside it (for example `<Router>`, `<Show>`, `<For>` or another boundary) stopped updating. A function returned as the content of a reactive child is now turned into its own reactive region, so a `<Show>` directly inside a `<Show>` works too.

## 0.12.0

### Minor Changes

- 63e98d2: Add `<ErrorBoundary>` (with `fallback(error, reset)` and `onError`) and `catchError`. Errors thrown while a component is created, inside effects and memos, or in `onMount` now go to the nearest boundary; without one they are thrown as before. Add dev-mode warnings (`onCleanup` or `useContext` called outside a component, duplicate keys in `<For>`) and a log for errors caught by a boundary, switched on automatically by the Vite plugin on the dev server. `render()` now throws a clear error when the component returns a function. The Vite plugin treats the children and `fallback` of `<ErrorBoundary>` as lazy, like `<Show>`.

## 0.11.0

No changes in this release.

## 0.10.1

No changes in this release.

## 0.10.0

### Minor Changes

- 97ab96f: Add the Vite plugin (`cajoa/vite`): calls in JSX are reactive without wrapper functions, `Show` children and `fallback` are created lazily, and the plugin configures Vite's JSX transform. `Show` and `For` now also accept plain values (`when={n() > 3}`, `each={todos()}`).

## 0.9.0

### Minor Changes

- f2e123a: Add the `ref` prop (a function called once with the created element, after its props and children are ready) and SVG support: SVG tags are created in the SVG namespace and camelCase attributes like `strokeWidth` become `stroke-width`.

## 0.8.0

No changes in this release.

## 0.7.0

### Minor Changes

- 349df4e: `@cajoa/core` no longer depends on DOM types. `h()` and `render()` now use a neutral `HostNode` type, and `h()` returns `HostNode` instead of `HTMLElement` (type-level breaking change; runtime behavior is unchanged).
