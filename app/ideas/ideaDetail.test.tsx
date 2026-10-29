import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { IdeaDetail } from "@/app/ideas/ideaDetail";
import type { Idea } from "@/lib/ideas/ideas";

afterEach(cleanup);

const idea: Idea = {
  id: "00000000-0000-4000-8000-000000000001",
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
});
