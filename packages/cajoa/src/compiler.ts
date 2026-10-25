import { parse } from "@babel/parser";
import MagicString from "magic-string";

type AnyNode = { type: string; start: number; end: number; [key: string]: any };

const CORE_MODULES = new Set(["cajoa", "@cajoa/core"]);

const SKIP_KEYS = new Set([
  "loc",
  "extra",
  "leadingComments",
  "trailingComments",
  "innerComments",
]);

const CALL_TYPES = new Set([
  "CallExpression",
  "OptionalCallExpression",
  "TaggedTemplateExpression",
  "MemberExpression",
  "OptionalMemberExpression",
]);

const STOP_TYPES = new Set([
  "ArrowFunctionExpression",
  "FunctionExpression",
  "FunctionDeclaration",
  "ObjectMethod",
  "ClassMethod",
  "ClassPrivateMethod",
  "JSXElement",
  "JSXFragment",
]);

const PASS_THROUGH = new Set([
  "ArrowFunctionExpression",
  "FunctionExpression",
  "Identifier",
  "MemberExpression",
  "OptionalMemberExpression",
]);

function isNode(value: unknown): value is AnyNode {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as AnyNode).type === "string"
  );
}

function childNodes(node: AnyNode): AnyNode[] {
  const out: AnyNode[] = [];
  for (const key of Object.keys(node)) {
    if (SKIP_KEYS.has(key)) continue;
    const value = node[key];
    if (Array.isArray(value)) {
      for (const item of value) if (isNode(item)) out.push(item);
    } else if (isNode(value)) {
      out.push(value);
    }
  }
  return out;
}

function containsCall(node: AnyNode): boolean {
  if (CALL_TYPES.has(node.type)) return true;
  if (STOP_TYPES.has(node.type)) return false;
  return childNodes(node).some(containsCall);
}

function exprOf(node: AnyNode | null | undefined): AnyNode | null {
  if (!node || node.type !== "JSXExpressionContainer") return null;
  return node.expression.type === "JSXEmptyExpression" ? null : node.expression;
}

type Control =
  | "Show"
  | "For"
  | "ErrorBoundary"
  | "Suspense"
  | "Portal"
  | "Match"
  | "Switch"
  | "Dynamic";

const CONTROLS = new Set<string>([
  "Show",
  "For",
  "ErrorBoundary",
  "Suspense",
  "Portal",
  "Match",
  "Switch",
  "Dynamic",
]);

const LAZY_CHILDREN = new Set<Control>([
  "Show",
  "ErrorBoundary",
  "Suspense",
  "Portal",
  "Match",
]);

const LAZY_FALLBACK = new Set<Control>([
  "Show",
  "ErrorBoundary",
  "Suspense",
  "Switch",
]);

const CALL_PROP: Partial<Record<Control, string>> = {
  Show: "when",
  Match: "when",
  For: "each",
  Dynamic: "is",
};

function collectControls(program: AnyNode): Map<string, Control> {
  const controls = new Map<string, Control>();
  for (const node of program.body as AnyNode[]) {
    if (
      node.type !== "ImportDeclaration" ||
      !CORE_MODULES.has(node.source.value)
    )
      continue;
    for (const spec of node.specifiers as AnyNode[]) {
      if (spec.type !== "ImportSpecifier") continue;
      const imported =
        spec.imported.type === "Identifier"
          ? spec.imported.name
          : spec.imported.value;
      if (CONTROLS.has(imported))
        controls.set(spec.local.name, imported as Control);
    }
  }
  return controls;
}

export interface CompileResult {
  code: string;
  map: ReturnType<MagicString["generateMap"]>;
}

export function transformJsx(code: string, id: string): CompileResult | null {
  const file = id.split("?")[0];
  if (!/\.[jt]sx$/.test(file) || /[\\/]node_modules[\\/]/.test(file))
    return null;
  if (!code.includes("<")) return null;

  let ast: AnyNode;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: file.endsWith(".tsx") ? ["jsx", "typescript"] : ["jsx"],
    }) as unknown as AnyNode;
  } catch {
    return null;
  }

  const controls = collectControls(ast.program);
  const s = new MagicString(code);
  let changed = false;

  const wrap = (expr: AnyNode) => {
    s.prependRight(expr.start, "() => (");
    s.appendLeft(expr.end, ")");
    changed = true;
  };

  const wrapChildren = (parent: AnyNode) => {
    for (const kid of parent.children as AnyNode[]) {
      const expr = exprOf(kid);
      if (expr && containsCall(expr)) wrap(expr);
    }
  };

  const wrapShowChildren = (el: AnyNode) => {
    const kids = (el.children as AnyNode[]).filter(
      (k) =>
        !(k.type === "JSXText" && k.value.trim() === "") &&
        !(
          k.type === "JSXExpressionContainer" &&
          k.expression.type === "JSXEmptyExpression"
        ),
    );
    if (kids.length === 0) return;

    if (kids.length === 1) {
      const only = kids[0];
      if (only.type === "JSXElement" || only.type === "JSXFragment") {
        s.prependRight(only.start, "{() => (");
        s.appendLeft(only.end, ")}");
        changed = true;
        return;
      }
      const expr = exprOf(only);
      if (expr) {
        if (!PASS_THROUGH.has(expr.type)) wrap(expr);
        return;
      }
    }

    s.prependRight(kids[0].start, "{() => (<>");
    s.appendLeft(kids[kids.length - 1].end, "</>)}");
    changed = true;
    wrapChildren(el);
  };

  const handleElement = (el: AnyNode) => {
    const nameNode = el.openingElement.name;
    const name: string | null =
      nameNode.type === "JSXIdentifier" ? nameNode.name : null;
    const isHost = name !== null && /^[a-z]/.test(name);
    const control = name !== null && !isHost ? controls.get(name) : undefined;

    for (const attr of el.openingElement.attributes as AnyNode[]) {
      if (attr.type !== "JSXAttribute" || attr.name.type !== "JSXIdentifier")
        continue;
      const expr = exprOf(attr.value);
      if (!expr) continue;
      const prop: string = attr.name.name;

      if (isHost) {
        if (prop === "ref" || prop === "key" || prop.startsWith("on")) continue;
        if (containsCall(expr)) wrap(expr);
      } else if (control) {
        if (prop === CALL_PROP[control] && containsCall(expr)) wrap(expr);
        else if (
          prop === "fallback" &&
          LAZY_FALLBACK.has(control) &&
          !PASS_THROUGH.has(expr.type)
        ) {
          wrap(expr);
        }
      }
    }

    if (control && LAZY_CHILDREN.has(control)) wrapShowChildren(el);
    else if (control !== "For" && control !== "Switch") wrapChildren(el);
  };

  const visit = (node: AnyNode) => {
    if (node.type === "JSXElement") handleElement(node);
    else if (node.type === "JSXFragment") wrapChildren(node);
    for (const child of childNodes(node)) visit(child);
  };
  visit(ast.program);

  if (!changed) return null;
  return {
    code: s.toString(),
    map: s.generateMap({ hires: true, source: file, includeContent: true }),
  };
}
