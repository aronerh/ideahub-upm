import { beforeEach, describe, expect, it, vi } from "vitest";
import { publishIdea } from "@/app/ideas/actions";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { createClient } from "@/lib/supabase/server";

// IH-25: saving an idea, without the live database. Supabase and the signed-in user are stand-ins.

vi.mock("@/lib/auth/currentUser", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
// Like Next.js, redirect stops the action by throwing.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

const ideaId = "3f2b8c1e-9d4a-4b6e-8f0a-1c2d3e4f5a6b";
const validIdea = {
  title: "Study room finder",
  pitch: "See which rooms are free.",
  problem: "Rooms are full.",
  solution: "A live map.",
  team_members: "Ana, Marco",
};

const insert = vi.fn();
let insertResult: { data: { id: string } | null; error: { message: string } | null };

function formWith(values: Record<string, string>) {
  const formData = new FormData();
  for (const [field, value] of Object.entries(values)) {
    formData.set(field, value);
  }
  return formData;
}

function signInAs(email: string | null) {
  vi.mocked(getCurrentUser).mockResolvedValue(email ? { id: "user-1", email } : null);
}

beforeEach(() => {
  vi.clearAllMocks();
  insertResult = { data: { id: ideaId }, error: null };
  insert.mockImplementation(() => ({
    select: () => ({ single: async () => insertResult }),
  }));
  vi.mocked(createClient).mockResolvedValue({
    from: () => ({ insert }),
  } as unknown as Awaited<ReturnType<typeof createClient>>);
  signInAs("ana@alumnos.upm.es");
});

describe("publishIdea", () => {
  it("saves the 5 fields and takes the student to the idea's page", async () => {
    await expect(publishIdea({}, formWith(validIdea))).rejects.toThrow(
      `redirect:/ideas/${ideaId}?published=1`,
    );
    expect(insert).toHaveBeenCalledWith(validIdea);
  });

  it("saves nothing and shows a message per field when the form is empty", async () => {
    const state = await publishIdea({}, new FormData());

    expect(insert).not.toHaveBeenCalled();
    expect(Object.keys(state.fieldErrors ?? {})).toEqual([
      "title",
      "pitch",
      "problem",
      "solution",
      "team_members",
    ]);
  });

  it("saves nothing when one field is too long, and keeps what the student typed", async () => {
    const values = { ...validIdea, title: "a".repeat(81) };
    const state = await publishIdea({}, formWith(values));

    expect(insert).not.toHaveBeenCalled();
    expect(state.fieldErrors).toEqual({ title: "Use at most 80 characters." });
    expect(state.values).toEqual(values);
  });

  it("sends a visitor to sign in without saving", async () => {
    signInAs(null);

    await expect(publishIdea({}, formWith(validIdea))).rejects.toThrow("redirect:/sign-in");
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects a student without a UPM email without saving", async () => {
    signInAs("ana@gmail.com");

    const state = await publishIdea({}, formWith(validIdea));

    expect(insert).not.toHaveBeenCalled();
    expect(state.formError).toBeTruthy();
  });

  it("shows a message and keeps the values when the database refuses the idea", async () => {
    insertResult = { data: null, error: { message: "check constraint" } };

    const state = await publishIdea({}, formWith(validIdea));

    expect(state.formError).toBe("Your idea couldn't be published. Check every field and try again.");
    expect(state.values).toEqual(validIdea);
  });
});
