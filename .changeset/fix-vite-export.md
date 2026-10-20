---
"cajoa": patch
---

Fix the `cajoa/vite` export: the `./vite` entry was nested inside the `"."` export, so `import { cajoa } from "cajoa/vite"` failed with `Missing "./vite" specifier`. A new CI check (`check:exports`) now verifies that every export resolves and imports.
