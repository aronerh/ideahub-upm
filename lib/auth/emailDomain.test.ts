import { describe, expect, it } from "vitest";
import { isUpmEmail } from "@/lib/auth/emailDomain";

describe("isUpmEmail", () => {
  it.each(["ana@alumnos.upm.es", "ana@upm.es", "ana@fi.upm.es", "ana@dit.upm.es"])(
    "accepts %s",
    (email) => {
      expect(isUpmEmail(email)).toBe(true);
    },
  );

  it.each([
    "ana@ALUMNOS.UPM.ES",
    "ana@sub.fi.upm.es",
    "ana@etsit.upm.es",
    "ana@fakeupm.es",
    "ana@upm.es.evil.com",
    "ana@gmail.com",
    "@upm.es",
    "upm.es",
    "",
  ])("rejects %j", (email) => {
    expect(isUpmEmail(email)).toBe(false);
  });
});
