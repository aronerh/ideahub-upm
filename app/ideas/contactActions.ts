"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { readContactInput, validateContactMessage } from "@/lib/contact/contactRequests";
import { notifyTeam } from "@/lib/contact/notifyTeam";
import { isIdeaId } from "@/lib/ideas/ideas";
import { createClient } from "@/lib/supabase/server";

export type ContactFormState = {
  message?: string;
  messageError?: string;
  formError?: string;
  sent?: boolean;
};

// IH-42 (story IH-15): saves an investor's request to contact an idea's team and emails the author.
// The "Contact the team" form (IH-41) posts idea_id (hidden) and message here with useActionState.
export async function requestContact(
  _state: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { idea_id, message } = readContactInput(formData);
  const messageError = validateContactMessage(message);
  if (messageError) {
    return { message, messageError };
  }
  if (!isIdeaId(idea_id)) {
    return { message, formError: "This idea isn’t there any more." };
  }

  const supabase = await createClient();
  const { data: idea } = await supabase
    .from("ideas")
    .select("id, title, author_id")
    .eq("id", idea_id)
    .maybeSingle();
  if (!idea) {
    return { message, formError: "This idea isn’t there any more." };
  }
  if (idea.author_id === user.id) {
    return { message, formError: "This is your own idea." };
  }

  const { error } = await supabase.from("contact_requests").insert({ idea_id, message });
  if (error) {
    return { message, formError: "Your request couldn’t be sent. Try again in a moment." };
  }

  const origin = (await headers()).get("origin") ?? "https://ideahub-upm.vercel.app";
  await notifyTeam({
    authorId: idea.author_id,
    ideaTitle: idea.title,
    ideaUrl: `${origin}/ideas/${idea.id}`,
    requesterEmail: user.email,
    message,
  });

  return { sent: true };
}

// IH-97: the author opened the idea page that lists its requests, so they are read now.
// RLS (008) only lets the idea's author do this; for anyone else it changes nothing.
export async function markContactRequestsRead(ideaId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_requests")
    .update({ read_at: new Date().toISOString() })
    .eq("idea_id", ideaId)
    .is("read_at", null);

  // Refresh so the header badge drops the count. If saving failed, the badge stays
  // and the next visit tries again.
  if (!error) refresh();
}
