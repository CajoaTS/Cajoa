import { Link } from "cajoa";
import { CounterDemo } from "../demos";
import { Code, Demo } from "../ui";

const example = `import { createSignal, render } from "cajoa";

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Clicked {count()} times
    </button>
  );
}

render(Counter, document.getElementById("app")!);`;

export function Landing() {
  return (
    <main class="landing">
      <section class="hero">
        <h1>A small frontend framework built on signals and JSX.</h1>
        <p class="lead">
          No virtual DOM. A component runs once, and only the parts that depend
          on a signal update.
        </p>
        <div class="actions">
          <Link href="/docs/getting-started" class="button primary">
            Get started
          </Link>
          <a class="button" href="https://github.com/CajoaTS/Cajoa">
            GitHub
          </a>
        </div>
        <Code lang="bash" code="npm create cajoa@latest my-app" />
      </section>

      <section class="features">
        <div>
          <h3>Signals, not re-renders</h3>
          <p>
            When a signal changes, only the text, attribute or list that uses it
            updates.
          </p>
        </div>
        <div>
          <h3>Plain, typed JSX</h3>
          <p>
            The Vite plugin makes JSX reactive. HTML and SVG are fully typed.
          </p>
        </div>
        <div>
          <h3>Batteries included</h3>
          <p>
            Router, stores, async data, error boundaries and Suspense. No extra
            packages.
          </p>
        </div>
        <div>
          <h3>Small, and server-ready</h3>
          <p>
            A counter app is under 3 KB gzipped. Render to HTML on the server
            when you need it.
          </p>
        </div>
      </section>

      <section class="example">
        <h2>It looks like this</h2>
        <Code code={example} />
        <Demo>
          <CounterDemo />
        </Demo>
      </section>
    </main>
  );
}
