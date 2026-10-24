import { test, expect } from "@playwright/test";

test("Switch and Match show the branch that matches", async ({ page }) => {
  await page.goto("/flow");
  const text = page.getByTestId("state-text");
  await expect(text).toHaveText("nothing happening");

  await page.getByTestId("state").selectOption("busy");
  await expect(text).toHaveText("working…");

  await page.getByTestId("state").selectOption("failed");
  await expect(text).toHaveText("unknown");
});

test("Dynamic switches the element type", async ({ page }) => {
  await page.goto("/flow");
  const h2 = page.getByRole("heading", { level: 2, name: "dynamic heading" });
  const h3 = page.getByRole("heading", { level: 3, name: "dynamic heading" });

  await expect(h2).toBeVisible();
  await page.getByTestId("toggle-tag").click();
  await expect(h3).toBeVisible();
  await expect(h2).toHaveCount(0);
});

test("Portal renders outside the app root and is removed on close", async ({
  page,
}) => {
  await page.goto("/flow");
  const modal = page.getByTestId("modal");
  await expect(modal).toHaveCount(0);

  await page.getByTestId("open").click();
  await expect(modal).toBeVisible();
  expect(await modal.evaluate((el) => el.parentElement?.tagName)).toBe("BODY");

  await page.getByTestId("close").click();
  await expect(modal).toHaveCount(0);
});

test("lazy and Suspense show the fallback, then the panel", async ({
  page,
}) => {
  await page.goto("/flow");
  await expect(page.getByTestId("lazy-fallback")).toBeVisible();
  await expect(page.getByTestId("lazy-panel")).toHaveCount(0);

  await expect(page.getByTestId("lazy-panel")).toHaveText("panel: hello");
  await expect(page.getByTestId("lazy-fallback")).toHaveCount(0);
});
