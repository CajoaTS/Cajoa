---
"cajoa": minor
"@cajoa/core": minor
"@cajoa/dom": minor
"@cajoa/server": minor
---

Hydration. New `hydrate(component, container)` (exported from `@cajoa/dom` and `cajoa`) attaches your app to the HTML that the server wrote, instead of throwing it away like `render()` does. The elements are reused, so focus, scroll position and typed text are kept. Use it with `renderToString(app, { hydratable: true })`. If the server HTML and the browser app differ, `hydrate()` ends with the page that the browser app describes (and warns in dev mode); with no markers in the container it does the same as `render()`.

Breaking, but in the experimental part: the markers that `hydratable: true` writes changed. Elements now have a `data-cj` attribute, and the comments are `<!--m…-->` and `<!--t…-->` (before, `<!--$-->` and `<!--|-->`). Nothing changes unless you set `hydratable: true`. `hydrate()` and the markers stay experimental until resource data can travel from the server to the browser. Known limits: resources load again in the browser, and the browser inserts a `<tbody>` in `<table><tr>`, so write the `<tbody>`.
