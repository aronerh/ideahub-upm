import { expect, test } from "@playwright/test";

// IH-33 replaces the confirmation link with a code; replace this test with it.
test("a broken confirmation link lands on the error page", async ({ page }) => {
  await page.goto("/auth/confirm");

  await expect(page).toHaveURL("/auth/error");
  await expect(page.getByRole("heading", { name: /That link didn.t work/ })).toBeVisible();
});
