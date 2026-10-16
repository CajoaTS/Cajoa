import type { Child } from "../dom/h";

export function For<T>(props: {
  each: () => T[];
  children: (item: T, index: number) => Child;
}) {
  return () => props.each().map((item, i) => props.children(item, i));
}
