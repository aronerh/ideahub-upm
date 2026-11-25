"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { emailDomainError, isUpmEmail } from "@/lib/auth/emailDomain";
import {
  type IdeaFieldErrors,
  type IdeaInput,
  type IdeaVisibility,
  readIdeaInput,
  readIdeaVisibility,
  validateIdeaInput,
} from "@/lib/ideas/ideas";
import {
  type IdeaClassification,
  readIdeaClassification,
  validateIdeaClassification,
} from "@/lib/ideas/classification";
import { createClient } from "@/lib/supabase/server";

export type IdeaFormState = {
  values?: IdeaInput;
  visibility?: IdeaVisibility;
  // IH-14: the sector and stage picked, kept when the form comes back with errors.
  classification?: IdeaClassification;
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
  const visibility = readIdeaVisibility(formData);
  const classification = readIdeaClassification(formData);
  if (!isUpmEmail(user.email)) {
    return { values, visibility, classification, formError: emailDomainError };
  }

  const fieldErrors = mergeErrors(validateIdeaInput(values), validateIdeaClassification(classification));
  if (fieldErrors) {
    return { values, visibility, classification, fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .insert({ ...values, ...visibility, ...classification })
    .select("id")
    .single();
  if (error) {
    return {
      values,
      visibility,
      classification,
      formError: "Your idea couldn't be published. Check every field and try again.",
    };
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

  // Refresh the public idea list, which is the home page (there is no /ideas page).
  revalidatePath("/");

  // Send the student back to the list.
  redirect("/");
}


/**
 * IH-46: Update an idea owned by the current student.
 */
export async function updateIdea(
  ideaId: string,
  _state: IdeaFormState,
  formData: FormData,
): Promise<IdeaFormState> {
  // Require an authenticated student.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Read the five edited fields, plus sector and stage (IH-14).
  const values = readIdeaInput(formData);
  const classification = readIdeaClassification(formData);

  // Check the student's UPM email.
  if (!isUpmEmail(user.email)) {
    return { values, classification, formError: emailDomainError };
  }

  // Validate the edited values.
  const fieldErrors = mergeErrors(validateIdeaInput(values), validateIdeaClassification(classification));

  if (fieldErrors) {
    return { values, classification, fieldErrors };
  }

  // Connect to Supabase as the current user.
  const supabase = await createClient();

  // Only update an idea belonging to this student.
  const { data, error } = await supabase
    .from("ideas")
    .update({ ...values, ...classification })
    .eq("id", ideaId)
    .eq("author_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      values,
      classification,
      formError: "Your idea couldn't be updated. Please try again.",
    };
  }

  // No matching idea, or the user isn't its owner.
  if (!data) {
    return {
      values,
      classification,
      formError: "Idea not found or you don't have permission to edit it.",
    };
  }

  // Refresh the ideas list and detail page.
  revalidatePath("/ideas");
  revalidatePath(`/ideas/${ideaId}`);

  // Return to the updated idea.
  redirect(`/ideas/${ideaId}`);
}



// Puts the 5 fields' errors and the sector and stage errors together; null when there are none.
function mergeErrors(...errors: (IdeaFieldErrors | null)[]): IdeaFieldErrors | null {
  const merged: IdeaFieldErrors = Object.assign({}, ...errors.filter(Boolean));
  return Object.keys(merged).length > 0 ? merged : null;
}
