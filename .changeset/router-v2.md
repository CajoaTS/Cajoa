---
"@cajoa/dom": minor
---

Router v2: nested routes with layouts and `<Outlet />`, a `base` path for apps served from a sub-path, query and hash support (`useLocation`, `useSearchParams`), `<NavLink>` with an active class, `<Navigate>` redirects, and a trailing `*` wildcard (`docs/*`). Navigating to a new page now scrolls to the top (or to the `#hash` target); pass `scroll: false` to `navigate` to opt out. A route component is re-created when its path params change.
