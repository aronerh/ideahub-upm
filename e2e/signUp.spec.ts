import { expect, test } from "@playwright/test";

// These tests never submit a valid sign-up: CI shares the production Supabase project.
test.beforeEach(async ({ page }) => {
  await page.goto("/sign-up");
});

test("an empty form asks for an email and a password", async ({ page }) => {
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page.getByText("Enter your password.")).toBeVisible();
});

test("a short password is rejected and the email is kept as typed", async ({ page }) => {
  await page.getByLabel("Email").fill("Ana.Test@alumnos.upm.es");
  await page.getByLabel("Password").fill("abc");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByText("Use at least 6 characters.")).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveValue("Ana.Test@alumnos.upm.es");
});
