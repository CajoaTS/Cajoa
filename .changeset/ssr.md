---
"@cajoa/core": minor
"@cajoa/dom": minor
"@cajoa/server": minor
"cajoa": minor
---

Server-side rendering. New package `@cajoa/server` (also available as `cajoa/server`) with `renderToString` and `renderToStringAsync`, which waits for `createResource` and `lazy`. On the server `isServer()` is true, `onMount` does not run, refs and event handlers are skipped, and `<Navigate>` reports a redirect through `onRedirect`. The router reads the url of the request and keeps its state per request, so concurrent requests do not mix; its behavior in the browser is unchanged. The output has comment markers that the next release will use for hydration (turn them off with `hydratable: false`).
