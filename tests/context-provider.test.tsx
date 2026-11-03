import { test, expect } from "vitest";
import { createContext, createSignal, render, useContext } from "cajoa";

const Theme = createContext("light");

function Label() {
  const theme = useContext(Theme);
  return <p>{theme}</p>;
}

test("Provider gives its value to everything inside, and only inside", () => {
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Label />
        <Theme.Provider value="dark">
          <Label />
        </Theme.Provider>
      </div>
    ),
    root,
  );

  expect(root.textContent).toBe("lightdark");
});

test("providers can be nested", () => {
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Theme.Provider value="dark">
          <Theme.Provider value="blue">
            <Label />
          </Theme.Provider>
          <Label />
        </Theme.Provider>
      </div>
    ),
    root,
  );

  expect(root.textContent).toBe("bluedark");
});

test("things created later inside a Provider still see the value", () => {
  const [on, setOn] = createSignal(false);
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Theme.Provider value="dark">
          {() => (on() ? <Label /> : null)}
        </Theme.Provider>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("");

  setOn(true);
  expect(root.textContent).toBe("dark");
});
