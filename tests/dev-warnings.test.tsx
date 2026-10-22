import { test, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";
import {
  createContext,
  createRoot,
  onCleanup,
  render,
  useContext,
  For,
} from "cajoa";

const flag = globalThis as unknown as { __CAJOA_DEV__?: boolean };
const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

const Theme = createContext("light");

beforeAll(() => {
  flag.__CAJOA_DEV__ = true;
});

beforeEach(() => {
  flag.__CAJOA_DEV__ = true;
  warn.mockClear();
});

afterAll(() => {
  delete flag.__CAJOA_DEV__;
  warn.mockRestore();
});

test("onCleanup outside a component or effect warns", () => {
  onCleanup(() => {});
  expect(warn).toHaveBeenCalledWith(expect.stringContaining("onCleanup"));
});

test("onCleanup inside a root does not warn", () => {
  createRoot(() => {
    onCleanup(() => {});
  });
  expect(warn).not.toHaveBeenCalled();
});

test("useContext outside a component warns and returns the default", () => {
  expect(useContext(Theme)).toBe("light");
  expect(warn).toHaveBeenCalledWith(expect.stringContaining("useContext"));
});

test("useContext inside a component does not warn", () => {
  const root = document.createElement("div");

  render(() => {
    useContext(Theme);
    return <p>ok</p>;
  }, root);

  expect(warn).not.toHaveBeenCalled();
});

test("<For> warns about duplicate keys", () => {
  const root = document.createElement("div");

  render(
    () => (
      <ul>
        <For each={["a", "a"]}>{(x: string) => <li>{x}</li>}</For>
      </ul>
    ),
    root,
  );

  expect(warn).toHaveBeenCalledWith(expect.stringContaining("duplicate key"));
});

test("nothing is logged when the dev flag is off", () => {
  flag.__CAJOA_DEV__ = false;
  onCleanup(() => {});
  expect(warn).not.toHaveBeenCalled();
});
