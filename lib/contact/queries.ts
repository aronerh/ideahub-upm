import "server-only";
import { type ContactRequest, contactRequestColumns } from "@/lib/contact/contactRequests";
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
