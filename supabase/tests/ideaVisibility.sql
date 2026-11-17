-- Tests for IH-38 (004_idea_visibility.sql, 005_hide_private_columns.sql):
-- private problem and solution, and all team members, are readable only by signed-in users.
-- Each test runs in its own transaction and rolls back.

-- Ana's idea has a private problem and a public solution.
create function tests.add_private_problem_idea() returns void
language sql
as $$
  insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
  insert into public.ideas (id, author_id, title, pitch, problem, solution, team_members, problem_private)
  values ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-00000000000a',
          'Idea', 'Pitch', 'Secret problem', 'Open solution', 'Ana', true);
$$;

-- Fails unless the reader sees the given problem, solution and team (null = hidden).
create function tests.expect_details(expected_problem text, expected_solution text, expected_team text)
returns void
language plpgsql
as $$
declare
  details record;
begin
  select * into details from public.idea_details('00000000-0000-0000-0000-0000000000d1');

  if details.title is distinct from 'Idea' or details.pitch is distinct from 'Pitch' then
    raise exception 'Title and pitch should always be visible, got % and %', details.title, details.pitch;
  end if;
  if details.problem is distinct from expected_problem
     or details.solution is distinct from expected_solution
     or details.team_members is distinct from expected_team then
    raise exception 'Expected problem %, solution % and team %, got %, % and %',
      expected_problem, expected_solution, expected_team,
      details.problem, details.solution, details.team_members;
  end if;
end;
$$;

-- A visitor sees the public solution, but not the private problem or the team.
begin;
select tests.add_private_problem_idea();
select tests.act_as_visitor();
select tests.expect_details(null, 'Open solution', null);
rollback;

-- An investor signed in with a non-UPM email sees everything.
begin;
select tests.add_private_problem_idea();
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
select tests.expect_details('Secret problem', 'Open solution', 'Ana');
rollback;

-- A signed-in UPM user sees everything.
begin;
select tests.add_private_problem_idea();
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000c', 'carla@upm.es');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000c', 'carla@upm.es');
select tests.expect_details('Secret problem', 'Open solution', 'Ana');
rollback;

-- The author sees their own private details.
begin;
select tests.add_private_problem_idea();
select tests.sign_in_as('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
select tests.expect_details('Secret problem', 'Open solution', 'Ana');
rollback;

-- Nobody can read problem, solution or team straight from the table, so the rule can't be skipped.
begin;
select tests.add_private_problem_idea();
select tests.act_as_visitor();
select tests.expect_error($sql$ select problem from public.ideas $sql$, '42501');
select tests.expect_error($sql$ select solution from public.ideas $sql$, '42501');
select tests.expect_error($sql$ select team_members from public.ideas $sql$, '42501');
select tests.expect_rows($sql$ select id, title, pitch, created_at, problem_private from public.ideas $sql$, 1);
rollback;

begin;
select tests.add_private_problem_idea();
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000c', 'carla@upm.es');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000c', 'carla@upm.es');
select tests.expect_error($sql$ select * from public.ideas $sql$, '42501');
rollback;

-- Ideas are public unless the student says otherwise, and a UPM user can publish a private one.
begin;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
do $$
declare
  saved record;
begin
  insert into public.ideas (title, pitch, problem, solution, team_members)
  values ('Public', 'Pitch', 'Problem', 'Solution', 'Ana')
  returning problem_private, solution_private into saved;
  if saved.problem_private or saved.solution_private then
    raise exception 'A new idea should be public by default';
  end if;

  insert into public.ideas (title, pitch, problem, solution, team_members, problem_private, solution_private)
  values ('Private', 'Pitch', 'Problem', 'Solution', 'Ana', true, true);
end $$;
rollback;

-- An unknown idea gives no row.
begin;
select tests.act_as_visitor();
select tests.expect_rows($sql$ select * from public.idea_details(gen_random_uuid()) $sql$, 0);
rollback;
