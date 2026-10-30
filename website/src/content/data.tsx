import { Callout, Code } from "../ui";

export function DataAndErrors() {
  return (
    <article>
      <h1>Data and errors</h1>

      <h2>Async data</h2>
      <Code
        code={`const [userId, setUserId] = createSignal(1);
const [user, { refetch, mutate }] = createResource(userId, (id) => fetchUser(id));

<p>{user.loading() ? "Loading..." : user()?.name}</p>`}
      />
      <ul>
        <li>
          <code>createResource(source, fetcher)</code> calls{" "}
          <code>fetcher(value)</code> whenever <code>source()</code> changes.
          The fetcher can return a value or a promise. With one argument, it
          loads once, and again on <code>refetch()</code>.
        </li>
        <li>
          While <code>source()</code> is <code>false</code>, <code>null</code>{" "}
          or <code>undefined</code>, nothing is fetched.
        </li>
        <li>
          <code>user()</code> returns the data, and keeps the previous data
          while a reload is in progress. <code>user.loading()</code> and{" "}
          <code>user.error()</code> are reactive.
        </li>
        <li>
          If the request failed, reading <code>user()</code> throws, so an error
          boundary can show a fallback.
        </li>
        <li>
          An old response that arrives after a newer request started is ignored.
        </li>
        <li>
          <code>mutate(value)</code> sets the data directly, for example an
          optimistic update.
        </li>
      </ul>

      <h2>Lazy components and Suspense</h2>
      <Code
        code={`const Settings = lazy(() => import("./Settings"));

<Suspense fallback={<p>Loading...</p>}>
  <Settings />
</Suspense>`}
      />
      <ul>
        <li>
          <code>lazy(loader)</code> loads a component the first time it is
          rendered. The loader returns a module with a default export, or the
          component itself.
        </li>
        <li>
          <code>{"<Suspense>"}</code> shows its fallback until everything inside
          has finished its <b>first</b> load: lazy components and{" "}
          <code>createResource</code> calls. A reload later does not bring the
          fallback back. Use <code>resource.loading()</code> for that.
        </li>
        <li>A failed load is thrown, so an error boundary can catch it.</li>
      </ul>

      <h2>Error boundaries</h2>
      <Code
        code={`<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>Something went wrong: {String(error)}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )}
>
  <Dashboard />
</ErrorBoundary>`}
      />
      <ul>
        <li>
          It catches errors thrown while a component is created, inside effects
          and memos, and in <code>onMount</code>. The nearest boundary wins.
        </li>
        <li>
          It does <strong>not</strong> catch errors in event handlers, timers or
          promises. Handle those yourself.
        </li>
        <li>
          <code>reset()</code> re-creates the children. Use <code>onError</code>{" "}
          to report the error, for example to a logging service.
        </li>
        <li>
          <code>catchError(fn, handler)</code> is the low-level building block.
        </li>
      </ul>
      <Callout>
        <code>{"<Suspense>"}</code> and <code>{"<ErrorBoundary>"}</code> must
        sit inside an element, not at the root of <code>render</code>.
      </Callout>
    </article>
  );
}
