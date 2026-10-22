import { createRoot } from "../reactivity/signal";
import { getRenderer } from "../renderer";
import type { HostNode } from "../renderer/types";

export function render(component: () => HostNode, container: HostNode) {
  return createRoot((dispose) => {
    const r = getRenderer();
    const node = component();

    if (typeof node === "function") {
      throw new Error(
        "render(): the component returned a function (for example <Show>, <For>, <Router> or <ErrorBoundary>). Wrap it in an element, such as <div>…</div>.",
      );
    }

    r.clear(container);
    r.insert(container, node);
    return () => {
      dispose();
      r.clear(container);
    };
  });
}
