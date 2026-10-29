import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdeaForm } from "@/app/ideas/ideaForm";

// The server action talks to Supabase; the form only needs something to call.
vi.mock("@/app/ideas/actions", () => ({ publishIdea: vi.fn() }));

afterEach(cleanup);

describe("IdeaForm", () => {
  it("has the 5 fields, all required, with the database's length limits", () => {
    render(<IdeaForm />);

    const fields = [
      ["Title", "80"],
      ["One-line pitch", "140"],
      ["Problem", "2000"],
      ["Solution", "2000"],
      ["Team members", "500"],
    ];
    for (const [label, maxLength] of fields) {
      const field = screen.getByLabelText(label);
      expect(field).toHaveProperty("required", true);
      expect(field.getAttribute("maxlength")).toBe(maxLength);
    }
  });

  it("has a publish button", () => {
    render(<IdeaForm />);
    expect(screen.getByRole("button", { name: "Publish idea" })).toBeTruthy();
  });
});
