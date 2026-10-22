import { test, expect } from "@playwright/test";

const routes = [
  "/",
  "/forms",
  "/lists",
  "/svg",
  "/long",
  "/search",
  "/users/1",
  "/old",
];

for (const route of routes) {
  test(`no page errors or cajoa warnings on ${route}`, async ({ page }) => {
    const problems: string[] = [];

    page.on("pageerror", (error) =>
      problems.push(`pageerror: ${error.message}`),
    );
    page.on("console", (msg) => {
      const type = msg.type();
      if (
        (type === "warning" || type === "error") &&
        msg.text().includes("[cajoa]")
      ) {
        problems.push(msg.text());
      }
    });

    await page.goto(route);
    await expect(page.getByRole("navigation")).toBeVisible();

    expect(problems).toEqual([]);
  });
}
