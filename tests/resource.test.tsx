import { test, expect } from "vitest";
import {
  createResource,
  createRoot,
  createSignal,
  render,
  ErrorBoundary,
} from "cajoa";

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

test("loads data and reports loading", async () => {
  const [user] = createResource(() => Promise.resolve("ada"));
  expect(user.loading()).toBe(true);
  expect(user()).toBeUndefined();

  await tick();
  expect(user.loading()).toBe(false);
  expect(user()).toBe("ada");
});

test("ignores a stale response when the source changes", async () => {
  const [id, setId] = createSignal(1);
  const calls: {
    resolve: (value: string) => void;
    promise: Promise<string>;
  }[] = [];
  const [data] = createResource(id, () => {
    const call = deferred<string>();
    calls.push(call);
    return call.promise;
  });

  setId(2);
  calls[1].resolve("second");
  await tick();
  calls[0].resolve("first");
  await tick();

  expect(data()).toBe("second");
});

test("stays idle while the source is falsy and loads synchronously for plain values", () => {
  const [id, setId] = createSignal<number | null>(null);
  let fetches = 0;
  const [data] = createResource(id, (n) => {
    fetches++;
    return n * 2;
  });

  expect(fetches).toBe(0);
  expect(data.loading()).toBe(false);

  setId(4);
  expect(data()).toBe(8);

  setId(null);
  expect(data()).toBeUndefined();
  expect(fetches).toBe(1);
});

test("a rejected promise sets the error, and reading the resource throws it", async () => {
  const [data] = createResource<string>(() =>
    Promise.reject(new Error("nope")),
  );
  await tick();

  expect(data.loading()).toBe(false);
  expect((data.error() as Error).message).toBe("nope");
  expect(() => data()).toThrow("nope");
});

test("refetch loads again and mutate sets the value", () => {
  let n = 0;
  const [data, { refetch, mutate }] = createResource(() => ++n);
  expect(data()).toBe(1);

  refetch();
  expect(data()).toBe(2);

  mutate(10);
  expect(data()).toBe(10);
});

test("keeps the previous value while a reload is in progress", async () => {
  const [id, setId] = createSignal(1);
  const calls: {
    resolve: (value: string) => void;
    promise: Promise<string>;
  }[] = [];
  const [data] = createResource(id, () => {
    const call = deferred<string>();
    calls.push(call);
    return call.promise;
  });

  calls[0].resolve("one");
  await tick();
  expect(data()).toBe("one");

  setId(2);
  expect(data.loading()).toBe(true);
  expect(data()).toBe("one");

  calls[1].resolve("two");
  await tick();
  expect(data()).toBe("two");
  expect(data.loading()).toBe(false);
});

test("a failed resource is caught by an ErrorBoundary", async () => {
  const Profile = () => {
    const [data] = createResource<string>(() =>
      Promise.reject(new Error("offline")),
    );
    return <p>{data()}</p>;
  };
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <ErrorBoundary
          fallback={(error: unknown) => <b>{(error as Error).message}</b>}
        >
          <Profile />
        </ErrorBoundary>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("");

  await tick();
  expect(root.textContent).toBe("offline");
});

test("results that arrive after the owner is disposed are ignored", async () => {
  const call = deferred<string>();
  let read!: () => string | undefined;

  const dispose = createRoot((dispose) => {
    const [data] = createResource(() => call.promise);
    read = data;
    return dispose;
  });

  dispose();
  call.resolve("late");
  await tick();

  expect(read()).toBeUndefined();
});
