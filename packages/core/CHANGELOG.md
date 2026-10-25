# @cajoa/core

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
