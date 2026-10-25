import { test, expect } from "vitest";
import { createEffect, createSignal } from "cajoa";

test("an event handler is batched: many sets, one update", () => {
  const [a, setA] = createSignal(0);
  const [b, setB] = createSignal(0);
  let runs = 0;

  createEffect(() => {
    a();
    b();
    runs++;
  });

  const button = (
    <button
      onClick={() => {
        setA(1);
        setB(1);
      }}
    >
      x
    </button>
  ) as HTMLButtonElement;

  expect(runs).toBe(1);
  button.click();
  expect(runs).toBe(2);
});

test("event handlers still receive the event, and `this` is the element", () => {
  let seen: unknown;
  let self: unknown;

  const button = (
    <button
      onClick={function (this: unknown, e: Event) {
        seen = e;
        self = this;
      }}
    >
      x
    </button>
  ) as HTMLButtonElement;

  button.click();
  expect(seen).toBeInstanceOf(Event);
  expect(self).toBe(button);
});
