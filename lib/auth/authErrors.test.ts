import { describe, expect, it } from "vitest";
import { authErrorMessage } from "@/lib/auth/authErrors";

describe("authErrorMessage", () => {
  it("explains a known Supabase error code", () => {
    expect(authErrorMessage("invalid_credentials")).toBe("Wrong email or password.");
  });

  it("says a code is wrong or expired", () => {
    expect(authErrorMessage("otp_expired")).toBe(
      "That code is wrong or has expired. Check it or ask for a new one.",
    );
  });

  it.each([undefined, "", "some_new_code"])("falls back to a generic message for %j", (code) => {
    expect(authErrorMessage(code)).toBe("Something went wrong. Try again.");
  });
});
