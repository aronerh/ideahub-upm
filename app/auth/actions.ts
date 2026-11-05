"use server";

import { redirect } from "next/navigation";
import { authErrorMessage } from "@/lib/auth/authErrors";
import {
  minPasswordLength,
  parseCredentials,
  type FieldErrors,
} from "@/lib/auth/credentials";
import { parseVerificationCode } from "@/lib/auth/verificationCode";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  email?: string;
  fieldErrors?: FieldErrors;
  formError?: string;
  // Set when a 6-digit code was emailed: the form then asks for the code.
  confirmationSentTo?: string;
};

export type CodeState = {
  error?: string;
  notice?: string;
};

export async function signUp(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password, fieldErrors } = parseCredentials(
    formData,
    minPasswordLength,
  );
  if (fieldErrors) {
    return { email, fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { email, formError: authErrorMessage(error.code) };
  }

  // A session means email confirmation is off, so the user is already signed in.
  if (data.session) {
    redirect("/");
  }
  // IH-33: Supabase emailed a 6-digit code (a link gets used up by email scanners, IH-32).
  return { confirmationSentTo: email };
}

// IH-33: checks the code from the sign-up email, then signs the student in.
export async function verifyCode(
  _state: CodeState,
  formData: FormData,
): Promise<CodeState> {
  const { email, code, error } = parseVerificationCode(formData);
  if (error) {
    return { error };
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "signup",
  });
  if (verifyError) {
    return { error: authErrorMessage(verifyError.code) };
  }

  redirect("/");
}

// IH-33: emails a fresh code when the first one is lost or has expired.
export async function resendCode(
  _state: CodeState,
  formData: FormData,
): Promise<CodeState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: authErrorMessage() };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) {
    return { error: authErrorMessage(error.code) };
  }

  return { notice: "We sent you a new code." };
}

export async function signIn(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password, fieldErrors } = parseCredentials(formData);
  if (fieldErrors) {
    return { email, fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error?.code === "email_not_confirmed") {
    // The student signed up but never entered the code: send a fresh one and ask for it.
    // If sending fails (rate limit), the code screen still has its own resend button.
    await supabase.auth.resend({ type: "signup", email });
    return { email, confirmationSentTo: email };
  }
  if (error) {
    return { email, formError: authErrorMessage(error.code) };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
