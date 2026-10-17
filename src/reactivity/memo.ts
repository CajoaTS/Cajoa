import { createSignal, createEffect } from "./signal";

export function createMemo<T>(fn: () => T): () => T {
  const [value, setValue] = createSignal<T>(undefined as T);
  createEffect(() => setValue(() => fn()));
  return value;
}
