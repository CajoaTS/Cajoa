---
"cajoa": patch
"@cajoa/core": patch
"@cajoa/dom": patch
"@cajoa/server": patch
---

`hydrate()` keeps more of the page as it is.

- **No more reloads of `<iframe>`, `<video>` and similar elements.** `hydrate()` used to write every prop again, and writing `srcdoc` or `src` again, even with the same value, makes an `<iframe>` load again. It now skips an attribute that the server HTML already has.
- **Nested blocks stay in place.** When a function returns another function (a `Show` inside a `Show`, a list inside a block, an array that holds functions), the elements were moved to a temporary fragment and back while hydrating. They are not moved now.

Still moved once while hydrating, with the same elements: those inside a `<>...</>` fragment, and `Suspense` content that comes from a fragment. An `<iframe>` or `<video>` there may reload.

Text that the user typed before `hydrate()` ran is kept in a field that the app does not control (no `value` or `checked` prop). A field with such a prop is set to what the app says.

New, experimental (the `Renderer` interface is experimental): the optional `createHolder()` and `unwrap()` methods of `Renderer`. Only `hydrate()` uses them. Rendering, updating and the server renderer work as before.

Also: a Playwright test page and spec in `e2e/` that hydrate server HTML in three browsers, and more `hydrate()` tests.
