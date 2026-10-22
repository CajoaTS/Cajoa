---
"@cajoa/core": minor
"cajoa": minor
---

Add `<ErrorBoundary>` (with `fallback(error, reset)` and `onError`) and `catchError`. Errors thrown while a component is created, inside effects and memos, or in `onMount` now go to the nearest boundary; without one they are thrown as before. Add dev-mode warnings (`onCleanup` or `useContext` called outside a component, duplicate keys in `<For>`) and a log for errors caught by a boundary, switched on automatically by the Vite plugin on the dev server. `render()` now throws a clear error when the component returns a function. The Vite plugin treats the children and `fallback` of `<ErrorBoundary>` as lazy, like `<Show>`.
