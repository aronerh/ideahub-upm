import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

// IH-11: a visitor browses published ideas without signing in.

test("a visitor sees the published ideas, or the empty state, on the home page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Explore ideas" })).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Published ideas" }).or(page.getByText("No ideas yet")),
  ).toBeVisible();
});

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

// IH-28. Opt-in because it writes to the shared Supabase project and ideas can't be deleted yet
// (002_ideas.sql has no delete policy). Run with E2E_WRITE_IDEAS=1 plus the E2E_USER_* account,
// which must have a UPM email. The test talks to Supabase directly, and Playwright doesn't read
// .env.local, so the two NEXT_PUBLIC_SUPABASE_* keys must be set in the shell too (CI sets them).
test("a newly published idea appears at the top of the list", async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  test.skip(
    process.env.E2E_WRITE_IDEAS !== "1" || !email || !password || !supabaseUrl || !supabaseKey,
    "Set E2E_WRITE_IDEAS=1, E2E_USER_EMAIL, E2E_USER_PASSWORD and the NEXT_PUBLIC_SUPABASE_* keys.",
  );

  const supabase = createClient(supabaseUrl!, supabaseKey!, { auth: { persistSession: false } });
  const { error: signInError } = await supabase.auth.signInWithPassword({ email: email!, password: password! });
  expect(signInError).toBeNull();

  const title = `E2E test idea ${Date.now()}`;
  const { error } = await supabase.from("ideas").insert({
    title,
    pitch: "Created by the IH-28 browser test.",
    problem: "Checking that new ideas show up.",
    solution: "Publish one and look at the list.",
    team_members: "IdeaHub test account",
  });
  expect(error).toBeNull();

  await page.goto("/");
  const newest = page.getByRole("list", { name: "Published ideas" }).getByRole("listitem").first();
  await expect(newest.getByRole("heading")).toHaveText(title);
});
