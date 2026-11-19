import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteIdea } from "@/app/ideas/actions";
import { DeleteIdeaButton } from "@/app/ideas/deleteIdeaButton";

// IH-47: the Delete button asks first, and only then calls the server action.
vi.mock("@/app/ideas/actions", () => ({ deleteIdea: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const ideaId = "3f2b8c1e-9d4a-4b6e-8f0a-1c2d3e4f5a6b";

describe("DeleteIdeaButton", () => {
  it("asks for confirmation before deleting anything", () => {
    render(<DeleteIdeaButton ideaId={ideaId} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete idea" }));

    expect(screen.getByText("Are you sure you want to delete this idea?")).toBeTruthy();
    expect(deleteIdea).not.toHaveBeenCalled();
  });

  it("goes back without deleting when the student cancels", () => {
    render(<DeleteIdeaButton ideaId={ideaId} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete idea" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("button", { name: "Delete idea" })).toBeTruthy();
    expect(deleteIdea).not.toHaveBeenCalled();
  });

  it("deletes this idea once the student confirms", async () => {
    render(<DeleteIdeaButton ideaId={ideaId} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete idea" }));
    fireEvent.click(screen.getByRole("button", { name: "Yes, delete" }));

    await vi.waitFor(() => expect(deleteIdea).toHaveBeenCalledWith(ideaId));
  });

  it("shows a message when the idea couldn't be deleted", async () => {
    vi.mocked(deleteIdea).mockRejectedValue(new Error("The idea could not be deleted."));
    render(<DeleteIdeaButton ideaId={ideaId} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete idea" }));
    fireEvent.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Could not delete the idea. Please try again.",
    );
  });
});
