// Supabase's default minimum password length.
export const minPasswordLength = 6;

export type FieldErrors = {
  email?: string;
  password?: string;
};

export type Credentials = {
  email: string;
  password: string;
  fieldErrors: FieldErrors | null;
};

// The email is kept as typed (case matters); only surrounding spaces are removed.
export function parseCredentials(
  formData: FormData,
  requiredPasswordLength = 1,
): Credentials {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fieldErrors: FieldErrors = {};

  if (!email.includes("@")) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (password.length === 0) {
    fieldErrors.password = "Enter your password.";
  } else if (password.length < requiredPasswordLength) {
    fieldErrors.password = `Use at least ${requiredPasswordLength} characters.`;
  }

  const hasErrors = Object.keys(fieldErrors).length > 0;
  return { email, password, fieldErrors: hasErrors ? fieldErrors : null };
}
