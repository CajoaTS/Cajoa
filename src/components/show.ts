import type { Child } from "../dom/h";

export function Show<T>(props: {
  when: () => T;
  children: () => Child;
  fallback?: () => Child;
}) {
  return () => (props.when() ? props.children() : (props.fallback?.() ?? null));
}
