-- Tests for 002_ideas.sql: who can read and publish ideas, and the field rules.
-- Each test runs in its own transaction and rolls back, so they don't affect each other.

-- A visitor can read published ideas.
begin;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
insert into public.ideas (author_id, title, pitch, problem, solution, team_members)
values ('00000000-0000-0000-0000-00000000000a', 'Idea', 'Pitch', 'Problem', 'Solution', 'Ana');
select tests.act_as_visitor();
do $$
begin
  if (select count(*) from public.ideas) <> 1 then
    raise exception 'A visitor should see the published idea';
  end if;
end $$;
rollback;

-- A UPM user can publish, and the idea is theirs without passing author_id.
begin;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
do $$
declare
  saved_author_id uuid;
begin
  insert into public.ideas (title, pitch, problem, solution, team_members)
  values ('Idea', 'Pitch', 'Problem', 'Solution', 'Ana')
  returning author_id into saved_author_id;

  if saved_author_id is distinct from '00000000-0000-0000-0000-00000000000a' then
    raise exception 'author_id should default to the signed-in user, got %', saved_author_id;
  end if;
end $$;
rollback;

-- A signed-in user without a UPM email can't publish.
begin;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
select tests.expect_error($sql$
  insert into public.ideas (title, pitch, problem, solution, team_members)
  values ('Idea', 'Pitch', 'Problem', 'Solution', 'Bob')
$sql$, '42501');
rollback;

-- The email check is case-sensitive here too.
begin;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000c', 'ana@FI.UPM.ES');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000c', 'ana@FI.UPM.ES');
select tests.expect_error($sql$
  insert into public.ideas (title, pitch, problem, solution, team_members)
  values ('Idea', 'Pitch', 'Problem', 'Solution', 'Ana')
$sql$, '42501');
rollback;

-- A UPM user can't publish an idea in someone else's name.
begin;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
select tests.expect_error($sql$
  insert into public.ideas (author_id, title, pitch, problem, solution, team_members)
  values ('00000000-0000-0000-0000-00000000000b', 'Idea', 'Pitch', 'Problem', 'Solution', 'Ana')
$sql$, '42501');
rollback;

-- A visitor can't publish.
begin;
select tests.act_as_visitor();
select tests.expect_error($sql$
  insert into public.ideas (title, pitch, problem, solution, team_members)
  values ('Idea', 'Pitch', 'Problem', 'Solution', 'Nobody')
$sql$, '42501');
rollback;

-- Published ideas can't be edited or deleted, even by their author.
begin;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
insert into public.ideas (author_id, title, pitch, problem, solution, team_members)
values ('00000000-0000-0000-0000-00000000000a', 'Idea', 'Pitch', 'Problem', 'Solution', 'Ana');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
select tests.expect_rows($sql$ update public.ideas set title = 'Changed' $sql$, 0);
select tests.expect_rows($sql$ delete from public.ideas $sql$, 0);
rollback;

-- Field rules: required, not blank, and within the length limits.
begin;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
select tests.expect_error($sql$
  insert into public.ideas (author_id, title, pitch, problem, solution, team_members)
  values ('00000000-0000-0000-0000-00000000000a', '   ', 'Pitch', 'Problem', 'Solution', 'Ana')
$sql$, '23514');
select tests.expect_error($sql$
  insert into public.ideas (author_id, title, pitch, problem, solution, team_members)
  values ('00000000-0000-0000-0000-00000000000a', repeat('a', 81), 'Pitch', 'Problem', 'Solution', 'Ana')
$sql$, '23514');
select tests.expect_error($sql$
  insert into public.ideas (author_id, title, pitch, problem, solution, team_members)
  values ('00000000-0000-0000-0000-00000000000a', 'Idea', repeat('a', 141), 'Problem', 'Solution', 'Ana')
$sql$, '23514');
select tests.expect_error($sql$
  insert into public.ideas (author_id, title, pitch, problem, solution, team_members)
  values ('00000000-0000-0000-0000-00000000000a', 'Idea', 'Pitch', 'Problem', 'Solution', '')
$sql$, '23514');
select tests.expect_error($sql$
  insert into public.ideas (author_id, title, pitch, problem, solution, team_members)
  values ('00000000-0000-0000-0000-00000000000a', null, 'Pitch', 'Problem', 'Solution', 'Ana')
$sql$, '23502');
do $$
begin
  insert into public.ideas (author_id, title, pitch, problem, solution, team_members)
  values ('00000000-0000-0000-0000-00000000000a', repeat('a', 80), repeat('b', 140), 'Problem', 'Solution', 'Ana');
end $$;
rollback;
