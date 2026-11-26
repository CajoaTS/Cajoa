# @cajoa/server

## 1.2.1

### Patch Changes

- e45d34a: `hydrate()` keeps more of the page as it is.
  
  - **No more reloads of `<iframe>`, `<video>` and similar elements.** `hydrate()` used to write every prop again, and writing `srcdoc` or `src` again, even with the same value, makes an `<iframe>` load again. It now skips an attribute that the server HTML already has.
  - **Nested blocks stay in place.** When a function returns another function (a `Show` inside a `Show`, a list inside a block, an array that holds functions), the elements were moved to a temporary fragment and back while hydrating. They are not moved now.
  
  Still moved once while hydrating, with the same elements: those inside a `<>...</>` fragment, and `Suspense` content that comes from a fragment. An `<iframe>` or `<video>` there may reload.
  
  Text that the user typed before `hydrate()` ran is kept in a field that the app does not control (no `value` or `checked` prop). A field with such a prop is set to what the app says.
  
  New, experimental (the `Renderer` interface is experimental): the optional `createHolder()` and `unwrap()` methods of `Renderer`. Only `hydrate()` uses them. Rendering, updating and the server renderer work as before.
  
  Also: a Playwright test page and spec in `e2e/` that hydrate server HTML in three browsers, and more `hydrate()` tests.

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

### Patch Changes

- Updated dependencies [4ec2de8]
  - @cajoa/core@1.0.0

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
