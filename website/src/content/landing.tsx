import { createSignal, For, Link } from "cajoa";
import { ReactivityDemo } from "../demos";
import { Icon } from "../icons";
import { REPO } from "../site";
import { Code, Install } from "../ui";

interface Tab {
  id: string;
  label: string;
  title: string;
  code: string;
}

const tabs: Tab[] = [
  {
    id: "signals",
    label: "Signals",
    title: "reactivity.ts",
    code: `import { createSignal, createMemo, createEffect } from "cajoa";

const [count, setCount] = createSignal(0);
const double = createMemo(() => count() * 2);

createEffect(() => console.log("double is", double()));

setCount(2); // logs: double is 4`,
  },
  {
    id: "stores",
    label: "Stores",
    title: "todos.tsx",
    code: `const [state, setState] = createStore({
  todos: [{ text: "Learn Cajoa", done: false }],
});

setState("todos", 0, "done", true);
setState((draft) => {
  draft.todos.push({ text: "Ship it", done: false });
});

<For each={state.todos}>{(todo) => <li>{todo.text}</li>}</For>`,
  },
  {
    id: "router",
    label: "Router",
    title: "App.tsx",
    code: `<Router>
  <Route path="/" component={Layout}>
    <Route path="" component={Home} />
    <Route path="users/:id" component={User} />
  </Route>
  <Route path="*" component={NotFound} />
</Router>`,
  },
  {
    id: "ssr",
    label: "SSR",
    title: "server.tsx",
    code: `import { renderToStringAsync } from "cajoa/server";

const html = await renderToStringAsync(() => <App />, {
  url: req.url,
  onRedirect: (to, status) => res.redirect(status, to),
});`,
  },
];

function Showcase() {
  const [active, setActive] = createSignal("signals");

  return (
    <div class="tabs">
      <div class="tab-list" role="tablist" aria-label="Examples">
        <For each={tabs}>
          {(tab: Tab) => (
            <button
              role="tab"
              class={() => (active() === tab.id ? "tab active" : "tab")}
              aria-selected={() => (active() === tab.id ? "true" : "false")}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          )}
        </For>
      </div>
      <For each={tabs}>
        {(tab: Tab) => (
          <div class={() => (active() === tab.id ? "tab-panel" : "tab-panel off")} role="tabpanel">
            <Code code={tab.code} title={tab.title} />
          </div>
        )}
      </For>
    </div>
  );
}

function Card(props: { span: string; title: string; text: string; code?: string }) {
  return (
    <article
      class={"card " + props.span}
      onMouseMove={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", e.clientX - box.left + "px");
        e.currentTarget.style.setProperty("--my", e.clientY - box.top + "px");
      }}
    >
      <h3>{props.title}</h3>
      <p>{props.text}</p>
      {props.code && <code class="mini">{props.code}</code>}
    </article>
  );
}

export function Landing() {
  return (
    <main id="main" class="landing">
      <section class="hero">
        <div class="hero-copy">
          <a class="pill" href={REPO + "/releases"} rel="noopener">
            <span class="pill-dot" />
            <span>What's new in Cajoa</span>
            <Icon name="arrow-right" size={14} />
          </a>
          <h1>
            Build interfaces with <span class="mark">signals</span>, not re-renders.
          </h1>
          <p class="lead">
            Cajoa is a small, typed, batteries-included framework. Components run once, and only the exact
            text or attribute that changed updates.
          </p>
          <div class="actions">
            <Link href="/docs/getting-started" class="button primary">
              Get started
              <Icon name="arrow-right" size={16} />
            </Link>
            <a class="button" href={REPO} rel="noopener">
              View on GitHub
            </a>
          </div>
          <Install command="npm create cajoa@latest my-app" />
        </div>
        <div class="hero-visual">
          <ReactivityDemo />
        </div>
      </section>

      <section class="stats" aria-label="Facts">
        <div>
          <strong>&lt; 3 KB</strong>
          <span>gzipped counter app</span>
        </div>
        <div>
          <strong>0</strong>
          <span>dependencies in your bundle</span>
        </div>
        <div>
          <strong>1</strong>
          <span>run per component</span>
        </div>
        <div>
          <strong>SSR</strong>
          <span>and typed JSX built in</span>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Everything you need, nothing you don't</h2>
        <div class="bento">
          <Card
            span="span-6"
            title="Signals, not re-renders"
            text="When a signal changes, only the text, attribute or list that uses it updates. Updates are glitch-free."
            code="const [n, setN] = createSignal(0)"
          />
          <Card
            span="span-6"
            title="Plain, typed JSX"
            text="The Vite plugin makes JSX reactive. Every HTML and SVG element, attribute and event is typed."
            code="onInput={(e) => e.currentTarget.value}"
          />
          <Card
            span="span-4"
            title="Stores"
            text="Nested state, tracked per property."
            code={'setState("user", "name", "Ada")'}
          />
          <Card
            span="span-4"
            title="Router"
            text="Nested routes, layouts, params and base paths."
            code={'<Route path="users/:id" />'}
          />
          <Card
            span="span-4"
            title="Server rendering"
            text="Render to HTML, wait for data, redirect."
            code="await renderToStringAsync(app)"
          />
          <Card
            span="span-6"
            title="Async data"
            text="createResource, Suspense, lazy components and error boundaries work together."
            code="createResource(userId, fetchUser)"
          />
          <Card
            span="span-6"
            title="Small and fast"
            text="A counter app is under 3 KB gzipped. Reordering a list moves only the nodes that have to move."
            code="createSelector(selected)"
          />
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">See how it reads</h2>
        <Showcase />
      </section>

      <section class="cta">
        <h2>Ready to build something?</h2>
        <p>Start with the starter, or add Cajoa to a Vite project you already have.</p>
        <div class="actions">
          <Link href="/docs/getting-started" class="button primary">
            Read the docs
            <Icon name="arrow-right" size={16} />
          </Link>
          <Link href="/docs/api" class="button">
            API reference
          </Link>
        </div>
        <Install command="npm create cajoa@latest my-app" />
      </section>
    </main>
  );
}