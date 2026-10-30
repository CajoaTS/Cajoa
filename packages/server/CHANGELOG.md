# @cajoa/server

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
