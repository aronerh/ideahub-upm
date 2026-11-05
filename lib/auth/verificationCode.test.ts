import { describe, expect, it } from "vitest";
import { codeLength, parseVerificationCode } from "@/lib/auth/verificationCode";

function formWith(email: string, code: string) {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("code", code);
  return formData;
}

describe("parseVerificationCode", () => {
  it("uses a 6-digit code", () => {
    expect(codeLength).toBe(6);
  });

  it("accepts a 6-digit code", () => {
    const { code, error } = parseVerificationCode(formWith("ana@upm.es", "483920"));
    expect(code).toBe("483920");
    expect(error).toBeNull();
  });

  it("ignores spaces, as in a pasted '483 920'", () => {
    const { code, error } = parseVerificationCode(formWith("ana@upm.es", " 483 920 "));
    expect(code).toBe("483920");
    expect(error).toBeNull();
  });

  it("trims spaces around the email but keeps its case", () => {
    const { email } = parseVerificationCode(formWith("  Ana.Test@alumnos.upm.es ", "483920"));
    expect(email).toBe("Ana.Test@alumnos.upm.es");
  });

  it.each(["", "12345", "1234567", "12345a", "abcdef", "12-345"])(
    "asks for the 6-digit code when given %j",
    (code) => {
      const { error } = parseVerificationCode(formWith("ana@upm.es", code));
      expect(error).toBe("Enter the 6-digit code from your email.");
    },
  );

  it("asks for the code when the field is missing", () => {
    const { error } = parseVerificationCode(new FormData());
    expect(error).toBe("Enter the 6-digit code from your email.");
  });
});
