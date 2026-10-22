import { test, expect } from "@playwright/test";

const BASE = "http://localhost:4174/sub";

test("an app served from a sub-path keeps the base in every url", async ({
  page,
}) => {
  await page.goto(`${BASE}/forms`);
  await expect(page.getByTestId("name")).toBeVisible();

  const link = page.getByRole("link", { name: "User 1" });
  await expect(link).toHaveAttribute("href", "/sub/users/1");

  await link.click();
  await expect(page).toHaveURL(`${BASE}/users/1`);
  await expect(page.getByTestId("user")).toHaveText("user 1");

  await page.reload();
  await expect(page.getByTestId("user")).toHaveText("user 1");
});
