import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  type Idea,
  type IdeaSummary,
  ideaSummaryColumns,
  isIdeaId,
} from "@/lib/ideas/ideas";

// Anyone can read ideas (RLS policy "Anyone can read ideas"), so these work for visitors too.
// Problem, solution and team members are only readable through idea_details (006_hide_private_columns.sql).

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

  // IH-38: idea_details (005_idea_visibility.sql) hides private details and the team from visitors.
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("idea_details", { idea_id: id }).maybeSingle();

  if (error) throw new Error(`Couldn't load idea ${id}: ${error.message}`);
  return data as Idea | null;
}
