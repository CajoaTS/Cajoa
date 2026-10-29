import { materialize, type Child } from "../runtime/h";
import { quietly } from "../dev";
import {
  createEffect,
  createSignal,
  provide,
  untrack,
  useContext,
} from "../reactivity/signal";
import { SuspenseContext, type SuspenseState } from "../reactivity/suspense";
import { ServerContext } from "../ssr";

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
  const server = quietly(() => useContext(ServerContext));

  const state: SuspenseState = {
    add() {
      setPending((n) => n + 1);
      const releaseServer = server?.track();
      let released = false;
      return () => {
        if (released) return;
        released = true;
        setPending((n) => n - 1);
        releaseServer?.();
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