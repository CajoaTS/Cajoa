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
          To make the HTML interactive in the browser, set{" "}
          <code>hydratable: true</code> and call <code>hydrate()</code> (see
          below).
        </li>
        <li>
          <code>renderToStringAsync</code> has a <code>timeout</code> (10
          seconds by default) and throws when it is reached.
        </li>
      </ul>
      <h2>Hydration</h2>
      <p>
        <code>render()</code> throws away what is in the container and builds
        the page again. <code>hydrate()</code> keeps the HTML that the server
        wrote and only attaches the app to it: events, signals and effects. The
        elements stay the same, so focus, scroll position and anything the user
        typed are not lost.
      </p>
      <Code
        code={`// On the server
const html = renderToString(() => <App />, { url: req.url, hydratable: true });

// In the browser (the HTML is inside <div id="app">)
import { hydrate } from "cajoa";

hydrate(() => <App />, document.getElementById("app")!);`}
      />
      <ul>
        <li>
          <code>hydrate(component, container)</code> has the same signature as{" "}
          <code>render()</code> and returns a <code>dispose</code> function.
        </li>
        <li>
          The server must use <code>hydratable: true</code>. This adds a{" "}
          <code>data-cj</code> attribute to elements and a few comments, which{" "}
          <code>hydrate()</code> removes again.
        </li>
        <li>
          <strong>The server and the browser must render the same thing</strong>
          : the same app, the same URL and the same data. Something that only
          the browser knows (the time, <code>window.innerWidth</code>, a value
          from <code>localStorage</code>) belongs in <code>onMount</code>,
          which does not run on the server.
        </li>
        <li>
          If they differ, <code>hydrate()</code> still ends with the page that
          the browser app describes. Text that differs is updated, elements that
          the server wrote and the app does not make are removed, and an
          element with another tag is replaced. In dev mode it warns about each
          difference.
        </li>
        <li>
          If the container has no hydration markers (or is empty),{" "}
          <code>hydrate()</code> does the same as <code>render()</code>.
        </li>
        <li>
          Browsers add a <code>{"<tbody>"}</code> when they read{" "}
          <code>{"<table><tr>"}</code>. Write the <code>{"<tbody>"}</code>{" "}
          yourself, so the server HTML and the app agree.
        </li>
      </ul>
      <Callout title="Resources are not sent to the browser yet">
        With <code>renderToStringAsync</code>, the browser does not get the
        data that the server loaded. It starts loading again, so content that
        depends on a resource shows its loading state and is filled in again.
        Hydration is experimental until this is solved.
      </Callout>
      <h2>Page title and meta tags</h2>
      <p>
        <code>{"<Title>"}</code> and <code>{"<Meta>"}</code> set the title and
        the meta tags. In the browser they change the document, and put things
        back when they are removed. On the server they fill an object that you
        pass in, and <code>headToString</code> turns it into HTML.
      </p>
      <Code
        code={`<Title>About | My site</Title>
<Meta name="description" content="What this site is about" />

// on the server
const head = {};
const html = await renderToStringAsync(() => <App />, { url: req.url, head });
const page = template
  .replace("<!--head-->", headToString(head))
  .replace("<!--app-->", html);`}
      />
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
