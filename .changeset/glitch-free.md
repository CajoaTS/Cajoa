---
"@cajoa/core": minor
"cajoa": minor
---

Glitch-free updates. The scheduler is rewritten: a change marks what depends on it, and effects run once afterwards, after the memos they read are up to date, so an effect never sees a half-updated state. Memos are now computed lazily when read (the first computation is still immediate) and reading a memo inside `batch` gives the fresh value. An update started inside an effect is queued instead of running in the middle of it. If one effect throws, the other queued effects still run and the first error is rethrown afterwards. An update loop that never settles now throws a clear error after 100,000 steps instead of overflowing the stack.
