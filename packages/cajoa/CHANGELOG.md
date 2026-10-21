# cajoa

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
