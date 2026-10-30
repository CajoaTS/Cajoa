import { Route, Router } from "cajoa";
import { Landing } from "./content/landing";
import { DocsLayout, NotFound, SiteLayout } from "./layout";
import { pages } from "./pages";

// Built outside the JSX on purpose: <Route> reads its children as a list of routes,
// and the compiler would wrap a call like pages.map() in a function.
const docsRoutes = [
  Route({ path: "", component: pages[0].component }),
  ...pages.map((page) => Route({ path: page.slug, component: page.component })),
];

export function App() {
  return (
    <div class="app">
      <Router base={import.meta.env.BASE_URL}>
        <Route path="/" component={SiteLayout}>
          <Route path="" component={Landing} />
          <Route path="docs" component={DocsLayout}>
            {docsRoutes}
          </Route>
          <Route path="*" component={NotFound} />
        </Route>
      </Router>
    </div>
  );
}
