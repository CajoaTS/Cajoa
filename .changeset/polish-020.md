---
"@cajoa/core": minor
"@cajoa/dom": minor
"@cajoa/server": minor
"cajoa": minor
---

Production polish. New `<Title>` and `<Meta>` set the page title and meta tags: in the browser they change the document and clean up after themselves, and on the server they fill a `head` object (pass `head` to `renderToString` or `renderToStringAsync`, then use `headToString(head)`). `<For>` has a `fallback` for empty lists. `NavLink` sets `aria-current="page"` on the current link. `<Router>` and `<Route>` now accept function children, so routes built with `map()` inside the JSX work (before, the compiler's wrapping made them disappear).