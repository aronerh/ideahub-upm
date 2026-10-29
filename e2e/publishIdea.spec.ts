import { expect, test } from "@playwright/test";

// IH-23: the idea form. These tests never publish: CI shares the production Supabase project.

const testUserEmail = process.env.E2E_USER_EMAIL;
const testUserPassword = process.env.E2E_USER_PASSWORD;

test("a visitor who opens the form is sent to sign in", async ({ page }) => {
  await page.goto("/ideas/new");

  await expect(page).toHaveURL("/sign-in");
});

test("a signed-in student sees the 5-field form", async ({ page }) => {
  test.skip(
    !testUserEmail || !testUserPassword,
    "Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run this test.",
  );

  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(testUserEmail!);
  await page.getByLabel("Password").fill(testUserPassword!);
  await page.getByRole("main").getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");

  await page.getByRole("banner").getByRole("link", { name: /Publish/ }).click();

  await expect(page).toHaveURL("/ideas/new");
  for (const label of ["Title", "One-line pitch", "Problem", "Solution", "Team members"]) {
    await expect(page.getByLabel(label)).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Publish idea" })).toBeVisible();
});
