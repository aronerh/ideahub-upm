import { describe, expect, it } from "vitest";
import {
  formatIdeaDate,
  type IdeaInput,
  isIdeaId,
  readIdeaInput,
  validateIdeaInput,
} from "@/lib/ideas/ideas";

describe("isIdeaId", () => {
  it("accepts a uuid", () => {
    expect(isIdeaId("3f2b8c1e-9d4a-4b6e-8f0a-1c2d3e4f5a6b")).toBe(true);
  });

  it.each(["", "123", "not-a-uuid", "3f2b8c1e-9d4a-4b6e-8f0a-1c2d3e4f5a6b-extra"])(
    "rejects %j",
    (value) => {
      expect(isIdeaId(value)).toBe(false);
    },
  );
});

describe("formatIdeaDate", () => {
  it("shows day, short month and year", () => {
    expect(formatIdeaDate("2026-10-29T18:00:00Z")).toBe("29 Oct 2026");
  });

  it("uses Madrid time, so just after midnight there is already the next day", () => {
    expect(formatIdeaDate("2026-10-29T23:30:00Z")).toBe("30 Oct 2026");
  });
});

describe("readIdeaInput", () => {
  it("reads the 5 fields without the spaces around them", () => {
    const formData = new FormData();
    formData.set("title", "  Study room finder ");
    formData.set("pitch", "See which rooms are free.");
    formData.set("problem", "Rooms are full.\n");
    formData.set("solution", "A live map.");
    formData.set("team_members", " Ana, Marco ");

    expect(readIdeaInput(formData)).toEqual({
      title: "Study room finder",
      pitch: "See which rooms are free.",
      problem: "Rooms are full.",
      solution: "A live map.",
      team_members: "Ana, Marco",
    });
  });

  it("gives empty strings for missing fields", () => {
    expect(readIdeaInput(new FormData()).title).toBe("");
  });
});

describe("validateIdeaInput", () => {
  const validIdea: IdeaInput = {
    title: "Study room finder",
    pitch: "See which rooms are free.",
    problem: "Rooms are full.",
    solution: "A live map.",
    team_members: "Ana, Marco",
  };

  it("accepts an idea with all 5 fields filled in", () => {
    expect(validateIdeaInput(validIdea)).toBeNull();
  });

  it("gives every empty field its own message", () => {
    const empty = { title: "", pitch: "", problem: "", solution: "", team_members: "" };
    expect(validateIdeaInput(empty)).toEqual({
      title: "Give your idea a title.",
      pitch: "Write a one-line pitch.",
      problem: "Describe the problem.",
      solution: "Describe the solution.",
      team_members: "List the team members.",
    });
  });

  it("flags only the field that is missing", () => {
    expect(validateIdeaInput({ ...validIdea, solution: "" })).toEqual({
      solution: "Describe the solution.",
    });
  });

  it("treats a field with only spaces as empty, once read from the form", () => {
    const formData = new FormData();
    for (const [field, value] of Object.entries(validIdea)) {
      formData.set(field, value);
    }
    formData.set("title", "   ");
    expect(validateIdeaInput(readIdeaInput(formData))).toEqual({ title: "Give your idea a title." });
  });

  it("accepts a title of exactly 80 characters and rejects 81", () => {
    expect(validateIdeaInput({ ...validIdea, title: "a".repeat(80) })).toBeNull();
    expect(validateIdeaInput({ ...validIdea, title: "a".repeat(81) })).toEqual({
      title: "Use at most 80 characters.",
    });
  });

  it("rejects a pitch longer than 140 characters", () => {
    expect(validateIdeaInput({ ...validIdea, pitch: "a".repeat(141) })).toEqual({
      pitch: "Use at most 140 characters.",
    });
  });
});
