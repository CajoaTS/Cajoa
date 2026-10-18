---
"cajoa": minor
"@cajoa/core": minor
"@cajoa/dom": minor
---

`@cajoa/core` no longer depends on DOM types. `h()` and `render()` now use a neutral `HostNode` type, and `h()` returns `HostNode` instead of `HTMLElement` (type-level breaking change; runtime behavior is unchanged).
