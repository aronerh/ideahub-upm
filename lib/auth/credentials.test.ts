import { describe, expect, it } from "vitest";
import { minPasswordLength, parseCredentials } from "@/lib/auth/credentials";

function formWith(email: string, password: string) {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
  return formData;
}

describe("parseCredentials", () => {
  it("trims spaces around the email but keeps its case", () => {
    const { email } = parseCredentials(formWith("  Ana.Test@alumnos.upm.es ", "secret1"));
    expect(email).toBe("Ana.Test@alumnos.upm.es");
  });

  it("accepts a valid email and password", () => {
    const { fieldErrors } = parseCredentials(formWith("ana@upm.es", "secret1"), minPasswordLength);
    expect(fieldErrors).toBeNull();
  });

  it("asks for a valid email and a password when both are empty", () => {
    const { fieldErrors } = parseCredentials(formWith("", ""));
    expect(fieldErrors).toEqual({
      email: "Enter a valid email address.",
      password: "Enter your password.",
    });
  });

  it("rejects a password shorter than the minimum", () => {
    const { fieldErrors } = parseCredentials(formWith("ana@upm.es", "abc"), minPasswordLength);
    expect(fieldErrors).toEqual({ password: "Use at least 6 characters." });
  });

  it("only checks that a password is present when no minimum is given", () => {
    const { fieldErrors } = parseCredentials(formWith("ana@upm.es", "abc"));
    expect(fieldErrors).toBeNull();
  });
});
