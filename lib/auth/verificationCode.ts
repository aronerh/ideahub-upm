// IH-33: the number of digits in the sign-up code. Supabase's "Email OTP Length" setting must match.
export const codeLength = 6;

export type VerificationInput = {
  email: string;
  code: string;
  error: string | null;
};

// People paste codes as "483 920", so spaces anywhere are dropped before checking.
export function parseVerificationCode(formData: FormData): VerificationInput {
  const email = String(formData.get("email") ?? "").trim();
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  const isValid = new RegExp(`^\\d{${codeLength}}$`).test(code);

  return {
    email,
    code,
    error: isValid ? null : `Enter the ${codeLength}-digit code from your email.`,
  };
}
