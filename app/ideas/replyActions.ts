"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { readReplyInput, validateReply } from "@/lib/contact/messages";
import { createClient } from "@/lib/supabase/server";

export type ReplyFormState = {
  body?: string;
  bodyError?: string;
  formError?: string;
  sent?: boolean;
};

// IH-105 (story IH-73): saves a reply under a contact request. The investor who sent the request and
// the idea's author can both reply; RLS (010) refuses anyone else, so a wrong request id fails here too.
// The reply form posts request_id (hidden) and body with useActionState.
export async function replyToRequest(
  _state: ReplyFormState,
  formData: FormData,
): Promise<ReplyFormState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { request_id, body } = readReplyInput(formData);
  const bodyError = validateReply(body);
  if (bodyError) {
    return { body, bodyError };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({ request_id, body });
  if (error) {
    return { body, formError: "Your reply couldn’t be sent. Try again in a moment." };
  }

  // Refresh so the new reply shows in the thread.
  refresh();
  return { sent: true };
}
