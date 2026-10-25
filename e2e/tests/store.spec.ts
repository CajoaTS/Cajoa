import { test, expect } from "@playwright/test";

test("a store drives the list: add, toggle and remove", async ({ page }) => {
  await page.goto("/store");
  const items = page.getByTestId("todo");
  const summary = page.getByTestId("summary");

  await expect(items).toHaveCount(3);
  await expect(summary).toHaveText("2 left");

  await page.getByTestId("todo-input").fill("review");
  await page.getByTestId("todo-input").press("Enter");
  await expect(items).toHaveCount(4);
  await expect(summary).toHaveText("3 left");

  await page.getByLabel("done learn").check();
  await expect(summary).toHaveText("2 left");
  await expect(items.first().locator("span")).toHaveClass("done");

  await page.getByLabel("remove build").click();
  await expect(items).toHaveCount(3);
  await expect(summary).toHaveText("1 left");
});

test("editing an item in the store keeps its DOM node", async ({ page }) => {
  await page.goto("/store");
  await page.evaluate(() => {
    (window as any).firstTodo = document.querySelector('[data-testid="todo"]');
  });

  await page.getByLabel("done learn").check();
  await expect(page.getByTestId("summary")).toHaveText("1 left");

  const sameNode = await page.evaluate(
    () =>
      document.querySelector('[data-testid="todo"]') ===
      (window as any).firstTodo,
  );
  expect(sameNode).toBe(true);
});

test("an event handler is batched: two updates, one effect run", async ({
  page,
}) => {
  await page.goto("/store");
  await expect(page.getByTestId("batch-runs")).toHaveText("1");

  await page.getByTestId("bump").click();
  await expect(page.getByTestId("batch-runs")).toHaveText("2");
});
