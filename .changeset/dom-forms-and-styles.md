---
"@cajoa/dom": minor
---

DOM renderer: `style` accepts objects, `value`/`checked`/`selected` are set as DOM properties (and stay in sync after the user types), `<select value>` works, event props can be replaced or removed, `onDoubleClick` maps to `dblclick`, `htmlFor` is supported, and inline `on*` string attributes are ignored.
