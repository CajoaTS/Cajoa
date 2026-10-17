import { createRoot } from "../reactivity/signal";
import { getRenderer } from "../renderer";

export function render(component: () => Node, container: Element) {
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
