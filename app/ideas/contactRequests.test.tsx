import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactRequests } from "@/app/ideas/contactRequests";
import type { ContactRequest } from "@/lib/contact/contactRequests";
import type { Message } from "@/lib/contact/messages";

vi.mock("@/app/ideas/replyActions", () => ({ replyToRequest: vi.fn() }));

afterEach(cleanup);

const authorId = "00000000-0000-4000-8000-0000000000aa";

const requests: ContactRequest[] = [
  {
    id: "00000000-0000-4000-8000-000000000002",
    idea_id: "00000000-0000-4000-8000-000000000001",
    requester_email: "laura@investor.com",
    investor_name: "Laura Investor",
    investor_organisation: "North Capital",
    message: "I'd like to hear more.\nAre you free next week?",
    created_at: "2026-11-10T09:00:00Z",
    read_at: null,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    idea_id: "00000000-0000-4000-8000-000000000001",
    requester_email: "pablo@fund.es",
    investor_name: "   ",
    investor_organisation: "   ",
    message: "Interesting idea.",
    created_at: "2026-11-08T09:00:00Z",
    read_at: "2026-11-09T09:00:00Z",
  },
];

describe("ContactRequests", () => {
  it("lists each request with its email, date and message, in the order given", () => {
    render(<ContactRequests requests={requests} messages={[]} userId={authorId} />);
    const items = within(screen.getByRole("list", { name: "Contact requests" })).getAllByRole("listitem");

    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain("laura@investor.com");
    expect(items[0].textContent).toContain("10 Nov 2026");
    expect(items[0].textContent).toContain("Laura Investor");
    expect(items[0].textContent).toContain("North Capital");
    expect(items[0].textContent).toContain("Are you free next week?");
    expect(items[1].textContent).toContain("pablo@fund.es");
    expect(items[1].textContent).toContain("Not provided");
  });

  it("links each email so the team can reply", () => {
    render(<ContactRequests requests={requests} messages={[]} userId={authorId} />);

    expect(screen.getByRole("link", { name: "laura@investor.com" }).getAttribute("href")).toBe(
      "mailto:laura@investor.com",
    );
  });

  it("says so when nobody has asked yet", () => {
    render(<ContactRequests requests={[]} messages={[]} userId={authorId} />);

    expect(screen.getByRole("heading", { name: "Contact requests" })).toBeTruthy();
    expect(screen.getByText("No requests yet.")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("puts each request's replies under that request, with who wrote them", () => {
    const replies: Message[] = [
      {
        id: "m1",
        request_id: requests[1].id,
        sender_id: authorId,
        body: "Thanks, let's talk.",
        created_at: "2026-11-09T10:00:00Z",
      },
      {
        id: "m2",
        request_id: requests[1].id,
        sender_id: "someone-else",
        body: "Tomorrow at 5?",
        created_at: "2026-11-09T11:00:00Z",
      },
    ];
    render(<ContactRequests requests={requests} messages={replies} userId={authorId} />);
    const [first, second] = within(screen.getByRole("list", { name: "Contact requests" })).getAllByRole("listitem");

    expect(within(first).queryByRole("list", { name: "Replies" })).toBeNull();
    const shown = within(within(second).getByRole("list", { name: "Replies" })).getAllByRole("listitem");
    expect(shown.map((item) => item.textContent)).toEqual([
      expect.stringMatching(/^You\d.*Thanks, let's talk\.$/),
      // This investor left their name empty, so their email names them.
      expect.stringMatching(/^pablo@fund\.es\d.*Tomorrow at 5\?$/),
    ]);
  });

  it("gives every request its own reply form", () => {
    render(<ContactRequests requests={requests} messages={[]} userId={authorId} />);

    const forms = screen.getAllByRole("button", { name: "Send reply" });
    expect(forms).toHaveLength(2);
    const fieldIds = screen.getAllByLabelText("Your reply").map((field) => field.id);
    expect(new Set(fieldIds).size).toBe(2);
  });
});
