import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FormField } from "@/app/ui/formField";

afterEach(cleanup);

describe("FormField", () => {
  it("links the label to the input", () => {
    render(<FormField name="email" label="Email" />);
    expect(screen.getByLabelText("Email")).toHaveProperty("name", "email");
  });

  it("shows the error and marks the input invalid", () => {
    render(<FormField name="email" label="Email" error="Enter a valid email address." />);
    const input = screen.getByLabelText("Email");

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("email-error");
    expect(screen.getByText("Enter a valid email address.").id).toBe("email-error");
  });

  it("has no error by default", () => {
    render(<FormField name="email" label="Email" />);
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe("false");
  });

  it("renders a textarea when multiline", () => {
    render(<FormField name="problem" label="Problem" multiline required maxLength={2000} />);
    const textarea = screen.getByLabelText("Problem");

    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveProperty("required", true);
    expect(textarea.getAttribute("maxlength")).toBe("2000");
  });
});
