-- Tests for IH-14 (007_sector_stage.sql): sector and stage values, and search_ideas.
-- Each test runs in its own transaction and rolls back.

-- Three ideas by Ana: two in health at different stages, one in mobility, and one from before IH-14.
create function tests.add_classified_ideas() returns void
language sql
as $$
  insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
  insert into public.ideas (id, author_id, title, pitch, problem, solution, team_members, sector, stage, created_at)
  values
    ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-00000000000a',
     'Clinic queue app', 'Skip the waiting room at the campus clinic.', 'P', 'S', 'Ana', 'health', 'idea',
     '2026-11-01'),
    ('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-00000000000a',
     'Sleep tracker for students', 'Better sleep before exams, 100% offline.', 'P', 'S', 'Ana', 'health', 'mvp',
     '2026-11-02'),
    ('00000000-0000-0000-0000-0000000000e3', '00000000-0000-0000-0000-00000000000a',
     'Campus bike share', 'Borrow a bike between campuses.', 'P', 'S', 'Ana', 'mobility', 'prototype',
     '2026-11-03'),
    ('00000000-0000-0000-0000-0000000000e4', '00000000-0000-0000-0000-00000000000a',
     'Old idea', 'Published before sectors existed.', 'P', 'S', 'Ana', null, null,
     '2026-10-01');
$$;

-- Fails unless search_ideas returns exactly these titles, in this order.
create function tests.expect_search(query text, sector text, stage text, expected text[]) returns void
language plpgsql
as $$
declare
  found text[];
begin
  select coalesce(array_agg(r.title order by ord), '{}') into found
  from public.search_ideas(query, sector, stage) with ordinality as r (id, title, pitch, created_at, sector, stage, ord);
  if found is distinct from expected then
    raise exception 'search_ideas(%, %, %): expected %, got %', query, sector, stage, expected, found;
  end if;
end;
$$;

-- Only the listed sectors and stages can be saved.
begin;
select tests.add_classified_ideas();
select tests.expect_error($sql$
  update public.ideas set sector = 'crypto' where id = '00000000-0000-0000-0000-0000000000e1'
$sql$, '23514');
select tests.expect_error($sql$
  update public.ideas set stage = 'unicorn' where id = '00000000-0000-0000-0000-0000000000e1'
$sql$, '23514');
rollback;

-- A visitor can read sector and stage, from the table and from idea_details.
begin;
select tests.add_classified_ideas();
select tests.act_as_visitor();
do $$ begin
  if (select sector || '/' || stage from public.ideas where id = '00000000-0000-0000-0000-0000000000e2')
     is distinct from 'health/mvp' then
    raise exception 'A visitor should read sector and stage from the table';
  end if;
  if (select sector || '/' || stage from public.idea_details('00000000-0000-0000-0000-0000000000e3'))
     is distinct from 'mobility/prototype' then
    raise exception 'idea_details should return sector and stage';
  end if;
end $$;
rollback;

-- Recreating idea_details kept its visibility rules: a visitor still doesn't see the team.
begin;
select tests.add_classified_ideas();
select tests.act_as_visitor();
do $$ begin
  if (select team_members from public.idea_details('00000000-0000-0000-0000-0000000000e1')) is not null then
    raise exception 'A visitor should not see the team';
  end if;
end $$;
rollback;

-- No search and no filters: every idea, newest first.
begin;
select tests.add_classified_ideas();
select tests.act_as_visitor();
select tests.expect_search('', null, null,
  array['Campus bike share', 'Sleep tracker for students', 'Clinic queue app', 'Old idea']);
select tests.expect_search(null, '', '',
  array['Campus bike share', 'Sleep tracker for students', 'Clinic queue app', 'Old idea']);
rollback;

-- The search matches words in the title or the pitch, in any case; every word must match.
begin;
select tests.add_classified_ideas();
select tests.act_as_visitor();
select tests.expect_search('BIKE', null, null, array['Campus bike share']);
select tests.expect_search('campus', null, null, array['Campus bike share', 'Clinic queue app']);
select tests.expect_search('  campus   clinic ', null, null, array['Clinic queue app']);
select tests.expect_search('exams', null, null, array['Sleep tracker for students']);
select tests.expect_search('spaceship', null, null, array[]::text[]);
rollback;

-- % and _ are searched as text, not as wildcards.
begin;
select tests.add_classified_ideas();
select tests.act_as_visitor();
select tests.expect_search('100%', null, null, array['Sleep tracker for students']);
select tests.expect_search('%', null, null, array['Sleep tracker for students']);
select tests.expect_search('_', null, null, array[]::text[]);
rollback;

-- Sector and stage filters narrow the list and combine with the search.
begin;
select tests.add_classified_ideas();
select tests.act_as_visitor();
select tests.expect_search('', 'health', null, array['Sleep tracker for students', 'Clinic queue app']);
select tests.expect_search('', null, 'prototype', array['Campus bike share']);
select tests.expect_search('', 'health', 'mvp', array['Sleep tracker for students']);
select tests.expect_search('clinic', 'health', 'mvp', array[]::text[]);
select tests.expect_search('campus', 'health', null, array['Clinic queue app']);
rollback;

drop function tests.add_classified_ideas();
drop function tests.expect_search(text, text, text, text[]);
