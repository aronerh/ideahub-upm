import "server-only";
import { type ContactRequest, contactRequestColumns } from "@/lib/contact/contactRequests";
import { type Message, messageColumns } from "@/lib/contact/messages";
import { createClient } from "@/lib/supabase/server";

// IH-43: the requests sent about one idea, newest first. RLS returns them only to the idea's author
// (and each sender sees their own), so call this only for the author.
export async function listContactRequests(ideaId: string): Promise<ContactRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_requests")
    .select(contactRequestColumns)
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Couldn't load contact requests for idea ${ideaId}: ${error.message}`);
  return data;
}

// IH-97: the author's unread requests, newest first, for the badge in the header.
// The inner join on ideas keeps only requests about this author's ideas: RLS would also return
// the requests the author sent to other people's ideas.
export async function listUnreadContactRequests(authorId: string): Promise<{ idea_id: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_requests")
    .select("idea_id, ideas!inner(author_id)")
    .is("read_at", null)
    .eq("ideas.author_id", authorId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Couldn't load unread contact requests: ${error.message}`);
  return data.map((request) => ({ idea_id: request.idea_id }));
}

// IH-105: the requests the signed-in user sent about one idea, newest first, so an investor can find
// their conversation with the team. The requester_id filter matters: the idea's author would otherwise
// get every request about it.
export async function listMyContactRequests(ideaId: string, userId: string): Promise<ContactRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_requests")
    .select(contactRequestColumns)
    .eq("idea_id", ideaId)
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Couldn't load your contact requests for idea ${ideaId}: ${error.message}`);
  return data;
}

// IH-105: the replies under the given requests, oldest first. RLS (010) returns only the replies of
// requests the signed-in user sent or received.
export async function listMessages(requestIds: string[]): Promise<Message[]> {
  if (requestIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select(messageColumns)
    .in("request_id", requestIds)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Couldn't load the replies: ${error.message}`);
  return data;
}
