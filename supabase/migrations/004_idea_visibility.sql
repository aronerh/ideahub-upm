-- IH-38: a student can make an idea's problem and solution private.
-- Title, pitch, team members and date stay public; private details are readable only by
-- the author and signed-in UPM users. Existing ideas stay public.
-- Apply before merging: the app reads ideas through idea_details from now on.

alter table public.ideas
  add column problem_private boolean not null default false,
  add column solution_private boolean not null default false;

-- One idea, with the private details as null when the reader may not see them.
-- Security definer, so it still reads problem and solution after 005 hides those columns.
create function public.idea_details(idea_id uuid)
returns table (
  id uuid,
  author_id uuid,
  title text,
  pitch text,
  problem text,
  solution text,
  team_members text,
  created_at timestamptz,
  problem_private boolean,
  solution_private boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with reader as (
    select (select auth.uid()) as id,
           public.is_upm_email((select auth.jwt()) ->> 'email') as is_upm
  )
  select i.id, i.author_id, i.title, i.pitch,
         case when not i.problem_private or reader.is_upm or i.author_id = reader.id
              then i.problem end,
         case when not i.solution_private or reader.is_upm or i.author_id = reader.id
              then i.solution end,
         i.team_members, i.created_at, i.problem_private, i.solution_private
  from public.ideas i, reader
  where i.id = idea_details.idea_id;
$$;

revoke execute on function public.idea_details(uuid) from public;
grant execute on function public.idea_details(uuid) to anon, authenticated;
