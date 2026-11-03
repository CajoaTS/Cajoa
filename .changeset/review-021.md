---
"@cajoa/core": minor
"@cajoa/dom": minor
"@cajoa/server": minor
"cajoa": minor
---

The 1.0 review. Breaking: the index that `<For>` gives to its child is now a function (`(item, i) => ... i() ...`), because a plain number went stale when the list was reordered. `renderToString` and `renderToStringAsync` no longer write hydration markers unless you pass `hydratable: true` (experimental, there is no `hydrate()` yet). The plugin now requires Vite 8 and the packages require Node 20 or newer. New: `createSignal`, `createMemo` and `createEffect` take options (`equals`, `name`), contexts have a `<Context.Provider value>` component, and `render()` accepts components that return a function, such as `<Show>` or `<Router>`, instead of throwing. The effects named in a "never settled" error are listed by name.
