import {
  createSignal,
  createContext,
  provide,
  useContext,
  untrack,
  h,
  type Child,
} from "@cajoa/core";

const read = () => (typeof location === "undefined" ? "/" : location.pathname);
const [path, setPath] = createSignal(read());

let listening = false;
function listen() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("popstate", () => setPath(read())); // back/forward button
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  if (new URL(to, location.href).href === location.href) return;
  history[options.replace ? "replaceState" : "pushState"](null, "", to);
  setPath(read());
}

export const usePath = () => path;

// ---- params ----
const Params = createContext<Record<string, string>>({});
export function useParams() {
  return useContext(Params);
}

const split = (s: string) => s.split("/").filter(Boolean);

function decode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function match(
  pattern: string,
  pathname: string,
): Record<string, string> | null {
  if (pattern === "*") return {};
  const p = split(pattern);
  const u = split(pathname);
  if (p.length !== u.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = decode(u[i]);
    else if (p[i] !== u[i]) return null;
  }
  return params;
}

// ---- components ----
export interface RouteDef {
  __route: true;
  path: string;
  component: () => unknown;
}

export function Route(props: {
  path: string;
  component: () => unknown;
}): RouteDef {
  return { __route: true, path: props.path, component: props.component };
}

export function Router(props: { children?: unknown }) {
  listen();
  const routes = ([props.children].flat(Infinity) as any[]).filter(
    (r): r is RouteDef => r?.__route === true,
  );

  return () => {
    const current = path();
    for (const route of routes) {
      const params = match(route.path, current);
      if (params) {
        return untrack(() => provide(Params, params, () => route.component()));
      }
    }
    return null;
  };
}

export function Link(props: {
  href: string;
  children?: unknown;
  [key: string]: unknown;
}) {
  const { href, children, ...rest } = props;

  const onClick = (e: MouseEvent) => {
    if (/^[a-z][a-z0-9+.-]*:|^\/\//i.test(href)) return; // external link
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // new tab, atbp.
    e.preventDefault();
    navigate(href);
  };

  return h("a", { ...rest, href, onClick }, children as Child);
}
