import { Api } from "./content/api";
import { Components } from "./content/components";
import { DataAndErrors } from "./content/data";
import { Forms } from "./content/forms";
import { GettingStarted } from "./content/getting-started";
import { Reactivity } from "./content/reactivity";
import { RouterPage } from "./content/router";
import { Ssr } from "./content/ssr";
import { Stores } from "./content/stores";
import { TypeScriptPage } from "./content/typescript";

export interface Page {
  slug: string;
  title: string;
  description: string;
  keywords: string;
  group: string;
  component: () => unknown;
}

export const groups = ["Start", "Core", "More", "Reference"];

export const pages: Page[] = [
  {
    slug: "getting-started",
    group: "Start",
    title: "Getting started",
    description: "Create a Cajoa project, or add Cajoa to an existing Vite project.",
    keywords: "install npm create vite plugin tsconfig first component render",
    component: GettingStarted,
  },
  {
    slug: "reactivity",
    group: "Core",
    title: "Reactivity",
    description: "Signals, effects, memos and reactive JSX.",
    keywords: "createSignal createEffect createMemo batch untrack createSelector onCleanup glitch",
    component: Reactivity,
  },
  {
    slug: "components",
    group: "Core",
    title: "Components and control flow",
    description: "Components, Show, For, Switch, Dynamic, Portal, lifecycle and context.",
    keywords: "props children Show For Switch Match Dynamic Portal onMount createContext provide useContext",
    component: Components,
  },
  {
    slug: "forms",
    group: "Core",
    title: "Forms, styles and events",
    description: "Inputs, style objects, events, refs and SVG.",
    keywords: "input value checked onInput onChange style ref svg batch",
    component: Forms,
  },
  {
    slug: "data",
    group: "Core",
    title: "Data and errors",
    description: "createResource, Suspense, lazy components and error boundaries.",
    keywords: "createResource fetch async Suspense lazy ErrorBoundary catchError loading error",
    component: DataAndErrors,
  },
  {
    slug: "stores",
    group: "Core",
    title: "Stores",
    description: "createStore for nested state with fine-grained updates.",
    keywords: "createStore setState draft unwrap nested object array",
    component: Stores,
  },
  {
    slug: "router",
    group: "More",
    title: "Router",
    description: "Routes, layouts, links, params, query strings and base paths.",
    keywords: "Router Route Outlet Link NavLink Navigate useParams useSearchParams useLocation base path",
    component: RouterPage,
  },
  {
    slug: "ssr",
    group: "More",
    title: "Server-side rendering",
    description: "renderToString and renderToStringAsync, and how this site is prerendered.",
    keywords: "ssr server render prerender isServer redirect hydration static",
    component: Ssr,
  },
  {
    slug: "typescript",
    group: "More",
    title: "TypeScript",
    description: "Typed JSX for HTML and SVG, and dev mode.",
    keywords: "types jsx events currentTarget aria style dev mode",
    component: TypeScriptPage,
  },
  {
    slug: "api",
    group: "Reference",
    title: "API reference",
    description: "Every function and component in one place.",
    keywords: "reference list functions components",
    component: Api,
  },
];

// The prerender script and the page title use this list
export const routeMeta = [
  {
    path: "/",
    title: "Cajoa: a small frontend framework built on signals",
    description:
      "Cajoa is a small, beginner-friendly frontend framework built on signals and JSX. No virtual DOM.",
  },
  { path: "/docs", title: pages[0].title + " | Cajoa", description: pages[0].description },
  ...pages.map((page) => ({
    path: "/docs/" + page.slug,
    title: page.title + " | Cajoa",
    description: page.description,
  })),
];