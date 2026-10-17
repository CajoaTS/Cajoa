import { test, expect } from "vitest";
import { createSignal, createEffect, createMemo } from "../src";

test("memo skips downstream updates when result is equal", () => {
  const [n, setN] = createSignal(1);
  let computes = 0;
  let effectRuns = 0;

  const isEven = createMemo(() => {
    computes++;
    return n() % 2 === 0;
  });
  createEffect(() => {
    isEven();
    effectRuns++;
  });

  expect([computes, effectRuns]).toEqual([1, 1]);

  setN(3); 
  expect([computes, effectRuns]).toEqual([2, 1]);

  setN(2); 
  expect([computes, effectRuns]).toEqual([3, 2]);
});

test("reading a memo many times does not recompute", () => {
  const [n] = createSignal(2);
  let computes = 0;
  const double = createMemo(() => {
    computes++;
    return n() * 2;
  });

  double();
  double();
  double();
  expect(computes).toBe(1);
  expect(double()).toBe(4);
});
