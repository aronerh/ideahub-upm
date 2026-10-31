"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { emailDomainError, isUpmEmail } from "@/lib/auth/emailDomain";
import { type IdeaInput, readIdeaInput } from "@/lib/ideas/ideas";
import { createClient } from "@/lib/supabase/server";

export type IdeaFormState = {
  values?: IdeaInput;
  formError?: string;
};

// IH-10: saves the idea and takes the student to its page.
// Per-field error messages are IH-24; for now the form relies on required and maxLength,
// and the database check constraints reject anything that slips through.
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

  const supabase = await createClient();
  const { data, error } = await supabase.from("ideas").insert(values).select("id").single();
  if (error) {
    return { values, formError: "Your idea couldn't be published. Check every field and try again." };
  }

  redirect(`/ideas/${data.id}?published=1`);
}
