import type { Renderer } from "@cajoa/core";

export type SNodeType = "element" | "text" | "comment" | "fragment";

export class SNode {
  parent: SNode | null = null;
  prev: SNode | null = null;
  next: SNode | null = null;
  first: SNode | null = null;
  last: SNode | null = null;
  props: Map<string, unknown> | null = null;

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

const make = (type: SNodeType, tag = "", text = "") =>
  new SNode(type, tag, text);

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
