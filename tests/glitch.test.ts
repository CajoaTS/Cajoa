import { test, expect } from "vitest";
import {
  batch,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
} from "cajoa";

test("a diamond updates once and never shows a mix of old and new values", () => {
  const [a, setA] = createSignal(1);
  const b = createMemo(() => a() * 2);
  const c = createMemo(() => a() + 1);
  const seen: string[] = [];

  createEffect(() => {
    seen.push(`${b()}:${c()}`);
  });

  setA(2);
  expect(seen).toEqual(["2:2", "4:3"]);
});

test("an effect that reads a signal and a memo made from it sees them in agreement", () => {
  const [a, setA] = createSignal(1);
  const double = createMemo(() => a() * 2);
  const seen: Array<[number, number]> = [];

  createEffect(() => {
    seen.push([a(), double()]);
  });

  setA(2);
  expect(seen).toEqual([
    [1, 2],
    [2, 4],
  ]);
});

test("a memo that does not change stops the update", () => {
  const [a, setA] = createSignal(1);
  let computes = 0;
  let runs = 0;

  const positive = createMemo(() => {
    computes++;
    return a() > 0;
  });
  const label = createMemo(() => (positive() ? "positive" : "negative"));

  createEffect(() => {
    label();
    runs++;
  });

  setA(2);
  expect([computes, runs]).toEqual([2, 1]);

  setA(-1);
  expect([computes, runs]).toEqual([3, 2]);
});

test("reading a memo inside a batch gives the fresh value", () => {
  const [a, setA] = createSignal(1);
  const double = createMemo(() => a() * 2);
  let inside = 0;

  batch(() => {
    setA(5);
    inside = double();
  });

  expect(inside).toBe(10);
});

test("a memo that nobody reads is computed lazily", () => {
  const [a, setA] = createSignal(1);
  let computes = 0;
  const double = createMemo(() => {
    computes++;
    return a() * 2;
  });
  expect(computes).toBe(1);

  setA(2);
  setA(3);
  expect(computes).toBe(1);

  expect(double()).toBe(6);
  expect(computes).toBe(2);
});

test("an update started by an effect is queued, not run in the middle of it", () => {
  const [a, setA] = createSignal(1);
  const [s, setS] = createSignal(0);
  const order: string[] = [];

  createEffect(() => {
    order.push("A start");
    setS(a());
    order.push("A end");
  });
  createEffect(() => {
    order.push(`B sees ${s()}`);
  });
  order.length = 0;

  setA(2);
  expect(order).toEqual(["A start", "A end", "B sees 2"]);
});

test("an error in one effect does not stop the others, and is rethrown after", () => {
  const [n, setN] = createSignal(0);
  let ran = 0;

  createEffect(() => {
    if (n() === 1) throw new Error("boom");
  });
  createEffect(() => {
    n();
    ran++;
  });

  expect(() => setN(1)).toThrow("boom");
  expect(ran).toBe(2);
});

test("an effect that is disposed while it waits does not run", () => {
  const [n, setN] = createSignal(0);
  let runs = 0;

  createRoot((dispose) => {
    createEffect(() => {
      n();
      runs++;
    });
    batch(() => {
      setN(1);
      dispose();
    });
  });

  expect(runs).toBe(1);
});

test("a disposed memo stops tracking", () => {
  const [a, setA] = createSignal(1);
  let computes = 0;

  const dispose = createRoot((dispose) => {
    const double = createMemo(() => {
      computes++;
      return a() * 2;
    });
    double();
    return dispose;
  });

  dispose();
  setA(2);
  expect(computes).toBe(1);
});

test("an update loop that never settles throws a clear error", () => {
  const [n, setN] = createSignal(0);

  expect(() =>
    createRoot(() => {
      createEffect(() => {
        setN(n() + 1);
      });
    }),
  ).toThrow(/never settled/);
});
