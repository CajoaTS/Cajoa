import { test, expect, beforeEach, afterEach } from "vitest";
import {
  createSignal,
  render,
  ErrorBoundary,
  Show,
  Router,
  Route,
  navigate,
} from "cajoa";

beforeEach(() => navigate("/"));
afterEach(() => navigate("/"));

test("a Show directly inside an ErrorBoundary stays reactive", () => {
  const [on, setOn] = createSignal(false);
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <ErrorBoundary fallback={<u>fallback</u>}>
          <Show when={on()} fallback={<i>off</i>}>
            <b>on</b>
          </Show>
        </ErrorBoundary>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("off");

  setOn(true);
  expect(root.textContent).toBe("on");

  setOn(false);
  expect(root.textContent).toBe("off");
});

test("a Router directly inside an ErrorBoundary keeps navigating", () => {
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <ErrorBoundary fallback={<u>fallback</u>}>
          <Router>
            <Route path="/" component={() => <p>home</p>} />
            <Route path="/about" component={() => <p>about</p>} />
          </Router>
        </ErrorBoundary>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("home");

  navigate("/about");
  expect(root.textContent).toBe("about");
});

test("an inner boundary can reset while it is the only child of an outer boundary", () => {
  let broken = true;
  let retry!: () => void;

  const Flaky = () => {
    if (broken) throw new Error("nope");
    return <b>fixed</b>;
  };
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <ErrorBoundary fallback={<s>outer</s>}>
          <ErrorBoundary
            fallback={(_error: unknown, reset: () => void) => {
              retry = reset;
              return <i>inner</i>;
            }}
          >
            <Flaky />
          </ErrorBoundary>
        </ErrorBoundary>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("inner");

  broken = false;
  retry();
  expect(root.textContent).toBe("fixed");
});

test("a Show directly inside a Show renders and stays reactive", () => {
  const [outer, setOuter] = createSignal(true);
  const [inner, setInner] = createSignal(false);
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Show when={outer()}>
          <Show when={inner()} fallback={<i>inner off</i>}>
            <b>inner on</b>
          </Show>
        </Show>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("inner off");

  setInner(true);
  expect(root.textContent).toBe("inner on");

  setOuter(false);
  expect(root.textContent).toBe("");

  setOuter(true);
  expect(root.textContent).toBe("inner on");
});
