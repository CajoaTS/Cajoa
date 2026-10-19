import { test, expect, vi } from "vitest";
import { createSignal, createEffect, createRoot } from "cajoa";

test("ref receives the created element", () => {
  let input: HTMLInputElement | undefined;
  const node = (
    <input ref={(el: HTMLInputElement) => (input = el)} />
  ) as HTMLInputElement;

  expect(input).toBe(node);
});

test("ref is called after the children are in place", () => {
  let childCount = -1;
  const box = (
    <div ref={(el: HTMLElement) => (childCount = el.children.length)}>
      <span />
      <span />
    </div>
  ) as HTMLElement;

  expect(box.children.length).toBe(2);
  expect(childCount).toBe(2);
});

test("ref is not an attribute and not a reactive prop", () => {
  const [cls, setCls] = createSignal("a");
  const spy = vi.fn();
  const box = (<div ref={spy} class={cls} />) as HTMLElement;

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(box);
  expect(box.hasAttribute("ref")).toBe(false);

  setCls("b");
  expect(spy).toHaveBeenCalledTimes(1);
  expect(box.getAttribute("class")).toBe("b");
});

test("signals read inside ref do not subscribe the surrounding effect", () => {
  const [n, setN] = createSignal(0);
  let runs = 0;

  createRoot(() => {
    createEffect(() => {
      runs++;
      const node = (
        <div
          ref={() => {
            n();
          }}
        />
      );
      void node;
    });
  });

  expect(runs).toBe(1);
  setN(1);
  expect(runs).toBe(1);
});
