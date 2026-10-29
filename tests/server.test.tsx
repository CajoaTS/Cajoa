import { test, expect, vi } from "vitest";
import { domRenderer } from "@cajoa/dom";
import {
  createResource,
  createSignal,
  currentRenderer,
  ErrorBoundary,
  For,
  isServer,
  Link,
  Navigate,
  NavLink,
  onMount,
  Route,
  Router,
  Show,
  Suspense,
  useParams,
} from "cajoa";
import { renderToString, renderToStringAsync } from "@cajoa/server";

const plain = { hydratable: false };
const later = <T,>(value: T, ms = 5) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

test("renders elements and escapes text and attributes", () => {
  const html = renderToString(
    () => (
      <div class="a" id={'x"y'}>
        {"<b>&"}
      </div>
    ),
    plain,
  );
  expect(html).toBe('<div class="a" id="x&quot;y">&lt;b&gt;&amp;</div>');
});

test("void elements, boolean attributes, style objects and attribute names", () => {
  const html = renderToString(
    () => (
      <form>
        <input type="checkbox" checked disabled />
        <label htmlFor="a" className="b">
          x
        </label>
        <div style={{ backgroundColor: "red", fontSize: "12px" }}>y</div>
        <br />
      </form>
    ),
    plain,
  );
  expect(html).toBe(
    '<form><input type="checkbox" checked disabled><label for="a" class="b">x</label><div style="background-color:red;font-size:12px">y</div><br></form>',
  );
});

test("events and refs are skipped", () => {
  const ref = vi.fn();
  const html = renderToString(
    () => (
      <button onClick={() => {}} ref={ref}>
        go
      </button>
    ),
    plain,
  );
  expect(html).toBe("<button>go</button>");
  expect(ref).not.toHaveBeenCalled();
});

test("signals, Show and For render their current value", () => {
  const [name] = createSignal("Ada");
  const [items] = createSignal(["a", "b"]);
  const html = renderToString(
    () => (
      <div>
        <p>Hello {name()}</p>
        <Show when={name()} fallback={<i>none</i>}>
          <b>{name()}</b>
        </Show>
        <ul>
          <For each={items}>{(s: string) => <li>{s}</li>}</For>
        </ul>
      </div>
    ),
    plain,
  );
  expect(html).toBe(
    "<div><p>Hello Ada</p><b>Ada</b><ul><li>a</li><li>b</li></ul></div>",
  );
});

test("the output has markers for hydration unless you turn them off", () => {
  const [name] = createSignal("Ada");
  expect(renderToString(() => <p>Hello {name()}</p>)).toBe(
    "<p>Hello <!--$-->Ada<!--$--></p>",
  );
  expect(
    renderToString(() => (
      <p>
        {"a"}
        {"b"}
      </p>
    )),
  ).toBe("<p>a<!--|-->b</p>");
});

test("select and textarea values", () => {
  const html = renderToString(
    () => (
      <div>
        <select value="b">
          <option value="a">A</option>
          <option value="b">B</option>
        </select>
        <textarea value="hi" />
      </div>
    ),
    plain,
  );
  expect(html).toBe(
    '<div><select><option value="a">A</option><option value="b" selected>B</option></select><textarea>hi</textarea></div>',
  );
});

test("SVG attribute names", () => {
  const html = renderToString(
    () => (
      <svg viewBox="0 0 10 10">
        <circle strokeWidth="2" r="4" />
      </svg>
    ),
    plain,
  );
  expect(html).toBe(
    '<svg viewBox="0 0 10 10"><circle stroke-width="2" r="4"></circle></svg>',
  );
});

test("onMount does not run on the server, and isServer() is true while rendering", async () => {
  let mounted = false;
  let inside = false;

  renderToString(() => {
    inside = isServer();
    onMount(() => {
      mounted = true;
    });
    return <p>x</p>;
  }, plain);

  await Promise.resolve();
  await Promise.resolve();
  expect(inside).toBe(true);
  expect(mounted).toBe(false);
  expect(isServer()).toBe(false);
  expect(currentRenderer()).toBe(domRenderer);
});

test("an error is thrown, unless an ErrorBoundary catches it", () => {
  const Boom = () => {
    throw new Error("boom");
  };

  expect(() =>
    renderToString(() => (
      <div>
        <Boom />
      </div>
    )),
  ).toThrow("boom");

  const html = renderToString(
    () => (
      <div>
        <ErrorBoundary fallback={() => <p>oops</p>}>
          <Boom />
        </ErrorBoundary>
      </div>
    ),
    plain,
  );
  expect(html).toBe("<div><p>oops</p></div>");
});

function User() {
  const [name] = createResource(() => later("Ada"));
  return <p>{name()}</p>;
}

test("renderToString does not wait, renderToStringAsync does", async () => {
  const app = () => (
    <div>
      <User />
    </div>
  );
  expect(renderToString(app, plain)).toBe("<div><p></p></div>");
  expect(await renderToStringAsync(app, plain)).toBe("<div><p>Ada</p></div>");
});

test("Suspense shows its fallback until the resources inside are ready", async () => {
  const app = () => (
    <div>
      <Suspense fallback={<i>loading</i>}>
        <User />
      </Suspense>
    </div>
  );
  expect(renderToString(app, plain)).toBe("<div><i>loading</i></div>");
  expect(await renderToStringAsync(app, plain)).toBe("<div><p>Ada</p></div>");
});

function Profile(props: { id: string }) {
  const [bio] = createResource(() => later(props.id + "!"));
  return <b>{bio()}</b>;
}

function Account() {
  const [id] = createResource(() => later("x"));
  return (
    <div>
      <Show when={id()}>
        <Profile id={id() as string} />
      </Show>
    </div>
  );
}

test("resources that start after others finish are awaited too", async () => {
  expect(await renderToStringAsync(() => <Account />, plain)).toBe(
    "<div><b>x!</b></div>",
  );
});

test("renderToStringAsync gives up after the timeout", async () => {
  const Stuck = () => {
    const [data] = createResource(() => new Promise<string>(() => {}));
    return <p>{data()}</p>;
  };
  await expect(
    renderToStringAsync(() => <Stuck />, { ...plain, timeout: 30 }),
  ).rejects.toThrow(/timed out/);
  expect(currentRenderer()).toBe(domRenderer);
});

function Home() {
  return <h1>home</h1>;
}
function UserPage() {
  return <h1>user {useParams().id}</h1>;
}
const routed = () => (
  <main>
    <Router>
      <Route path="/" component={Home} />
      <Route path="users/:id" component={UserPage} />
    </Router>
  </main>
);

test("the router reads the url of the request", () => {
  expect(renderToString(routed, { url: "/", ...plain })).toBe(
    "<main><h1>home</h1></main>",
  );
  expect(renderToString(routed, { url: "/users/42?tab=x", ...plain })).toBe(
    "<main><h1>user 42</h1></main>",
  );
});

function Slow(props: { label: string }) {
  const [x] = createResource(() => later(props.label, 10));
  return <p>{x()}</p>;
}

test("two requests at the same time do not mix", async () => {
  const app = () => (
    <main>
      <Router>
        <Route path="a" component={() => <Slow label="A" />} />
        <Route path="b" component={() => <Slow label="B" />} />
      </Router>
    </main>
  );

  const [a, b] = await Promise.all([
    renderToStringAsync(app, { url: "/a", ...plain }),
    renderToStringAsync(app, { url: "/b", ...plain }),
  ]);
  expect(a).toBe("<main><p>A</p></main>");
  expect(b).toBe("<main><p>B</p></main>");
  expect(currentRenderer()).toBe(domRenderer);
});

test("Navigate asks the server for a redirect, with the base path", () => {
  const app = () => (
    <main>
      <Router base="/app">
        <Route path="secret" component={() => <Navigate to="/login" />} />
      </Router>
    </main>
  );
  const redirects: Array<[string, number]> = [];

  const html = renderToString(app, {
    url: "/app/secret",
    ...plain,
    onRedirect: (to, status) => redirects.push([to, status]),
  });

  expect(redirects).toEqual([["/app/login", 302]]);
  expect(html).toBe("<main></main>");
});

test("links get the base path, and NavLink knows the current page", () => {
  const app = () => (
    <nav>
      <Router base="/app">
        <Route
          path="about"
          component={() => (
            <div>
              <Link href="/about">About</Link>
              <NavLink href="/about" class="nav">
                About
              </NavLink>
            </div>
          )}
        />
      </Router>
    </nav>
  );

  expect(renderToString(app, { url: "/app/about", ...plain })).toBe(
    '<nav><div><a href="/app/about">About</a><a class="nav active" href="/app/about">About</a></div></nav>',
  );
});
