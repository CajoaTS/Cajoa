import { test, expect } from "@playwright/test";

test("loads data and shows the loading state", async ({ page }) => {
  await page.goto("/data");
  await expect(page.getByTestId("status")).toHaveText("loading");
  await expect(page.getByTestId("user")).toHaveText("-");

  await expect(page.getByTestId("status")).toHaveText("ready");
  await expect(page.getByTestId("user")).toHaveText("user-1");
});

test("a newer request wins when the source changes quickly", async ({
  page,
}) => {
  await page.goto("/data");
  await expect(page.getByTestId("user")).toHaveText("user-1");

  await page.getByTestId("next").click();
  await page.getByTestId("next").click();

  await expect(page.getByTestId("user")).toHaveText("user-3");
  await expect(page.getByTestId("status")).toHaveText("ready");
  await expect(page.getByTestId("fetch-count")).toHaveText("3");
});

test("a failed request is shown by the ErrorBoundary and retry recovers", async ({
  page,
}) => {
  await page.goto("/data");
  await expect(page.getByTestId("user")).toHaveText("user-1");

  await page.getByTestId("jump").click();
  await expect(page.getByTestId("data-error")).toHaveText("unlucky");

  await page.getByTestId("data-retry").click();
  await expect(page.getByTestId("user")).toHaveText("user-1");
  await expect(page.getByTestId("data-error")).toHaveCount(0);
});

test("refetch loads the same data again", async ({ page }) => {
  await page.goto("/data");
  await expect(page.getByTestId("user")).toHaveText("user-1");
  await expect(page.getByTestId("fetch-count")).toHaveText("1");

  await page.getByTestId("refetch").click();
  await expect(page.getByTestId("status")).toHaveText("loading");
  await expect(page.getByTestId("status")).toHaveText("ready");
  await expect(page.getByTestId("fetch-count")).toHaveText("2");
});
