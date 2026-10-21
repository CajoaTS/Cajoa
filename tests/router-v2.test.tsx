import { test, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  Router,
  Route,
  Outlet,
  Link,
  NavLink,
  Navigate,
  navigate,
  useParams,
  useSearchParams,
} from "cajoa";

beforeEach(() => navigate("/"));
afterEach(() => navigate("/"));

test("nested routes render a layout with an Outlet and keep the layout alive", () => {
  let layoutCreated = 0;
  const Layout = () => {
    layoutCreated++;
    return (
      <section>
        <h1>layout</h1>
        <Outlet />
      </section>
    );
  };
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Router>
          <Route path="/" component={Layout}>
            <Route path="" component={() => <p>home</p>} />
            <Route path="about" component={() => <p>about</p>} />
          </Route>
        </Router>
      </div>
    ),
    root,
  );
  expect(root.textContent).toBe("layouthome");

  navigate("/about");
  expect(root.textContent).toBe("layoutabout");
  expect(layoutCreated).toBe(1);
});

test("params from every level are merged, and a route is re-created when its params change", () => {
  let userCreated = 0;
  const User = () => {
    userCreated++;
    return (
      <div>
        <b>{useParams().id}</b>
        <Outlet />
      </div>
    );
  };
  const Post = () => <i>{useParams().id + "-" + useParams().postId}</i>;
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Router>
          <Route path="users/:id" component={User}>
            <Route path="posts/:postId" component={Post} />
          </Route>
        </Router>
      </div>
    ),
    root,
  );

  navigate("/users/1/posts/9");
  expect(root.textContent).toBe("11-9");

  navigate("/users/1/posts/10");
  expect(root.textContent).toBe("11-10");
  expect(userCreated).toBe(1);

  navigate("/users/2/posts/10");
  expect(root.textContent).toBe("22-10");
  expect(userCreated).toBe(2);
});

test("a route without a component passes straight through to its children", () => {
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Router>
          <Route path="admin">
            <Route path="a" component={() => <p>a</p>} />
            <Route path="b" component={() => <p>b</p>} />
          </Route>
        </Router>
      </div>
    ),
    root,
  );

  navigate("/admin/a");
  expect(root.textContent).toBe("a");

  navigate("/admin/b");
  expect(root.textContent).toBe("b");
});

test("a trailing * collects the rest of the path", () => {
  const Docs = () => <p>{useParams()["*"]}</p>;
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Router>
          <Route path="/docs/*" component={Docs} />
        </Router>
      </div>
    ),
    root,
  );

  navigate("/docs/guide/intro");
  expect(root.textContent).toBe("guide/intro");
});

test("base path: the url, the router and the links all include the base", () => {
  history.replaceState(null, "", "/app/about");
  const root = document.createElement("div");

  const dispose = render(
    () => (
      <div>
        <nav>
          <Link href="/">home</Link>
        </nav>
        <Router base="/app">
          <Route path="/" component={() => <p>home</p>} />
          <Route path="/about" component={() => <p>about</p>} />
        </Router>
      </div>
    ),
    root,
  );

  expect(root.querySelector("p")!.textContent).toBe("about");
  expect(root.querySelector("a")!.getAttribute("href")).toBe("/app/");

  navigate("/");
  expect(location.pathname).toBe("/app/");
  expect(root.querySelector("p")!.textContent).toBe("home");

  dispose();
});

test("useSearchParams reads and writes the query without re-creating the page", () => {
  let renders = 0;
  let api!: ReturnType<typeof useSearchParams>;

  const Search = () => {
    renders++;
    api = useSearchParams();
    const [params] = api;
    return <p>{params().get("q") ?? "none"}</p>;
  };
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Router>
          <Route path="/search" component={Search} />
        </Router>
      </div>
    ),
    root,
  );

  navigate("/search?q=cajoa#top");
  expect(root.textContent).toBe("cajoa");

  const [, setParams] = api;
  setParams({ q: "x", page: 2 });
  expect(location.search).toBe("?q=x&page=2");
  expect(location.hash).toBe("#top");
  expect(root.textContent).toBe("x");
  expect(renders).toBe(1);

  setParams({ q: null });
  expect(location.search).toBe("?page=2");
  expect(root.textContent).toBe("none");
});

test("NavLink adds the active class (end means an exact match)", () => {
  const root = document.createElement("div");

  render(
    () => (
      <nav>
        <NavLink href="/" end>
          home
        </NavLink>
        <NavLink href="/docs">docs</NavLink>
      </nav>
    ),
    root,
  );
  const [home, docs] = Array.from(root.querySelectorAll("a"));

  expect(home.className).toBe("active");
  expect(docs.className).toBe("");

  navigate("/docs/intro");
  expect(home.className).toBe("");
  expect(docs.className).toBe("active");
});

test("Navigate redirects to another path", async () => {
  const root = document.createElement("div");

  render(
    () => (
      <div>
        <Router>
          <Route path="/old" component={() => <Navigate to="/new" />} />
          <Route path="/new" component={() => <p>new</p>} />
        </Router>
      </div>
    ),
    root,
  );

  navigate("/old");
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(location.pathname).toBe("/new");
  expect(root.textContent).toBe("new");
});

test("scrolls to the top on a new page, but not on a query change", () => {
  const spy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

  navigate("/a");
  expect(spy).toHaveBeenCalledWith(0, 0);

  spy.mockClear();
  navigate("/a?x=1");
  expect(spy).not.toHaveBeenCalled();

  spy.mockRestore();
});

test("scrolls to the element that matches the hash", () => {
  const target = document.createElement("div");
  target.id = "section";
  target.scrollIntoView = vi.fn();
  document.body.append(target);

  navigate("/page#section");
  expect(target.scrollIntoView).toHaveBeenCalled();

  target.remove();
});
