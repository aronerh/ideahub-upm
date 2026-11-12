import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdeaDetail } from "@/app/ideas/ideaDetail";
import type { Idea } from "@/lib/ideas/ideas";


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
};

describe("IdeaDetail", () => {
  it("shows all 5 fields", () => {
    render(<IdeaDetail idea={idea} />);
    const article = screen.getByRole("article");

    expect(within(article).getByRole("heading", { level: 1 }).textContent).toBe("Campus bike share");
    expect(article.textContent).toContain("Borrow a bike between Montegancedo and Ciudad Universitaria.");
    for (const [heading, body] of [
      ["Problem", idea.problem],
      ["Solution", idea.solution],
      ["Team members", idea.team_members],
    ]) {
      const section = within(article).getByRole("heading", { level: 2, name: heading }).parentElement!;
      expect(section.textContent).toContain(body);
    }
  });

  it("shows the publication date", () => {
    render(<IdeaDetail idea={idea} />);
    const date = screen.getByText("Published 27 Oct 2026");

    expect(date.getAttribute("datetime")).toBe("2026-10-27T10:00:00Z");
  });

  it("keeps the line breaks the student typed", () => {
    render(<IdeaDetail idea={idea} />);
    const solution = screen.getByText(/Docking stations/);

    expect(solution.textContent).toBe("Docking stations at both campuses.\nUnlock a bike with the UPM card.");
    expect(solution.className).toContain("whitespace-pre-line");
  });
    // IH-45: The Delete button must not appear for other users.
  it("hides the Delete button from non-owners", () => {
    render(<IdeaDetail idea={idea} isOwner={false} />);

    expect(
      screen.queryByRole("button", { name: "Delete idea" })
    ).toBeNull();
  });

  // IH-45: The Delete button appears for the idea's owner.
  it("shows the Delete button to the owner", () => {
    render(<IdeaDetail idea={idea} isOwner={true} />);

    expect(
      screen.getByRole("button", { name: "Delete idea" })
    ).toBeTruthy();
  });
});
