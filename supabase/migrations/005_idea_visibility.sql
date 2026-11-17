-- IH-38: a student can make an idea's problem and solution private.
-- Private details are readable only by signed-in users (UPM students and investors).
-- Team members are always hidden from visitors; title, pitch and date stay public.
-- Existing ideas stay public.
-- Apply before merging: the app reads ideas through idea_details from now on.

alter table public.ideas
  add column problem_private boolean not null default false,
  add column solution_private boolean not null default false;

-- One idea, with the details the reader may not see as null.
-- Security definer, so it still reads the columns 006 hides.
create or replace function public.idea_details(idea_id uuid)
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
    select (select auth.uid()) is not null as signed_in
  )
  select i.id, i.author_id, i.title, i.pitch,
         case when not i.problem_private or reader.signed_in then i.problem end,
         case when not i.solution_private or reader.signed_in then i.solution end,
         case when reader.signed_in then i.team_members end,
         i.created_at, i.problem_private, i.solution_private
  from public.ideas i, reader
  where i.id = idea_details.idea_id;
$$;

revoke execute on function public.idea_details(uuid) from public;
grant execute on function public.idea_details(uuid) to anon, authenticated;
