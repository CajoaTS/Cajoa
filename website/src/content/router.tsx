import { Code } from "../ui";

export function RouterPage() {
  return (
    <article>
      <h1>Router</h1>
      <Code
        code={`import { render, Router, Route, Outlet, NavLink, useParams } from "cajoa";

function Layout() {
  return (
    <div>
      <nav>
        <NavLink href="/" end>Home</NavLink>
        <NavLink href="/users/7">User 7</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}

const User = () => <h1>User {useParams().id}</h1>;

render(
  () => (
    <main>
      <Router>
        <Route path="/" component={Layout}>
          <Route path="" component={() => <h1>Home</h1>} />
          <Route path="users/:id" component={User} />
        </Route>
        <Route path="*" component={() => <h1>Not found</h1>} />
      </Router>
    </main>
  ),
  document.getElementById("app")!,
);`}
      />
      <ul>
        <li>
          Routes are matched in order, so put <code>path="*"</code> last. Child
          paths are relative to their parent, and <code>path=""</code> is the
          index route.
        </li>
        <li>
          <code>{"<Outlet />"}</code> renders the matching child route inside a
          layout. The layout stays alive while you move between its children.
        </li>
        <li>
          <code>useParams()</code> reads the path params. A route component is
          re-created when its own params change.
        </li>
        <li>
          <code>{"<NavLink>"}</code> adds an <code>active</code> class (
          <code>activeClass</code> changes it). Use <code>end</code> for an
          exact match.
        </li>
        <li>
          <code>{'<Navigate to="/login" />'}</code> redirects.{" "}
          <code>navigate(path, {"{ replace, scroll }"})</code> navigates from
          code. New pages scroll to the top, or to the <code>#hash</code>{" "}
          target.
        </li>
      </ul>

      <h2>Query string</h2>
      <Code
        code={`const [params, setParams] = useSearchParams();

params().get("q");
setParams({ q: "cajoa", page: null }); // null removes a key`}
      />
      <p>
        <code>useLocation()</code> returns a getter for{" "}
        <code>{"{ pathname, search, hash }"}</code>.
      </p>

      <h2>Base path</h2>
      <p>
        Serving the app from a sub-path? Use{" "}
        <code>{'<Router base="/my-app">'}</code>. With Vite, use{" "}
        <code>{"<Router base={import.meta.env.BASE_URL}>"}</code>. Keep writing
        app paths in <code>Link</code> and <code>navigate</code> without the
        base. This site does exactly that.
      </p>
      <p>
        Single-page apps need a server fallback to <code>index.html</code> for
        unknown paths.
      </p>
    </article>
  );
}
