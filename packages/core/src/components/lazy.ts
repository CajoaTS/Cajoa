import { createSignal, untrack } from "../reactivity/signal";
import { trackPending } from "../reactivity/suspense";

type Component<P> = (props: P) => unknown;

export function lazy<P = Record<string, unknown>>(
  loader: () => Promise<{ default: Component<P> } | Component<P>>,
): Component<P> {
  let promise: Promise<void> | undefined;
  let component: Component<P> | undefined;
  let failure = null as { error: unknown } | null;

  const load = () =>
    (promise ??= loader().then(
      (module) => {
        component = typeof module === "function" ? module : module.default;
      },
      (error) => {
        failure = { error };
      },
    ));

  return function LazyComponent(props: P) {
    if (component) return component(props);
    if (failure) throw failure.error;

    const release = trackPending()?.();
    const [done, setDone] = createSignal(false);
    load().then(() => {
      setDone(true);
      release?.();
    });

    return () => {
      done();
      if (failure) throw failure.error;
      return component ? untrack(() => component!(props)) : null;
    };
  };
}
