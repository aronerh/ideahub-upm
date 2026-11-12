import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestContact } from "@/app/ideas/contactActions";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { notifyTeam } from "@/lib/contact/notifyTeam";
import { createClient } from "@/lib/supabase/server";

// IH-42: saving a contact request and emailing the team, without the live database or a real email.

vi.mock("@/lib/auth/currentUser", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/contact/notifyTeam", () => ({ notifyTeam: vi.fn() }));
const request = vi.hoisted(() => ({ origin: "https://preview.example" as string | null }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers(request.origin ? { origin: request.origin } : {}),
}));
// Like Next.js, redirect stops the action by throwing.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

const ideaId = "3f2b8c1e-9d4a-4b6e-8f0a-1c2d3e4f5a6b";
const authorId = "author-1";

let idea: { id: string; title: string; author_id: string } | null;
let insertError: { message: string } | null;
const insert = vi.fn();

function formWith(values: Record<string, string>) {
  const formData = new FormData();
  for (const [field, value] of Object.entries(values)) {
    formData.set(field, value);
  }
  return formData;
}

function signInAs(id: string | null, email = "bob@gmail.com") {
  vi.mocked(getCurrentUser).mockResolvedValue(id ? { id, email } : null);
}

beforeEach(() => {
  vi.clearAllMocks();
  request.origin = "https://preview.example";
  idea ={ id: ideaId, title: "Study room finder", author_id: authorId };
  insertError = null;
  insert.mockImplementation(async () => ({ error: insertError }));
  vi.mocked(createClient).mockResolvedValue({
    from: (table: string) =>
      table === "ideas"
        ? { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: idea }) }) }) }
        : { insert },
  } as unknown as Awaited<ReturnType<typeof createClient>>);
  vi.mocked(notifyTeam).mockResolvedValue("sent");
  signInAs("investor-1");
});

describe("requestContact", () => {
  it("saves the request and emails the idea's author", async () => {
    const state = await requestContact({}, formWith({ idea_id: ideaId, message: "  Let's talk.  " }));

    expect(state).toEqual({ sent: true });
    expect(insert).toHaveBeenCalledWith({ idea_id: ideaId, message: "Let's talk." });
    expect(notifyTeam).toHaveBeenCalledWith({
      authorId,
      ideaTitle: "Study room finder",
      ideaUrl: `https://preview.example/ideas/${ideaId}`,
      requesterEmail: "bob@gmail.com",
      message: "Let's talk.",
    });
  });

  it("links the idea on the live site when the request carries no origin", async () => {
    request.origin = null;

    await requestContact({}, formWith({ idea_id: ideaId, message: "Hi" }));

    expect(notifyTeam).toHaveBeenCalledWith(
      expect.objectContaining({ ideaUrl: `https://ideahub-upm.vercel.app/ideas/${ideaId}` }),
    );
  });

  it("sends visitors to sign in", async () => {
    signInAs(null);

    await expect(requestContact({}, formWith({ idea_id: ideaId, message: "Hi" }))).rejects.toThrow(
      "redirect:/sign-in",
    );
    expect(insert).not.toHaveBeenCalled();
  });

  it.each([
    ["", "Write a message for the team."],
    ["a".repeat(1001), "Use at most 1000 characters."],
  ])("saves nothing when the message is %#, and keeps what was typed", async (message, error) => {
    const state = await requestContact({}, formWith({ idea_id: ideaId, message }));

    expect(state).toEqual({ message, messageError: error });
    expect(insert).not.toHaveBeenCalled();
    expect(notifyTeam).not.toHaveBeenCalled();
  });

  it.each([["not-an-id"], [ideaId]])("says so when the idea doesn't exist (%s)", async (id) => {
    idea = null;
    const state = await requestContact({}, formWith({ idea_id: id, message: "Hi" }));

    expect(state.formError).toBe("This idea isn’t there any more.");
    expect(insert).not.toHaveBeenCalled();
  });

  it("doesn't let an author contact their own idea", async () => {
    signInAs(authorId, "ana@alumnos.upm.es");
    const state = await requestContact({}, formWith({ idea_id: ideaId, message: "Hi" }));

    expect(state.formError).toBe("This is your own idea.");
    expect(insert).not.toHaveBeenCalled();
  });

  it("emails nobody when the request couldn't be saved", async () => {
    insertError = { message: "new row violates row-level security policy" };
    const state = await requestContact({}, formWith({ idea_id: ideaId, message: "Hi" }));

    expect(state).toEqual({ message: "Hi", formError: "Your request couldn’t be sent. Try again in a moment." });
    expect(notifyTeam).not.toHaveBeenCalled();
  });

  it("still confirms the request when the email isn't sent", async () => {
    vi.mocked(notifyTeam).mockResolvedValue("failed");
    const state = await requestContact({}, formWith({ idea_id: ideaId, message: "Hi" }));

    expect(state).toEqual({ sent: true });
  });
});
