import { test, expect } from "vitest";
import { navigate, NavLink, render, Route, Router } from "cajoa";

test("routes can be created with map() inside the JSX", () => {
  const names = ["one", "two"];
  const root = document.createElement("div");

  const dispose = render(
    () => (
      <div>
        <Router>
          {names.map((name) => (
            <Route path={name} component={() => <p>{name}</p>} />
          ))}
        </Router>
      </div>
    ),
    root
  );

  navigate("/two");
  expect(root.textContent).toBe("two");

  dispose();
  navigate("/");
});

test("NavLink marks the current page with aria-current", () => {
  navigate("/about");
  const root = document.createElement("div");

  const dispose = render(
    () => (
      <nav>
        <NavLink href="/about">About</NavLink>
        <NavLink href="/other">Other</NavLink>
      </nav>
    ),
    root
  );

  const links = root.querySelectorAll("a");
  expect(links[0].getAttribute("aria-current")).toBe("page");
  expect(links[1].getAttribute("aria-current")).toBeNull();

  navigate("/other");
  expect(links[0].getAttribute("aria-current")).toBeNull();
  expect(links[1].getAttribute("aria-current")).toBe("page");

  dispose();
  navigate("/");
});