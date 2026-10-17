import { test, expect } from "vitest";
import {
  createSignal,
  createEffect,
  createRoot,
  onCleanup,
  onMount,
  h,
  render,
  Show,
} from "cajoa";

test("onCleanup runs before an effect re-runs", () => {
  const [n, setN] = createSignal(0);
  const log: string[] = [];

  createRoot(() => {
    createEffect(() => {
      const v = n();
      log.push("run " + v);
      onCleanup(() => log.push("cleanup " + v));
    });
  });

  setN(1);
  expect(log).toEqual(["run 0", "cleanup 0", "run 1"]);
});

test("dispose stops effects", () => {
  const [n, setN] = createSignal(0);
  let runs = 0;

  const dispose = createRoot((d) => {
    createEffect(() => {
      n();
      runs++;
    });
    return d;
  });

  setN(1);
  expect(runs).toBe(2);

  dispose();
  setN(2);
  expect(runs).toBe(2);
});

test("same value does not trigger effects", () => {
  const [n, setN] = createSignal(1);
  let runs = 0;
  createEffect(() => {
    n();
    runs++;
  });

  setN(1);
  expect(runs).toBe(1);
});

test("Show disposes the old branch (no leak)", () => {
  const [on, setOn] = createSignal(true);
  const [n, setN] = createSignal(0);
  let runs = 0;
  const root = document.createElement("div");

  render(
    () =>
      h(
        "div",
        null,
        Show({
          when: on,
          children: () =>
            h("p", null, () => {
              runs++;
              return n();
            }),
        }),
      ),
    root,
  );
  expect(runs).toBe(1);

  setOn(false); // mawawala ang <p>
  setN(1); // dapat hindi na tumakbo ang effect ng lumang <p>
  expect(runs).toBe(1);
});

test("onMount runs after render", async () => {
  const root = document.createElement("div");
  let attached = false;

  render(() => {
    const el = h("p", null, "hi") as HTMLElement;
    onMount(() => {
      attached = el.parentElement === root;
    });
    return el;
  }, root);

  expect(attached).toBe(false); // hindi pa
  await Promise.resolve();
  expect(attached).toBe(true); // tapos na ang render
});
