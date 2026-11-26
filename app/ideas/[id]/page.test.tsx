import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoadedIdea } from "@/app/ideas/[id]/loadedIdea";
import type { Idea } from "@/lib/ideas/ideas";

const { getIdea, getCurrentUser, listContactRequests, listMyContactRequests, listMessages } = vi.hoisted(() => ({
  getIdea: vi.fn(),
  getCurrentUser: vi.fn(),
  listContactRequests: vi.fn(),
  listMyContactRequests: vi.fn(),
  listMessages: vi.fn(),
}));

vi.mock("@/lib/ideas/queries", () => ({ getIdea }));
vi.mock("@/lib/auth/currentUser", () => ({ getCurrentUser }));
vi.mock("@/lib/contact/queries", () => ({ listContactRequests, listMyContactRequests, listMessages }));

vi.mock("@/app/ideas/deleteIdeaButton", () => ({
  DeleteIdeaButton: () => <button type="button">Delete idea</button>,
}));

vi.mock("@/app/ideas/markRequestsRead", () => ({
  MarkRequestsRead: () => null,
}));

vi.mock("@/app/ideas/contactActions", () => ({
  requestContact: vi.fn(),
}));

vi.mock("@/app/ideas/replyActions", () => ({
  replyToRequest: vi.fn(),
}));

vi.mock("@/app/ui/backLink", () => ({
  BackLink: () => null,
}));

afterEach(cleanup);

const idea: Idea = {
  id: "00000000-0000-4000-8000-000000000001",
  author_id: "00000000-0000-4000-8000-0000000000aa",
  title: "Campus bike share",
  pitch: "Borrow a bike between campuses.",
  problem: "Private problem description.",
  solution: "Private solution description.",
  team_members: "Private team members.",
  created_at: "2026-10-27T10:00:00Z",
  problem_private: true,
  solution_private: true,
  team_private: true,
  sector: "health",
  stage: "prototype",
};

async function renderPage(view?: string) {
  const content = await LoadedIdea({
    params: Promise.resolve({ id: idea.id }),
    searchParams: Promise.resolve(view ? { view } : {}),
  });

  return render(content);
}

beforeEach(() => {
  vi.resetAllMocks();
  getIdea.mockResolvedValue(idea);
  getCurrentUser.mockResolvedValue({ id: idea.author_id });
  listContactRequests.mockResolvedValue([]);
  listMyContactRequests.mockResolvedValue([]);
  listMessages.mockResolvedValue([]);
});

describe("IH-92: visitor preview", () => {
  it("shows the visitor preview link to the owner", async () => {
    await renderPage();

    const link = await screen.findByRole("link", {
      name: "See as visitor",
    });

    expect(link.getAttribute("href")).toBe(
      `/ideas/${idea.id}?view=visitor`
    );
  });

  it("hides private fields when the owner previews as a visitor", async () => {
    await renderPage("visitor");

    await screen.findByText("Visitor preview");

    const article = screen.getByRole("article");

    expect(article.textContent).not.toContain(idea.problem);
    expect(article.textContent).not.toContain(idea.solution);
    expect(article.textContent).not.toContain(idea.team_members);

    expect(
      within(article).getAllByText(
        "Anyone with an IdeaHub account can read this."
      )
    ).toHaveLength(3);
  });

  it("keeps public problem and solution visible during preview", async () => {
    getIdea.mockResolvedValue({
      ...idea,
      problem_private: false,
      solution_private: false,
    });

    await renderPage("visitor");

    await screen.findByText("Visitor preview");

    const article = screen.getByRole("article");

    expect(article.textContent).toContain(idea.problem);
    expect(article.textContent).toContain(idea.solution);
    expect(article.textContent).not.toContain(idea.team_members);
  });

  it("ignores the visitor parameter for signed-in non-owners", async () => {
    getCurrentUser.mockResolvedValue({
      id: "00000000-0000-4000-8000-0000000000bb",
    });

    await renderPage("visitor");

    const article = await screen.findByRole("article");

    expect(screen.queryByText("Visitor preview")).toBeNull();
    expect(
      screen.queryByRole("link", { name: "See as visitor" })
    ).toBeNull();

    expect(article.textContent).toContain(idea.problem);
    expect(article.textContent).toContain(idea.solution);
    expect(article.textContent).toContain(idea.team_members);
    expect(listContactRequests).not.toHaveBeenCalled();
  });

  it("hides author-only controls and contact requests in preview", async () => {
    await renderPage("visitor");

    await screen.findByText("Visitor preview");

    expect(
      screen.queryByRole("link", { name: "Edit idea" })
    ).toBeNull();

    expect(
      screen.queryByRole("button", { name: "Delete idea" })
    ).toBeNull();

    expect(listContactRequests).not.toHaveBeenCalled();
    expect(listMyContactRequests).not.toHaveBeenCalled();
  });

  it("shows the signed-out contact box during preview", async () => {
    await renderPage("visitor");

    await screen.findByText("Visitor preview");

    const contactSection = screen.getByRole("heading", {
      name: "Contact the team",
    }).parentElement!;

    expect(
      within(contactSection).getByRole("link", { name: "Sign in" })
        .getAttribute("href")
    ).toBe("/sign-in");

    expect(screen.queryByLabelText("Your message")).toBeNull();
  });

  it("provides a link back to the normal author view", async () => {
    await renderPage("visitor");

    const link = await screen.findByRole("link", {
      name: "Back to my view",
    });

    expect(link.getAttribute("href")).toBe(`/ideas/${idea.id}`);
  });

  it("shows private information and controls in the normal author view", async () => {
    await renderPage();

    const article = await screen.findByRole("article");

    expect(article.textContent).toContain(idea.problem);
    expect(article.textContent).toContain(idea.solution);
    expect(article.textContent).toContain(idea.team_members);

    expect(
      screen.getByRole("link", { name: "Edit idea" })
    ).toBeTruthy();

    expect(
      screen.getByRole("button", { name: "Delete idea" })
    ).toBeTruthy();

    expect(listContactRequests).toHaveBeenCalledWith(idea.id);
  });
});

// IH-105: the replies under a contact request, on both sides of the conversation.
describe("IH-105: replies on the idea page", () => {
  const investorId = "00000000-0000-4000-8000-0000000000bb";
  const request = {
    id: "00000000-0000-4000-8000-000000000002",
    idea_id: idea.id,
    requester_email: "laura@investor.com",
    investor_name: "Laura Investor",
    investor_organisation: "North Capital",
    message: "I'd like to hear more.",
    created_at: "2026-11-10T09:00:00Z",
    read_at: null,
  };
  const reply = (sender_id: string, body: string) => ({
    id: `m-${body}`,
    request_id: request.id,
    sender_id,
    body,
    created_at: "2026-11-11T09:00:00Z",
  });

  it("shows the author each request with its replies, and loads them for those requests only", async () => {
    listContactRequests.mockResolvedValue([request]);
    listMessages.mockResolvedValue([reply(idea.author_id, "Monday works."), reply(investorId, "Great.")]);

    await renderPage();

    const replies = within(await screen.findByRole("list", { name: "Replies" }));
    expect(replies.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      expect.stringMatching(/^You\d.*Monday works\.$/),
      expect.stringMatching(/^Laura Investor\d.*Great\.$/),
    ]);
    expect(listMessages).toHaveBeenCalledWith([request.id]);
    expect(listMyContactRequests).not.toHaveBeenCalled();
  });

  it("shows an investor their own request and the team's replies, and a way to answer", async () => {
    getCurrentUser.mockResolvedValue({ id: investorId });
    listMyContactRequests.mockResolvedValue([request]);
    listMessages.mockResolvedValue([reply(idea.author_id, "Monday works.")]);

    await renderPage();

    const section = within(await screen.findByRole("region", { name: "Your messages to the team" }));
    expect(section.getByText("I'd like to hear more.")).toBeTruthy();
    expect(section.getByText("The team")).toBeTruthy();
    expect(section.getByText("Monday works.")).toBeTruthy();
    expect(section.getByRole("button", { name: "Send reply" })).toBeTruthy();
    expect(listMyContactRequests).toHaveBeenCalledWith(idea.id, investorId);
    expect(listMessages).toHaveBeenCalledWith([request.id]);
    expect(listContactRequests).not.toHaveBeenCalled();
  });

  it("shows no conversation to an investor who hasn't written to the team", async () => {
    getCurrentUser.mockResolvedValue({ id: investorId });

    await renderPage();

    await screen.findByRole("heading", { name: "Contact the team" });
    expect(screen.queryByRole("region", { name: "Your messages to the team" })).toBeNull();
    expect(listMessages).toHaveBeenCalledWith([]);
  });

  it("doesn't look up anyone's requests for a visitor", async () => {
    getCurrentUser.mockResolvedValue(null);

    await renderPage();

    await screen.findByRole("heading", { name: "Contact the team" });
    expect(listContactRequests).not.toHaveBeenCalled();
    expect(listMyContactRequests).not.toHaveBeenCalled();
  });
});
