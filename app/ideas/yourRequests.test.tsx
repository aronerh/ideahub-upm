import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { YourRequests } from "@/app/ideas/yourRequests";
import type { ContactRequest } from "@/lib/contact/contactRequests";
import type { Message } from "@/lib/contact/messages";

vi.mock("@/app/ideas/replyActions", () => ({ replyToRequest: vi.fn() }));

afterEach(cleanup);

const investorId = "00000000-0000-4000-8000-0000000000bb";
const requests: ContactRequest[] = [
  {
    id: "r2",
    idea_id: "idea-1",
    requester_email: "laura@investor.com",
    investor_name: "Laura Investor",
    investor_organisation: "North Capital",
    message: "Second message.",
    created_at: "2026-11-12T09:00:00Z",
    read_at: null,
  },
  {
    id: "r1",
    idea_id: "idea-1",
    requester_email: "laura@investor.com",
    investor_name: "Laura Investor",
    investor_organisation: "North Capital",
    message: "First message.",
    created_at: "2026-11-10T09:00:00Z",
    read_at: null,
  },
];

describe("YourRequests", () => {
  it("renders nothing until the investor has written to the team", () => {
    const { container } = render(<YourRequests requests={[]} messages={[]} userId={investorId} />);

    expect(container.textContent).toBe("");
  });

  it("shows each request the investor sent, with the team's replies under the right one", () => {
    const messages: Message[] = [
      { id: "m1", request_id: "r1", sender_id: "team", body: "Welcome!", created_at: "2026-11-11T09:00:00Z" },
      { id: "m2", request_id: "r1", sender_id: investorId, body: "Thanks.", created_at: "2026-11-11T10:00:00Z" },
    ];
    render(<YourRequests requests={requests} messages={messages} userId={investorId} />);
    const [second, first] = within(screen.getByRole("list", { name: "Your requests" })).getAllByRole("listitem");

    expect(second.textContent).toContain("Second message.");
    expect(within(second).queryByRole("list", { name: "Replies" })).toBeNull();
    expect(first.textContent).toContain("First message.");
    const replies = within(within(first).getByRole("list", { name: "Replies" })).getAllByRole("listitem");
    expect(replies.map((item) => item.textContent)).toEqual([
      expect.stringMatching(/^The team\d.*Welcome!$/),
      expect.stringMatching(/^You\d.*Thanks\.$/),
    ]);
  });
});
