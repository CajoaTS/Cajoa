import { Link } from "cajoa";
import { CounterDemo } from "../demos";
import { Callout, Code, Demo } from "../ui";

export function GettingStarted() {
  return (
    <article>
      <h1>Getting started</h1>
      <p>
        Cajoa is a small frontend framework built on signals and JSX. There is no virtual DOM. A component runs once,
        and only the parts that depend on a signal update.
      </p>

      <h2>Create a project</h2>
      <p>The fastest way is the starter. It uses Vite and TypeScript.</p>
      <Code
        lang="bash"
        code={`npm create cajoa@latest my-app
cd my-app
npm install
npm run dev`}
      />

      <h2>Add Cajoa to an existing Vite project</h2>
      <Code lang="bash" code="npm install cajoa" />
      <p>
        Add the plugin to <code>vite.config.ts</code>. It makes your JSX reactive, and it sets Vite's JSX options for
        you.
      </p>
      <Code
        title="vite.config.ts"
        lang="ts"
        code={`import { defineConfig } from "vite";
import { cajoa } from "cajoa/vite";

export default defineConfig({ plugins: [cajoa()] });`}
      />
      <p>Then tell TypeScript to use Cajoa for JSX.</p>
      <Code
        title="tsconfig.json"
        lang="json"
        code={`{ "compilerOptions": { "jsx": "react-jsx", "jsxImportSource": "cajoa" } }`}
      />

      <h2>Your first component</h2>
      <Code
        title="src/main.tsx"
        code={`import { createSignal, render } from "cajoa";

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Clicked {count()} times
    </button>
  );
}

render(Counter, document.getElementById("app")!);`}
      />
      <Demo>
        <CounterDemo />
      </Demo>
      <Callout title="Why does the number update by itself?">
        <code>count</code> is a signal. The plugin turns <code>{"{count()}"}</code> into a small reactive
        expression, so only that text changes. The component function does not run again.
      </Callout>
      <p>
        <code>render</code> needs an element. Components like <code>{"<Show>"}</code> or <code>{"<Router>"}</code>{" "}
        must be inside an element, not at the root.
      </p>
      <p>
        Next: <Link href="/docs/reactivity">Reactivity</Link>.
      </p>
    </article>
  );
}