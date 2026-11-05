import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "@/app/auth/authForm";

// The code screen calls server actions that talk to Supabase; here they only need to exist.
vi.mock("@/app/auth/actions", () => ({ verifyCode: vi.fn(), resendCode: vi.fn() }));

afterEach(cleanup);

function renderForm(action: React.ComponentProps<typeof AuthForm>["action"]) {
  render(
    <AuthForm
      action={action}
      title="Create your account"
      submitLabel="Create account"
      passwordAutoComplete="new-password"
      footer={null}
    />,
  );
}

describe("AuthForm", () => {
  it("shows the email and password form first", () => {
    renderForm(vi.fn());
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(screen.queryByLabelText("Code")).toBeNull();
  });

  // IH-33: with email confirmation on, a sign-up (or a sign-in before confirming) ends on the code screen.
  it("asks for the emailed code once the action says one was sent", async () => {
    renderForm(vi.fn().mockResolvedValue({ confirmationSentTo: "ana@alumnos.upm.es" }));

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByLabelText("Code")).toBeTruthy();
    expect(screen.getByText("ana@alumnos.upm.es")).toBeTruthy();
  });

  it("shows an error from the action and stays on the form", async () => {
    renderForm(vi.fn().mockResolvedValue({ email: "ana@upm.es", formError: "Wrong email or password." }));

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Wrong email or password.")).toBeTruthy();
    expect(screen.queryByLabelText("Code")).toBeNull();
  });
});
