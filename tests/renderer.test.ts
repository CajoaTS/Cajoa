import { test, expect, afterEach } from "vitest";
import {
  createSignal,
  h,
  render,
  Show,
  setRenderer,
  domRenderer,
  type Renderer,
} from "../src";

interface FNode {
  kind: "el" | "text" | "marker" | "frag";
  tag?: string;
  text?: string;
  props: Record<string, unknown>;
  kids: FNode[];
  parent: FNode | null;
}

const mk = (kind: FNode["kind"], extra: Partial<FNode> = {}): FNode => ({
  kind,
  props: {},
  kids: [],
  parent: null,
  ...extra,
});

const detach = (n: FNode) => {
  if (n.parent) {
    n.parent.kids.splice(n.parent.kids.indexOf(n), 1);
    n.parent = null;
  }
};

const fake: Renderer<FNode> = {
  createElement: (tag) => mk("el", { tag }),
  createText: (text) => mk("text", { text }),
  createMarker: () => mk("marker"),
  createFragment: () => mk("frag"),
  isNode: (v): v is FNode =>
    typeof v === "object" && v !== null && "kids" in v && "kind" in v,
  insert(parent, node, anchor = null) {
    if (node.kind === "frag") {
      for (const k of [...node.kids]) fake.insert(parent, k, anchor);
      return;
    }
    detach(node);
    const i = anchor ? parent.kids.indexOf(anchor) : parent.kids.length;
    parent.kids.splice(i, 0, node);
    node.parent = parent;
  },
  remove: detach,
  nextSibling(n) {
    const s = n.parent?.kids;
    return s ? (s[s.indexOf(n) + 1] ?? null) : null;
  },
  parentNode: (n) => n.parent,
  clear(p) {
    p.kids.forEach((k) => (k.parent = null));
    p.kids = [];
  },
  setProp: (el, key, value) => {
    el.props[key] = value;
  },
};

const ser = (n: FNode): string =>
  n.kind === "text"
    ? n.text!
    : n.kind === "marker"
      ? ""
      : `<${n.tag}>${n.kids.map(ser).join("")}</${n.tag}>`;

afterEach(() => setRenderer(domRenderer));

test("works with a custom (non-DOM) renderer", () => {
  setRenderer(fake);
  const [count, setCount] = createSignal(0);
  const root = fake.createElement("root");

  render(() => h("p", { id: "x" }, "Count: ", count), root as any);
  expect(ser(root)).toBe("<root><p>Count: 0</p></root>");
  expect(root.kids[0].props.id).toBe("x");

  setCount(5);
  expect(ser(root)).toBe("<root><p>Count: 5</p></root>");
});

test("Show works on a custom renderer", () => {
  setRenderer(fake);
  const [on, setOn] = createSignal(false);
  const root = fake.createElement("root");

  render(
    () =>
      h(
        "div",
        null,
        Show({
          when: on,
          children: () => h("b", null, "yes"),
          fallback: () => h("i", null, "no"),
        }),
      ),
    root as any,
  );
  expect(ser(root)).toBe("<root><div><i>no</i></div></root>");

  setOn(true);
  expect(ser(root)).toBe("<root><div><b>yes</b></div></root>");
});
