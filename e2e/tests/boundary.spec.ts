import { test, expect } from "@playwright/test";

test("ErrorBoundary shows the fallback, logs the error in dev, and retry recovers", async ({
  page,
}) => {
  const logged: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && msg.text().includes("[cajoa]"))
      logged.push(msg.text());
  });

  await page.goto("/boundary");
  await expect(page.getByTestId("error-message")).toHaveText("kaboom");
  await expect(page.getByTestId("healthy")).toHaveCount(0);

  expect(logged).toHaveLength(1);
  expect(logged[0]).toContain("ErrorBoundary caught an error");

  await page.getByTestId("retry").click();
  await expect(page.getByTestId("healthy")).toBeVisible();
  await expect(page.getByTestId("fallback")).toHaveCount(0);
});
