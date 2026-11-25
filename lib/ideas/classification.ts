// IH-14: the sectors and stages an idea can have. The values are the same as the check
// constraints in supabase/migrations/007_sector_stage.sql; change both together.

export const sectors = [
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "sustainability", label: "Sustainability & energy" },
  { value: "mobility", label: "Mobility" },
  { value: "fintech", label: "Fintech" },
  { value: "software_ai", label: "Software & AI" },
  { value: "social_impact", label: "Social impact" },
  { value: "other", label: "Other" },
] as const;

export const stages = [
  { value: "idea", label: "Idea", hint: "Just an idea" },
  { value: "prototype", label: "Prototype", hint: "Something to show" },
  { value: "mvp", label: "MVP", hint: "First users try it" },
  { value: "growing", label: "Growing", hint: "Users or revenue" },
] as const;

export type Sector = (typeof sectors)[number]["value"];
export type Stage = (typeof stages)[number]["value"];

export function isSector(value: unknown): value is Sector {
  return sectors.some((sector) => sector.value === value);
}

export function isStage(value: unknown): value is Stage {
  return stages.some((stage) => stage.value === value);
}

export function sectorLabel(value: string | null | undefined): string | null {
  return sectors.find((sector) => sector.value === value)?.label ?? null;
}

export function stageLabel(value: string | null | undefined): string | null {
  return stages.find((stage) => stage.value === value)?.label ?? null;
}

// What the student picks in the publish and edit forms. "" until they pick one.
export type IdeaClassification = {
  sector: Sector | "";
  stage: Stage | "";
};

export function readIdeaClassification(formData: FormData): IdeaClassification {
  const sector = String(formData.get("sector") ?? "");
  const stage = String(formData.get("stage") ?? "");
  return {
    sector: isSector(sector) ? sector : "",
    stage: isStage(stage) ? stage : "",
  };
}

export type IdeaClassificationErrors = Partial<Record<keyof IdeaClassification, string>>;

// Both are required when publishing or editing. Returns null when both are picked.
export function validateIdeaClassification(values: IdeaClassification): IdeaClassificationErrors | null {
  const errors: IdeaClassificationErrors = {};
  if (values.sector === "") errors.sector = "Pick a sector.";
  if (values.stage === "") errors.stage = "Pick a stage.";
  return Object.keys(errors).length > 0 ? errors : null;
}

// The search and filters on the ideas list, read from the page's address (?q=&sector=&stage=).
// Unknown sectors or stages are ignored, so an old or edited link still shows something.
export type IdeaSearch = {
  query: string;
  sector: Sector | "";
  stage: Stage | "";
};

export function readIdeaSearch(params: Record<string, string | string[] | undefined>): IdeaSearch {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
  const sector = first(params.sector);
  const stage = first(params.stage);
  return {
    query: first(params.q).trim().slice(0, 100),
    sector: isSector(sector) ? sector : "",
    stage: isStage(stage) ? stage : "",
  };
}

export function isFiltering(search: IdeaSearch): boolean {
  return search.query !== "" || search.sector !== "" || search.stage !== "";
}
