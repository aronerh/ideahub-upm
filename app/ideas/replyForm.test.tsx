import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { replyToRequest } from "@/app/ideas/replyActions";
import { ReplyForm } from "@/app/ideas/replyForm";

vi.mock("@/app/ideas/replyActions", () => ({ replyToRequest: vi.fn() }));

afterEach(cleanup);

describe("ReplyForm", () => {
  it("has a required reply field with the length rule, the request it belongs to and a send button", () => {
    const { container } = render(<ReplyForm requestId="request-1" />);

    const field = screen.getByLabelText("Your reply");
    expect(field).toHaveProperty("required", true);
    expect(field.getAttribute("maxlength")).toBe("1000");
    expect(container.querySelector<HTMLInputElement>('input[name="request_id"]')?.value).toBe("request-1");
    expect(screen.getByRole("button", { name: "Send reply" })).toBeTruthy();
  });

  it("shows the error next to the field and keeps what was typed", async () => {
    vi.mocked(replyToRequest).mockResolvedValue({ body: "Hi", bodyError: "Use at most 1000 characters." });
    render(<ReplyForm requestId="request-1" />);

    const field = screen.getByLabelText("Your reply");
    fireEvent.change(field, { target: { value: "Hi" } });
    fireEvent.click(screen.getByRole("button", { name: "Send reply" }));

    expect(await screen.findByText("Use at most 1000 characters.")).toBeTruthy();
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(field.getAttribute("aria-describedby")).toBe("reply-request-1-error");
    expect(field).toHaveProperty("value", "Hi");
  });

  it("tells the sender when the reply couldn't be sent", async () => {
    vi.mocked(replyToRequest).mockResolvedValue({
      body: "Hi",
      formError: "Your reply couldn’t be sent. Try again in a moment.",
    });
    render(<ReplyForm requestId="request-1" />);

    fireEvent.change(screen.getByLabelText("Your reply"), { target: { value: "Hi" } });
    fireEvent.click(screen.getByRole("button", { name: "Send reply" }));

    expect((await screen.findByRole("alert")).textContent).toBe("Your reply couldn’t be sent. Try again in a moment.");
  });

  it("shows no error before anything is sent", () => {
    render(<ReplyForm requestId="request-1" />);

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByLabelText("Your reply").getAttribute("aria-invalid")).toBe("false");
  });

  it("disables the button and says it is sending while the reply is on its way", async () => {
    vi.mocked(replyToRequest).mockReturnValue(new Promise(() => {}));
    render(<ReplyForm requestId="request-1" />);

    fireEvent.change(screen.getByLabelText("Your reply"), { target: { value: "Hi" } });
    fireEvent.click(screen.getByRole("button", { name: "Send reply" }));

    const button = await screen.findByRole("button", { name: "Sending…" });
    expect(button).toHaveProperty("disabled", true);
  });
});
