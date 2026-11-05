import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resendCode, verifyCode } from "@/app/auth/actions";
import { VerifyCodeForm } from "@/app/auth/verifyCodeForm";

// The server actions talk to Supabase; the form only needs something to call.
vi.mock("@/app/auth/actions", () => ({ verifyCode: vi.fn(), resendCode: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("VerifyCodeForm", () => {
  it("says where the code was sent", () => {
    render(<VerifyCodeForm email="ana@alumnos.upm.es" />);
    expect(screen.getByText("ana@alumnos.upm.es")).toBeTruthy();
    expect(screen.getByText(/6-digit code/)).toBeTruthy();
  });

  it("has a one-time-code field for exactly 6 digits with a number keypad", () => {
    render(<VerifyCodeForm email="ana@alumnos.upm.es" />);
    const field = screen.getByLabelText("Code");
    expect(field.getAttribute("maxlength")).toBe("6");
    expect(field.getAttribute("inputmode")).toBe("numeric");
    expect(field.getAttribute("autocomplete")).toBe("one-time-code");
  });

  it("sends the email along with the code", () => {
    const { container } = render(<VerifyCodeForm email="ana@alumnos.upm.es" />);
    const emails = container.querySelectorAll<HTMLInputElement>('input[name="email"]');
    expect(emails).toHaveLength(2); // one in the verify form, one in the resend form
    for (const input of emails) {
      expect(input.value).toBe("ana@alumnos.upm.es");
    }
  });

  it("leaves validation to the server", () => {
    const { container } = render(<VerifyCodeForm email="ana@alumnos.upm.es" />);
    expect(container.querySelector("form")?.noValidate).toBe(true);
  });

  it("shows a wrong or expired code under the field", async () => {
    vi.mocked(verifyCode).mockResolvedValue({
      error: "That code is wrong or has expired. Check it or ask for a new one.",
    });
    render(<VerifyCodeForm email="ana@alumnos.upm.es" />);

    fireEvent.change(screen.getByLabelText("Code"), { target: { value: "000000" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    expect(
      await screen.findByText("That code is wrong or has expired. Check it or ask for a new one."),
    ).toBeTruthy();
    expect(screen.getByLabelText("Code").getAttribute("aria-invalid")).toBe("true");
  });

  it("confirms when a new code was sent", async () => {
    vi.mocked(resendCode).mockResolvedValue({ notice: "We sent you a new code." });
    render(<VerifyCodeForm email="ana@alumnos.upm.es" />);

    fireEvent.click(screen.getByRole("button", { name: "Send a new code" }));

    expect(await screen.findByText("We sent you a new code.")).toBeTruthy();
  });

  it("shows why a new code could not be sent", async () => {
    vi.mocked(resendCode).mockResolvedValue({
      error: "Too many emails sent. Wait a few minutes and try again.",
    });
    render(<VerifyCodeForm email="ana@alumnos.upm.es" />);

    fireEvent.click(screen.getByRole("button", { name: "Send a new code" }));

    expect(
      await screen.findByText("Too many emails sent. Wait a few minutes and try again."),
    ).toBeTruthy();
  });
});
