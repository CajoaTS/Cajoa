# Cajoa

A small, beginner-friendly frontend framework built on **signals**.
No virtual DOM, no hooks rules, no re-rendering components.

> ⚠️ **v0.1 (early stage).** The API will change. Not production-ready yet.

## Why Cajoa?

- **Components run once.** A component is just a function that builds DOM. Only the parts that depend on a signal update.
- **Tiny and readable.** The whole core is a few hundred lines you can read in one sitting.
- **TypeScript-first**, ESM + CommonJS, zero runtime dependencies.

## Install

```bash
npm install cajoa
```

## Quick start

```ts
import { createSignal, h, render } from "cajoa";

function Counter() {
  const [count, setCount] = createSignal(0);

  return h(
    "button",
    { onClick: () => setCount((c) => c + 1) },
    "Clicked ",
    count,
    " times",
  );
}

render(Counter, document.getElementById("app")!);
```

Passing `count` (the function itself, not `count()`) is what makes that part of the DOM reactive.

## API

| Function                             | What it does                                                             |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `createSignal(value)`                | Returns `[get, set]`. Reading `get()` inside an effect subscribes to it. |
| `createEffect(fn)`                   | Runs `fn` now and again whenever a signal it read changes.               |
| `h(tag, props, ...children)`         | Creates a real DOM element. Function props/children are reactive.        |
| `render(component, container)`       | Mounts a component. Returns a `dispose` function.                        |
| `Show({ when, children, fallback })` | Conditional rendering.                                                   |
| `For({ each, children })`            | List rendering.                                                          |
| `onMount(fn)`                        | Runs `fn` after the component is rendered.                               |
| `onCleanup(fn)`                      | Runs `fn` before an effect re-runs or when its owner is disposed.        |
| `createRoot(fn)`                     | Creates a top-level owner you can dispose manually.                      |

## Known limitations

- `For` rebuilds the whole list on every change (keyed diffing is planned).
- No `createMemo`, `batch`, or context yet.
- No JSX support yet (`h()` only).
- No SSR.

## Roadmap

- [x] Signals and effects
- [x] DOM bindings (`h`, `render`)
- [x] `Show`, `For`
- [x] Lifecycle (`onMount`, `onCleanup`) and disposal
- [ ] `createMemo`, `batch`
- [ ] Keyed `For`
- [ ] Context
- [ ] JSX support
- [ ] Router

## Development

```bash
npm install
npm test          # run tests
npm run dev       # open the playground
npm run build     # build to dist/
```

## License

[Apache-2.0](./LICENSE)
