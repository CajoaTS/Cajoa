import { test, expect } from "vitest";
import { createEffect, createRoot, createSelector, createSignal } from "cajoa";

test("a selector only wakes the effects of the old and the new key", () => {
  const [selected, setSelected] = createSignal(0);
  const runs = new Array<number>(100).fill(0);

  createRoot(() => {
    const isSelected = createSelector(selected);
    for (let i = 0; i < 100; i++) {
      createEffect(() => {
        isSelected(i);
        runs[i]++;
      });
    }
  });

  setSelected(5);
  expect(runs[0]).toBe(2);
  expect(runs[5]).toBe(2);
  expect(runs.filter((n) => n > 1).length).toBe(2);
});

test("it answers correctly inside and outside an effect", () => {
  const [selected, setSelected] = createSignal("a");
  const isSelected = createSelector(selected);

  expect(isSelected("a")).toBe(true);
  expect(isSelected("b")).toBe(false);

  setSelected("b");
  expect(isSelected("a")).toBe(false);
  expect(isSelected("b")).toBe(true);
});

test("an effect that reads the source and the selector sees them in agreement", () => {
  const [selected, setSelected] = createSignal(1);
  const isSelected = createSelector(selected);
  const seen: string[] = [];

  createEffect(() => {
    seen.push(`${selected()}:${isSelected(1)}`);
  });

  setSelected(2);
  expect(seen).toEqual(["1:true", "2:false"]);
});