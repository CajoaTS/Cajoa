# cajoa

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
