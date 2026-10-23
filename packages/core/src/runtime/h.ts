import { createEffect, untrack } from "../reactivity/signal";
import { getRenderer } from "../renderer";
import type { HostNode } from "../renderer/types";

export type Child =
  | string
  | number
  | boolean
  | null
  | undefined
  | HostNode
  | (() => unknown)
  | Child[];

export function h(
  tag: string,
  props: Record<string, any> | null,
  ...children: Child[]
): HostNode {
  const r = getRenderer();
  const el = r.createElement(tag);
  let ref: ((node: HostNode) => void) | undefined;

  for (const [key, value] of Object.entries(props ?? {})) {
    if (key === "ref") {
      if (typeof value === "function") ref = value;
      continue;
    }
    if (typeof value === "function" && !key.startsWith("on")) {
      createEffect(() => r.setProp(el, key, value()));
    } else {
      r.setProp(el, key, value);
    }
  }
  appendChildren(el, children);

  const onRef = ref;
  if (onRef) untrack(() => onRef(el));

  return el as HostNode;
}

export function materialize(value: unknown): unknown {
  if (typeof value !== "function") return value;
  const holder = getRenderer().createFragment();
  appendChildren(holder, [value as Child]);
  return holder;
}

function toNodes(value: unknown): any[] {
  const r = getRenderer();
  const out: any[] = [];
  for (const v of ([value] as unknown[]).flat(Infinity) as unknown[]) {
    if (v == null || typeof v === "boolean") continue;
    if (typeof v === "function") {
      out.push(materialize(v)); 
      continue;
    }
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
