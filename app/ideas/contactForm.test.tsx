import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/app/ideas/contactForm";
import { requestContact } from "@/app/ideas/contactActions";

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
    expect(screen.getByText("0 / 100")).toBeTruthy();
    expect(organisation).toHaveProperty("required", true);
    expect(organisation.getAttribute("maxlength")).toBe("120");
    expect(message).toHaveProperty("required", true);
    expect(message.getAttribute("maxlength")).toBe("1000");
    expect(screen.getByText("1 to 1000 characters.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Contact the team" })).toBeTruthy();
  });

  it("shows field errors accessibly and preserves typed values", async () => {
    vi.mocked(requestContact).mockResolvedValue({
      investorName: "Laura Investor",
      investorNameError: "Write your name.",
      investorOrganisation: "North Capital",
      investorOrganisationError: "Write the organisation you represent.",
      message: "I'd like to talk.",
    });
    render(<ContactForm ideaId="idea-1" signedIn={true} />);

    const name = screen.getByLabelText("Your name");
    const organisation = screen.getByLabelText("Organisation");
    const message = screen.getByLabelText("Your message");
    fireEvent.change(name, { target: { value: "Laura Investor" } });
    fireEvent.change(organisation, { target: { value: "North Capital" } });
    fireEvent.change(message, { target: { value: "I'd like to talk." } });
    fireEvent.click(screen.getByRole("button", { name: "Contact the team" }));

    expect(await screen.findByText("Write your name.")).toBeTruthy();
    expect(screen.getByText("Write the organisation you represent.")).toBeTruthy();
    expect(name).toHaveProperty("value", "Laura Investor");
    expect(organisation).toHaveProperty("value", "North Capital");
    expect(message).toHaveProperty("value", "I'd like to talk.");
    expect(name.getAttribute("aria-invalid")).toBe("true");
    expect(name.getAttribute("aria-describedby")).toBe("investor_name-error");
    expect(organisation.getAttribute("aria-invalid")).toBe("true");
    expect(organisation.getAttribute("aria-describedby")).toBe("investor_organisation-error");
  });
});
