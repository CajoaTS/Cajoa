import { ServerContext, useContext, type Renderer } from "@cajoa/core";

export type SNodeType = "element" | "text" | "comment" | "fragment";

export class SNode {
  parent: SNode | null = null;
  prev: SNode | null = null;
  next: SNode | null = null;
  first: SNode | null = null;
  last: SNode | null = null;
  props: Map<string, unknown> | null = null;
  /** Creation number within one request (0 = none). hydrate() uses it to find this node in the browser. */
  id = 0;

  constructor(
    readonly type: SNodeType,
    readonly tag = "",
    public text = "",
  ) {}
}

function detach(node: SNode) {
  const { parent, prev, next } = node;
  if (!parent) return;
  if (prev) prev.next = next;
  else parent.first = next;
  if (next) next.prev = prev;
  else parent.last = prev;
  node.parent = node.prev = node.next = null;
}

function insertBefore(parent: SNode, node: SNode, anchor: SNode | null) {
  if (node === anchor) return;

  if (node.type === "fragment") {
    let child = node.first;
    while (child) {
      const next = child.next;
      insertBefore(parent, child, anchor);
      child = next;
    }
    return;
  }

  detach(node);
  node.parent = parent;
  if (anchor) {
    const prev = anchor.prev;
    node.prev = prev;
    node.next = anchor;
    anchor.prev = node;
    if (prev) prev.next = node;
    else parent.first = node;
  } else {
    node.prev = parent.last;
    node.next = null;
    if (parent.last) parent.last.next = node;
    else parent.first = node;
    parent.last = node;
  }
}

const ATTRIBUTE_NAMES: Record<string, string> = {
  className: "class",
  htmlFor: "for",
};

const SAFE_NAME = /^[^\s"'<>/=`]+$/;

function toCssName(name: string): string {
  if (name.startsWith("--") || name.includes("-")) return name;
  return name.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}

function styleToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const parts: string[] = [];
  for (const [name, v] of Object.entries(value as Record<string, unknown>)) {
    if (v == null || v === false || v === "") continue;
    parts.push(`${toCssName(name)}:${String(v)}`);
  }
  return parts.join(";");
}

function setProp(el: SNode, key: string, value: unknown) {
  if (/^on[A-Za-z]/.test(key)) return;
  if (key === "indeterminate") return;

  const name = ATTRIBUTE_NAMES[key] ?? key;
  if (!SAFE_NAME.test(name)) return;

  let next: unknown;
  if (key === "style") {
    const css = styleToString(value);
    next = css === "" ? null : css;
  } else if (key === "value") {
    next = value == null ? null : String(value);
  } else if (key === "checked" || key === "selected") {
    next = value ? true : null;
  } else {
    next = value == null || value === false ? null : value;
  }

  const props = (el.props ??= new Map());
  if (next === null) props.delete(name);
  else props.set(name, next);
}

// ---------- Ang renderer ----------

// Every node gets a number in creation order, per request. The browser creates its nodes in the same
// order, so hydrate() can find the matching server node by number. A WeakMap keeps requests apart
// even when several async renders run at the same time.
const counters = new WeakMap<object, number>();

function nextId(): number {
  const request = useContext(ServerContext);
  if (!request) return 0;
  const id = (counters.get(request) ?? 0) + 1;
  counters.set(request, id);
  return id;
}

const make = (type: SNodeType, tag = "", text = "") => {
  const node = new SNode(type, tag, text);
  if (type !== "fragment") node.id = nextId();
  return node;
};

export const stringRenderer: Renderer<SNode> = {
  isServer: true,
  createElement: (tag) => make("element", tag),
  createText: (value) => make("text", "", value),
  createMarker: () => make("comment"),
  createFragment: () => make("fragment"),
  isNode: (v): v is SNode => v instanceof SNode,

  insert: (parent, node, anchor = null) => insertBefore(parent, node, anchor),
  remove: (node) => detach(node),
  nextSibling: (node) => node.next,
  parentNode: (node) => node.parent,
  clear: (parent) => {
    while (parent.first) detach(parent.first);
  },
  portalRoot: () => make("fragment"),

  setProp,
};
