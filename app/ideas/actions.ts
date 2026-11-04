"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { emailDomainError, isUpmEmail } from "@/lib/auth/emailDomain";
import {
  type IdeaFieldErrors,
  type IdeaInput,
  readIdeaInput,
  validateIdeaInput,
} from "@/lib/ideas/ideas";
import { createClient } from "@/lib/supabase/server";

export type IdeaFormState = {
  values?: IdeaInput;
  fieldErrors?: IdeaFieldErrors;
  formError?: string;
};

// IH-10: saves the idea and takes the student to its page.
// IH-24: an empty or too long field gets its own message and nothing is saved.
export async function publishIdea(
  _state: IdeaFormState,
  formData: FormData,
): Promise<IdeaFormState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const values = readIdeaInput(formData);
  if (!isUpmEmail(user.email)) {
    return { values, formError: emailDomainError };
  }

  const fieldErrors = validateIdeaInput(values);
  if (fieldErrors) {
    return { values, fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("ideas").insert(values).select("id").single();
  if (error) {
    return { values, formError: "Your idea couldn't be published. Check every field and try again." };
  }

  redirect(`/ideas/${data.id}?published=1`);
}
