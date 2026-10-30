import { Callout, Code } from "../ui";

export function Ssr() {
  return (
    <article>
      <h1>Server-side rendering</h1>
      <Code
        code={`import { renderToString, renderToStringAsync } from "cajoa/server";

// Fast, does not wait: async data is still "loading"
const html = renderToString(() => <App />, { url: "/users/42" });

// Waits for createResource and lazy, including ones that start after others finish
const page = await renderToStringAsync(() => <App />, {
  url: req.url,
  onRedirect: (to, status) => res.redirect(status, to),
});`}
      />
      <ul>
        <li>
          On the server, <code>isServer()</code> is <code>true</code>.{" "}
          <code>onMount</code> does not run (so <code>window</code> is safe
          there), <code>ref</code> is not called, and event handlers are left
          out.
        </li>
        <li>
          <code>{"<Router>"}</code> uses the <code>url</code> of the request,
          and every request has its own router state, so parallel requests are
          safe. Put components that use <code>useLocation</code>,{" "}
          <code>NavLink</code> and similar <strong>inside</strong>{" "}
          <code>{"<Router>"}</code>.
        </li>
        <li>
          <code>{"<Navigate>"}</code> calls <code>onRedirect</code> instead of
          rendering.
        </li>
        <li>
          The output has markers for hydration. Use{" "}
          <code>hydratable: false</code> for plain static HTML.
        </li>
        <li>
          <code>renderToStringAsync</code> has a <code>timeout</code> (10
          seconds by default) and throws when it is reached.
        </li>
      </ul>
      <Callout title="No hydration yet">
        In the browser, <code>render()</code> replaces the content of the
        container, even if it was rendered on the server. The page looks the
        same, but state in the DOM, such as focus, is not kept.{" "}
        <code>hydrate()</code> is planned.
      </Callout>

      <h2>How this site is built</h2>
      <p>
        This site is a Cajoa app, in the <code>website</code> folder of the
        repository. The build has three steps:
      </p>
      <ol>
        <li>
          <code>vite build</code> makes the normal client files.
        </li>
        <li>
          <code>vite build --ssr</code> makes a server bundle that exports{" "}
          <code>render(path)</code>, which calls{" "}
          <code>renderToStringAsync</code>.
        </li>
        <li>
          A small script calls <code>render</code> for every page and writes
          real HTML files, with the right title and description. It also writes{" "}
          <code>404.html</code> and <code>sitemap.xml</code>.
        </li>
      </ol>
      <p>
        So every page is real HTML before any JavaScript loads. A GitHub Action
        then publishes the result to GitHub Pages.
      </p>
    </article>
  );
}
