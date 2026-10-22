import {
  For,
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Router,
  createSignal,
  render,
  useParams,
  useSearchParams,
} from "cajoa";

// ---------- Layout ----------
let shellRenders = 0;

function Shell() {
  const renders = ++shellRenders;

  return (
    <div>
      <nav
        style={{
          position: "sticky",
          top: "0",
          background: "white",
          padding: "8px",
        }}
      >
        <NavLink href="/" end>
          Home
        </NavLink>{" "}
        <NavLink href="/forms">Forms</NavLink>{" "}
        <NavLink href="/lists">Lists</NavLink>{" "}
        <NavLink href="/svg">SVG</NavLink> <NavLink href="/long">Long</NavLink>{" "}
        <NavLink href="/search">Search</NavLink>{" "}
        <NavLink href="/users/1">User 1</NavLink>{" "}
        <NavLink href="/users/2">User 2</NavLink>{" "}
        <Link href="/long#bottom">Bottom</Link>{" "}
        <span data-testid="shell-renders">{renders}</span>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

// ---------- Pages ----------
const Home = () => <h1 data-testid="home">Home</h1>;
const NotFound = () => <h1 data-testid="not-found">Not found</h1>;

function FormsPage() {
  const [name, setName] = createSignal("");
  const [agree, setAgree] = createSignal(false);
  const [color, setColor] = createSignal("b");
  const [size, setSize] = createSignal(20);
  const [doubled, setDoubled] = createSignal(0);
  let nameField: HTMLInputElement | undefined;

  const reset = () => {
    setName("");
    setAgree(false);
    setColor("b");
    setSize(20);
  };

  return (
    <section>
      <input
        data-testid="name"
        ref={(el: HTMLInputElement) => (nameField = el)}
        value={name}
        onInput={(e: Event) => setName((e.target as HTMLInputElement).value)}
      />
      <button data-testid="focus-name" onClick={() => nameField?.focus()}>
        focus
      </button>
      <p data-testid="hello">Hello, {name() || "stranger"}!</p>

      <input
        data-testid="agree"
        type="checkbox"
        checked={agree}
        onChange={(e: Event) =>
          setAgree((e.target as HTMLInputElement).checked)
        }
      />
      <p data-testid="agree-text">{agree() ? "yes" : "no"}</p>

      <select
        data-testid="color"
        value={color}
        onChange={(e: Event) => setColor((e.target as HTMLSelectElement).value)}
      >
        <option value="a">A</option>
        <option value="b">B</option>
        <option value="c">C</option>
      </select>
      <p data-testid="color-text">{color()}</p>

      <input
        data-testid="size"
        type="range"
        min="10"
        max="40"
        value={size}
        onInput={(e: Event) =>
          setSize(Number((e.target as HTMLInputElement).value))
        }
      />
      <p
        data-testid="styled"
        style={{
          fontSize: `${size()}px`,
          color: agree() ? "rgb(0, 128, 0)" : "rgb(128, 128, 128)",
        }}
      >
        styled
      </p>

      <button data-testid="dbl" onDoubleClick={() => setDoubled((n) => n + 1)}>
        double-click me
      </button>
      <span data-testid="dbl-count">{doubled()}</span>

      <button data-testid="reset" onClick={reset}>
        reset
      </button>
    </section>
  );
}

interface Item {
  id: number;
  text: string;
}
let nextId = 4;

function ListPage() {
  const [items, setItems] = createSignal<Item[]>([
    { id: 1, text: "one" },
    { id: 2, text: "two" },
    { id: 3, text: "three" },
  ]);
  const prepend = () =>
    setItems((list) => [{ id: nextId++, text: "new" }, ...list]);

  return (
    <section>
      <ul>
        <For each={items()}>
          {(item: Item) => (
            <li data-testid={`item-${item.id}`}>
              <input
                aria-label={`item ${item.id}`}
                value={item.text}
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key === "Enter") prepend();
                }}
              />
            </li>
          )}
        </For>
      </ul>
      <button
        data-testid="reverse"
        onClick={() => setItems((list) => [...list].reverse())}
      >
        reverse
      </button>
      <p data-testid="count">{items().length}</p>
    </section>
  );
}

function SvgPage() {
  const [r, setR] = createSignal(20);

  return (
    <section>
      <svg data-testid="svg" width="160" height="160" viewBox="0 0 160 160">
        <circle
          data-testid="circle"
          cx="80"
          cy="80"
          r={r}
          fill="royalblue"
          stroke-width="3"
        />
      </svg>
      <button data-testid="grow" onClick={() => setR((v) => v + 20)}>
        grow
      </button>
    </section>
  );
}

function LongPage() {
  return (
    <section>
      <p>Top</p>
      <div style={{ height: "2000px" }} />
      <h2 id="bottom">Bottom</h2>
      <div style={{ height: "800px" }} />
    </section>
  );
}

function SearchPage() {
  const [params, setParams] = useSearchParams();

  return (
    <section>
      <input
        data-testid="q"
        value={params().get("q") ?? ""}
        onInput={(e: Event) =>
          setParams(
            { q: (e.target as HTMLInputElement).value || null },
            { replace: true },
          )
        }
      />
      <p data-testid="q-text">{params().get("q") ?? "none"}</p>
    </section>
  );
}

let userRenders = 0;

function UserPage() {
  const renders = ++userRenders;
  const params = useParams();

  return (
    <section>
      <p data-testid="user">user {params.id}</p>
      <span data-testid="user-renders">{renders}</span>
    </section>
  );
}

// ---------- App ----------
render(
  () => (
    <div>
      <Router base={import.meta.env.BASE_URL}>
        <Route path="/" component={Shell}>
          <Route path="" component={Home} />
          <Route path="forms" component={FormsPage} />
          <Route path="lists" component={ListPage} />
          <Route path="svg" component={SvgPage} />
          <Route path="long" component={LongPage} />
          <Route path="search" component={SearchPage} />
          <Route path="users/:id" component={UserPage} />
          <Route path="old" component={() => <Navigate to="/forms" />} />
        </Route>
        <Route path="*" component={NotFound} />
      </Router>
    </div>
  ),
  document.getElementById("app")!,
);
