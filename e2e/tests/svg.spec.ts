import { test, expect } from "@playwright/test";

test("svg renders in the SVG namespace and updates reactively", async ({
  page,
}) => {
  await page.goto("/svg");
  const circle = page.getByTestId("circle");

  expect(await circle.evaluate((el) => el.namespaceURI)).toBe(
    "http://www.w3.org/2000/svg",
  );

  const before = (await circle.boundingBox())!;
  expect(before.width).toBeGreaterThan(30);

  await page.getByTestId("grow").click();
  await expect
    .poll(async () => (await circle.boundingBox())!.width)
    .toBeGreaterThan(before.width);
});
