import { h, appendChildren, type Child } from "./dom/h";

export function jsx(type: any, props: Record<string, any> | null) {
  // Component: tawagin nang isang beses lang
  if (typeof type === "function") return type(props ?? {});

  // HTML tag: seperate ang children sa ibang props
  const { children, ...rest } = props ?? {};
  const kids = children === undefined ? [] : [children];
  return h(type, rest, ...kids);
}

export const jsxs = jsx; // childrens
export const jsxDEV = jsx; // dev mode

export declare namespace JSX {
  type Element = any; // Node, function (reactive), text, atbp.
  interface IntrinsicElements {
    [tag: string]: any;
  }
  interface ElementChildrenAttribute {
    children: {};
  }
}

export function Fragment(props: { children?: Child }) {
  const frag = document.createDocumentFragment();
  appendChildren(frag, props.children === undefined ? [] : [props.children]);
  return frag;
}
