import {
  createEffect,
  createMemo,
  createSignal,
  isServer,
  Link,
  NavLink,
  Outlet,
  usePath,
} from "cajoa";
import { Icon } from "./icons";
import { Palette, SearchButton } from "./palette";
import { groups, pages, routeMeta, type Page } from "./pages";
import { asset, REPO } from "./site";
import { ThemeToggle } from "./theme";
import { Toc } from "./toc";

function Brand() {
  return (
    <Link href="/" class="brand" aria-label="Cajoa home">
      <img class="logo logo-for-light" src={asset("logo.png")} alt="" width="30" height="30" />
      <img class="logo logo-for-dark" src={asset("logo-light.png")} alt="" width="30" height="30" />
      <span>Cajoa</span>
    </Link>
  );
}

function Footer() {
  return (
    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <Brand />
          <p class="footer-blurb">
            A small, typed frontend framework built on signals and JSX. Open source under Apache-2.0.
          </p>
        </div>
        <div>
          <h4>Learn</h4>
          <Link href="/docs/getting-started">Getting started</Link>
          <Link href="/docs/reactivity">Reactivity</Link>
          <Link href="/docs/router">Router</Link>
          <Link href="/docs/api">API reference</Link>
        </div>
        <div>
          <h4>Project</h4>
          <a href={REPO} rel="noopener">
            GitHub
          </a>
          <a href={REPO + "/releases"} rel="noopener">
            Releases
          </a>
          <a href={REPO + "/issues"} rel="noopener">
            Issues
          </a>
          <a href="https://www.npmjs.com/package/cajoa" rel="noopener">
            npm
          </a>
        </div>
      </div>
      <p class="footer-bottom">
        This site is built with Cajoa and prerendered with its own server renderer.
      </p>
    </footer>
  );
}

export function SiteLayout() {
  const path = usePath();
  const [searchOpen, setSearchOpen] = createSignal(false);

  // The prerender script sets the title on the server. This keeps it right while you browse.
  createEffect(() => {
    if (isServer()) return;
    const current = path().replace(/\/+$/, "") || "/";
    document.title = routeMeta.find((r) => r.path === current)?.title ?? "Page not found | Cajoa";
  });

  return (
    <div class="site">
      <a class="skip" href="#main">
        Skip to content
      </a>
      <header class="site-header">
        <div class="header-inner">
          <Brand />
          <nav class="header-nav" aria-label="Main">
            <NavLink href="/docs">Docs</NavLink>
            <a href={REPO + "/releases"} rel="noopener">
              Releases
            </a>
            <a href={REPO} rel="noopener">
              GitHub
            </a>
          </nav>
          <div class="header-actions">
            <SearchButton onOpen={() => setSearchOpen(true)} />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <Palette open={searchOpen} setOpen={setSearchOpen} />
      <Outlet />
      <Footer />
    </div>
  );
}

function pagerLink(page: Page | undefined, side: "prev" | "next") {
  if (!page) return <span />;
  return (
    <Link href={"/docs/" + page.slug} class={"pager-link " + side}>
      <span class="pager-label">{side === "prev" ? "\u2190 Previous" : "Next \u2192"}</span>
      <strong>{page.title}</strong>
    </Link>
  );
}

export function DocsLayout() {
  const path = usePath();
  const [menuOpen, setMenuOpen] = createSignal(false);

  const index = createMemo(() => {
    const current = path().replace(/\/+$/, "");
    return current === "/docs" ? 0 : pages.findIndex((page) => "/docs/" + page.slug === current);
  });
  const current = () => pages[index()];

  // Close the mobile menu after every page change
  createEffect(() => {
    path();
    setMenuOpen(false);
  });

  return (
    <div class="docs">
      <button
        class="docs-menu"
        aria-expanded={() => (menuOpen() ? "true" : "false")}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <Icon name="menu" size={16} />
        <span>Menu</span>
      </button>
      <aside class={() => (menuOpen() ? "sidebar open" : "sidebar")}>
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
      <main id="main" class="content">
        <p class="eyebrow">{() => current()?.group}</p>
        <Outlet />
        <a
          class="edit-link"
          rel="noopener"
          href={() =>
            REPO + "/edit/main/website/src/content/" + (current()?.slug ?? "getting-started") + ".tsx"
          }
        >
          Edit this page on GitHub
        </a>
        <nav class="pager" aria-label="Previous and next page">
          {() => pagerLink(pages[index() - 1], "prev")}
          {() => pagerLink(pages[index() + 1], "next")}
        </nav>
      </main>
      <Toc path={path} />
    </div>
  );
}

export function NotFound() {
  return (
    <main id="main" class="not-found">
      <img class="logo-big logo-for-light" src={asset("logo.png")} alt="" width="96" height="96" />
      <img class="logo-big logo-for-dark" src={asset("logo-light.png")} alt="" width="96" height="96" />
      <h1>Page not found</h1>
      <p>This page does not exist, or it moved.</p>
      <div class="actions">
        <Link href="/" class="button primary">
          Back home
        </Link>
        <Link href="/docs" class="button">
          Read the docs
        </Link>
      </div>
    </main>
  );
}