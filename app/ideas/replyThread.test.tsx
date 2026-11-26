import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReplyThread } from "@/app/ideas/replyThread";
import type { Message } from "@/lib/contact/messages";

vi.mock("@/app/ideas/replyActions", () => ({ replyToRequest: vi.fn() }));

afterEach(cleanup);

const userId = "user-1";
const reply = (id: string, sender_id: string, body: string, created_at = "2026-11-11T09:00:00Z"): Message => ({
  id,
  request_id: "request-1",
  sender_id,
  body,
  created_at,
});

function thread(messages: Message[]) {
  return render(<ReplyThread requestId="request-1" messages={messages} userId={userId} otherSide="Laura Investor" />);
}

describe("ReplyThread", () => {
  it("shows the replies in the order given, naming the signed-in user 'You' and everyone else by otherSide", () => {
    thread([reply("m1", "someone", "First."), reply("m2", userId, "Second."), reply("m3", "someone", "Third.")]);

    const items = within(screen.getByRole("list", { name: "Replies" })).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringMatching(/^Laura Investor.*First\.$/),
      expect.stringMatching(/^You.*Second\.$/),
      expect.stringMatching(/^Laura Investor.*Third\.$/),
    ]);
  });

  it("shows only the reply box when nobody has replied yet", () => {
    thread([]);

    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.getByLabelText("Your reply")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Send reply" })).toBeTruthy();
  });

  it("dates each reply", () => {
    thread([reply("m1", "someone", "Hi", "2026-11-11T09:00:00Z")]);

    const time = screen.getByText("11 Nov 2026");
    expect(time.tagName).toBe("TIME");
    expect(time.getAttribute("datetime")).toBe("2026-11-11T09:00:00Z");
  });

  it("keeps the line breaks of a reply", () => {
    thread([reply("m1", "someone", "Hi,\n\nSee you Monday.")]);

    const body = screen.getByText(/See you Monday/);
    expect(body.textContent).toBe("Hi,\n\nSee you Monday.");
    // The browser only shows the line breaks with this style.
    expect(body.className).toContain("whitespace-pre-line");
  });

  it("shows markup in a reply as plain text instead of running it", () => {
    const { container } = thread([reply("m1", "someone", '<b>bold</b> <img src=x onerror="alert(1)">')]);

    expect(container.querySelector("b, img")).toBeNull();
    expect(screen.getByText(/<b>bold<\/b>/)).toBeTruthy();
  });

  it("points the reply box at its request", () => {
    const { container } = thread([]);

    expect(container.querySelector<HTMLInputElement>('input[name="request_id"]')?.value).toBe("request-1");
  });
});
