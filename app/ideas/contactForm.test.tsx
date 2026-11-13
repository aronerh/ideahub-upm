import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/app/ideas/contactForm";

vi.mock("@/app/ideas/contactActions", () => ({
  requestContact: vi.fn(),
}));

afterEach(cleanup);

describe("ContactForm", () => {
  it("shows the message field with the contact length rules and submit action", () => {
    render(<ContactForm ideaId="idea-1" signedIn={true} />);

    const field = screen.getByLabelText("Your message");
    expect(field).toHaveProperty("required", true);
    expect(field.getAttribute("maxlength")).toBe("1000");
    expect(screen.getByText("1 to 1000 characters.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Contact the team" })).toBeTruthy();
  });
});
