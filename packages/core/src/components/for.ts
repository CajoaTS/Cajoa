import { createRoot, onCleanup } from "../reactivity/signal";
import type { HostNode } from "../renderer/types";

interface Entry {
  node: HostNode;
  dispose: () => void;
}

export function For<T>(props: {
  each: () => T[];
  children: (item: T, index: number) => HostNode;
  key?: (item: T, index: number) => unknown;
}) {
  let cache = new Map<unknown, Entry>();

  onCleanup(() => {
    cache.forEach((e) => e.dispose());
    cache.clear();
  });

  return () => {
    const items = props.each();
    const next = new Map<unknown, Entry>();
    const nodes: HostNode[] = [];

    items.forEach((item, i) => {
      const k = props.key ? props.key(item, i) : item;
      let entry = cache.get(k);
      if (!entry) {
        // bagong item: gumawa ng sariling "root" para hindi masama sa effect ng list
        entry = createRoot((dispose) => ({
          node: props.children(item, i),
          dispose,
        }));
      }
      next.set(k, entry);
      nodes.push(entry.node);
    });

    // itapon ang mga item na wala na (linisin ang effects nila)
    cache.forEach((entry, k) => {
      if (!next.has(k)) entry.dispose();
    });
    cache = next;

    return nodes;
  };
}
