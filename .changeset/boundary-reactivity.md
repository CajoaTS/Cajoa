---
"@cajoa/core": patch
---

Fix `<ErrorBoundary>`: a reactive component placed directly inside it (for example `<Router>`, `<Show>`, `<For>` or another boundary) stopped updating. A function returned as the content of a reactive child is now turned into its own reactive region, so a `<Show>` directly inside a `<Show>` works too.
