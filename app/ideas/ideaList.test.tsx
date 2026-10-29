import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { IdeaList } from "@/app/ideas/ideaList";
import type { IdeaSummary } from "@/lib/ideas/ideas";

afterEach(cleanup);

const ideas: IdeaSummary[] = [
  {
    id: "00000000-0000-4000-8000-000000000002",
    title: "Study room finder",
    pitch: "See which UPM study rooms are free right now.",
    created_at: "2026-10-29T10:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000001",
    title: "Campus bike share",
    pitch: "Borrow a bike between Montegancedo and Ciudad Universitaria.",
    created_at: "2026-10-27T10:00:00Z",
  },
];

describe("IdeaList", () => {
  it("shows title, pitch and date for each idea, in the order given", () => {
    render(<IdeaList ideas={ideas} />);
    const items = within(screen.getByRole("list", { name: "Published ideas" })).getAllByRole("listitem");

    expect(items).toHaveLength(2);
    expect(within(items[0]).getByRole("heading").textContent).toBe("Study room finder");
    expect(items[0].textContent).toContain("See which UPM study rooms are free right now.");
    expect(items[0].textContent).toContain("29 Oct 2026");
    expect(within(items[1]).getByRole("heading").textContent).toBe("Campus bike share");
  });

  it("links each idea to its page", () => {
    render(<IdeaList ideas={ideas} />);

    expect(screen.getByRole("link", { name: /Campus bike share/ }).getAttribute("href")).toBe(
      "/ideas/00000000-0000-4000-8000-000000000001",
    );
  });

  it("shows an empty state when there are no ideas", () => {
    render(<IdeaList ideas={[]} />);

    expect(screen.getByRole("status").textContent).toContain("No ideas yet");
    expect(screen.queryByRole("list")).toBeNull();
  });
});
