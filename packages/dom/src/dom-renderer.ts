import type { Renderer } from "@cajoa/core";

const SVG_NS = "http://www.w3.org/2000/svg";

const SVG_TAGS = new Set<string>([
  "svg",
  "g",
  "defs",
  "symbol",
  "use",
  "switch",
  "view",
  "desc",
  "metadata",
  "circle",
  "ellipse",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "image",
  "text",
  "tspan",
  "textPath",
  "foreignObject",
  "linearGradient",
  "radialGradient",
  "stop",
  "pattern",
  "clipPath",
  "mask",
  "marker",
  "filter",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDropShadow",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "animate",
  "animateMotion",
  "animateTransform",
  "set",
  "mpath",
]);

const PROPERTIES = new Set(["value", "checked", "selected", "indeterminate"]);

const ATTRIBUTE_NAMES: Record<string, string> = {
  className: "class",
  htmlFor: "for",
};

const SVG_ATTRIBUTE_NAMES: Record<string, string> = {
  strokeWidth: "stroke-width",
  strokeLinecap: "stroke-linecap",
  strokeLinejoin: "stroke-linejoin",
  strokeDasharray: "stroke-dasharray",
  strokeDashoffset: "stroke-dashoffset",
  strokeOpacity: "stroke-opacity",
  strokeMiterlimit: "stroke-miterlimit",
  fillOpacity: "fill-opacity",
  fillRule: "fill-rule",
  clipRule: "clip-rule",
  clipPath: "clip-path",
  stopColor: "stop-color",
  stopOpacity: "stop-opacity",
  floodColor: "flood-color",
  floodOpacity: "flood-opacity",
  textAnchor: "text-anchor",
  dominantBaseline: "dominant-baseline",
  fontSize: "font-size",
  fontFamily: "font-family",
  fontWeight: "font-weight",
  letterSpacing: "letter-spacing",
  markerStart: "marker-start",
  markerMid: "marker-mid",
  markerEnd: "marker-end",
  vectorEffect: "vector-effect",
  shapeRendering: "shape-rendering",
  pointerEvents: "pointer-events",
};

const EVENT_NAMES: Record<string, string> = {
  doubleclick: "dblclick",
};

const listeners = new WeakMap<Node, Map<string, EventListener>>();

const selectValues = new WeakMap<Node, string>();

function isEvent(el: Element, key: string): boolean {
  return /^on[A-Z]/.test(key) || (key.startsWith("on") && key in el);
}

function setEvent(el: Element, key: string, value: unknown) {
  const raw = key.slice(2).toLowerCase();
  const name = EVENT_NAMES[raw] ?? raw;

  let byName = listeners.get(el);
  if (!byName) {
    byName = new Map();
    listeners.set(el, byName);
  }

  const previous = byName.get(name);
  if (previous) {
    el.removeEventListener(name, previous);
    byName.delete(name);
  }

  if (typeof value === "function") {
    el.addEventListener(name, value as EventListener);
    byName.set(name, value as EventListener);
  }
}

function toCssName(name: string): string {
  if (name.startsWith("--") || name.includes("-")) return name;
  return name.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}

function setStyle(el: HTMLElement, value: unknown) {
  const style = el.style;

  if (typeof value === "string") {
    style.cssText = value;
    return;
  }

  style.cssText = "";
  if (value && typeof value === "object") {
    for (const [name, v] of Object.entries(value as Record<string, unknown>)) {
      if (v == null || v === false || v === "") continue;
      style.setProperty(toCssName(name), String(v));
    }
  }
}

function setProperty(el: Element, name: string, value: unknown) {
  const target = el as unknown as Record<string, unknown>;

  if (name === "value") {
    const next = value == null ? "" : String(value);
    if (target.value !== next) target.value = next;
    if (el.tagName === "SELECT") selectValues.set(el, next);
  } else {
    target[name] = !!value;
  }
}

export const domRenderer: Renderer<Node> = {
  createElement: (tag) =>
    SVG_TAGS.has(tag)
      ? document.createElementNS(SVG_NS, tag)
      : document.createElement(tag),
  createText: (value) => document.createTextNode(value),
  createMarker: () => document.createComment(""),
  createFragment: () => document.createDocumentFragment(),
  isNode: (v): v is Node => typeof Node !== "undefined" && v instanceof Node,

  insert: (parent, node, anchor = null) => {
    parent.insertBefore(node, anchor);
    const wanted = selectValues.get(parent);
    if (wanted !== undefined) (parent as HTMLSelectElement).value = wanted;
  },

  remove: (node) => {
    (node as ChildNode).remove();
  },
  nextSibling: (node) => node.nextSibling,
  parentNode: (node) => node.parentNode,
  clear: (parent) => {
    (parent as Element).replaceChildren();
  },
  portalRoot: () => document.body,

  setProp(el, key, value) {
    const e = el as HTMLElement;

    if (isEvent(e, key)) {
      setEvent(e, key, value);
      return;
    }
    if (key === "style") {
      setStyle(e, value);
      return;
    }
    if (PROPERTIES.has(key) && key in e) {
      setProperty(e, key, value);
      return;
    }

    const isSvg = e.namespaceURI === SVG_NS;
    const name =
      (isSvg ? SVG_ATTRIBUTE_NAMES[key] : undefined) ??
      ATTRIBUTE_NAMES[key] ??
      key;

    if (value == null || value === false) e.removeAttribute(name);
    else e.setAttribute(name, value === true ? "" : String(value));
  },
};
