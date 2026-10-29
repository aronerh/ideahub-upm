import { expect, test } from "@playwright/test";

test("a visitor can open the home page without signing in", async ({ page }) => {
  await page.goto("/");

  const header = page.getByRole("banner");
  await expect(header.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(header.getByRole("link", { name: /Publish/ })).toBeVisible();
});

test("a saved dark theme is applied after a reload", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.goto("/");
  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the sign-up page doesn't scroll sideways", async ({ page }) => {
    await page.goto("/sign-up");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
