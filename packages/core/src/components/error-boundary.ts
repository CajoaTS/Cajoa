import { materialize, type Child } from "../runtime/h";
import { logError } from "../dev";
import { catchError, createSignal, untrack } from "../reactivity/signal";

type Lazy<T> = T | (() => T);

function resolve<T>(value: Lazy<T>): T {
  return typeof value === "function" ? (value as () => T)() : value;
}

export function ErrorBoundary(props: {
  fallback: Child | ((error: unknown, reset: () => void) => Child);
  children?: Lazy<Child>;
  onError?: (error: unknown) => void;
}) {
  const [version, setVersion] = createSignal(0);
  let failure = null as { error: unknown } | null;

  const caught = (error: unknown) => {
    logError("ErrorBoundary caught an error:", error);
    props.onError?.(error);
  };

  const reset = () => {
    failure = null;
    setVersion((v) => v + 1);
  };

  const fail = (error: unknown) => {
    caught(error);
    failure = { error };
    setVersion((v) => v + 1);
  };

  const showFallback = (error: unknown): Child =>
    typeof props.fallback === "function"
      ? (props.fallback as (error: unknown, reset: () => void) => Child)(
          error,
          reset,
        )
      : props.fallback;

  return () => {
    version();

    const current = failure;
    if (current) return untrack(() => showFallback(current.error));

    let creating = true;
    let early = null as { error: unknown } | null;

    const content = untrack(() =>
      catchError(
        () => materialize(resolve(props.children ?? null)),
        (error) => {
          if (creating) early = { error };
          else fail(error);
        },
      ),
    );
    creating = false;

    const first = early;
    if (first) {
      caught(first.error);
      failure = first;
      return untrack(() => showFallback(first.error));
    }
    return content;
  };
}
