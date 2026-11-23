import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  type Idea,
  type IdeaSummary,
  isIdeaId,
} from "@/lib/ideas/ideas";
import type { IdeaSearch } from "@/lib/ideas/classification";

// Anyone can read ideas (RLS policy "Anyone can read ideas"), so these work for visitors too.
// Problem, solution and team members are only readable through idea_details (006_hide_private_columns.sql).

// IH-14: newest first, narrowed by the search words and the sector and stage filters
// (search_ideas in 007_sector_stage.sql). With no search it lists every idea.
export async function listIdeas(search?: IdeaSearch): Promise<IdeaSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_ideas", {
    query: search?.query ?? "",
    sector: search?.sector || null,
    stage: search?.stage || null,
  });

  if (error) throw new Error(`Couldn't load ideas: ${error.message}`);
  return data as IdeaSummary[];
}

export async function getIdea(id: string): Promise<Idea | null> {
  if (!isIdeaId(id)) return null;

  // IH-38: idea_details (005_idea_visibility.sql) hides private details and the team from visitors.
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("idea_details", { idea_id: id }).maybeSingle();

  if (error) throw new Error(`Couldn't load idea ${id}: ${error.message}`);
  return data as Idea | null;
}
