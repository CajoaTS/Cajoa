import { test, expect } from "vitest";
import { createSignal, createEffect, batch } from "cajoa";

test("without batch, effect runs per set", () => {
  const [a, setA] = createSignal(1);
  const [b, setB] = createSignal(1);
  let runs = 0;
  createEffect(() => {
    a();
    b();
    runs++;
  });

  setA(2);
  setB(2);
  expect(runs).toBe(3);
});

test("batch runs the effect once", () => {
  const [a, setA] = createSignal(1);
  const [b, setB] = createSignal(1);
  const seen: number[] = [];
  createEffect(() => {
    seen.push(a() + b());
  });

  batch(() => {
    setA(2);
    setB(3);
  });
  expect(seen).toEqual([2, 5]); // walang "3" na intermediate
});

test("nested batch flushes only at the outermost end", () => {
  const [n, setN] = createSignal(0);
  let runs = 0;
  createEffect(() => {
    n();
    runs++;
  });

  batch(() => {
    batch(() => {
      setN(1);
    });
    expect(runs).toBe(1); // hindi pa nag-flush
    setN(2);
  });
  expect(runs).toBe(2);
});
