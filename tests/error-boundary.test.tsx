import { test, expect, vi } from "vitest";
import {
  catchError,
  createEffect,
  createRoot,
  createSignal,
  onMount,
  render,
  ErrorBoundary,
} from "cajoa";

const Bomb = (props: { message?: string }): never => {
  throw new Error(props.message ?? "boom");
};

test("shows the fallback when a child throws while it is created", () => {
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <p>before</p>
        <ErrorBoundary
          fallback={(error: unknown) => (
            <b>failed: {(error as Error).message}</b>
          )}
        >
          <Bomb />
        </ErrorBoundary>
        <p>after</p>
      </div>
    ),
    root,
  );

  expect(root.textContent).toBe("beforefailed: boomafter");
});

test("catches an error thrown later, inside an effect", () => {
  const [n, setN] = createSignal(0);
  const Fragile = () => {
    createEffect(() => {
      if (n() > 1) throw new Error("too big");
    });
    return <i>ok</i>;
  };
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <ErrorBoundary fallback={<u>fallback</u>}>
          <Fragile />
        </ErrorBoundary>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("ok");

  setN(2);
  expect(root.textContent).toBe("fallback");
});

test("reset re-creates the children", () => {
  let broken = true;
  let created = 0;
  let retry!: () => void;

  const Flaky = () => {
    created++;
    if (broken) throw new Error("nope");
    return <b>fixed</b>;
  };
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <ErrorBoundary
          fallback={(_error: unknown, reset: () => void) => {
            retry = reset;
            return <i>broken</i>;
          }}
        >
          <Flaky />
        </ErrorBoundary>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("broken");

  broken = false;
  retry();
  expect(root.textContent).toBe("fixed");
  expect(created).toBe(2);
});

test("the nearest boundary catches the error", () => {
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <ErrorBoundary fallback={<s>outer</s>}>
          <p>content</p>
          <ErrorBoundary fallback={<s>inner</s>}>
            <Bomb />
          </ErrorBoundary>
        </ErrorBoundary>
      </div>
    ),
    root,
  );

  expect(root.textContent).toBe("contentinner");
});

test("an error in the fallback goes to the next boundary", () => {
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <ErrorBoundary fallback={<s>outer</s>}>
          <ErrorBoundary
            fallback={() => {
              throw new Error("fallback failed");
            }}
          >
            <Bomb />
          </ErrorBoundary>
        </ErrorBoundary>
      </div>
    ),
    root,
  );

  expect(root.textContent).toBe("outer");
});

test("without a boundary the error is still thrown", () => {
  const root = document.createElement("div");

  expect(() =>
    render(
      () => (
        <div>
          <Bomb />
        </div>
      ),
      root,
    ),
  ).toThrow("boom");
});

test("catches an error thrown in onMount", async () => {
  const Late = () => {
    onMount(() => {
      throw new Error("late");
    });
    return <i>ok</i>;
  };
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <ErrorBoundary fallback={<u>caught</u>}>
          <Late />
        </ErrorBoundary>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("ok");

  await Promise.resolve();
  expect(root.textContent).toBe("caught");
});

test("onError is called with the error", () => {
  const onError = vi.fn();
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <ErrorBoundary fallback={<u>x</u>} onError={onError}>
          <Bomb message="reported" />
        </ErrorBoundary>
      </div>
    ),
    root,
  );

  expect(onError).toHaveBeenCalledTimes(1);
  expect((onError.mock.calls[0][0] as Error).message).toBe("reported");
});

test("catchError reports synchronous and later errors", () => {
  const errors: string[] = [];
  const report = (e: unknown) => errors.push((e as Error).message);
  const [n, setN] = createSignal(0);

  createRoot(() => {
    catchError(() => {
      throw new Error("now");
    }, report);

    catchError(() => {
      createEffect(() => {
        if (n() === 1) throw new Error("later");
      });
    }, report);
  });
  expect(errors).toEqual(["now"]);

  setN(1);
  expect(errors).toEqual(["now", "later"]);
});

test("render() explains how to fix a component that returns a function", () => {
  const root = document.createElement("div");

  expect(() =>
    render(
      () => ErrorBoundary({ fallback: "x", children: () => "y" }) as never,
      root,
    ),
  ).toThrow(/Wrap it in an element/);
});
