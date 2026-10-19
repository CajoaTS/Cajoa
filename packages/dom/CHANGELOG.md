# @cajoa/dom

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
