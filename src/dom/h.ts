import { createEffect } from "../reactivity/signal";
import { getRenderer } from "../renderer";

export type Child =
  | string
  | number
  | boolean
  | null
  | undefined
  | Node
  | (() => unknown)
  | Child[];

export function h(
  tag: string,
  props: Record<string, any> | null,
  ...children: Child[]
): HTMLElement {
  const r = getRenderer();
  const el = r.createElement(tag);

  for (const [key, value] of Object.entries(props ?? {})) {
    if (typeof value === "function" && !key.startsWith("on")) {
      createEffect(() => r.setProp(el, key, value())); // reactive prop
    } else {
      r.setProp(el, key, value);
    }
  }
  appendChildren(el, children);
  return el as HTMLElement;
}

function toNodes(value: unknown): any[] {
  const r = getRenderer();
  const out: any[] = [];
  for (const v of [value].flat(Infinity) as unknown[]) {
    if (v == null || typeof v === "boolean") continue;
    out.push(r.isNode(v) ? v : r.createText(String(v)));
  }
  return out;
}

function reconcile(start: any, end: any, next: any[]) {
  const r = getRenderer();
  const keep = new Set(next);

  let cur = r.nextSibling(start);
  while (cur && cur !== end) {
    const after = r.nextSibling(cur);
    if (!keep.has(cur)) r.remove(cur);
    cur = after;
  }

  const parent = r.parentNode(end)!;
  let ref = r.nextSibling(start);
  for (const node of next) {
    if (node === ref) ref = r.nextSibling(ref);
    else r.insert(parent, node, ref);
  }
}

export function appendChildren(parent: any, children: Child[]) {
  const r = getRenderer();
  for (const child of (children as unknown[]).flat(Infinity) as Child[]) {
    if (typeof child === "function") {
      const start = r.createMarker();
      const end = r.createMarker();
      r.insert(parent, start);
      r.insert(parent, end);
      createEffect(() => reconcile(start, end, toNodes(child())));
    } else {
      for (const node of toNodes(child)) r.insert(parent, node);
    }
  }
}
