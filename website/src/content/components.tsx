import { Callout, Code } from "../ui";

export function Components() {
  return (
    <article>
      <h1>Components and control flow</h1>
      <p>
        A component is a function that builds DOM and runs <strong>once</strong>
        . Its props are plain values.
      </p>
      <Code
        code={`function Greeting(props: { name: string }) {
  return <p>Hello {props.name}</p>;
}

<Greeting name="Ada" />`}
      />

      <h2>Show</h2>
      <Code
        code={`<Show when={user()} fallback={<p>Please log in.</p>}>
  <p>Welcome back, {user()?.name}</p>
</Show>`}
      />

      <h2>For</h2>
      <Code
        code={`<ul>
  <For each={todos()}>{(todo) => <li>{todo.text}</li>}</For>
</ul>`}
      />
      <ul>
        <li>
          By default each item is tracked by itself. Pass <code>key</code> to
          track by something else. Items with the same key are not re-rendered
          when their data changes, so keys must be unique, and the item should
          hold its own signals if it needs to update.
        </li>
        <li>
          Return a single element (not a fragment) from the child function,
          because the list reuses that node.
        </li>
        <li>
          Reordering only moves the nodes that have to move. Swapping two rows
          moves two nodes.
        </li>
      </ul>

      <h2>Switch and Match</h2>
      <Code
        code={`<Switch fallback={<p>Unknown</p>}>
  <Match when={status() === "loading"}><Spinner /></Match>
  <Match when={status() === "error"}><p>Something went wrong</p></Match>
</Switch>`}
      />
      <p>
        The first <code>Match</code> with a truthy <code>when</code> wins. A
        branch is created only when selected.
      </p>

      <h2>Dynamic</h2>
      <p>
        <code>is</code> is a function that returns a tag name or a component.
        The other props are passed on.
      </p>
      <Code
        code={`<Dynamic is={() => (big() ? "h1" : "h2")}>Title</Dynamic>`}
      />
      <p>
        To store a component in a signal, set it with{" "}
        <code>setView(() =&gt; Page)</code>. Writing <code>setView(Page)</code>{" "}
        would call <code>Page</code> as an updater.
      </p>

      <h2>Portal</h2>
      <p>
        <code>{"<Portal>"}</code> renders its children somewhere else.{" "}
        <code>mount</code> is an element, and the default is{" "}
        <code>document.body</code>. The content is removed when the portal is
        disposed.
      </p>

      <h2>Lifecycle</h2>
      <Code
        code={`onMount(() => {
  console.log("the component is on the page");
});

onCleanup(() => {
  console.log("the owner was disposed");
});`}
      />
      <p>
        <code>createRoot(fn)</code> creates a top-level owner that you can
        dispose by hand.
      </p>

      <h2>Context</h2>
      <Code
        code={`const Theme = createContext("light");

function Page() {
  const theme = useContext(Theme); // read it at the top of the component
  return <p>Theme: {theme}</p>;
}

provide(Theme, "dark", () => <Page />);`}
      />

      <Callout title="Good to know">
        <code>{"<Show>"}</code>, <code>{"<For>"}</code>,{" "}
        <code>{"<Router>"}</code> and the other control components return a
        function, so they must sit inside an element, not at the root of{" "}
        <code>render</code>. <code>useContext</code> and <code>useParams</code>{" "}
        only work while a component is being created, so read them at the top
        and use the value later.
      </Callout>
    </article>
  );
}
