---
"@cajoa/core": minor
"cajoa": minor
---

Faster list reordering: a keyed `<For>` now moves only the nodes that have to move (it keeps the longest run of nodes that are already in order), so swapping two rows no longer moves almost every row. Add `createSelector` for cheap "which one is selected" checks: only the old and the new key wake up.
