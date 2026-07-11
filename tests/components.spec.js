import { expect, test } from "@playwright/test";

const examples = [
  "/examples/standalone.html",
  "/examples/no-js.html",
  "/examples/product-os.html",
  "/examples/classic-os.html",
  "/examples/media-os.html",
  "/examples/custom-theme.html",
];

for (const path of examples) {
  test(`loads ${path}`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(path);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("gessi-desktop, gessi-window, main").first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("desktop windows stay within their desktop surface when dragged", async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 720 });
  await page.goto("/examples/product-os.html");
  const window = page.locator("gessi-window").first();
  const title = window.locator(".gs-window-titlebar");
  await title.dragTo(page.locator("gessi-desktop"), {
    sourcePosition: { x: 12, y: 12 },
    targetPosition: { x: 940, y: 30 },
  });
  const bounds = await window.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const desktop = element.closest("gessi-desktop").getBoundingClientRect();
    return {
      left: box.left - desktop.left,
      top: box.top - desktop.top,
      right: box.right - desktop.left,
      bottom: box.bottom - desktop.top,
      width: desktop.width,
      height: desktop.height,
    };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.top).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(bounds.width);
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.height);
});

test("media effects and carousel controls are available", async ({ page }) => {
  await page.goto("/examples/media-os.html");
  await expect(page.locator("gessi-media img").first()).toBeVisible();
  const next = page.getByRole("button", { name: "Next slide" });
  await expect(next).toBeVisible();
  await next.click();
});
