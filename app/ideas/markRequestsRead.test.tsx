import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { markContactRequestsRead } from "@/app/ideas/contactActions";
import { MarkRequestsRead } from "@/app/ideas/markRequestsRead";

vi.mock("@/app/ideas/contactActions", () => ({ markContactRequestsRead: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const ideaId = "3f2b8c1e-9d4a-4b6e-8f0a-1c2d3e4f5a6b";

// IH-98: the idea page marks its requests as read once it is on screen.
describe("MarkRequestsRead", () => {
  it("marks this idea's requests as read once, and shows nothing", () => {
    const { container, rerender } = render(<MarkRequestsRead ideaId={ideaId} />);
    rerender(<MarkRequestsRead ideaId={ideaId} />);

    expect(markContactRequestsRead).toHaveBeenCalledTimes(1);
    expect(markContactRequestsRead).toHaveBeenCalledWith(ideaId);
    expect(container.innerHTML).toBe("");
  });
});
