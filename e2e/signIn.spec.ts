import { expect, test } from "@playwright/test";

const testUserEmail = process.env.E2E_USER_EMAIL;
const testUserPassword = process.env.E2E_USER_PASSWORD;

test.beforeEach(async ({ page }) => {
  await page.goto("/sign-in");
});

test("a wrong password shows a clear message", async ({ page }) => {
  await page.getByLabel("Email").fill(`nobody-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("main").getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Wrong email or password.");
});

test("the test account can sign in and sign out", async ({ page }) => {
  test.skip(
    !testUserEmail || !testUserPassword,
    "Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run this test.",
  );

  await page.getByLabel("Email").fill(testUserEmail!);
  await page.getByLabel("Password").fill(testUserPassword!);
  await page.getByRole("main").getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/");
  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(page.getByText(testUserEmail!)).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("banner").getByRole("link", { name: "Sign in" })).toBeVisible();
});
