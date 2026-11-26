import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ContactRequests } from "@/app/ideas/contactRequests";
import type { ContactRequest } from "@/lib/contact/contactRequests";

afterEach(cleanup);

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
    render(<ContactRequests requests={requests} />);
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
    render(<ContactRequests requests={requests} />);

    expect(screen.getByRole("link", { name: "laura@investor.com" }).getAttribute("href")).toBe(
      "mailto:laura@investor.com",
    );
  });

  it("says so when nobody has asked yet", () => {
    render(<ContactRequests requests={[]} />);

    expect(screen.getByRole("heading", { name: "Contact requests" })).toBeTruthy();
    expect(screen.getByText("No requests yet.")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
