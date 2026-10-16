export function render(component: () => Node, container: Element) {
  container.replaceChildren(component());
}
