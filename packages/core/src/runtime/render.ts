import { createRoot } from "../reactivity/signal";
import { getRenderer } from "../renderer";
import type { HostNode } from "../renderer/types";

export function render(component: () => HostNode, container: HostNode) {
  return createRoot((dispose) => {
    const r = getRenderer();
    const node = component();
    r.clear(container);
    r.insert(container, node);
    return () => {
      dispose();
      r.clear(container);
    };
  });
}
