import { materialize, type Child } from "../runtime/h";
import {
  createEffect,
  createSignal,
  provide,
  untrack,
} from "../reactivity/signal";
import { SuspenseContext, type SuspenseState } from "../reactivity/suspense";

type Lazy<T> = T | (() => T);

function resolve<T>(value: Lazy<T>): T {
  return typeof value === "function" ? (value as () => T)() : value;
}

export function Suspense(props: {
  fallback?: Lazy<Child>;
  children?: Lazy<Child>;
}) {
  const [pending, setPending] = createSignal(0);
  const [ready, setReady] = createSignal(false);

  const state: SuspenseState = {
    add() {
      setPending((n) => n + 1);
      let released = false;
      return () => {
        if (released) return;
        released = true;
        setPending((n) => n - 1);
      };
    },
  };

  const content = untrack(() =>
    provide(SuspenseContext, state, () =>
      materialize(resolve(props.children ?? null)),
    ),
  );

  createEffect(() => {
    if (pending() === 0) setReady(true);
  });

  return () =>
    ready() ? content : untrack(() => resolve(props.fallback ?? null));
}
