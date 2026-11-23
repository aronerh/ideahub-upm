
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdeaDetail } from "@/app/ideas/ideaDetail";
import type { Idea } from "@/lib/ideas/ideas";

// Mock the Delete component to avoid server-only imports.
vi.mock("@/app/ideas/deleteIdeaButton", () => ({
  DeleteIdeaButton: () => (
    <button type="button">Delete idea</button>
  ),
}));

afterEach(cleanup);

const idea: Idea = {
  id: "00000000-0000-4000-8000-000000000001",
  author_id: "00000000-0000-4000-8000-0000000000aa",
  title: "Campus bike share",
  pitch: "Borrow a bike between Montegancedo and Ciudad Universitaria.",
  problem: "The bus between campuses is slow and crowded.",
  solution: "Docking stations at both campuses.\nUnlock a bike with the UPM card.",
  team_members: "Marco Grilli, Aron Herreros",
  created_at: "2026-10-27T10:00:00Z",
  problem_private: false,
  solution_private: false,
  sector: "health",
  stage: "prototype",
};

describe("IdeaDetail", () => {
  it("shows all 5 fields", () => {
    render(<IdeaDetail idea={idea} />);
    const article = screen.getByRole("article");

    expect(
      within(article).getByRole("heading", { level: 1 }).textContent
    ).toBe("Campus bike share");

    expect(article.textContent).toContain(
      "Borrow a bike between Montegancedo and Ciudad Universitaria."
    );

    for (const [heading, body] of [
      ["Problem", idea.problem],
      ["Solution", idea.solution],
      ["Team members", idea.team_members],
    ] as const) {
      const section = within(article)
        .getByRole("heading", { level: 2, name: heading })
        .parentElement!;

      expect(section.textContent).toContain(body);
    }
  });

  // IH-38: the database sends null for what a visitor can't see.
  it("locks hidden details with a sign-in button and shows the rest", () => {
    render(<IdeaDetail idea={{ ...idea, problem: null, team_members: null, problem_private: true }} />);
    const article = screen.getByRole("article");

    for (const heading of ["Problem", "Team members"]) {
      const section = within(article).getByRole("heading", { level: 2, name: heading }).parentElement!;
      expect(section.textContent).toContain("Only UPM students and investors can read this.");
      expect(within(section).getByRole("link", { name: "Sign in" }).getAttribute("href")).toBe("/sign-in");
    }
    expect(article.textContent).toContain(idea.solution);
  });

  // IH-40: a private detail the database did send (the reader is signed in) is shown, not locked.
  it("shows private details to a signed-in reader without a lock", () => {
    render(<IdeaDetail idea={{ ...idea, problem_private: true, solution_private: true }} />);
    const article = screen.getByRole("article");

    expect(article.textContent).toContain(idea.problem);
    expect(article.textContent).toContain(idea.solution);
    expect(article.textContent).not.toContain("Only UPM students and investors can read this.");
    expect(within(article).queryByRole("link", { name: "Sign in" })).toBeNull();
  });

  it("shows the publication date", () => {
    render(<IdeaDetail idea={idea} />);

    const date = screen.getByText("Published 27 Oct 2026");

    expect(date.getAttribute("datetime")).toBe(
      "2026-10-27T10:00:00Z"
    );
  });

  it("keeps the line breaks the student typed", () => {
    render(<IdeaDetail idea={idea} />);

    const solution = screen.getByText(/Docking stations/);

    expect(solution.textContent).toBe(
      "Docking stations at both campuses.\nUnlock a bike with the UPM card."
    );

    expect(solution.className).toContain("whitespace-pre-line");
  });

  // IH-45: Non-owners must not see Delete.
  it("hides the Delete button from non-owners", () => {
    render(<IdeaDetail idea={idea} isOwner={false} />);

    expect(
      screen.queryByRole("button", { name: "Delete idea" })
    ).toBeNull();
  });

  // IH-45: Owners can see Delete.
  it("shows the Delete button to the owner", () => {
    render(<IdeaDetail idea={idea} isOwner={true} />);

    expect(
      screen.getByRole("button", { name: "Delete idea" })
    ).toBeTruthy();
  });

  // IH-46: Non-owners must not see Edit.
  it("hides the Edit link from non-owners", () => {
    render(<IdeaDetail idea={idea} isOwner={false} />);

    expect(
      screen.queryByRole("link", { name: "Edit idea" })
    ).toBeNull();
  });

  // IH-46: Owners can see Edit.
  it("shows the Edit link to the owner", () => {
    render(<IdeaDetail idea={idea} isOwner={true} />);

    const editLink = screen.getByRole("link", {
      name: "Edit idea",
    });

    expect(editLink.getAttribute("href")).toBe(
      `/ideas/${idea.id}/edit`
    );
  });
});
