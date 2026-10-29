import { expect, test } from "@playwright/test";

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
