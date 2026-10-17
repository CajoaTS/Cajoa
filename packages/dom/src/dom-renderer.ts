import type { Renderer } from "./types";

export const domRenderer: Renderer<Node> = {
  createElement: (tag) => document.createElement(tag),
  createText: (value) => document.createTextNode(value),
  createMarker: () => document.createComment(""),
  createFragment: () => document.createDocumentFragment(),
  isNode: (v): v is Node => typeof Node !== "undefined" && v instanceof Node,
  insert: (parent, node, anchor = null) => {
    parent.insertBefore(node, anchor);
  },
  remove: (node) => {
    (node as ChildNode).remove();
  },
  nextSibling: (node) => node.nextSibling,
  parentNode: (node) => node.parentNode,
  clear: (parent) => {
    (parent as Element).replaceChildren();
  },
  setProp(el, key, value) {
    const e = el as HTMLElement;
    // onClick -> "click" (sa native, ang renderer na ang magmamapa, hal. onTap)
    if (key.startsWith("on") && typeof value === "function") {
      e.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
      return;
    }
    const name = key === "className" ? "class" : key;
    if (value == null || value === false) e.removeAttribute(name);
    else e.setAttribute(name, value === true ? "" : String(value));
  },
};
