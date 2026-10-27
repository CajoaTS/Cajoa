import { test, expect, vi } from "vitest";
import { createSignal, For, render } from "cajoa";

function mount(initial: string[]) {
  const [list, setList] = createSignal(initial);
  const root = document.createElement("div");
  render(
    () => (
      <ul>
        <For each={list}>{(s: string) => <li>{s}</li>}</For>
      </ul>
    ),
    root,
  );
  return { setList, root };
}

const texts = (root: HTMLElement) =>
  Array.from(root.querySelectorAll("li")).map((li) => li.textContent);

function countMoves(from: string[], to: string[]) {
  const { setList, root } = mount(from);
  const list = root.querySelector("ul")!;
  const spy = vi.spyOn(Node.prototype, "insertBefore");
  setList(to);
  const count = spy.mock.contexts.filter((node) => node === list).length;
  spy.mockRestore();
  expect(texts(root)).toEqual(to);
  return count;
}

test("swapping two rows in a list of 1,000 moves only two nodes", () => {
  const items = Array.from({ length: 1000 }, (_, i) => `n${i}`);
  const swapped = [...items];
  [swapped[1], swapped[998]] = [swapped[998], swapped[1]];

  expect(countMoves(items, swapped)).toBe(2);
});

test("moving one item costs one move, reversing costs n - 1", () => {
  const letters = "abcdefghij".split("");

  expect(countMoves(letters, [...letters.slice(1), letters[0]])).toBe(1);
  expect(countMoves(letters, ["j", ...letters.slice(0, 9)])).toBe(1);
  expect(countMoves(letters, [...letters].reverse())).toBe(9);
});

test("adding in the middle is one insert, removing is none", () => {
  const letters = "abcdefghij".split("");

  expect(
    countMoves(letters, [...letters.slice(0, 5), "X", ...letters.slice(5)]),
  ).toBe(1);
  expect(
    countMoves(
      letters,
      letters.filter((l) => l !== "c"),
    ),
  ).toBe(0);
});

test("random reorders, additions and removals give the right DOM and keep nodes", () => {
  let seed = 7;
  const random = (n: number) => {
    seed = (seed * 16807) % 2147483647;
    return seed % n;
  };
  const pool = Array.from({ length: 40 }, (_, i) => `k${i}`);
  const { setList, root } = mount([]);
  let before = new Map<string | null, Element>();

  for (let round = 0; round < 200; round++) {
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = random(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const next = shuffled.slice(0, random(pool.length + 1));

    setList(next);

    const now = Array.from(root.querySelectorAll("li"));
    expect(now.map((li) => li.textContent)).toEqual(next);
    for (const li of now) {
      const old = before.get(li.textContent);
      if (old) expect(li).toBe(old);
    }
    before = new Map(now.map((li) => [li.textContent, li]));
  }
});
