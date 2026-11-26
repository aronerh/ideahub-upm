"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { readReplyInput, validateReply } from "@/lib/contact/messages";
import { notifyReply } from "@/lib/contact/notifyReply";
import { createClient } from "@/lib/supabase/server";

export type ReplyFormState = {
  body?: string;
  bodyError?: string;
  formError?: string;
  sent?: boolean;
};

// IH-105 (story IH-73): saves a reply under a contact request. The investor who sent the request and
// the idea's author can both reply; RLS (010) refuses anyone else, so a wrong request id fails here too.
// IH-106: after saving, the other side gets an email (notifyReply).
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

  // IH-106: tell the other side. The reply is saved, so nothing below can fail the action.
  const { data: request } = await supabase
    .from("contact_requests")
    .select("id, idea_id, requester_id, requester_email")
    .eq("id", request_id)
    .maybeSingle();
  const { data: idea } = request
    ? await supabase.from("ideas").select("id, title, author_id").eq("id", request.idea_id).maybeSingle()
    : { data: null };
  if (request && idea) {
    const origin = (await headers()).get("origin") ?? "https://ideahub-upm.vercel.app";
    await notifyReply({
      senderId: user.id,
      requesterId: request.requester_id,
      requesterEmail: request.requester_email,
      authorId: idea.author_id,
      ideaTitle: idea.title,
      ideaUrl: `${origin}/ideas/${idea.id}`,
      body,
    });
  }

  // Refresh so the new reply shows in the thread.
  refresh();
  return { sent: true };
}
