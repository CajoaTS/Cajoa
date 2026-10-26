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

export interface MatchDef {
  __match: true;
  when: Lazy<unknown>;
  children?: Lazy<Child>;
}

export function Match(props: {
  when: Lazy<unknown>;
  children?: Lazy<Child>;
}): MatchDef {
  return { __match: true, when: props.when, children: props.children };
}

const isMatch = (value: unknown): value is MatchDef =>
  typeof value === "object" &&
  value !== null &&
  (value as MatchDef).__match === true;

export function Switch(props: { fallback?: Lazy<Child>; children?: unknown }) {
  const matches = (
    ([props.children] as unknown[]).flat(Infinity) as unknown[]
  ).filter(isMatch);

  const selected = createMemo(() => {
    for (let i = 0; i < matches.length; i++) {
      if (resolveCondition(matches[i].when)) return i;
    }
    return -1;
  });

  return () => {
    const i = selected();
    return untrack(() =>
      resolve(
        i === -1 ? (props.fallback ?? null) : (matches[i].children ?? null),
      ),
    );
  };
}
