import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  type Idea,
  type IdeaSummary,
  ideaColumns,
  ideaSummaryColumns,
  isIdeaId,
} from "@/lib/ideas/ideas";

// Anyone can read ideas (RLS policy "Anyone can read ideas"), so these work for visitors too.

export async function listIdeas(): Promise<IdeaSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select(ideaSummaryColumns)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Couldn't load ideas: ${error.message}`);
  return data;
}

export async function getIdea(id: string): Promise<Idea | null> {
  if (!isIdeaId(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select(ideaColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Couldn't load idea ${id}: ${error.message}`);
  return data;
}
