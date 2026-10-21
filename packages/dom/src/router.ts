import {
  createContext,
  createMemo,
  createSignal,
  h,
  onCleanup,
  onMount,
  provide,
  untrack,
  useContext,
  type Child,
} from "@cajoa/core";

// ---------- Location at base path ----------

interface RawLocation {
  pathname: string;
  search: string;
  hash: string;
}

const inBrowser = typeof window !== "undefined";

const readRaw = (): RawLocation =>
  inBrowser
    ? {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      }
    : { pathname: "/", search: "", hash: "" };

const [base, setBase] = createSignal("");
const [raw, setRaw] = createSignal<RawLocation>(readRaw());

function normalizeBase(value: string | undefined): string {
  const trimmed = (value ?? "").replace(/^\/+|\/+$/g, "");
  return trimmed ? "/" + trimmed : "";
}

function stripBase(pathname: string, prefix: string): string {
  if (!prefix) return pathname;
  if (pathname === prefix) return "/";
  return pathname.startsWith(prefix + "/")
    ? pathname.slice(prefix.length)
    : pathname;
}

function withBase(to: string): string {
  const prefix = base();
  return prefix && to.startsWith("/") && !to.startsWith("//")
    ? prefix + to
    : to;
}

const location$ = createMemo(() => {
  const r = raw();
  return {
    pathname: stripBase(r.pathname, base()),
    search: r.search,
    hash: r.hash,
  };
});

const pathname$ = createMemo(() => location$().pathname);

export const useLocation = () => location$;

export const usePath = () => pathname$;

function sync() {
  if (!inBrowser) return;
  const next = readRaw();
  const prev = untrack(raw);
  if (
    next.pathname !== prev.pathname ||
    next.search !== prev.search ||
    next.hash !== prev.hash
  ) {
    setRaw(next);
  }
}

let listening = false;
function listen() {
  if (listening || !inBrowser) return;
  listening = true;
  window.addEventListener("popstate", sync);
}

// ---------- Navigation ----------

export interface NavigateOptions {
  replace?: boolean;
  scroll?: boolean;
}

export function navigate(to: string, options: NavigateOptions = {}) {
  if (!inBrowser) return;
  const url = new URL(
    untrack(() => withBase(to)),
    location.href,
  );

  if (url.origin !== location.origin) {
    location.assign(url.href);
    return;
  }
  if (url.href === location.href) {
    sync();
    return;
  }

  const pathChanged = url.pathname !== location.pathname;
  history[options.replace ? "replaceState" : "pushState"](
    null,
    "",
    url.pathname + url.search + url.hash,
  );
  sync();

  if (options.scroll !== false) restoreScroll(url.hash, pathChanged);
}

function restoreScroll(hash: string, pathChanged: boolean) {
  if (hash) {
    const target = document.getElementById(decode(hash.slice(1)));
    if (target) {
      target.scrollIntoView?.();
      return;
    }
  }
  if (pathChanged) window.scrollTo(0, 0);
}

export type SearchParamValue = string | number | boolean | null | undefined;

export function useSearchParams(): [
  () => URLSearchParams,
  (
    values: Record<string, SearchParamValue>,
    options?: { replace?: boolean },
  ) => void,
] {
  const params = () => new URLSearchParams(location$().search);

  const setParams = (
    values: Record<string, SearchParamValue>,
    options: { replace?: boolean } = {},
  ) => {
    if (!inBrowser) return;
    const next = new URLSearchParams(location.search);
    for (const [key, value] of Object.entries(values)) {
      if (value === null || value === undefined) next.delete(key);
      else next.set(key, String(value));
    }
    const search = next.toString();
    const { pathname, hash } = untrack(location$);
    navigate(pathname + (search ? "?" + search : "") + hash, {
      replace: options.replace,
      scroll: false,
    });
  };

  return [params, setParams];
}

// ---------- Matching ----------

const ParamsContext = createContext<Record<string, string>>({});

export function useParams() {
  return useContext(ParamsContext);
}

const split = (s: string) => s.split("/").filter(Boolean);

function decode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

interface Matched {
  params: Record<string, string>;
  rest: string[];
}

function matchSegments(pattern: string[], segments: string[]): Matched | null {
  const params: Record<string, string> = {};
  for (let i = 0; i < pattern.length; i++) {
    const part = pattern[i];
    if (part === "*") {
      params["*"] = segments.slice(i).map(decode).join("/");
      return { params, rest: [] };
    }
    if (i >= segments.length) return null;
    if (part.startsWith(":")) params[part.slice(1)] = decode(segments[i]);
    else if (part !== decode(segments[i])) return null;
  }
  return { params, rest: segments.slice(pattern.length) };
}

// ---------- Routes ----------

export interface RouteDef {
  __route: true;
  id: number;
  path: string;
  component?: () => unknown;
  children: RouteDef[];
}

let nextRouteId = 1;

const isRoute = (value: unknown): value is RouteDef =>
  typeof value === "object" &&
  value !== null &&
  (value as RouteDef).__route === true;

const collectRoutes = (children: unknown): RouteDef[] =>
  (([children] as unknown[]).flat(Infinity) as unknown[]).filter(isRoute);

export function Route(props: {
  path: string;
  component?: () => unknown;
  children?: unknown;
}): RouteDef {
  return {
    __route: true,
    id: nextRouteId++,
    path: props.path,
    component: props.component,
    children: collectRoutes(props.children),
  };
}

interface Match {
  route: RouteDef;
  params: Record<string, string>;
}

function matchRoutes(
  routes: RouteDef[],
  segments: string[],
  inherited: Record<string, string>,
): Match[] | null {
  for (const route of routes) {
    const hit = matchSegments(split(route.path), segments);
    if (!hit) continue;

    const params = { ...inherited, ...hit.params };

    if (route.children.length === 0) {
      if (hit.rest.length === 0) return [{ route, params }];
      continue;
    }
    const inner = matchRoutes(route.children, hit.rest, params);
    if (inner) return [{ route, params }, ...inner];
  }
  return null;
}

// ---------- Rendering ----------

const OutletContext = createContext<(() => unknown) | null>(null);

export function Outlet() {
  const render = useContext(OutletContext);
  return render ? render() : null;
}

function renderLevel(matches: () => Match[], level: number): () => unknown {
  const key = createMemo(() => {
    const match = matches()[level];
    return match ? `${match.route.id}:${JSON.stringify(match.params)}` : "";
  });

  return () => {
    key();
    const match = untrack(() => matches()[level]);
    if (!match) return null;

    const component = match.route.component;
    if (!component) {
      return provide(ParamsContext, match.params, () =>
        renderLevel(matches, level + 1)(),
      );
    }

    return untrack(() =>
      provide(ParamsContext, match.params, () =>
        provide(
          OutletContext,
          () => renderLevel(matches, level + 1),
          () => component(),
        ),
      ),
    );
  };
}

export function Router(props: { base?: string; children?: unknown }) {
  setBase(normalizeBase(props.base));
  onCleanup(() => setBase(""));
  listen();
  sync();

  const routes = collectRoutes(props.children);
  const matches = createMemo(
    () => matchRoutes(routes, split(pathname$()), {}) ?? [],
  );

  return renderLevel(matches, 0);
}

// ---------- Links ----------

export function Link(props: {
  href: string;
  children?: unknown;
  [key: string]: unknown;
}) {
  const { href, children, ...rest } = props;
  const external = /^[a-z][a-z0-9+.-]*:|^\/\//i.test(href);

  const onClick = (e: MouseEvent) => {
    if (external) return;
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // new tab, atbp.
    const target = rest.target as string | undefined;
    if ((target && target !== "_self") || rest.download !== undefined) return;
    e.preventDefault();
    navigate(href);
  };

  return h(
    "a",
    { ...rest, href: external ? href : () => withBase(href), onClick },
    children as Child,
  );
}

function isActive(current: string, href: string, end: boolean): boolean {
  const target = split(href.split(/[?#]/)[0]);
  const here = split(current);
  if (end && target.length !== here.length) return false;
  return (
    target.length <= here.length &&
    target.every((segment, i) => segment === here[i])
  );
}

export function NavLink(props: {
  href: string;
  activeClass?: string;
  end?: boolean;
  class?: string;
  children?: unknown;
  [key: string]: unknown;
}) {
  const {
    href,
    activeClass = "active",
    end = false,
    class: cls,
    children,
    ...rest
  } = props;
  const active = () => isActive(pathname$(), href, end);

  return Link({
    ...rest,
    href,
    children,
    class: () => [cls, active() ? activeClass : ""].filter(Boolean).join(" "),
  });
}

export function Navigate(props: { to: string; replace?: boolean }) {
  onMount(() => navigate(props.to, { replace: props.replace ?? true }));
  return null;
}
