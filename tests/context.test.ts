import { test, expect } from "vitest";
import {
  createSignal,
  createRoot,
  createContext,
  provide,
  useContext,
  h,
  render,
  Show,
} from "cajoa";

test("returns default outside a provider", () => {
  const Theme = createContext("light");
  expect(useContext(Theme)).toBe("light");
});

test("nearest provider wins", () => {
  const Theme = createContext("light");
  const seen: string[] = [];
  createRoot(() => {
    provide(Theme, "dark", () => {
      seen.push(useContext(Theme));
      provide(Theme, "blue", () => seen.push(useContext(Theme)));
      seen.push(useContext(Theme));
    });
  });
  expect(seen).toEqual(["dark", "blue", "dark"]);
});

test("works for components deep in the tree", () => {
  const Theme = createContext("light");
  const Child = () => h("span", null, useContext(Theme));
  const root = document.createElement("div");

  render(() => provide(Theme, "dark", () => h("div", null, Child())), root);
  expect(root.textContent).toBe("dark");
});

test("available inside reactive children (Show)", () => {
  const Theme = createContext("light");
  const [on, setOn] = createSignal(false);
  const root = document.createElement("div");

  render(
    () =>
      provide(Theme, "dark", () =>
        h(
          "div",
          null,
          Show({ when: on, children: () => h("p", null, useContext(Theme)) }),
        ),
      ),
    root,
  );

  setOn(true);
  expect(root.textContent).toBe("dark");
});