import { h, appendChildren, type Child } from "./runtime/h";
import { getRenderer } from "./renderer";

export function jsx(type: any, props: Record<string, any> | null) {
  if (typeof type === "function") return type(props ?? {});

  const { children, ...rest } = props ?? {};
  const kids = children === undefined ? [] : [children];
  return h(type, rest, ...kids);
}

export const jsxs = jsx; // childrens
export const jsxDEV = jsx; // dev mode

export function Fragment(props: { children?: Child }) {
  const frag = getRenderer().createFragment();
  appendChildren(frag, props.children === undefined ? [] : [props.children]);
  return frag;
}
