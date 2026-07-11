import { expect, test } from "@playwright/test";

test("interactive components expose native accessible controls", async ({ page }) => {
  await page.goto("/examples/classic-os.html");
  await expect(page.getByRole("button", { name: "Close" }).first()).toBeVisible();
  await expect(page.getByRole("progressbar").first()).toHaveAttribute("aria-valuenow");
  await page.goto("/examples/media-os.html");
  await expect(page.getByRole("toolbar", { name: "Desktop appearance" })).toBeVisible();
});

test("menu, carousel, and desktop keyboard interactions remain reachable", async ({ page }) => {
  await page.goto("/examples/media-os.html");
  const carousel = page.locator("gessi-carousel");
  await carousel.focus();
  await carousel.press("ArrowRight");
  await expect(carousel.getByRole("button", { name: "Next slide" })).toBeVisible();

  const menu = page.locator("gessi-menu[label]").first();
  if (await menu.count()) {
    const trigger = menu.getByRole("button");
    await trigger.focus();
    await trigger.press("ArrowDown");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await trigger.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  }

  await page.keyboard.press("F6");
  await expect(page.locator("gessi-window[active], gessi-dialog[active]").first()).toBeVisible();
});

test("dialog focus restores to its trigger", async ({ page }) => {
  await page.goto("/examples/product-os.html");
  const trigger = page.getByRole("button", { name: "Open settings" });
  if (!await trigger.count()) test.skip();
  await trigger.click();
  const dialog = page.locator("gessi-dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("content remains visible", async ({ page }) => {
    await page.goto("/examples/no-js.html");
    await expect(page.getByRole("heading", { name: "The content remains available" })).toBeVisible();
  });
});
