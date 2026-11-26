import { beforeEach, describe, expect, it, vi } from "vitest";
import { replyToRequest } from "@/app/ideas/replyActions";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { notifyReply } from "@/lib/contact/notifyReply";
import { createClient } from "@/lib/supabase/server";

// IH-105: saving a reply under a contact request, without the live database.

vi.mock("@/lib/auth/currentUser", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/contact/notifyReply", () => ({ notifyReply: vi.fn() }));
const request = vi.hoisted(() => ({ origin: "https://preview.example" as string | null }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers(request.origin ? { origin: request.origin } : {}),
}));
const refresh = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ refresh }));
// Like Next.js, redirect stops the action by throwing.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

const requestId = "20000000-0000-4000-8000-000000000001";
const ideaId = "10000000-0000-4000-8000-000000000001";

let insertError: { message: string } | null;
let contactRequest: { id: string; idea_id: string; requester_id: string; requester_email: string } | null;
let idea: { id: string; title: string; author_id: string } | null;
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
  request.origin = "https://preview.example";
  insertError = null;
  contactRequest = { id: requestId, idea_id: ideaId, requester_id: "user-1", requester_email: "bob@gmail.com" };
  idea = { id: ideaId, title: "Study room finder", author_id: "author-1" };
  insert.mockImplementation(async () => ({ error: insertError }));
  const lookup = (row: () => unknown) => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row() }) }) }) });
  from.mockImplementation((table: string) =>
    table === "messages" ? { insert } : table === "contact_requests" ? lookup(() => contactRequest) : lookup(() => idea),
  );
  vi.mocked(notifyReply).mockResolvedValue("sent");
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

  // IH-106: the other side gets an email once the reply is saved.
  it("emails the other side with the reply and a link to the idea", async () => {
    await replyToRequest({}, formWith({ request_id: requestId, body: "  Monday works.  " }));

    expect(notifyReply).toHaveBeenCalledWith({
      senderId: "user-1",
      requesterId: "user-1",
      requesterEmail: "bob@gmail.com",
      authorId: "author-1",
      ideaTitle: "Study room finder",
      ideaUrl: `https://preview.example/ideas/${ideaId}`,
      body: "Monday works.",
    });
  });

  it("links the idea on the live site when the request carries no origin", async () => {
    request.origin = null;

    await replyToRequest({}, formWith({ request_id: requestId, body: "Hi" }));

    expect(notifyReply).toHaveBeenCalledWith(
      expect.objectContaining({ ideaUrl: `https://ideahub-upm.vercel.app/ideas/${ideaId}` }),
    );
  });

  it("tells the email who wrote the reply, so it reaches the other side", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "author-1", email: "ana@alumnos.upm.es" });

    await replyToRequest({}, formWith({ request_id: requestId, body: "Hi Bob" }));

    expect(notifyReply).toHaveBeenCalledWith(
      expect.objectContaining({ senderId: "author-1", requesterId: "user-1", authorId: "author-1" }),
    );
  });

  it("still confirms the reply when the email isn't sent", async () => {
    vi.mocked(notifyReply).mockResolvedValue("failed");

    const state = await replyToRequest({}, formWith({ request_id: requestId, body: "Hi" }));

    expect(state).toEqual({ sent: true });
    expect(refresh).toHaveBeenCalledOnce();
  });

  it.each([
    ["request", () => (contactRequest = null)],
    ["idea", () => (idea = null)],
  ])("still saves and confirms the reply when the %s can't be read back, and emails nobody", async (_what, remove) => {
    remove();

    const state = await replyToRequest({}, formWith({ request_id: requestId, body: "Hi" }));

    expect(state).toEqual({ sent: true });
    expect(insert).toHaveBeenCalled();
    expect(notifyReply).not.toHaveBeenCalled();
  });

  it("emails nobody when the reply wasn't saved", async () => {
    insertError = { message: "new row violates row-level security policy" };
    await replyToRequest({}, formWith({ request_id: requestId, body: "Hi" }));
    await replyToRequest({}, formWith({ request_id: requestId, body: "" }));

    expect(notifyReply).not.toHaveBeenCalled();
  });

  // IH-107: edge cases.
  it("keeps the line breaks inside a reply when it saves it", async () => {
    await replyToRequest({}, formWith({ request_id: requestId, body: "Hi,\n\nMonday works." }));

    expect(insert).toHaveBeenCalledWith({ request_id: requestId, body: "Hi,\n\nMonday works." });
  });

  it("accepts a reply of exactly 1000 characters", async () => {
    const state = await replyToRequest({}, formWith({ request_id: requestId, body: "a".repeat(1000) }));

    expect(state).toEqual({ sent: true });
  });

  it("says the reply couldn't be sent, and emails nobody, when the request id is missing", async () => {
    // Without a request id the database refuses the insert (RLS or a bad id).
    insertError = { message: "invalid input syntax for type uuid" };

    const state = await replyToRequest({}, formWith({ body: "Hi" }));

    expect(state).toEqual({ body: "Hi", formError: "Your reply couldn’t be sent. Try again in a moment." });
    expect(insert).toHaveBeenCalledWith({ request_id: "", body: "Hi" });
    expect(notifyReply).not.toHaveBeenCalled();
  });

  it("doesn't email anyone for a visitor's reply", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    await expect(replyToRequest({}, formWith({ request_id: requestId, body: "Hi" }))).rejects.toThrow();
    expect(notifyReply).not.toHaveBeenCalled();
  });

  it("sends the email after saving, never before", async () => {
    const order: string[] = [];
    insert.mockImplementation(async () => {
      order.push("saved");
      return { error: null };
    });
    vi.mocked(notifyReply).mockImplementation(async () => {
      order.push("emailed");
      return "sent";
    });
    refresh.mockImplementation(() => order.push("refreshed"));

    await replyToRequest({}, formWith({ request_id: requestId, body: "Hi" }));

    expect(order).toEqual(["saved", "emailed", "refreshed"]);
  });
});
