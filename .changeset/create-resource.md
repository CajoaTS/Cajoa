---
"@cajoa/core": minor
"cajoa": minor
---

Add `createResource` for async data: `const [user, { refetch, mutate }] = createResource(id, fetchUser)`. It loads when the source changes, ignores stale responses, keeps the previous data while reloading, exposes `loading()` and `error()`, and throws the error when the resource is read after a failure, so an `<ErrorBoundary>` can catch it.
