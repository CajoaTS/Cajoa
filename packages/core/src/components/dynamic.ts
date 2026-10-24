import { jsx } from "../jsx-runtime";
import { untrack } from "../reactivity/signal";

type Target = string | ((props: any) => unknown) | null | undefined | false;

export function Dynamic(props: {
  is: Target | (() => Target);
  [key: string]: unknown;
}) {
  const { is, ...rest } = props;
  const read =
    typeof is === "function" ? (is as () => Target) : () => is as Target;

  return () => {
    const target = read();
    if (target == null || target === false) return null;

    if (typeof target !== "string" && typeof target !== "function") {
      throw new Error(
        `<Dynamic>: \`is\` must be a tag name, or a function that returns a tag name or a component (got ${typeof target}). To render a component directly, write is={() => MyComponent}.`,
      );
    }
    return untrack(() => jsx(target, rest));
  };
}
