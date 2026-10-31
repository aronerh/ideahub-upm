import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

  it("counts characters when there is a limit", () => {
    render(<FormField name="title" label="Title" maxLength={80} defaultValue="Bike" />);
    expect(screen.getByText("4 / 80")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Bike share" } });
    expect(screen.getByText("10 / 80")).toBeTruthy();
  });

  it("shows no counter without a limit", () => {
    render(<FormField name="email" label="Email" />);
    expect(screen.queryByText(/\/ \d+/)).toBeNull();
  });

  it("renders a textarea when multiline", () => {
    render(<FormField name="problem" label="Problem" multiline required maxLength={2000} />);
    const textarea = screen.getByLabelText("Problem");

    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveProperty("required", true);
    expect(textarea.getAttribute("maxlength")).toBe("2000");
  });
});
