import { createRoot } from "../reactivity/signal";
import { getRenderer } from "../renderer";
import type { HostNode } from "../renderer/types";
import { appendChildren, type Child } from "./h";

export function render(component: () => unknown, container: HostNode) {
  return createRoot((dispose) => {
    const r = getRenderer();
    const result = component();

    r.clear(container);
    // A function result (<Show>, <Router>, ...) is given its own reactive place, so it can be the root
    appendChildren(container, [result as Child]);

    return () => {
      dispose();
      r.clear(container);
    };
  });
}
