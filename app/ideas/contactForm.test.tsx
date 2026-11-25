import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/app/ideas/contactForm";

vi.mock("@/app/ideas/contactActions", () => ({
  requestContact: vi.fn(),
}));

afterEach(cleanup);

describe("ContactForm", () => {
  it("shows the investor detail and message fields with their length rules and submit action", () => {
    render(<ContactForm ideaId="idea-1" signedIn={true} />);

    const name = screen.getByLabelText("Your name");
    const organisation = screen.getByLabelText("Organisation");
    const message = screen.getByLabelText("Your message");
    expect(name).toHaveProperty("required", true);
    expect(name.getAttribute("maxlength")).toBe("100");
    expect(organisation).toHaveProperty("required", true);
    expect(organisation.getAttribute("maxlength")).toBe("120");
    expect(message).toHaveProperty("required", true);
    expect(message.getAttribute("maxlength")).toBe("1000");
    expect(screen.getByText("1 to 1000 characters.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Contact the team" })).toBeTruthy();
  });
});
