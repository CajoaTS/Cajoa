import { createRoot, onCleanup } from "../reactivity/signal";
import { warn } from "../dev";
import type { HostNode } from "../renderer/types";

interface Entry {
  node: HostNode;
  dispose: () => void;
}

export function For<T>(props: {
  each: T[] | (() => T[]);
  children: (item: T, index: number) => HostNode;
  key?: (item: T, index: number) => unknown;
}) {
  let cache = new Map<unknown, Entry>();

  onCleanup(() => {
    cache.forEach((e) => e.dispose());
    cache.clear();
  });

  return () => {
    const items = typeof props.each === "function" ? props.each() : props.each;
    const next = new Map<unknown, Entry>();
    const nodes: HostNode[] = [];

    items.forEach((item, i) => {
      const k = props.key ? props.key(item, i) : item;
      if (next.has(k)) {
        warn(
          `<For> found a duplicate key (${String(k)}). Keys must be unique, otherwise one item replaces another.`,
        );
      }
      let entry = cache.get(k);
      if (!entry) {
        entry = createRoot((dispose) => ({
          node: props.children(item, i),
          dispose,
        }));
      }
      next.set(k, entry);
      nodes.push(entry.node);
    });

    cache.forEach((entry, k) => {
      if (!next.has(k)) entry.dispose();
    });
    cache = next;

    return nodes;
  };
}
