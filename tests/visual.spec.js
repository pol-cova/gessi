import { test } from "@playwright/test";

const styles = ["neo", "minimal", "retro", "old-tech", "classic-os"];

test.describe("visual baselines", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Visual baselines run in Chromium.");

  for (const style of styles) {
    test(`${style} desktop`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`/examples/index.html?style=${style}`);
      await page.screenshot({
        fullPage: true,
        path: testInfo.outputPath(`${style}-desktop.png`),
      });
    });
  }
});
