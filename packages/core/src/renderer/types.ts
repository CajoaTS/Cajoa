export type HostNode = object;
export interface Renderer<N = any> {
  createElement(tag: string): N;
  createText(value: string): N;
  createMarker(): N;
  createFragment(): N; 
  isNode(value: unknown): value is N;
  insert(parent: N, node: N, anchor?: N | null): void; 
  remove(node: N): void;
  nextSibling(node: N): N | null;
  parentNode(node: N): N | null;
  portalRoot?(): N;
  clear(parent: N): void;
  setProp(el: N, name: string, value: unknown): void; 
  isServer?: boolean;
}
