---
"cajoa": minor
"@cajoa/core": minor
"@cajoa/dom": minor
"@cajoa/server": minor
---

Hydration keeps the data that resources loaded on the server. With `renderToStringAsync(app, { hydratable: true })`, the data of every resource is written at the end of the HTML in a `<script type="application/json" data-cj-data>`. `hydrate()` removes it, and `createResource` in the browser starts with that value: it does not fetch again, and `Suspense` shows its content at once instead of its fallback. `refetch()` and a changing source work as before.

A resource only takes the server's data when its source (the value its first function returns) is the same as on the server. A resource that failed on the server, whose value JSON cannot write (`undefined`, `Map`, class instances; a `Date` becomes a string) or whose source JSON cannot write, loads in the browser.

Everything a resource returns is sent to the browser, not only what the page shows. Pick the fields you need inside the fetcher.

Behavior change: with `hydratable: true`, `renderToStringAsync` now renders the app more than once, until no new data is loaded. This is needed so that the HTML matches what `hydrate()` builds. Each fetcher still runs once, but your components run again on the server, so keep them free of side effects. `head` and `onRedirect` only get what the last pass produced. Without `hydratable`, and with `renderToString`, nothing changes.

New experimental API, used by `@cajoa/server` and `hydrate()`, not by apps: `setResourceTransfer()`, the `ResourceTransfer` and `ResourceSlot` types, and the optional `transfer` field of `ServerRequest`. `hydrate()`, the markers and the data script stay experimental.
