import { createEffect } from "../reactivity/signal";

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
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props ?? {})) {
    setProp(el, key, value);
  }
  appendChildren(el, children);
  return el;
}

function setProp(el: HTMLElement, key: string, value: any) {
  if (key.startsWith("on") && typeof value === "function") {
    el.addEventListener(key.slice(2).toLowerCase(), value);
  } else if (typeof value === "function") {
    createEffect(() => applyAttr(el, key, value()));
  } else {
    applyAttr(el, key, value);
  }
}

function applyAttr(el: HTMLElement, key: string, value: unknown) {
  const name = key === "className" ? "class" : key;
  if (value == null || value === false) el.removeAttribute(name);
  else el.setAttribute(name, value === true ? "" : String(value));
}

function toNodes(value: unknown): Node[] {
  const out: Node[] = [];
  for (const v of [value].flat(Infinity) as unknown[]) {
    if (v == null || typeof v === "boolean") continue;
    out.push(v instanceof Node ? v : document.createTextNode(String(v)));
  }
  return out;
}

export function appendChildren(parent: ParentNode, children: Child[]) {
  const pending: Child[] = [...children].reverse();
  while (pending.length > 0) {
    const child = pending.pop()!;
    if (Array.isArray(child)) {
      for (let i = child.length - 1; i >= 0; i--) {
        pending.push(child[i]);
      }
      continue;
    }

    if (typeof child === "function") {
      const start = document.createComment("");
      const end = document.createComment("");
      parent.append(start, end);
      createEffect(() => {
        reconcile(start, end, toNodes(child()));
      });
    } else {
      parent.append(...toNodes(child));
    }
  }
}

function reconcile(start: Node, end: Node, next: Node[]) {
  const keep = new Set(next);

  // 1. burahin ang mga lumang node na wala na sa bagong listahan
  let cur = start.nextSibling;
  while (cur && cur !== end) {
    const after = cur.nextSibling;
    if (!keep.has(cur)) (cur as ChildNode).remove();
    cur = after;
  }

  // 2. ilagay o ilipat ang mga node sa tamang pagkakasunod-sunod
  const parent = end.parentNode!;
  let ref = start.nextSibling;
  for (const node of next) {
    if (node === ref)
      ref = ref!.nextSibling; // nasa tamang pwesto na, walang galaw
    else parent.insertBefore(node, ref);
  }
}
