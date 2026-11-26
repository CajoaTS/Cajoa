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
  /**
   * Experimental. Used by hydrate(). Like createFragment(), for the nodes of a block that a function
   * returns, which are put in the page right away.
   */
  createHolder?(): N;
  /**
   * Experimental. Used by hydrate(), right after the nodes of a block were put in a holder. When they
   * are already in the page, this returns them, so that they do not have to be moved.
   */
  unwrap?(holder: N): N[] | undefined;
  clear(parent: N): void;
  setProp(el: N, name: string, value: unknown): void; 
  isServer?: boolean;
}
