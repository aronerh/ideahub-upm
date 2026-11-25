import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { publishIdea } from "@/app/ideas/actions";
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

  // IH-38: problem and solution can each be made private; ideas are public by default.
  it("lets the student make the problem and the solution private, unticked by default", () => {
    render(<IdeaForm />);
    const boxes = screen.getAllByRole("checkbox", { name: "Anyone with an IdeaHub account can read this" });

    expect(boxes.map((box) => box.getAttribute("name"))).toEqual(["problem_private", "solution_private"]);
    for (const box of boxes) {
      expect(box).toHaveProperty("checked", false);
    }
  });

  // IH-14
  it("asks for a sector and a stage, with nothing picked yet", () => {
    render(<IdeaForm />);
    const sector = screen.getByRole("combobox", { name: "Sector" }) as HTMLSelectElement;
    const stage = screen.getByRole("combobox", { name: "Stage" }) as HTMLSelectElement;

    expect(sector.required).toBe(true);
    expect(stage.required).toBe(true);
    expect(sector.value).toBe("");
    expect(stage.value).toBe("");
    expect(screen.getByRole("option", { name: "Sustainability & energy" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Prototype · Something to show" })).toBeTruthy();
  });

  it("has a publish button", () => {
    render(<IdeaForm />);
    expect(screen.getByRole("button", { name: "Publish idea" })).toBeTruthy();
  });

  // The form uses its own messages (IH-24) instead of the browser's, which skip fields with only spaces.
  it("leaves validation to the server", () => {
    const { container } = render(<IdeaForm />);
    expect(container.querySelector("form")?.noValidate).toBe(true);
  });

  it("shows each field's error under it and keeps what the student typed", async () => {
    vi.mocked(publishIdea).mockResolvedValue({
      values: { title: "", pitch: "Free rooms now.", problem: "", solution: "", team_members: "" },
      fieldErrors: { title: "Give your idea a title.", problem: "Describe the problem." },
    });
    render(<IdeaForm />);

    fireEvent.click(screen.getByRole("button", { name: "Publish idea" }));

    expect(await screen.findByText("Give your idea a title.")).toBeTruthy();
    expect(screen.getByLabelText("Title").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText("Title").getAttribute("aria-describedby")).toBe("title-error");
    expect(screen.getByText("Describe the problem.")).toBeTruthy();
    expect(screen.getByLabelText("One-line pitch").getAttribute("aria-invalid")).toBe("false");
    expect(screen.getByLabelText("One-line pitch")).toHaveProperty("value", "Free rooms now.");
  });
});
