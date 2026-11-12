"use server";

import { revalidatePath } from "next/cache";
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

/**
 * IH-45: Delete an idea owned by the current student.
 */
export async function deleteIdea(ideaId: string): Promise<void> {
  // Require an authenticated user.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Connect using the current user's Supabase session.
  const supabase = await createClient();

  // Delete only an idea belonging to this student.
  const { data, error } = await supabase
    .from("ideas")
    .delete()
    .eq("id", ideaId)
    .eq("author_id", user.id)
    .select("id");

  if (error) {
    throw new Error("The idea could not be deleted.");
  }

  if (!data || data.length === 0) {
    throw new Error(
      "Idea not found or you don't have permission to delete it."
    );
  }

  // Refresh the public idea list.
  revalidatePath("/ideas");

  // Send the student back to the list.
  redirect("/ideas");
}

