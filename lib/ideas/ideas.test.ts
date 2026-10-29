import { describe, expect, it } from "vitest";
import { formatIdeaDate, isIdeaId } from "@/lib/ideas/ideas";

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
