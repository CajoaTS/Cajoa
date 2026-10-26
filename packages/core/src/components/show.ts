import type { Child } from "../runtime/h";
import { createMemo, untrack } from "../reactivity/signal";

type Lazy<T> = T | (() => T);

function resolve<T>(value: Lazy<T>): T {
  return typeof value === "function" ? (value as () => T)() : value;
}

function resolveCondition(value: unknown): unknown {
  while (typeof value === "function") value = (value as () => unknown)();
  return value;
}

export function Show<T>(props: {
  when: Lazy<T>;
  children?: Lazy<Child>;
  fallback?: Lazy<Child>;
}) {
  const visible = createMemo(() => !!resolveCondition(props.when));

  return () =>
    visible()
      ? untrack(() => resolve(props.children ?? null))
      : untrack(() => resolve(props.fallback ?? null));
}
