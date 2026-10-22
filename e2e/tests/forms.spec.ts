import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/forms");
});

test("typing updates the page and keeps the caret in place", async ({
  page,
}) => {
  const name = page.getByTestId("name");

  await name.pressSequentially("abc");
  await expect(page.getByTestId("hello")).toHaveText("Hello, abc!");

  await name.press("Home");
  await name.press("ArrowRight");
  await name.pressSequentially("XY");
  await expect(name).toHaveValue("aXYbc");
});

test("checkbox, select, range and style stay in sync with their signals", async ({
  page,
}) => {
  const agree = page.getByTestId("agree");
  const color = page.getByTestId("color");
  const styled = page.getByTestId("styled");

  await expect(color).toHaveValue("b");
  await expect(styled).toHaveCSS("font-size", "20px");

  await agree.check();
  await expect(page.getByTestId("agree-text")).toHaveText("yes");
  await expect(styled).toHaveCSS("color", "rgb(0, 128, 0)");

  await color.selectOption("c");
  await expect(page.getByTestId("color-text")).toHaveText("c");

  await page.getByTestId("size").evaluate((el: HTMLInputElement) => {
    el.value = "30";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(styled).toHaveCSS("font-size", "30px");

  await page.getByTestId("name").fill("typed");
  await page.getByTestId("reset").click();

  await expect(agree).not.toBeChecked();
  await expect(color).toHaveValue("b");
  await expect(page.getByTestId("name")).toHaveValue("");
  await expect(styled).toHaveCSS("font-size", "20px");
});

test("onDoubleClick listens to dblclick and ref gives access to the element", async ({
  page,
}) => {
  await page.getByTestId("dbl").dblclick();
  await expect(page.getByTestId("dbl-count")).toHaveText("1");

  await page.getByTestId("focus-name").click();
  await expect(page.getByTestId("name")).toBeFocused();
});
