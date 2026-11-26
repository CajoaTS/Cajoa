import {
  render,
  setRenderer,
  setResourceTransfer,
  type HostNode,
  type Renderer,
  type ResourceTransfer,
} from "@cajoa/core";
import { attributeFor, domRenderer } from "./dom-renderer";

declare const console:
  | { warn(...args: unknown[]): void }
  | undefined;

const ID_ATTRIBUTE = "data-cj";
// Elements whose children the server wrote without markers
const TEXT_ONLY = new Set(["script", "style", "textarea", "title"]);

function warn(message: string): void {
  const dev = (globalThis as unknown as { __CAJOA_DEV__?: boolean }).__CAJOA_DEV__;
  if (dev === true && typeof console !== "undefined") {
    console.warn(`[cajoa] ${message}`);
  }
}

/** What hydrate() knows about the server HTML while it runs. */
interface Session {
  active: boolean;
  root: Node;
  /** The id that the next created node will get. Counts like the server did. */
  next: number;
  elements: Map<number, Element>;
  markers: Map<number, Comment>;
  /** The comment before a text node, which says what number the text has. */
  texts: Map<number, Comment>;
  claimed: WeakSet<Node>;
  /** The last node placed in each claimed parent, so the next one goes after it. */
  last: WeakMap<Node, Node>;
  /**
   * Holders for the nodes of a nested block (a function that returns a function). When the markers
   * of a block are already in the page, they stay there, and the holder only remembers them.
   */
  holders: WeakMap<Node, { start?: Node; end?: Node; seen: number }>;
  problems: number;
}

function scan(root: Node): Session {
  const session: Session = {
    active: true,
    root,
    next: 0,
    elements: new Map(),
    markers: new Map(),
    texts: new Map(),
    claimed: new WeakSet(),
    last: new WeakMap(),
    holders: new WeakMap(),
    problems: 0,
  };

  const SHOW_ELEMENT = 0x1;
  const SHOW_COMMENT = 0x80;
  const walker = document.createTreeWalker(root, SHOW_ELEMENT | SHOW_COMMENT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === 1) {
      const id = Number((node as Element).getAttribute(ID_ATTRIBUTE));
      if (id > 0) session.elements.set(id, node as Element);
    } else {
      const match = /^([mt])(\d+)$/.exec((node as Comment).data);
      if (!match) continue;
      const id = Number(match[2]);
      if (id > 0) (match[1] === "m" ? session.markers : session.texts).set(id, node as Comment);
    }
  }
  return session;
}

/** Does the element from the server HTML already have this attribute, with this value? */
function samePage(el: Element, key: string, value: unknown): boolean {
  const name = attributeFor(el, key);
  if (!name) return false;
  if (value == null || value === false) return !el.hasAttribute(name);
  return el.getAttribute(name) === (value === true ? "" : String(value));
}

function createHydrationRenderer(s: Session): Renderer<Node> {
  const dom = domRenderer;

  function problem(message: string) {
    s.problems++;
    warn(`hydrate(): ${message}`);
  }

  function place(parent: Node, node: Node) {
    const previous = s.last.get(parent);
    const before = previous ? previous.nextSibling : parent.firstChild;

    if (node !== before) {
      const inPlace =
        s.claimed.has(node) &&
        node.parentNode === parent &&
        (!previous ||
          previous.parentNode !== parent ||
          // DOCUMENT_POSITION_FOLLOWING
          (previous.compareDocumentPosition(node) & 4) !== 0);
      if (!inPlace) {
        const from = s.claimed.has(node) ? node.parentNode : null;
        // A fragment empties itself, so remember where it ends before it is gone
        const end = node.nodeType === 11 ? node.lastChild : node;
        dom.insert(parent, node, before);
        if (end) s.last.set(parent, end);

        if (from && from !== parent) {
          const added =
            from.nodeType === 1 &&
            (from as Element).localName === "tbody" &&
            (from as Element).attributes.length === 0 &&
            !from.firstChild;
          if (added) {
            // The browser adds <tbody> when it reads <table><tr>. The browser app does not have one.
            from.parentNode?.removeChild(from);
            problem(
              "the browser added a <tbody> to a <table> that the app builds without one. Write the <tbody> yourself, so the server HTML and the app agree.",
            );
          } else {
            problem(
              "a node from the server HTML is in a different place than the browser expects. Server and browser must render the same thing.",
            );
          }
        }
        return;
      }
    }
    s.last.set(parent, node);
  }

  return {
    ...dom,

    createElement(tag) {
      if (!s.active) return dom.createElement(tag);
      const id = ++s.next;
      const element = s.elements.get(id);
      if (!element) return dom.createElement(tag);

      if (element.localName.toLowerCase() !== tag.toLowerCase()) {
        // Not claimed, so it is removed at the end with the other leftovers
        problem(
          `the server HTML has <${element.localName}> where the browser makes <${tag}>. Server and browser must render the same thing.`,
        );
        return dom.createElement(tag);
      }
      s.elements.delete(id);
      element.removeAttribute(ID_ATTRIBUTE);
      if (TEXT_ONLY.has(element.localName)) element.textContent = "";
      s.claimed.add(element);
      return element;
    },

    setProp(el, key, value) {
      // Writing an attribute again, even with the same value, can reload an <iframe> or <video>
      if (s.active && s.claimed.has(el) && samePage(el as Element, key, value)) return;
      dom.setProp(el, key, value);
    },

    createText(value) {
      if (!s.active) return dom.createText(value);
      const pointer = s.texts.get(++s.next);
      const text = pointer?.nextSibling;
      if (!pointer || !text || text.nodeType !== 3) return dom.createText(value);

      s.texts.delete(s.next);
      pointer.remove();
      if ((text as Text).data !== value) (text as Text).data = value;
      s.claimed.add(text);
      return text;
    },

    createMarker() {
      if (!s.active) return dom.createMarker();
      const marker = s.markers.get(++s.next);
      if (!marker) return dom.createMarker();

      s.markers.delete(s.next);
      marker.data = "";
      s.claimed.add(marker);
      return marker;
    },

    createHolder() {
      const holder = dom.createFragment();
      if (s.active) s.holders.set(holder, { seen: 0 });
      return holder;
    },

    unwrap(holder) {
      const found = s.active ? s.holders.get(holder) : undefined;
      const start = found?.start;
      const end = found?.end;
      if (!start || !end) return undefined;

      // The nodes of the block are already in the page, from the first marker to the last
      if (start.parentNode && start.parentNode === end.parentNode) {
        const parts: Node[] = [];
        for (let n: Node | null = start; n; n = n.nextSibling) {
          parts.push(n);
          if (n === end) return parts;
        }
      }

      // Not what the server wrote. Put the markers in the holder, like a normal render does.
      problem("a block in the server HTML is not where the browser expects it.");
      found.start = found.end = undefined;
      dom.insert(holder, start, null);
      dom.insert(holder, end, null);
      return undefined;
    },

    insert(parent, node, anchor = null) {
      const holder = s.active && anchor === null ? s.holders.get(parent) : undefined;
      if (holder) {
        const inPage =
          s.claimed.has(node) &&
          node.nodeType === 8 &&
          !!node.parentNode &&
          node.parentNode.nodeType !== 11;
        // A fragment gets its start marker first and its end marker second
        const which = ++holder.seen;
        if (which === 1 && inPage) {
          holder.start = node;
          return;
        }
        if (which === 2 && holder.start) {
          if (inPage) {
            holder.end = node;
            return;
          }
          // Only the start marker was in the page. Keep both markers together in the fragment.
          dom.insert(parent, holder.start, null);
          holder.start = undefined;
        }
      }

      // Only appending into a node from the server HTML needs care. Everything else is a normal insert.
      if (s.active && anchor === null && (parent === s.root || s.claimed.has(parent))) {
        place(parent, node);
        return;
      }
      dom.insert(parent, node, anchor);
    },

    clear(parent) {
      // render() clears its container first. Here the container holds the server HTML we want to keep.
      if (s.active && parent === s.root) return;
      dom.clear(parent);
    },
  };
}

/**
 * The server puts the data that its resources loaded in a <script> at the end of the HTML. Take it out
 * of the page, so it is not part of the app, and read it.
 */
function takeData(root: Node): unknown[] | null {
  let node = root.lastChild;
  // Skip whitespace and comments after the script
  while (node && node.nodeType !== 1) node = node.previousSibling;
  if (
    !node ||
    (node as Element).localName !== "script" ||
    !(node as Element).hasAttribute("data-cj-data")
  ) {
    return null;
  }
  const text = node.textContent ?? "";
  node.parentNode?.removeChild(node);
  try {
    const data: unknown = JSON.parse(text);
    return Array.isArray(data) ? data : null;
  } catch {
    warn("hydrate(): could not read the resource data that the server sent, so resources load again.");
    return null;
  }
}

/** Resources start with what the server loaded: the nth resource gets the nth item, if its source is the same. */
function browserTransfer(items: unknown[]): ResourceTransfer {
  let index = 0;
  return {
    open() {
      const item = items[index++];
      return {
        take(key) {
          return Array.isArray(item) && item[0] === key
            ? { value: item[1] }
            : undefined;
        },
      };
    },
  };
}

/**
 * Makes the HTML that the server wrote in `container` interactive, instead of throwing it away and
 * building it again like render() does. Server and browser must render the same app with the same data.
 * The server needs `hydratable: true`. Returns a function that stops the app.
 *
 * With `renderToStringAsync`, the data that the resources loaded comes with the HTML, so the resources
 * in the browser start with their value and do not load again.
 */
export function hydrate(component: () => unknown, container: HostNode): () => void {
  const root = container as Node;
  const data = takeData(root);
  const session = scan(root);

  if (!session.elements.size && !session.markers.size && !session.texts.size) {
    if (root.firstChild) {
      warn(
        "hydrate(): found no hydration markers in the container, so it renders from scratch. Did the server use hydratable: true?",
      );
    }
    return render(component, container);
  }

  const renderer = createHydrationRenderer(session);
  setRenderer(renderer);
  if (data) setResourceTransfer(browserTransfer(data));
  let dispose: () => void;
  try {
    dispose = render(component, container);
  } finally {
    setRenderer(domRenderer);
    setResourceTransfer(null);
    session.active = false;
  }

  // Whatever is left was written by the server but never made by the browser. Remove it.
  const leftovers = session.elements.size + session.markers.size + session.texts.size;
  if (leftovers > 0) {
    warn(
      `hydrate(): the server HTML had ${leftovers} node(s) that the browser did not make, so they were removed. Server and browser must render the same thing.`,
    );
    for (const element of session.elements.values()) element.remove();
    for (const marker of session.markers.values()) marker.remove();
    for (const pointer of session.texts.values()) {
      const text = pointer.nextSibling;
      pointer.remove();
      if (text && text.nodeType === 3) text.parentNode?.removeChild(text);
    }
  }
  session.elements.clear();
  session.markers.clear();
  session.texts.clear();

  return dispose;
}
