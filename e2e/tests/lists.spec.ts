import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lists");
});

test("keyed For keeps the focus and the typed text when the list changes", async ({
  page,
}) => {
  const two = page.getByLabel("item 2");

  await two.fill("two!");
  await two.press("Enter");

  await expect(page.getByTestId("count")).toHaveText("4");
  await expect(two).toBeFocused();
  await expect(two).toHaveValue("two!");
  await expect(page.locator("li").first().getByRole("textbox")).toHaveValue(
    "new",
  );
});

test("reversing the list reuses the same DOM nodes", async ({ page }) => {
  await page.evaluate(() => {
    (window as any).firstItem = document.querySelector(
      '[data-testid="item-1"]',
    );
  });

  await page.getByTestId("reverse").click();
  await expect(page.locator("li").first()).toHaveAttribute(
    "data-testid",
    "item-3",
  );

  const sameNode = await page.evaluate(
    () =>
      document.querySelector('[data-testid="item-1"]') ===
      (window as any).firstItem,
  );
  expect(sameNode).toBe(true);
});
