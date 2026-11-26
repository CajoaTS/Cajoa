import { test, expect, type Page } from "@playwright/test";

declare global {
  interface Window {
    hydrateNow: () => void;
    __frameLoads: number;
    __fetches: number;
  }
}

// The page puts server HTML in the document and waits. The test acts on that HTML, then hydrates it.
async function openServerHtml(page: Page) {
  await page.goto("/hydrate.html");
  await expect(page.locator("body")).toHaveAttribute("data-phase", "server");
  // The <iframe> from the server HTML has loaded once
  await page.waitForFunction(() => window.__frameLoads === 1);
}

async function hydrateNow(page: Page) {
  await page.evaluate(() => window.hydrateNow());
  await expect(page.locator("body")).toHaveAttribute("data-phase", "browser");
}

test("the server HTML is readable before the app runs", async ({ page }) => {
  await openServerHtml(page);
  await expect(page.getByTestId("title")).toHaveText("Hello Ada");
  await expect(page.getByTestId("user")).toHaveText("Ada");
  await expect(page.getByTestId("list").locator("li")).toHaveCount(2);
});

test("hydrate keeps the elements and the typed text", async ({
  page,
}) => {
  await openServerHtml(page);
  await page.getByTestId("free-input").fill("typed before hydration");
  await page.evaluate(() => {
    document
      .querySelectorAll("[data-testid]")
      .forEach((element) => ((element as any).__same = true));
  });

  await hydrateNow(page);

  const allSame = await page.evaluate(() =>
    [...document.querySelectorAll("[data-testid]")].every(
      (element) => (element as any).__same === true,
    ),
  );
  expect(allSame).toBe(true);
  await expect(page.getByTestId("free-input")).toHaveValue(
    "typed before hydration",
  );
});

test("the page is interactive after hydrate", async ({ page }) => {
  await openServerHtml(page);
  await hydrateNow(page);

  await page.getByTestId("inc").click();
  await page.getByTestId("inc").click();
  await expect(page.getByTestId("inc")).toHaveText("count 2");

  await page.getByTestId("add").click();
  await expect(page.getByTestId("list").locator("li")).toHaveText([
    "one",
    "two",
    "item 3",
  ]);
});

test("resources start with the data from the server and do not load again", async ({
  page,
}) => {
  await openServerHtml(page);
  await hydrateNow(page);

  // The content is there at once: no loading state
  await expect(page.getByTestId("user")).toHaveText("Ada");
  await expect(page.getByTestId("fallback")).toHaveCount(0);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__fetches)).toBe(0);
});

test("hydrate does not reload an iframe, also inside nested blocks", async ({
  page,
}) => {
  await openServerHtml(page);
  await hydrateNow(page);
  await page.waitForTimeout(500);

  expect(await page.evaluate(() => window.__frameLoads)).toBe(1);
  await expect(page.getByTestId("frame")).toHaveCount(1);
});

test("nested blocks still update after hydrate", async ({ page }) => {
  await openServerHtml(page);
  await hydrateNow(page);

  await page.getByTestId("toggle-inner").click();
  await expect(page.getByTestId("frame")).toHaveCount(0);
  await expect(page.getByTestId("no-frame")).toHaveCount(1);

  await page.getByTestId("toggle-inner").click();
  await expect(page.getByTestId("frame")).toHaveCount(1);
  await expect(page.getByTestId("no-frame")).toHaveCount(0);

  await page.getByTestId("toggle-outer").click();
  await expect(page.getByTestId("frame")).toHaveCount(0);
  await expect(page.getByTestId("no-frame")).toHaveCount(0);
});
