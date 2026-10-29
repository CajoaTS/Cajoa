import type { SNode } from "./string-renderer";

const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const SAFE_TAG = /^[A-Za-z][A-Za-z0-9:_.-]*$/;

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

export interface SerializeOptions {
  hydratable: boolean;
}

interface Context {
  svg: boolean;
  selectValue: string | undefined;
  raw: boolean; 
}

const escapeText = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeAttr = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeRaw = (s: string) =>
  s.replace(/<\/(script|style)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");

function textOf(node: SNode): string {
  let text = "";
  for (let c = node.first; c; c = c.next) {
    if (c.type === "text") text += c.text;
    else if (c.type === "element") text += textOf(c);
  }
  return text;
}

export function serialize(root: SNode, options: SerializeOptions): string {
  const out: string[] = [];
  writeChildren(root, out, options, {
    svg: false,
    selectValue: undefined,
    raw: false,
  });
  return out.join("");
}

function writeChildren(
  parent: SNode,
  out: string[],
  options: SerializeOptions,
  ctx: Context,
) {
  let afterText = false;
  for (let child = parent.first; child; child = child.next) {
    if (child.type === "text") {
      if (child.text === "") continue;
      if (afterText && options.hydratable) out.push("<!--|-->");
      out.push(ctx.raw ? escapeRaw(child.text) : escapeText(child.text));
      afterText = true;
      continue;
    }
    afterText = false;
    if (child.type === "comment") {
      if (options.hydratable) out.push("<!--$-->");
    } else if (child.type === "element") {
      writeElement(child, out, options, ctx);
    }
  }
}

function writeElement(
  node: SNode,
  out: string[],
  options: SerializeOptions,
  ctx: Context,
) {
  const tag = node.tag;
  if (!SAFE_TAG.test(tag))
    throw new Error(`Cajoa server: invalid tag name "${tag}".`);

  const svg = ctx.svg || tag === "svg";
  const props = node.props;
  const inSelect = tag === "option" && ctx.selectValue !== undefined;

  out.push("<", tag);
  if (props) {
    for (const [name, value] of props) {
      if (name === "value" && (tag === "select" || tag === "textarea"))
        continue;
      if (name === "selected" && inSelect) continue; 
      const attr = svg ? (SVG_ATTRIBUTE_NAMES[name] ?? name) : name;
      if (value === true) out.push(" ", attr);
      else out.push(" ", attr, '="', escapeAttr(String(value)), '"');
    }
  }
  if (inSelect) {
    const own = props?.get("value");
    const optionValue = own !== undefined ? String(own) : textOf(node).trim();
    if (optionValue === ctx.selectValue) out.push(" selected");
  }
  out.push(">");

  if (VOID.has(tag)) return;

  if (tag === "textarea" && props?.has("value")) {
    const value = String(props.get("value"));
    out.push(escapeText(value.startsWith("\n") ? "\n" + value : value));
  } else {
    const selectValue =
      tag === "select"
        ? props?.has("value")
          ? String(props.get("value"))
          : undefined
        : tag === "optgroup"
          ? ctx.selectValue
          : undefined;
    writeChildren(node, out, options, {
      svg: svg && tag !== "foreignObject",
      selectValue,
      raw: tag === "script" || tag === "style",
    });
  }
  out.push("</", tag, ">");
}
