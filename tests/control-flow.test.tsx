import { test, expect } from "vitest";
import {
  createResource,
  createSignal,
  render,
  ErrorBoundary,
  Switch,
  Match,
  Dynamic,
  Portal,
  Suspense,
  lazy,
} from "cajoa";

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

// ---------- Switch / Match ----------

test("Switch renders the first matching branch, then the fallback", () => {
  const [state, setState] = createSignal("loading");
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Switch fallback={<p>unknown</p>}>
          <Match when={state() === "loading"}>
            <p>loading</p>
          </Match>
          <Match when={state() === "error"}>
            <p>error</p>
          </Match>
        </Switch>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("loading");

  setState("error");
  expect(root.textContent).toBe("error");

  setState("other");
  expect(root.textContent).toBe("unknown");
});

test("Match children are created only for the selected branch", () => {
  let created = 0;
  const Heavy = () => {
    created++;
    return <b>heavy</b>;
  };
  const [on, setOn] = createSignal(false);
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Switch>
          <Match when={on()}>
            <Heavy />
          </Match>
        </Switch>
      </div>
    ),
    root,
  );
  expect(created).toBe(0);

  setOn(true);
  expect(created).toBe(1);
  expect(root.textContent).toBe("heavy");
});

test("Switch does not re-create the branch while the same one stays selected", () => {
  let created = 0;
  const Heavy = () => {
    created++;
    return <b>heavy</b>;
  };
  const [n, setN] = createSignal(1);
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Switch>
          <Match when={n() > 0}>
            <Heavy />
          </Match>
        </Switch>
      </div>
    ),
    root,
  );

  setN(2);
  setN(3);
  expect(created).toBe(1);
});

// ---------- Dynamic ----------

test("Dynamic switches between a tag and a component", () => {
  const A = (props: { label: string }) => <i>{props.label}</i>;
  const [target, setTarget] = createSignal<
    string | ((props: { label: string }) => unknown) | null
  >("b");
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Dynamic is={target} label="hi">
          text
        </Dynamic>
      </div>
    ),
    root,
  );
  expect(root.querySelector("b")?.textContent).toBe("text");
  expect(root.querySelector("b")?.getAttribute("label")).toBe("hi");

  setTarget(() => A); // tandaan: ang setTarget(A) ay tatawag sa A bilang updater
  expect(root.querySelector("b")).toBeNull();
  expect(root.querySelector("i")?.textContent).toBe("hi");

  setTarget(null);
  expect(root.textContent).toBe("");
});

test("Dynamic explains how to pass a component directly", () => {
  const Page = () => <p>page</p>;
  const root = document.createElement("div");

  expect(() =>
    render(
      () => (
        <div>
          <Dynamic is={Page} />
        </div>
      ),
      root,
    ),
  ).toThrow(/is=\{\(\) => MyComponent\}/);
});

// ---------- Portal ----------

test("Portal renders into another element and cleans up", () => {
  const target = document.createElement("div");
  document.body.append(target);
  const root = document.createElement("div");

  const dispose = render(
    () => (
      <div>
        <p>page</p>
        <Portal mount={target}>
          <b>modal</b>
        </Portal>
      </div>
    ),
    root,
  );

  expect(root.textContent).toBe("page");
  expect(target.textContent).toBe("modal");

  dispose();
  expect(target.textContent).toBe("");
  target.remove();
});

test("Portal uses document.body by default and updates reactively", () => {
  const [n, setN] = createSignal(1);
  const root = document.createElement("div");

  const dispose = render(
    () => (
      <div>
        <Portal>
          <i id="portal-default">{n()}</i>
        </Portal>
      </div>
    ),
    root,
  );

  const el = () => document.getElementById("portal-default");
  expect(el()?.parentElement).toBe(document.body);
  expect(el()?.textContent).toBe("1");

  setN(2);
  expect(el()?.textContent).toBe("2");

  dispose();
  expect(el()).toBeNull();
});

// ---------- lazy / Suspense ----------

test("lazy loads a component and Suspense shows its fallback meanwhile", async () => {
  const gate = deferred<{ default: (props: { name: string }) => unknown }>();
  const Page = lazy(() => gate.promise);
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Suspense fallback={<i>loading</i>}>
          <Page name="ada" />
        </Suspense>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("loading");

  gate.resolve({ default: (props) => <b>hello {props.name}</b> });
  await tick();
  expect(root.textContent).toBe("hello ada");
});

test("a loaded lazy component renders immediately the next time", async () => {
  const Page = lazy(() => Promise.resolve({ default: () => <b>ready</b> }));
  const first = document.createElement("div");

  render(
    () => (
      <div>
        <Suspense fallback={<i>loading</i>}>
          <Page />
        </Suspense>
      </div>
    ),
    first,
  );
  await tick();
  expect(first.textContent).toBe("ready");

  const second = document.createElement("div");
  render(
    () => (
      <div>
        <Page />
      </div>
    ),
    second,
  );
  expect(second.textContent).toBe("ready");
});

test("Suspense waits for resources, then keeps the content", async () => {
  const gate = deferred<string>();
  const Profile = () => {
    const [data] = createResource(() => gate.promise);
    return <p>{data()}</p>;
  };
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Suspense fallback={<i>loading</i>}>
          <h1>title</h1>
          <Profile />
        </Suspense>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("loading");

  gate.resolve("ada");
  await tick();
  expect(root.textContent).toBe("titleada");
});

test("a failed lazy load is caught by an ErrorBoundary", async () => {
  const Page = lazy<Record<string, never>>(() =>
    Promise.reject(new Error("chunk failed")),
  );
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <ErrorBoundary
          fallback={(error: unknown) => <b>{(error as Error).message}</b>}
        >
          <Suspense fallback={<i>loading</i>}>
            <Page />
          </Suspense>
        </ErrorBoundary>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("loading");

  await tick();
  expect(root.textContent).toBe("chunk failed");
});
