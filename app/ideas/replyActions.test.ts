import { beforeEach, describe, expect, it, vi } from "vitest";
import { replyToRequest } from "@/app/ideas/replyActions";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { createClient } from "@/lib/supabase/server";

// IH-105: saving a reply under a contact request, without the live database.

vi.mock("@/lib/auth/currentUser", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
const refresh = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ refresh }));
// Like Next.js, redirect stops the action by throwing.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

const requestId = "20000000-0000-4000-8000-000000000001";

let insertError: { message: string } | null;
const insert = vi.fn();
const from = vi.fn();

function formWith(values: Record<string, string>) {
  const formData = new FormData();
  for (const [field, value] of Object.entries(values)) {
    formData.set(field, value);
  }
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  insertError = null;
  insert.mockImplementation(async () => ({ error: insertError }));
  from.mockReturnValue({ insert });
  vi.mocked(createClient).mockResolvedValue({ from } as unknown as Awaited<ReturnType<typeof createClient>>);
  vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1", email: "bob@gmail.com" });
});

describe("replyToRequest", () => {
  it("saves the trimmed reply under the request and refreshes the page", async () => {
    const state = await replyToRequest({}, formWith({ request_id: requestId, body: "  Monday works.  " }));

    expect(state).toEqual({ sent: true });
    expect(from).toHaveBeenCalledWith("messages");
    expect(insert).toHaveBeenCalledWith({ request_id: requestId, body: "Monday works." });
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("doesn't send who wrote the reply: the database takes it from the session", async () => {
    await replyToRequest({}, formWith({ request_id: requestId, body: "Hi", sender_id: "someone-else" }));

    expect(insert).toHaveBeenCalledWith({ request_id: requestId, body: "Hi" });
  });

  it("sends visitors to sign in and saves nothing", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    await expect(replyToRequest({}, formWith({ request_id: requestId, body: "Hi" }))).rejects.toThrow(
      "redirect:/sign-in",
    );
    expect(insert).not.toHaveBeenCalled();
  });

  it.each([
    ["", "Write a reply."],
    ["   \n ", "Write a reply."],
    ["a".repeat(1001), "Use at most 1000 characters."],
  ])("saves nothing when the reply is %#, and keeps what was typed", async (body, error) => {
    const state = await replyToRequest({}, formWith({ request_id: requestId, body }));

    expect(state).toEqual({ body: body.trim(), bodyError: error });
    expect(insert).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("keeps the reply and says so when it couldn't be saved", async () => {
    insertError = { message: "new row violates row-level security policy" };

    const state = await replyToRequest({}, formWith({ request_id: requestId, body: "Hi" }));

    expect(state).toEqual({ body: "Hi", formError: "Your reply couldn’t be sent. Try again in a moment." });
    expect(refresh).not.toHaveBeenCalled();
  });
});
