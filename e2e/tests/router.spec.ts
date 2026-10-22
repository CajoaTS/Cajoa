import { test, expect } from "@playwright/test";

test("a nested layout stays alive while child routes change", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("home")).toBeVisible();
  await expect(page.getByTestId("shell-renders")).toHaveText("1");

  await page.getByRole("link", { name: "Forms" }).click();
  await expect(page).toHaveURL(/\/forms$/);
  await expect(page.getByTestId("name")).toBeVisible();
  await expect(page.getByTestId("shell-renders")).toHaveText("1");
});

test("a route is re-created when its params change", async ({ page }) => {
  await page.goto("/users/1");
  await expect(page.getByTestId("user")).toHaveText("user 1");
  await expect(page.getByTestId("user-renders")).toHaveText("1");

  await page.getByRole("link", { name: "User 2" }).click();
  await expect(page.getByTestId("user")).toHaveText("user 2");
  await expect(page.getByTestId("user-renders")).toHaveText("2");
  await expect(page.getByTestId("shell-renders")).toHaveText("1");
});

test("back and forward buttons keep the page in sync", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Forms" }).click();
  await page.getByRole("link", { name: "User 1" }).click();
  await expect(page.getByTestId("user")).toBeVisible();

  await page.goBack();
  await expect(page.getByTestId("name")).toBeVisible();

  await page.goBack();
  await expect(page.getByTestId("home")).toBeVisible();

  await page.goForward();
  await expect(page.getByTestId("name")).toBeVisible();
});

test("the query string is the source of truth", async ({ page }) => {
  await page.goto("/search");
  await page.getByTestId("q").fill("cajoa");
  await expect(page).toHaveURL(/\/search\?q=cajoa$/);
  await expect(page.getByTestId("q-text")).toHaveText("cajoa");

  await page.reload();
  await expect(page.getByTestId("q")).toHaveValue("cajoa");
  await expect(page.getByTestId("q-text")).toHaveText("cajoa");
});

test("NavLink marks the current page", async ({ page }) => {
  await page.goto("/");
  const home = page.getByRole("link", { name: "Home" });
  const forms = page.getByRole("link", { name: "Forms" });

  await expect(home).toHaveClass(/active/);
  await expect(forms).not.toHaveClass(/active/);

  await forms.click();
  await expect(forms).toHaveClass(/active/);
  await expect(home).not.toHaveClass(/active/);
});

test("Navigate redirects and unknown paths show the not-found page", async ({
  page,
}) => {
  await page.goto("/old");
  await expect(page).toHaveURL(/\/forms$/);

  await page.goto("/nope");
  await expect(page.getByTestId("not-found")).toBeVisible();
});

test("a new page scrolls to the top", async ({ page }) => {
  await page.goto("/long");
  await page.evaluate(() => window.scrollTo(0, 800));
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(500);

  await page.getByRole("link", { name: "Forms" }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("a hash link scrolls to its target", async ({ page }) => {
  await page.goto("/long");
  await page.getByRole("link", { name: "Bottom" }).click();
  await expect(page.locator("#bottom")).toBeInViewport();
});
