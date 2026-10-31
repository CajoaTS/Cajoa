type Rows = Array<[string, string]>; 
import { slug } from "../site";

const sections: Array<{ title: string; rows: Rows }> = [
  
  {
    title: "Reactivity",
    rows: [
      [
        "createSignal(value)",
        "Returns [get, set]. Reading get() inside an effect subscribes to it.",
      ],
      [
        "createEffect(fn)",
        "Runs fn now and again whenever a signal it read changes.",
      ],
      [
        "createMemo(fn)",
        "Cached computed value. Computed when read, and only notifies when the result changes.",
      ],
      [
        "createSelector(source)",
        "Returns isSelected(key). Only the old and the new key wake up.",
      ],
      ["batch(fn)", "Groups several writes into one update."],
      ["untrack(fn)", "Runs fn without subscribing to signals."],
      [
        "onMount(fn)",
        "Runs fn after the component is rendered. Does not run on the server.",
      ],
      [
        "onCleanup(fn)",
        "Runs fn before an effect re-runs or when its owner is disposed.",
      ],
      ["createRoot(fn)", "Creates a top-level owner you can dispose by hand."],
      [
        "createContext / provide / useContext",
        "Share a value with everything created inside provide().",
      ],
    ],
  },
  {
    title: "Stores and data",
    rows: [
      [
        "createStore(initial)",
        "Returns [state, setState]. state is read-only and tracked per property.",
      ],
      [
        "setState(...path, value)",
        "Sets a value. Objects are merged, functions replace.",
      ],
      ["setState(draft => { ... })", "Edits a draft, as one update."],
      ["unwrap(state)", "The plain object behind the store."],
      [
        "createResource(source?, fetcher)",
        "Loads data when source() changes. Returns [resource, { refetch, mutate }].",
      ],
    ],
  },
  {
    title: "Components",
    rows: [
      ["<Show when fallback>", "Conditional rendering."],
      [
        "<For each key?>",
        "List rendering. Reuses DOM nodes for unchanged items.",
      ],
      [
        "<Switch> / <Match when>",
        "Renders the first matching branch, or the fallback.",
      ],
      [
        "<Dynamic is>",
        "Renders a tag or component that can change. is is a function.",
      ],
      [
        "<Portal mount?>",
        "Renders its children into another element (default: document.body).",
      ],
      [
        "<ErrorBoundary fallback onError?>",
        "Shows fallback when something below it throws.",
      ],
      [
        "<Suspense fallback>",
        "Shows the fallback until the first load of everything inside has finished.",
      ],
      ["lazy(loader)", "A component loaded on first use."],
      [
        "catchError(fn, handler)",
        "Runs fn. Errors it throws, now or later, go to handler.",
      ],
    ],
  },
  {
    title: "Router",
    rows: [
      ["<Router base?>", "Renders the route that matches the current path."],
      [
        "<Route path component>",
        "Maps a path (/users/:id, *) to a component. Nest routes for layouts.",
      ],
      ["<Outlet />", "Renders the matching child route inside a layout."],
      [
        "<Link href>",
        "An a element that navigates without reloading the page.",
      ],
      [
        "<NavLink href end? activeClass?>",
        "A Link that gets an active class on the current page.",
      ],
      ["<Navigate to replace?>", "Redirects when it is rendered."],
      ["navigate(to, { replace?, scroll? })", "Navigates from code."],
      ["useParams()", "Reads the route params."],
      [
        "useLocation() / usePath()",
        "Getters for the location and the pathname.",
      ],
      [
        "useSearchParams()",
        "Returns [params, setParams] for the query string.",
      ],
    ],
  },
  {
    title: "Rendering and server",
    rows: [
      [
        "render(component, container)",
        "Mounts a component. Returns a dispose function.",
      ],
      [
        "h(tag, props, ...children)",
        "Low-level element creator. JSX compiles to this.",
      ],
      [
        "setRenderer / getRenderer / domRenderer",
        "Swap or read the renderer (default: DOM).",
      ],
      ["isServer()", "true while rendering on the server."],
      [
        "renderToString(app, options?)",
        "Renders to an HTML string (cajoa/server). Does not wait for resources.",
      ],
      [
        "renderToStringAsync(app, options?)",
        "Same, but waits for createResource and lazy.",
      ],
      ["cajoa() from cajoa/vite", "The Vite plugin that makes JSX reactive."],
    ],
  },
];

export const apiRows: Rows = sections.flatMap((section) => section.rows);

export function Api() {
  return (
    <article>
      <h1>API reference</h1>
      {sections.map((section) => (
        <section>
          <h2>{section.title}</h2>
          <table>
            <tbody>
              {section.rows.map((row) => (
                <tr id={slug(row[0])}>
                  <td>
                    <code>{row[0]}</code>
                  </td>
                  <td>{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </article>
  );
}
