export type HostNode = object;
export interface Renderer<N = any> {
  createElement(tag: string): N;
  createText(value: string): N;
  createMarker(): N;
  createFragment(): N; // children's node container
  isNode(value: unknown): value is N;
  insert(parent: N, node: N, anchor?: N | null): void; // if no anchor = add sa last
  remove(node: N): void;
  nextSibling(node: N): N | null;
  parentNode(node: N): N | null;
  portalRoot?(): N;
  clear(parent: N): void;
  setProp(el: N, name: string, value: unknown): void; // attribute O event handler
}
