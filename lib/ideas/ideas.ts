// Shapes and helpers for the ideas table (supabase/migrations/002_ideas.sql).

export type IdeaSummary = {
  id: string;
  title: string;
  pitch: string;
  created_at: string;
};

export type Idea = IdeaSummary & {
  problem: string;
  solution: string;
  team_members: string;
};

// The 5 fields a student fills in (IH-10).
export type IdeaInput = Pick<Idea, "title" | "pitch" | "problem" | "solution" | "team_members">;

// Same limits as the check constraints in 002_ideas.sql.
export const ideaFieldMaxLength: Record<keyof IdeaInput, number> = {
  title: 80,
  pitch: 140,
  problem: 2000,
  solution: 2000,
  team_members: 500,
};

// Reads the 5 fields from the submitted form, without the spaces around them.
export function readIdeaInput(formData: FormData): IdeaInput {
  const read = (field: keyof IdeaInput) => String(formData.get(field) ?? "").trim();
  return {
    title: read("title"),
    pitch: read("pitch"),
    problem: read("problem"),
    solution: read("solution"),
    team_members: read("team_members"),
  };
}

export const ideaSummaryColumns = "id, title, pitch, created_at";
export const ideaColumns = "id, title, pitch, problem, solution, team_members, created_at";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Ideas use uuid keys. Checking the format first means /ideas/anything gives a 404
// instead of a Postgres "invalid input syntax for type uuid" error.
export function isIdeaId(value: string): boolean {
  return uuidPattern.test(value);
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Madrid",
});

// "29 Oct 2026", in Madrid time so an idea published at 00:30 shows the right day.
export function formatIdeaDate(isoTimestamp: string): string {
  return dateFormat.format(new Date(isoTimestamp));
}
