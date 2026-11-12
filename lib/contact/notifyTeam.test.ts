import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { notifyTeam, type ContactNotification } from "@/lib/contact/notifyTeam";

// IH-42: the email to the idea's author, without Supabase or Resend.

vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

const notification: ContactNotification = {
  authorId: "author-1",
  ideaTitle: "Study room finder",
  ideaUrl: "https://ideahub-upm.vercel.app/ideas/abc",
  requesterEmail: "bob@gmail.com",
  message: "I'd like to fund this.",
};

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

describe("notifyTeam", () => {
  it("emails the author, with the investor as reply-to and the message in the body", async () => {
    expect(await notifyTeam(notification)).toBe("sent");

    expect(getUserById).toHaveBeenCalledWith("author-1");
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(request.headers.Authorization).toBe("Bearer re_test");
    const body = JSON.parse(request.body);
    expect(body).toMatchObject({
      from: "IdeaHub UPM <contact@example.com>",
      to: ["ana@alumnos.upm.es"],
      reply_to: "bob@gmail.com",
      subject: "Someone wants to talk about “Study room finder”",
    });
    expect(body.text).toContain("I'd like to fund this.");
    expect(body.text).toContain("https://ideahub-upm.vercel.app/ideas/abc");
  });

  it.each(["RESEND_API_KEY", "CONTACT_EMAIL_FROM", "SUPABASE_SECRET_KEY"])(
    "does nothing until %s is set",
    async (name) => {
      vi.stubEnv(name, "");

      expect(await notifyTeam(notification)).toBe("not-configured");
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("reports a failure instead of throwing when the email service refuses", async () => {
    fetchMock.mockResolvedValue(new Response("bad sender", { status: 422 }));

    expect(await notifyTeam(notification)).toBe("failed");
  });

  it("reports a failure when the author has no email", async () => {
    getUserById.mockResolvedValue({ data: { user: null }, error: null });

    expect(await notifyTeam(notification)).toBe("failed");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
