import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RequestsBadge } from "@/app/header/requestsBadge";

afterEach(cleanup);

const ideaId = "3f2b8c1e-9d4a-4b6e-8f0a-1c2d3e4f5a6b";

// IH-98: the unread contact requests badge in the header (IH-97).
describe("RequestsBadge", () => {
  it("shows the number of unread requests and opens the idea that has the newest one", () => {
    render(<RequestsBadge count={3} ideaId={ideaId} />);
    const link = screen.getByRole("link", { name: "3 unread contact requests" });

    expect(link.textContent).toBe("3");
    expect(link.getAttribute("href")).toBe(`/ideas/${ideaId}`);
  });

  it("says request, not requests, when there is one", () => {
    render(<RequestsBadge count={1} ideaId={ideaId} />);

    expect(screen.getByRole("link", { name: "1 unread contact request" })).toBeTruthy();
  });

  it("caps the number at 9+ but keeps the exact count for screen readers", () => {
    render(<RequestsBadge count={12} ideaId={ideaId} />);
    const link = screen.getByRole("link", { name: "12 unread contact requests" });

    expect(link.textContent).toBe("9+");
  });
});
