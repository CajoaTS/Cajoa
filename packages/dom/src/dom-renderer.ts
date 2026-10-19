import type { Renderer } from "@cajoa/core";

/** Mga prop na itinatakda bilang DOM property, hindi attribute. */
const PROPERTIES = new Set(["value", "checked", "selected", "indeterminate"]);

/** Mga JSX prop name na iba ang pangalan bilang HTML attribute. */
const ATTRIBUTE_NAMES: Record<string, string> = {
  className: "class",
  htmlFor: "for",
};

/** Mga event name na hindi basta lowercase ng JSX name (onDoubleClick -> dblclick). */
const EVENT_NAMES: Record<string, string> = {
  doubleclick: "dblclick",
};

/** Mga listener na itinakda natin, para mapalitan o maalis kapag nagbago. */
const listeners = new WeakMap<Node, Map<string, EventListener>>();

/** Value ng <select> na itinakda ng app (ibabalik kapag nadagdag ang mga <option>). */
const selectValues = new WeakMap<Node, string>();

/** onClick, onKeyDown, atbp. May suporta rin sa lowercase na tunay na event property (onclick). */
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

  // Function lang ang tinatanggap. Ang string (onclick="...") ay hindi isinasama para iwas XSS.
  if (typeof value === "function") {
    el.addEventListener(name, value as EventListener);
    byName.set(name, value as EventListener);
  }
}

function toCssName(name: string): string {
  // custom property (--accent) o kebab-case na: huwag galawin
  if (name.startsWith("--") || name.includes("-")) return name;
  return name.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}

function setStyle(el: HTMLElement, value: unknown) {
  const style = el.style;

  if (typeof value === "string") {
    style.cssText = value;
    return;
  }

  // Ang `style` prop ang may-ari ng inline style: nililinis muna bago ilapat ang bago
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
    if (target.value !== next) target.value = next; // iwas lipat ng cursor kung pareho na
    if (el.tagName === "SELECT") selectValues.set(el, next);
  } else {
    target[name] = !!value;
  }
}

export const domRenderer: Renderer<Node> = {
  createElement: (tag) => document.createElement(tag),
  createText: (value) => document.createTextNode(value),
  createMarker: () => document.createComment(""),
  createFragment: () => document.createDocumentFragment(),
  isNode: (v): v is Node => typeof Node !== "undefined" && v instanceof Node,

  insert: (parent, node, anchor = null) => {
    parent.insertBefore(node, anchor);
    // Dahil nauuna ang props bago ang mga <option>, ibalik ang value ng <select> pagkatapos ng insert
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

    const name = ATTRIBUTE_NAMES[key] ?? key;
    if (value == null || value === false) e.removeAttribute(name);
    else e.setAttribute(name, value === true ? "" : String(value));
  },
};
