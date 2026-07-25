import { expect, test } from "@playwright/test";

function parseRgb(color) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
  };
}

function isNear(color, target, tolerance = 8) {
  const rgb = parseRgb(color);
  if (!rgb) return false;
  return (
    Math.abs(rgb.r - target.r) <= tolerance
    && Math.abs(rgb.g - target.g) <= tolerance
    && Math.abs(rgb.b - target.b) <= tolerance
  );
}

test.describe("first paint without enhancement", () => {
  test("html background is neutral when a desktop is present", async ({ page }) => {
    await page.goto("/examples/ssr-desktop-nojs.html");
    const htmlBackground = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
    expect(isNear(htmlBackground, { r: 17, g: 17, b: 17 })).toBeTruthy();
    expect(isNear(htmlBackground, { r: 255, g: 243, b: 248 })).toBeFalsy();
  });

  test("declared desktop theme attributes paint before gessi.js", async ({ page }) => {
    await page.goto("/examples/ssr-desktop-nojs.html");
    const desktopStyles = await page.locator("gessi-desktop").evaluate((node) => {
      const styles = getComputedStyle(node);
      return {
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        borderTopWidth: styles.borderTopWidth,
        desktopColor: styles.getPropertyValue("--gs-desktop-color").trim(),
      };
    });

    expect(desktopStyles.backgroundImage).not.toBe("none");
    expect(desktopStyles.borderTopWidth).toBe("0px");
    expect(
      desktopStyles.desktopColor === "#98d7c2"
      || desktopStyles.desktopColor === "rgb(152, 215, 194)",
    ).toBeTruthy();
    expect(isNear(desktopStyles.backgroundColor, { r: 152, g: 215, b: 194 })).toBeTruthy();
  });
});
