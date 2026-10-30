---
"@cajoa/core": minor
"@cajoa/dom": minor
"cajoa": minor
---

Typed JSX. Every HTML and SVG element, its attributes and its events are now typed: `onInput={(e) => e.currentTarget.value}` knows `currentTarget` is an `HTMLInputElement`, unknown elements and attributes are errors, and every attribute accepts a value or a function. `style` values are strings (Cajoa does not add `px`) and ARIA booleans are strings (`aria-hidden="true"`). The `JSX` namespace moved from `@cajoa/core` to `@cajoa/dom`, because the DOM elements belong to the DOM renderer; `cajoa/jsx-runtime` still exposes it, so projects that use `jsxImportSource: "cajoa"` change nothing. `JSX`, `CSSProperties` and `TargetedEvent` are exported from `cajoa`. Types only: no change in behavior or bundle size.
