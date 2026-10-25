# @cajoa/dom

## 0.15.0

### Minor Changes

- 406a4ab: Add `createStore`: a read-only proxy tracked per property, with `setState` for paths, merges, updater functions and drafts, and `unwrap`. DOM event handlers are now batched automatically: several updates in one handler cause one update. The Vite plugin now also makes property reads reactive (`{state.count}`, `{props.title}`), and `Show`, `Match` and `For` resolve nested getters (for example `when={props.open}` where `open` is a signal).

### Patch Changes

- Updated dependencies [406a4ab]
  - @cajoa/core@0.15.0

## 0.14.0

### Minor Changes

- 971c2b6: Add `Switch`/`Match`, `Dynamic`, `Portal`, `lazy` and `Suspense`. `Suspense` shows its fallback until the first load of every `lazy` component and `createResource` inside it has finished. The renderer interface gets an optional `portalRoot()` (the DOM renderer returns `document.body`). The Vite plugin makes the children of `Suspense`, `Portal` and `Match`, and the `fallback` of `Suspense` and `Switch`, lazy, and wraps `Match`'s `when` and `Dynamic`'s `is`.

### Patch Changes

- Updated dependencies [971c2b6]
  - @cajoa/core@0.14.0

## 0.13.0

### Patch Changes

- Updated dependencies [d587d69]
  - @cajoa/core@0.13.0

## 0.12.1

### Patch Changes

- Updated dependencies [7c6ee8f]
  - @cajoa/core@0.12.1

## 0.12.0

### Patch Changes

- Updated dependencies [63e98d2]
  - @cajoa/core@0.12.0

## 0.11.0

### Minor Changes

- d9ebb16: Router v2: nested routes with layouts and `<Outlet />`, a `base` path for apps served from a sub-path, query and hash support (`useLocation`, `useSearchParams`), `<NavLink>` with an active class, `<Navigate>` redirects, and a trailing `*` wildcard (`docs/*`). Navigating to a new page now scrolls to the top (or to the `#hash` target); pass `scroll: false` to `navigate` to opt out. A route component is re-created when its path params change.

### Patch Changes

- @cajoa/core@0.11.0

## 0.10.1

### Patch Changes

- @cajoa/core@0.10.1

## 0.10.0

### Patch Changes

- Updated dependencies [97ab96f]
  - @cajoa/core@0.10.0

## 0.9.0

### Minor Changes

- f2e123a: Add the `ref` prop (a function called once with the created element, after its props and children are ready) and SVG support: SVG tags are created in the SVG namespace and camelCase attributes like `strokeWidth` become `stroke-width`.

### Patch Changes

- Updated dependencies [f2e123a]
  - @cajoa/core@0.9.0

## 0.8.0

### Minor Changes

- 4634522: DOM renderer: `style` accepts objects, `value`/`checked`/`selected` are set as DOM properties (and stay in sync after the user types), `<select value>` works, event props can be replaced or removed, `onDoubleClick` maps to `dblclick`, `htmlFor` is supported, and inline `on*` string attributes are ignored.

### Patch Changes

- @cajoa/core@0.8.0

## 0.7.0

### Minor Changes

- 349df4e: `@cajoa/core` no longer depends on DOM types. `h()` and `render()` now use a neutral `HostNode` type, and `h()` returns `HostNode` instead of `HTMLElement` (type-level breaking change; runtime behavior is unchanged).

### Patch Changes

- Updated dependencies [349df4e]
  - @cajoa/core@0.7.0
