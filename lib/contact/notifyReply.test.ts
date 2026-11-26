import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { notifyReply, replyEmailText, type ReplyNotification } from "@/lib/contact/notifyReply";

// IH-106: the email to the other side of a contact request, without Supabase or Resend.

vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

const investorId = "investor-1";
const authorId = "author-1";

// Bob (the investor) writes to Ana (the author), or the other way round.
const fromInvestor: ReplyNotification = {
  senderId: investorId,
  requesterId: investorId,
  requesterEmail: "bob@gmail.com",
  authorId,
  ideaTitle: "Study room finder",
  ideaUrl: "https://ideahub-upm.vercel.app/ideas/abc",
  body: "Can we talk on Monday?",
};
const fromAuthor: ReplyNotification = { ...fromInvestor, senderId: authorId, body: "Monday works." };

const getUserById = vi.fn();
const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("CONTACT_EMAIL_FROM", "IdeaHub UPM <contact@example.com>");
  vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test");
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(createClient).mockReturnValue({
    auth: { admin: { getUserById } },
  } as unknown as ReturnType<typeof createClient>);
  getUserById.mockResolvedValue({ data: { user: { email: "ana@alumnos.upm.es" } }, error: null });
  fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function sentEmail() {
  const [url, request] = fetchMock.mock.calls[0];
  return { url, request, body: JSON.parse(request.body) };
}

describe("notifyReply", () => {
  it("emails the idea's author when the investor replies, with the reply and a link to the idea", async () => {
    expect(await notifyReply(fromInvestor)).toBe("sent");

    expect(getUserById).toHaveBeenCalledWith(authorId);
    const { url, request, body } = sentEmail();
    expect(url).toBe("https://api.resend.com/emails");
    expect(request.headers.Authorization).toBe("Bearer re_test");
    expect(body).toMatchObject({
      from: "IdeaHub UPM <contact@example.com>",
      to: ["ana@alumnos.upm.es"],
      subject: "New reply about “Study room finder”",
    });
    expect(body.text).toContain("Can we talk on Monday?");
    expect(body.text).toContain("https://ideahub-upm.vercel.app/ideas/abc");
  });

  it("emails the investor when the author replies, without looking the author up", async () => {
    expect(await notifyReply(fromAuthor)).toBe("sent");

    expect(getUserById).not.toHaveBeenCalled();
    const { body } = sentEmail();
    expect(body.to).toEqual(["bob@gmail.com"]);
    expect(body.text).toContain("Monday works.");
  });

  it("doesn't set a reply-to, so neither side's address is handed over and the answer goes on the site", async () => {
    await notifyReply(fromInvestor);
    await notifyReply(fromAuthor);

    for (const [, request] of fetchMock.mock.calls) {
      expect(JSON.parse(request.body)).not.toHaveProperty("reply_to");
    }
  });

  it.each(["RESEND_API_KEY", "CONTACT_EMAIL_FROM", "SUPABASE_SECRET_KEY"])(
    "does nothing until %s is set",
    async (name) => {
      vi.stubEnv(name, "");

      expect(await notifyReply(fromInvestor)).toBe("not-configured");
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("reports a failure instead of throwing when the email service refuses", async () => {
    fetchMock.mockResolvedValue(new Response("bad sender", { status: 422 }));

    expect(await notifyReply(fromInvestor)).toBe("failed");
  });

  it("reports a failure instead of throwing when the email service can't be reached", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    expect(await notifyReply(fromAuthor)).toBe("failed");
  });

  it("reports a failure when the author has no email", async () => {
    getUserById.mockResolvedValue({ data: { user: null }, error: null });

    expect(await notifyReply(fromInvestor)).toBe("failed");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports a failure instead of throwing when looking up the author crashes", async () => {
    getUserById.mockRejectedValue(new Error("Supabase is down"));

    expect(await notifyReply(fromInvestor)).toBe("failed");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("emails nobody when the sender is on neither side of the request", async () => {
    expect(await notifyReply({ ...fromInvestor, senderId: "stranger" })).toBe("failed");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(getUserById).not.toHaveBeenCalled();
  });
});

describe("replyEmailText", () => {
  it("says who replied, about which idea, what they wrote and where to answer", () => {
    const text = replyEmailText(fromInvestor);

    expect(text).toContain("The investor replied");
    expect(text).toContain("“Study room finder”");
    expect(text).toContain("Can we talk on Monday?");
    expect(text).toContain("https://ideahub-upm.vercel.app/ideas/abc");
  });

  it("calls the author's side the team", () => {
    expect(replyEmailText(fromAuthor)).toContain("The team behind the idea replied");
  });

  it("doesn't print either side's email address", () => {
    expect(replyEmailText(fromInvestor)).not.toContain("bob@gmail.com");
    expect(replyEmailText(fromAuthor)).not.toContain("bob@gmail.com");
  });
});
