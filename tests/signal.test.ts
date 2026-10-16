import { test, expect } from "vitest";
import { createSignal, createEffect } from "../src/reactivity/signal";

test("effect re-runs when signal changes", () => {
  const [n, setN] = createSignal(0);
  const seen: number[] = [];
  createEffect(() => seen.push(n()));
  setN(1);
  expect(seen).toEqual([0, 1]);
});
