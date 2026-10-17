import type { Child } from "../dom/h";
import { createMemo } from "../reactivity/memo";
import { untrack } from "../reactivity/signal";

export function Show<T>(props: {
  when: () => T;
  children: () => Child;
  fallback?: () => Child;
}) {
  const visible = createMemo(() => !!props.when());

  return () =>
    visible()
      ? untrack(() => props.children())
      : untrack(() => props.fallback?.() ?? null);
}
