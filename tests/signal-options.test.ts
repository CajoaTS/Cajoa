import { test, expect } from "vitest";
import { createEffect, createMemo, createRoot, createSignal } from "cajoa";

test("equals: false notifies even when the value is the same", () => {
  const [obj, setObj] = createSignal({ n: 1 }, { equals: false });
  let runs = 0;
  createEffect(() => {
    obj();
    runs++;
  });

  setObj(obj()); // the same object
  expect(runs).toBe(2);
});

test("a custom equals decides what counts as a change", () => {
  const [n, setN] = createSignal(1, { equals: (a, b) => Math.abs(a - b) < 1 });
  let runs = 0;
  createEffect(() => {
    n();
    runs++;
  });

  setN(1.5); // too close: not a change
  expect(runs).toBe(1);
  setN(3);
  expect(runs).toBe(2);
});

test("a memo with equals: false passes every recompute on", () => {
  const [a, setA] = createSignal(1);
  const parity = createMemo(() => a() % 2, { equals: false });
  let runs = 0;
  createEffect(() => {
    parity();
    runs++;
  });

  setA(3); // the memo gives 1 again, but equals is false
  expect(runs).toBe(2);
});

test("the error for a loop that never settles names the effects", () => {
  const [n, setN] = createSignal(0);

  expect(() =>
    createRoot(() => {
      createEffect(
        () => {
          setN(n() + 1);
        },
        { name: "counter-loop" },
      );
    }),
  ).toThrow(/counter-loop/);
});
