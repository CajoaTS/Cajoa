import { createRoot } from "../reactivity/signal";

export function render(component: () => Node, container: Element) {
  return createRoot((dispose) => {
    container.replaceChildren(component());
    return () => {
      dispose();
      container.replaceChildren();
    };
  });
}
