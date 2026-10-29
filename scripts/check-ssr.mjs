import assert from "node:assert/strict";

assert.equal(typeof window, "undefined", "this check must run without a DOM");
assert.equal(typeof document, "undefined", "this check must run without a DOM");

const {
  h,
  createSignal,
  createResource,
  For,
  Router,
  Route,
  Navigate,
  useParams,
  isServer,
} = await import("cajoa");
const { renderToString, renderToStringAsync } = await import("cajoa/server");

const [name] = createSignal("Ada");
const page = () =>
  h(
    "div",
    { class: "box", id: 'a"b' },
    h("p", null, "Hello ", () => name()),
    h("ul", null, For({ each: ["x", "y"], children: (s) => h("li", null, s) })),
  );

assert.equal(
  renderToString(page, { hydratable: false }),
  '<div class="box" id="a&quot;b"><p>Hello Ada</p><ul><li>x</li><li>y</li></ul></div>',
);
assert.equal(
  renderToString(() => h("p", null, "Hi ", () => name())),
  "<p>Hi <!--$-->Ada<!--$--></p>",
);

const slow = () => {
  const [data] = createResource(
    () => new Promise((resolve) => setTimeout(() => resolve("loaded"), 5)),
  );
  return h("p", null, () => data());
};
assert.equal(
  await renderToStringAsync(slow, { hydratable: false }),
  "<p>loaded</p>",
);

const Home = () => h("h1", null, "home");
const User = () => h("h1", null, "user ", () => useParams().id);
const Secret = () => Navigate({ to: "/login" });
const app = () =>
  h(
    "main",
    null,
    Router({
      children: [
        Route({ path: "/", component: Home }),
        Route({ path: "users/:id", component: User }),
        Route({ path: "secret", component: Secret }),
      ],
    }),
  );

assert.equal(
  renderToString(app, { url: "/users/42", hydratable: false }),
  "<main><h1>user 42</h1></main>",
);

let redirect;
renderToString(app, {
  url: "/secret",
  onRedirect: (to, status) => (redirect = { to, status }),
});
assert.deepEqual(redirect, { to: "/login", status: 302 });

let inside;
renderToString(() => {
  inside = isServer();
  return h("i", null);
});
assert.equal(inside, true);
assert.equal(isServer(), false);

console.log("SSR check passed (plain Node, no DOM).");
