
import {
  cleanup,
  render,
  screen,
  fireEvent,
} from "@testing-library/react";
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { EditIdeaForm } from "@/app/ideas/editIdeaForm";
import { updateIdea } from "@/app/ideas/actions";
import type { Idea } from "@/lib/ideas/ideas";

// Mock the server action to avoid loading server-only modules.
vi.mock("@/app/ideas/actions", () => ({
  updateIdea: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const idea: Idea = {
  id: "00000000-0000-4000-8000-000000000001",
  author_id: "00000000-0000-4000-8000-0000000000aa",
  title: "Campus bike share",
  pitch: "Borrow a bike between UPM campuses.",
  problem: "Transport between campuses is slow.",
  solution: "Provide shared bikes at both campuses.",
  team_members: "Ana, Marco",
  created_at: "2026-10-27T10:00:00Z",
  problem_private: false,
  solution_private: false,
};

describe("EditIdeaForm", () => {
  it("pre-fills all five fields with the existing idea", () => {
    render(<EditIdeaForm idea={idea} />);

    const fields = [
      ["Title", idea.title],
      ["One-line pitch", idea.pitch],
      ["Problem", idea.problem],
      ["Solution", idea.solution],
      ["Team members", idea.team_members],
    ] as const;

    for (const [label, value] of fields) {
      const field = screen.getByLabelText(label);

      expect(field.getAttribute("name")).toBe(
        label === "One-line pitch"
          ? "pitch"
          : label === "Team members"
            ? "team_members"
            : label.toLowerCase()
      );

      expect(
        (field as HTMLInputElement | HTMLTextAreaElement).value
      ).toBe(value);
    }
  });

  it("uses the correct length limits", () => {
    render(<EditIdeaForm idea={idea} />);

    const fields = [
      ["Title", "80"],
      ["One-line pitch", "140"],
      ["Problem", "2000"],
      ["Solution", "2000"],
      ["Team members", "500"],
    ];

    for (const [label, maxLength] of fields) {
      const field = screen.getByLabelText(label);

      expect(field.getAttribute("maxlength")).toBe(maxLength);
      expect(field.hasAttribute("required")).toBe(true);
    }
  });

  it("shows a Save changes button", () => {
    render(<EditIdeaForm idea={idea} />);

    expect(
      screen.getByRole("button", { name: "Save changes" })
    ).toBeTruthy();

    expect(
      screen.queryByRole("button", { name: "Publish idea" })
    ).toBeNull();
  });

  it("has a Cancel link to the original idea", () => {
    render(<EditIdeaForm idea={idea} />);

    const cancel = screen.getByRole("link", {
      name: "Cancel",
    });

    expect(cancel.getAttribute("href")).toBe(
      `/ideas/${idea.id}`
    );
  });

  it("allows the student to change the field values", () => {
    render(<EditIdeaForm idea={idea} />);

    const title = screen.getByLabelText(
      "Title"
    ) as HTMLInputElement;

    const pitch = screen.getByLabelText(
      "One-line pitch"
    ) as HTMLInputElement;

    fireEvent.change(title, {
      target: { value: "Updated campus bike share" },
    });

    fireEvent.change(pitch, {
      target: { value: "New bike-sharing service." },
    });

    expect(title.value).toBe("Updated campus bike share");
    expect(pitch.value).toBe("New bike-sharing service.");
  });

  it("uses server-side validation instead of browser validation", () => {
    const { container } = render(
      <EditIdeaForm idea={idea} />
    );

    const form = container.querySelector("form");

    expect(form?.noValidate).toBe(true);
    expect(vi.mocked(updateIdea)).not.toHaveBeenCalled();
  });
});
