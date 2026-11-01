import {
  createEffect,
  isServer,
  onCleanup,
  ServerContext,
  useContext,
  type HeadMeta,
} from "@cajoa/core";

/** Turns text, numbers and live getters (even inside arrays) into one string. */
function textOf(value: unknown): string {
  if (typeof value === "function") return textOf((value as () => unknown)());
  if (Array.isArray(value)) return value.map(textOf).join("");
  return value == null || value === false ? "" : String(value);
}

/**
 * Sets the page title. In the browser it changes document.title and puts the old title back
 * when the component is removed. On the server it fills the `head` object.
 */
export function Title(props: { children?: unknown }) {
  if (isServer()) {
    const request = useContext(ServerContext);
    createEffect(() => {
      if (request) request.head.title = textOf(props.children);
    });
    return null;
  }

  const previous = document.title;
  createEffect(() => {
    document.title = textOf(props.children);
  });
  onCleanup(() => {
    document.title = previous;
  });
  return null;
}

/**
 * Adds or updates a <meta> tag, for example <Meta name="description" content="..." />.
 * Use `property` instead of `name` for tags like og:title. `content` can be a function.
 */
export function Meta(props: { name?: string; property?: string; content: unknown }) {
  const attribute = props.name !== undefined ? "name" : "property";
  const key = props.name ?? props.property ?? "";

  if (isServer()) {
    const request = useContext(ServerContext);
    createEffect(() => {
      if (!request) return;
      const content = textOf(props.content);
      const list = (request.head.meta ??= []);
      const entry: HeadMeta = attribute === "name" ? { name: key, content } : { property: key, content };
      const at = list.findIndex((m) => (attribute === "name" ? m.name === key : m.property === key));
      if (at === -1) list.push(entry);
      else list[at] = entry;
    });
    return null;
  }

  const existing = Array.from(document.head.querySelectorAll("meta")).find(
    (meta) => meta.getAttribute(attribute) === key,
  );
  const element = existing ?? document.createElement("meta");
  const previous = existing?.getAttribute("content") ?? null;
  if (!existing) {
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  createEffect(() => {
    element.setAttribute("content", textOf(props.content));
  });
  onCleanup(() => {
    if (!existing) element.remove();
    else if (previous !== null) element.setAttribute("content", previous);
  });
  return null;
}