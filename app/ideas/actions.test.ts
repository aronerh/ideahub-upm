
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteIdea, publishIdea, updateIdea } from "@/app/ideas/actions";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Mock authentication and Supabase.
vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock Next.js cache revalidation.
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

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

// IH-14: sector and stage are required too.
const classification = { sector: "health", stage: "prototype" };
const validForm = { ...validIdea, ...classification };

// Mock database INSERT.
const insert = vi.fn();

let insertResult: {
  data: { id: string } | null;
  error: { message: string } | null;
};

// Mock database UPDATE and its query chain.
const update = vi.fn();
const eq = vi.fn();
const select = vi.fn();
const maybeSingle = vi.fn();

let updateResult: {
  data: { id: string } | null;
  error: { message: string } | null;
};

// Mock database DELETE and its query chain.
const remove = vi.fn();
const deleteEq = vi.fn();

let deleteResult: {
  data: { id: string }[] | null;
  error: { message: string } | null;
};

function formWith(values: Record<string, string>) {
  const formData = new FormData();

  for (const [field, value] of Object.entries(values)) {
    formData.set(field, value);
  }

  return formData;
}

function signInAs(email: string | null) {
  vi.mocked(getCurrentUser).mockResolvedValue(
    email ? { id: "user-1", email } : null
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  // Default INSERT result.
  insertResult = {
    data: { id: ideaId },
    error: null,
  };

  insert.mockImplementation(() => ({
    select: () => ({
      single: async () => insertResult,
    }),
  }));

  // Default UPDATE result.
  updateResult = {
    data: { id: ideaId },
    error: null,
  };

  const updateQuery = {
    eq,
    select,
    maybeSingle,
  };

  update.mockReturnValue(updateQuery);
  eq.mockReturnValue(updateQuery);
  select.mockReturnValue(updateQuery);

  maybeSingle.mockImplementation(async () => updateResult);

  // Default DELETE result: one idea removed.
  deleteResult = { data: [{ id: ideaId }], error: null };

  const deleteQuery = {
    eq: deleteEq,
    select: async () => deleteResult,
  };

  remove.mockReturnValue(deleteQuery);
  deleteEq.mockReturnValue(deleteQuery);

  vi.mocked(createClient).mockResolvedValue({
    from: () => ({
      insert,
      update,
      delete: remove,
    }),
  } as unknown as Awaited<ReturnType<typeof createClient>>);

  signInAs("ana@alumnos.upm.es");
});

// ============================================================
// EXISTING TESTS: PUBLISH IDEA (IH-25)
// ============================================================

describe("publishIdea", () => {
  it("saves the 5 fields and takes the student to the idea's page", async () => {
    await expect(
      publishIdea({}, formWith(validForm))
    ).rejects.toThrow(
      `redirect:/ideas/${ideaId}?published=1`
    );

    expect(insert).toHaveBeenCalledWith({
      ...validIdea,
      ...classification,
      problem_private: false,
      solution_private: false,
    });
  });

  // IH-38: a ticked box saves that detail as private.
  it("saves which details the student made private", async () => {
    await expect(
      publishIdea({}, formWith({ ...validForm, solution_private: "on" })),
    ).rejects.toThrow(`redirect:/ideas/${ideaId}?published=1`);
    expect(insert).toHaveBeenCalledWith({
      ...validIdea,
      ...classification,
      problem_private: false,
      solution_private: true,
    });
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
      "sector",
      "stage",
    ]);
  });

  it("saves nothing when one field is too long, and keeps what the student typed", async () => {
    const values = { ...validIdea, title: "a".repeat(81) };

    const state = await publishIdea({}, formWith({ ...values, ...classification }));

    expect(insert).not.toHaveBeenCalled();

    expect(state.fieldErrors).toEqual({
      title: "Use at most 80 characters.",
    });

    expect(state.values).toEqual(values);
  });

  it("sends a visitor to sign in without saving", async () => {
    signInAs(null);

    await expect(
      publishIdea({}, formWith(validForm))
    ).rejects.toThrow("redirect:/sign-in");

    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects a student without a UPM email without saving", async () => {
    signInAs("ana@gmail.com");

    const state = await publishIdea({}, formWith(validForm));

    expect(insert).not.toHaveBeenCalled();
    expect(state.formError).toBeTruthy();
  });

  it("shows a message and keeps the values when the database refuses the idea", async () => {
    insertResult = {
      data: null,
      error: { message: "check constraint" },
    };

    const state = await publishIdea({}, formWith(validForm));

    expect(state.formError).toBe(
      "Your idea couldn't be published. Check every field and try again."
    );

    expect(state.values).toEqual(validIdea);
  });
});

// ============================================================
// NEW TESTS: EDIT OWN IDEA (IH-46)
// ============================================================

describe("updateIdea", () => {
  it("updates the five fields and redirects to the idea page", async () => {
    await expect(
      updateIdea(ideaId, {}, formWith(validForm))
    ).rejects.toThrow(`redirect:/ideas/${ideaId}`);

    expect(update).toHaveBeenCalledWith({ ...validIdea, ...classification });

    expect(eq).toHaveBeenCalledWith("id", ideaId);
    expect(eq).toHaveBeenCalledWith("author_id", "user-1");

    expect(revalidatePath).toHaveBeenCalledWith("/ideas");
    expect(revalidatePath).toHaveBeenCalledWith(
      `/ideas/${ideaId}`
    );
  });

  it("rejects empty fields without updating", async () => {
    const state = await updateIdea(
      ideaId,
      {},
      new FormData()
    );

    expect(update).not.toHaveBeenCalled();

    expect(Object.keys(state.fieldErrors ?? {})).toEqual([
      "title",
      "pitch",
      "problem",
      "solution",
      "team_members",
      "sector",
      "stage",
    ]);
  });

  it("rejects fields exceeding their maximum length", async () => {
    const values = {
      ...validIdea,
      title: "a".repeat(81),
    };

    const state = await updateIdea(
      ideaId,
      {},
      formWith({ ...values, ...classification })
    );

    expect(update).not.toHaveBeenCalled();

    expect(state.fieldErrors).toEqual({
      title: "Use at most 80 characters.",
    });

    expect(state.values).toEqual(values);
  });

  it("redirects visitors to sign in without updating", async () => {
    signInAs(null);

    await expect(
      updateIdea(ideaId, {}, formWith(validForm))
    ).rejects.toThrow("redirect:/sign-in");

    expect(update).not.toHaveBeenCalled();
  });

  it("rejects users without a UPM email", async () => {
    signInAs("ana@gmail.com");

    const state = await updateIdea(
      ideaId,
      {},
      formWith(validForm)
    );

    expect(update).not.toHaveBeenCalled();
    expect(state.formError).toBeTruthy();
  });

  it("returns an error when the database update fails", async () => {
    updateResult = {
      data: null,
      error: { message: "Database error" },
    };

    const state = await updateIdea(
      ideaId,
      {},
      formWith(validForm)
    );

    expect(state.formError).toBe(
      "Your idea couldn't be updated. Please try again."
    );

    expect(state.values).toEqual(validIdea);
  });

  it("returns an error when no matching owned idea exists", async () => {
    updateResult = {
      data: null,
      error: null,
    };

    const state = await updateIdea(
      ideaId,
      {},
      formWith(validForm)
    );

    expect(state.formError).toBe(
      "Idea not found or you don't have permission to edit it."
    );

    expect(state.values).toEqual(validIdea);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

// IH-47: deleting your own idea.
// IH-14: sector and stage in the publish and edit forms.
describe("sector and stage", () => {
  it("publishes nothing without a sector and stage, and says so", async () => {
    const state = await publishIdea({}, formWith(validIdea));

    expect(insert).not.toHaveBeenCalled();
    expect(state.fieldErrors).toEqual({ sector: "Pick a sector.", stage: "Pick a stage." });
    expect(state.values).toEqual(validIdea);
  });

  it("ignores a sector or stage that isn't in the list", async () => {
    const state = await publishIdea({}, formWith({ ...validIdea, sector: "crypto", stage: "unicorn" }));

    expect(insert).not.toHaveBeenCalled();
    expect(state.fieldErrors).toEqual({ sector: "Pick a sector.", stage: "Pick a stage." });
  });

  it("keeps the picked sector and stage when another field has an error", async () => {
    const state = await publishIdea({}, formWith({ ...validForm, title: "" }));

    expect(state.classification).toEqual(classification);
  });

  it("saves a changed sector and stage when editing", async () => {
    await expect(
      updateIdea(ideaId, {}, formWith({ ...validIdea, sector: "mobility", stage: "growing" })),
    ).rejects.toThrow(`redirect:/ideas/${ideaId}`);

    expect(update).toHaveBeenCalledWith({ ...validIdea, sector: "mobility", stage: "growing" });
  });

  it("doesn't save an edit without a sector and stage", async () => {
    const state = await updateIdea(ideaId, {}, formWith(validIdea));

    expect(update).not.toHaveBeenCalled();
    expect(state.fieldErrors).toEqual({ sector: "Pick a sector.", stage: "Pick a stage." });
  });
});

describe("deleteIdea", () => {
  it("deletes only the student's own idea and takes them to the list on the home page", async () => {
    await expect(deleteIdea(ideaId)).rejects.toThrow(/^redirect:\/$/);

    expect(remove).toHaveBeenCalled();
    expect(deleteEq).toHaveBeenCalledWith("id", ideaId);
    expect(deleteEq).toHaveBeenCalledWith("author_id", "user-1");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("sends a visitor to sign in without deleting", async () => {
    signInAs(null);

    await expect(deleteIdea(ideaId)).rejects.toThrow("redirect:/sign-in");
    expect(remove).not.toHaveBeenCalled();
  });

  it("fails without redirecting when the idea isn't the student's", async () => {
    deleteResult = { data: [], error: null };

    await expect(deleteIdea(ideaId)).rejects.toThrow(
      "Idea not found or you don't have permission to delete it.",
    );
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("fails without redirecting when the database refuses", async () => {
    deleteResult = { data: null, error: { message: "permission denied" } };

    await expect(deleteIdea(ideaId)).rejects.toThrow("The idea could not be deleted.");
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
