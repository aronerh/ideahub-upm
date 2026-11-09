import { beforeEach, describe, expect, it, vi } from "vitest";
import { signUp } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

// Signing up without the live Supabase project: its auth client is a stand-in.

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ origin: "http://localhost:3000" }),
}));
// Like Next.js, redirect stops the action by throwing.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

const authSignUp = vi.fn();

function formWith(email: string, password: string) {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClient).mockResolvedValue({
    auth: { signUp: authSignUp },
  } as unknown as Awaited<ReturnType<typeof createClient>>);
});

describe("signUp", () => {
  it("takes a newly signed-in student to the publish form", async () => {
    authSignUp.mockResolvedValue({ data: { session: { access_token: "token" } }, error: null });

    await expect(signUp({}, formWith("ana@alumnos.upm.es", "secret1"))).rejects.toThrow(
      "redirect:/ideas/new",
    );
  });

  it("asks the student to check their email when confirmation is on", async () => {
    authSignUp.mockResolvedValue({ data: { session: null }, error: null });

    await expect(signUp({}, formWith("ana@alumnos.upm.es", "secret1"))).resolves.toEqual({
      confirmationSentTo: "ana@alumnos.upm.es",
    });
  });

  it("does not call Supabase when the password is too short", async () => {
    const state = await signUp({}, formWith("ana@alumnos.upm.es", "abc"));

    expect(state.fieldErrors).toEqual({ password: "Use at least 6 characters." });
    expect(authSignUp).not.toHaveBeenCalled();
  });
});
