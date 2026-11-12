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
