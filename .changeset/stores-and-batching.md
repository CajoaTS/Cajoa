---
"@cajoa/core": minor
"@cajoa/dom": minor
"cajoa": minor
---

Add `createStore`: a read-only proxy tracked per property, with `setState` for paths, merges, updater functions and drafts, and `unwrap`. DOM event handlers are now batched automatically: several updates in one handler cause one update. The Vite plugin now also makes property reads reactive (`{state.count}`, `{props.title}`), and `Show`, `Match` and `For` resolve nested getters (for example `when={props.open}` where `open` is a signal).
