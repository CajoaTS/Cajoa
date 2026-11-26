import {
  createResource,
  createSignal,
  For,
  hydrate,
  Show,
  Suspense,
} from "cajoa";
import { renderToStringAsync } from "@cajoa/server";

// The page makes its own "server" HTML with renderToStringAsync, puts it in the page and waits.
// The test then does things to that HTML (types in it, focuses it) and calls hydrateNow().

declare global {
  interface Window {
    hydrateNow: () => void;
    __frameLoads: number;
    __fetches: number;
  }
}

window.__frameLoads = 0; // how many times the <iframe> loaded
window.__fetches = 0; // how many times the browser (not the "server") fetched

let phase: "server" | "browser" = "server";

function loadUser() {
  if (phase === "browser") window.__fetches++;
  return new Promise<string>((resolve) => setTimeout(() => resolve("Ada"), 30));
}

function App() {
  const [count, setCount] = createSignal(0);
  const [items, setItems] = createSignal(["one", "two"]);
  const [outer, setOuter] = createSignal(true);
  const [inner, setInner] = createSignal(true);
  const [user] = createResource(loadUser);

  return (
    <main data-testid="root">
      <h1 data-testid="title">Hello {() => user() ?? "..."}</h1>
      <input data-testid="free-input" />
      <button data-testid="inc" onClick={() => setCount((n) => n + 1)}>
        count {() => count()}
      </button>
      <Suspense fallback={() => <p data-testid="fallback">loading</p>}>
        {() => <p data-testid="user">{() => user()}</p>}
      </Suspense>
      <button
        data-testid="add"
        onClick={() => setItems((all) => [...all, "item " + (all.length + 1)])}
      >
        add
      </button>
      <ul data-testid="list">
        <For each={() => items()}>{(item: string) => <li>{item}</li>}</For>
      </ul>
      <button data-testid="toggle-outer" onClick={() => setOuter((v) => !v)}>
        outer
      </button>
      <button data-testid="toggle-inner" onClick={() => setInner((v) => !v)}>
        inner
      </button>
      <Show when={() => outer()}>
        {() => (
          <Show
            when={() => inner()}
            fallback={() => <em data-testid="no-frame">no frame</em>}
          >
            {() => (
              <iframe
                data-testid="frame"
                title="frame"
                srcDoc="<script>parent.__frameLoads++</script>"
              />
            )}
          </Show>
        )}
      </Show>
    </main>
  );
}

const container = document.getElementById("app")!;

window.hydrateNow = () => {
  phase = "browser";
  hydrate(() => <App />, container);
  document.body.dataset.phase = "browser";
};

renderToStringAsync(() => <App />, { hydratable: true }).then((html) => {
  container.innerHTML = html;
  document.body.dataset.phase = "server";
});
