import { createEffect, isServer, Link, NavLink, Outlet, usePath } from "cajoa";
import { groups, pages, routeMeta } from "./pages";

export function SiteLayout() {
  const path = usePath();

  // The prerender script sets the title on the server. This keeps it right while you browse.
  createEffect(() => {
    if (isServer()) return;
    const current = path().replace(/\/+$/, "") || "/";
    document.title =
      routeMeta.find((r) => r.path === current)?.title ??
      "Page not found | Cajoa";
  });

  return (
    <div class="site">
      <header class="site-header">
        <Link href="/" class="brand">
          Cajoa
        </Link>
        <nav aria-label="Main">
          <NavLink href="/docs">Docs</NavLink>
          <a href="https://github.com/CajoaTS/Cajoa" rel="noopener">
            GitHub
          </a>
          <a href="https://www.npmjs.com/package/cajoa" rel="noopener">
            npm
          </a>
        </nav>
      </header>
      <Outlet />
      <footer class="site-footer">
        Cajoa is open source (Apache-2.0). This site is built with Cajoa.
      </footer>
    </div>
  );
}

export function DocsLayout() {
  return (
    <div class="docs">
      <aside class="sidebar">
        <nav aria-label="Docs">
          {groups.map((group) => (
            <div class="nav-group">
              <h4>{group}</h4>
              {pages
                .filter((page) => page.group === group)
                .map((page) => (
                  <NavLink href={"/docs/" + page.slug}>{page.title}</NavLink>
                ))}
            </div>
          ))}
        </nav>
      </aside>
      <main class="content">
        <Outlet />
      </main>
    </div>
  );
}

export function NotFound() {
  return (
    <main class="not-found">
      <h1>Page not found</h1>
      <p>This page does not exist.</p>
      <Link href="/" class="button primary">
        Back to the home page
      </Link>
    </main>
  );
}
