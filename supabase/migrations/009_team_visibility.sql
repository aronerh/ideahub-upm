-- IH-93 (story IH-69): a student can make the team members public.
-- Hidden is the default, so existing ideas keep the team hidden from visitors, as before.
-- Signed-in users still see every team.
-- Apply before merging: the app reads team_private through idea_details.

alter table public.ideas
  add column team_private boolean not null default true;

-- 006 lists every readable column: everyone can read the new one.
grant select (team_private) on public.ideas to anon, authenticated;

-- idea_details (007) also returns team_private, and shows a public team to visitors.
-- Adding a column to its result means dropping and recreating it.
drop function public.idea_details(uuid);

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
  solution_private boolean,
  team_private boolean,
  sector text,
  stage text
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
         case when not i.team_private or reader.signed_in then i.team_members end,
         i.created_at, i.problem_private, i.solution_private, i.team_private,
         i.sector, i.stage
  from public.ideas i, reader
  where i.id = idea_details.idea_id;
$$;

revoke execute on function public.idea_details(uuid) from public;
grant execute on function public.idea_details(uuid) to anon, authenticated;
