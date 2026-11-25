import { expect, type Page, test } from "@playwright/test";

// IH-11: a visitor browses published ideas without signing in.

test("a visitor sees the published ideas, or the empty state, on the home page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Explore ideas" })).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Published ideas" }).or(page.getByText("No ideas yet")),
  ).toBeVisible();
});

// Skips while the shared database has no ideas; IdeaDetail's unit test covers the page meanwhile.
test("clicking an idea opens its page with all 5 fields", async ({ page }) => {
  await page.goto("/");
  const list = page.getByRole("list", { name: "Published ideas" });
  await expect(list.or(page.getByText("No ideas yet"))).toBeVisible();
  test.skip(!(await list.isVisible()), "No ideas published yet.");

  const firstIdea = list.getByRole("link").first();

  const title = (await firstIdea.getByRole("heading").textContent())!;
  await firstIdea.click();

  await expect(page).toHaveURL(/\/ideas\/[0-9a-f-]{36}$/);
  const article = page.getByRole("article");
  await expect(article.getByRole("heading", { level: 1 })).toHaveText(title);
  for (const field of ["Problem", "Solution", "Team members"]) {
    await expect(article.getByRole("heading", { level: 2, name: field })).toBeVisible();
  }
});

test.describe("an idea that doesn't exist shows a not-found page", () => {
  for (const id of ["00000000-0000-4000-8000-000000000000", "not-an-id"]) {
    test(`for /ideas/${id}`, async ({ page }) => {
      await page.goto(`/ideas/${id}`);
      await expect(page.getByRole("heading", { name: "Idea not found" })).toBeVisible();
    });
  }
});

// IH-40: on the live database, visitors never see the team; signed-in users see every detail.
// Skips while the shared database has no ideas, like the test above.
async function openFirstIdea(page: Page) {
  await page.goto("/");
  const list = page.getByRole("list", { name: "Published ideas" });
  await expect(list.or(page.getByText("No ideas yet"))).toBeVisible();
  test.skip(!(await list.isVisible()), "No ideas published yet.");

  await list.getByRole("link").first().click();
  await expect(page).toHaveURL(/\/ideas\/[0-9a-f-]{36}$/);
  return page.getByRole("article");
}

test("a visitor sees the team members locked, with a sign-in button", async ({ page }) => {
  const article = await openFirstIdea(page);

  const team = article.getByRole("heading", { level: 2, name: "Team members" }).locator("..");
  await expect(team).toContainText("Anyone with an IdeaHub account can read this.");
  await expect(team.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/sign-in");
});

test("a signed-in user sees every detail, with nothing locked", async ({ page }) => {
  const testUserEmail = process.env.E2E_USER_EMAIL;
  const testUserPassword = process.env.E2E_USER_PASSWORD;
  test.skip(
    !testUserEmail || !testUserPassword,
    "Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run this test.",
  );

  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(testUserEmail!);
  await page.getByLabel("Password").fill(testUserPassword!);
  await page.getByRole("main").getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");

  const article = await openFirstIdea(page);

  await expect(article.getByRole("heading", { level: 2, name: "Team members" })).toBeVisible();
  await expect(article).not.toContainText("Anyone with an IdeaHub account can read this.");
});

// IH-14: works with any ideas in the database, since nothing matches this word.
test("a search that matches nothing says so and can be cleared", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Search ideas" }).fill("zzqxnomatchzzqx");
  await page.getByRole("searchbox", { name: "Search ideas" }).press("Enter");

  await expect(page).toHaveURL(/q=zzqxnomatchzzqx/);
  await expect(page.getByText("No ideas match")).toBeVisible();

  await page.getByRole("link", { name: "Clear search and filters" }).click();
  await expect(page.getByRole("searchbox", { name: "Search ideas" })).toHaveValue("");
  await expect(page.getByText("No ideas match")).toHaveCount(0);
});

test("picking a stage filter puts it in the address", async ({ page }) => {
  await page.goto("/");
  const stages = page.getByRole("navigation", { name: "Stage" });
  await stages.getByRole("link", { name: "Prototype" }).click();

  await expect(page).toHaveURL(/stage=prototype/);
  await expect(stages.getByRole("link", { name: "Prototype" })).toHaveAttribute("aria-current", "true");
});
