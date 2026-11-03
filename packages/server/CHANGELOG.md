# @cajoa/server

## 0.21.0

### Minor Changes

- 6e02070: The 1.0 review. Breaking: the index that `<For>` gives to its child is now a function (`(item, i) => ... i() ...`), because a plain number went stale when the list was reordered. `renderToString` and `renderToStringAsync` no longer write hydration markers unless you pass `hydratable: true` (experimental, there is no `hydrate()` yet). The plugin now requires Vite 8 and the packages require Node 20 or newer. New: `createSignal`, `createMemo` and `createEffect` take options (`equals`, `name`), contexts have a `<Context.Provider value>` component, and `render()` accepts components that return a function, such as `<Show>` or `<Router>`, instead of throwing. The effects named in a "never settled" error are listed by name.

### Patch Changes

- Updated dependencies [6e02070]
  - @cajoa/core@0.21.0

## 0.20.0

### Minor Changes

- 5ff2d54: Production polish. New `<Title>` and `<Meta>` set the page title and meta tags: in the browser they change the document and clean up after themselves, and on the server they fill a `head` object (pass `head` to `renderToString` or `renderToStringAsync`, then use `headToString(head)`). `<For>` has a `fallback` for empty lists. `NavLink` sets `aria-current="page"` on the current link. `<Router>` and `<Route>` now accept function children, so routes built with `map()` inside the JSX work (before, the compiler's wrapping made them disappear).

### Patch Changes

- Updated dependencies [5ff2d54]
  - @cajoa/core@0.20.0

## 0.19.0

### Patch Changes

- Updated dependencies [3afb3f0]
  - @cajoa/core@0.19.0

## 0.18.0

### Minor Changes

- fb28418: Server-side rendering. New package `@cajoa/server` (also available as `cajoa/server`) with `renderToString` and `renderToStringAsync`, which waits for `createResource` and `lazy`. On the server `isServer()` is true, `onMount` does not run, refs and event handlers are skipped, and `<Navigate>` reports a redirect through `onRedirect`. The router reads the url of the request and keeps its state per request, so concurrent requests do not mix; its behavior in the browser is unchanged. The output has comment markers that the next release will use for hydration (turn them off with `hydratable: false`).

### Patch Changes

- Updated dependencies [fb28418]
  - @cajoa/core@0.18.0
