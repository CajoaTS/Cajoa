import { test, expect, beforeEach } from "vitest";
import {
  createSignal,
  render,
  Router,
  Route,
  Link,
  navigate,
  useParams,
} from "cajoa";

beforeEach(() => navigate("/"));

const Home = () => <p>home</p>;
const About = () => <p>about</p>;
const User = () => <p>user {useParams().id}</p>;
const NotFound = () => <p>404</p>;

function mount() {
  const root = document.createElement("div");
  render(
    () => (
      <div>
        <nav>
          <Link href="/about">go</Link>
        </nav>
        <Router>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/users/:id" component={User} />
          <Route path="*" component={NotFound} />
        </Router>
      </div>
    ),
    root,
  );
  return root;
}

const page = (root: HTMLElement) => root.querySelector("p")!.textContent;

test("renders the matching route", () => {
  expect(page(mount())).toBe("home");
});

test("navigate switches the page", () => {
  const root = mount();
  navigate("/about");
  expect(page(root)).toBe("about");
});

test("reads params from the path", () => {
  const root = mount();
  navigate("/users/42");
  expect(page(root)).toBe("user 42");
});

test("wildcard route catches unknown paths", () => {
  const root = mount();
  navigate("/nope");
  expect(page(root)).toBe("404");
});

test("clicking a Link navigates without reloading", () => {
  const root = mount();
  root.querySelector("a")!.click();
  expect(location.pathname).toBe("/about");
  expect(page(root)).toBe("about");
});

test("signals read in a page do not re-create the page", () => {
  const [n, setN] = createSignal(0);
  let creates = 0;
  const Page = () => {
    creates++;
    n();
    return <p>page</p>;
  };

  const root = document.createElement("div");
  render(
    () => (
      <div>
        <Router>
          <Route path="/" component={Page} />
        </Router>
      </div>
    ),
    root,
  );

  setN(1);
  expect(creates).toBe(1);
});
