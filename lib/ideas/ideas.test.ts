import { describe, expect, it } from "vitest";
import { formatIdeaDate, isIdeaId, readIdeaInput } from "@/lib/ideas/ideas";

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
