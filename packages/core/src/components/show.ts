import type { Child } from "../runtime/h";
import { createMemo } from "../reactivity/memo";
import { untrack } from "../reactivity/signal";

type Lazy<T> = T | (() => T);

function resolve<T>(value: Lazy<T>): T {
  return typeof value === "function" ? (value as () => T)() : value;
}

export function Show<T>(props: {
  when: Lazy<T>;
  children?: Lazy<Child>;
  fallback?: Lazy<Child>;
}) {
  const visible = createMemo(() => !!resolve(props.when));

  return () =>
    visible()
      ? untrack(() => resolve(props.children ?? null))
      : untrack(() => resolve(props.fallback ?? null));
}
