import { describe, expect, it } from "vitest";
import {
  isFiltering,
  readIdeaClassification,
  readIdeaSearch,
  sectorLabel,
  stageLabel,
  validateIdeaClassification,
} from "@/lib/ideas/classification";

function formWith(values: Record<string, string>) {
  const formData = new FormData();
  for (const [field, value] of Object.entries(values)) formData.set(field, value);
  return formData;
}

describe("readIdeaClassification", () => {
  it("reads a listed sector and stage", () => {
    expect(readIdeaClassification(formWith({ sector: "health", stage: "mvp" }))).toEqual({
      sector: "health",
      stage: "mvp",
    });
  });

  it("treats a missing or unknown value as not picked", () => {
    expect(readIdeaClassification(formWith({ sector: "crypto" }))).toEqual({ sector: "", stage: "" });
  });
});

describe("validateIdeaClassification", () => {
  it("asks for both", () => {
    expect(validateIdeaClassification({ sector: "", stage: "" })).toEqual({
      sector: "Pick a sector.",
      stage: "Pick a stage.",
    });
    expect(validateIdeaClassification({ sector: "health", stage: "" })).toEqual({ stage: "Pick a stage." });
  });

  it("passes when both are picked", () => {
    expect(validateIdeaClassification({ sector: "health", stage: "idea" })).toBeNull();
  });
});

describe("readIdeaSearch", () => {
  it("reads the search words and filters from the address", () => {
    expect(readIdeaSearch({ q: "  bike share ", sector: "mobility", stage: "prototype" })).toEqual({
      query: "bike share",
      sector: "mobility",
      stage: "prototype",
    });
  });

  it("ignores unknown filters, so an old link still lists ideas", () => {
    expect(readIdeaSearch({ sector: "crypto", stage: "unicorn" })).toEqual({ query: "", sector: "", stage: "" });
  });

  it("takes the first value when a parameter is repeated, and caps the search at 100 characters", () => {
    expect(readIdeaSearch({ q: ["a".repeat(150), "b"] }).query).toBe("a".repeat(100));
  });

  it("knows when a search or filter is on", () => {
    expect(isFiltering(readIdeaSearch({}))).toBe(false);
    expect(isFiltering(readIdeaSearch({ q: "   " }))).toBe(false);
    expect(isFiltering(readIdeaSearch({ stage: "mvp" }))).toBe(true);
  });
});

describe("labels", () => {
  it("names the sector and stage, and nothing for ideas without one", () => {
    expect(sectorLabel("software_ai")).toBe("Software & AI");
    expect(stageLabel("mvp")).toBe("MVP");
    expect(sectorLabel(null)).toBeNull();
    expect(stageLabel("unknown")).toBeNull();
  });
});
