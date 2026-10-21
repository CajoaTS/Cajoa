# @cajoa/core

## 0.11.0

No changes in this release.

## 0.10.1

No changes in this release.

## 0.10.0

### Minor Changes

- 97ab96f: Add the Vite plugin (`cajoa/vite`): calls in JSX are reactive without wrapper functions, `Show` children and `fallback` are created lazily, and the plugin configures Vite's JSX transform. `Show` and `For` now also accept plain values (`when={n() > 3}`, `each={todos()}`).

## 0.9.0

### Minor Changes

- f2e123a: Add the `ref` prop (a function called once with the created element, after its props and children are ready) and SVG support: SVG tags are created in the SVG namespace and camelCase attributes like `strokeWidth` become `stroke-width`.

## 0.8.0

No changes in this release.

## 0.7.0

### Minor Changes

- 349df4e: `@cajoa/core` no longer depends on DOM types. `h()` and `render()` now use a neutral `HostNode` type, and `h()` returns `HostNode` instead of `HTMLElement` (type-level breaking change; runtime behavior is unchanged).
