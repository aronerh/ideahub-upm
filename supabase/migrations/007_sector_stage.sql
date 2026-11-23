-- IH-14 (IH-83): an idea's sector and stage, and the search and filters on the ideas list.
-- The allowed values are the same as in lib/ideas/classification.ts.
-- Both are optional here because ideas published before IH-14 have none; the publish and edit
-- forms require them from now on.
-- Apply before merging: the app reads sector and stage through idea_details and search_ideas.

alter table public.ideas
  add column sector text check (sector in (
    'education', 'health', 'sustainability', 'mobility', 'fintech', 'software_ai', 'social_impact', 'other'
  )),
  add column stage text check (stage in ('idea', 'prototype', 'mvp', 'growing'));

-- 006 lists every readable column: everyone can read the new ones.
grant select (sector, stage) on public.ideas to anon, authenticated;

-- idea_details (005) also returns sector and stage. Adding columns to its result means
-- dropping and recreating it; the visibility rules are unchanged.
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
         case when reader.signed_in then i.team_members end,
         i.created_at, i.problem_private, i.solution_private,
         i.sector, i.stage
  from public.ideas i, reader
  where i.id = idea_details.idea_id;
$$;

revoke execute on function public.idea_details(uuid) from public;
grant execute on function public.idea_details(uuid) to anon, authenticated;

-- The ideas list, newest first. Every word of query must appear in the title or the pitch
-- (any case); sector and stage narrow it further. Empty or null arguments filter nothing.
-- Runs with the reader's rights, so it only reads columns everyone can read.
create function public.search_ideas(query text default '', sector text default null, stage text default null)
returns table (id uuid, title text, pitch text, created_at timestamptz, sector text, stage text)
language sql
stable
set search_path = ''
as $$
  select i.id, i.title, i.pitch, i.created_at, i.sector, i.stage
  from public.ideas i
  where (nullif(search_ideas.sector, '') is null or i.sector = search_ideas.sector)
    and (nullif(search_ideas.stage, '') is null or i.stage = search_ideas.stage)
    and not exists (
      select 1
      from regexp_split_to_table(btrim(coalesce(search_ideas.query, '')), '\s+') as words (word)
      where words.word <> ''
        and not (
          -- % and _ in a word are searched as themselves, not as wildcards.
          i.title ilike '%' || replace(replace(replace(words.word, '\', '\\'), '%', '\%'), '_', '\_') || '%'
          or i.pitch ilike '%' || replace(replace(replace(words.word, '\', '\\'), '%', '\%'), '_', '\_') || '%'
        )
    )
  order by i.created_at desc;
$$;

revoke execute on function public.search_ideas(text, text, text) from public;
grant execute on function public.search_ideas(text, text, text) to anon, authenticated;
