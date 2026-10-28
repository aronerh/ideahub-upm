"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authErrorMessage } from "@/lib/auth/authErrors";
import {
  minPasswordLength,
  parseCredentials,
  type FieldErrors,
} from "@/lib/auth/credentials";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  email?: string;
  fieldErrors?: FieldErrors;
  formError?: string;
  confirmationSentTo?: string;
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
  const origin = (await headers()).get("origin") ?? undefined;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: origin },
  });
  if (error) {
    return { email, formError: authErrorMessage(error.code) };
  }

  // A session means email confirmation is off, so the user is already signed in.
  if (data.session) {
    redirect("/");
  }
  return { confirmationSentTo: email };
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
