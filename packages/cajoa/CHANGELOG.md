# cajoa

## 0.14.0

### Minor Changes

- 971c2b6: Add `Switch`/`Match`, `Dynamic`, `Portal`, `lazy` and `Suspense`. `Suspense` shows its fallback until the first load of every `lazy` component and `createResource` inside it has finished. The renderer interface gets an optional `portalRoot()` (the DOM renderer returns `document.body`). The Vite plugin makes the children of `Suspense`, `Portal` and `Match`, and the `fallback` of `Suspense` and `Switch`, lazy, and wraps `Match`'s `when` and `Dynamic`'s `is`.

### Patch Changes

- Updated dependencies [971c2b6]
  - @cajoa/core@0.14.0
  - @cajoa/dom@0.14.0

## 0.13.0

### Minor Changes

- d587d69: Add `createResource` for async data: `const [user, { refetch, mutate }] = createResource(id, fetchUser)`. It loads when the source changes, ignores stale responses, keeps the previous data while reloading, exposes `loading()` and `error()`, and throws the error when the resource is read after a failure, so an `<ErrorBoundary>` can catch it.

### Patch Changes

- Updated dependencies [d587d69]
  - @cajoa/core@0.13.0
  - @cajoa/dom@0.13.0

## 0.12.1

### Patch Changes

- Updated dependencies [7c6ee8f]
  - @cajoa/core@0.12.1
  - @cajoa/dom@0.12.1

## 0.12.0

### Minor Changes

- 63e98d2: Add `<ErrorBoundary>` (with `fallback(error, reset)` and `onError`) and `catchError`. Errors thrown while a component is created, inside effects and memos, or in `onMount` now go to the nearest boundary; without one they are thrown as before. Add dev-mode warnings (`onCleanup` or `useContext` called outside a component, duplicate keys in `<For>`) and a log for errors caught by a boundary, switched on automatically by the Vite plugin on the dev server. `render()` now throws a clear error when the component returns a function. The Vite plugin treats the children and `fallback` of `<ErrorBoundary>` as lazy, like `<Show>`.

### Patch Changes

- Updated dependencies [63e98d2]
  - @cajoa/core@0.12.0
  - @cajoa/dom@0.12.0

## 0.11.0

### Patch Changes

- Updated dependencies [d9ebb16]
  - @cajoa/dom@0.11.0
  - @cajoa/core@0.11.0

## 0.10.1

### Patch Changes

- eb34a75: Fix the `cajoa/vite` export: the `./vite` entry was nested inside the `"."` export, so `import { cajoa } from "cajoa/vite"` failed with `Missing "./vite" specifier`. A new CI check (`check:exports`) now verifies that every export resolves and imports.
- @cajoa/core@0.10.1
  - @cajoa/dom@0.10.1

## 0.10.0

### Minor Changes

- 97ab96f: Add the Vite plugin (`cajoa/vite`): calls in JSX are reactive without wrapper functions, `Show` children and `fallback` are created lazily, and the plugin configures Vite's JSX transform. `Show` and `For` now also accept plain values (`when={n() > 3}`, `each={todos()}`).

### Patch Changes

- Updated dependencies [97ab96f]
  - @cajoa/core@0.10.0
  - @cajoa/dom@0.10.0

## 0.9.0

### Patch Changes

- Updated dependencies [f2e123a]
  - @cajoa/core@0.9.0
  - @cajoa/dom@0.9.0

## 0.8.0

### Patch Changes

- Updated dependencies [4634522]
  - @cajoa/dom@0.8.0
  - @cajoa/core@0.8.0

## 0.7.0

### Minor Changes

- 349df4e: `@cajoa/core` no longer depends on DOM types. `h()` and `render()` now use a neutral `HostNode` type, and `h()` returns `HostNode` instead of `HTMLElement` (type-level breaking change; runtime behavior is unchanged).

### Patch Changes

- Updated dependencies [349df4e]
  - @cajoa/core@0.7.0
  - @cajoa/dom@0.7.0
