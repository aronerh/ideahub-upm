-- Tests for IH-69 (009_team_visibility.sql): a student can make the team public.
-- A hidden team is readable only by signed-in users; a public one by everyone.
-- Each test runs in its own transaction and rolls back.

-- Ana's idea, with the team public or hidden.
create function tests.add_team_idea(team_is_private boolean) returns void
language sql
as $$
  insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
  insert into public.ideas (id, author_id, title, pitch, problem, solution, team_members, team_private)
  values ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-00000000000a',
          'Idea', 'Pitch', 'Problem', 'Solution', 'Ana', team_is_private);
$$;

-- Fails unless the reader sees the given team (null = hidden) and the team_private flag.
create function tests.expect_team(expected_team text, expected_private boolean) returns void
language plpgsql
as $$
declare
  details record;
begin
  select * into details from public.idea_details('00000000-0000-0000-0000-0000000000e1');

  if details.team_members is distinct from expected_team
     or details.team_private is distinct from expected_private then
    raise exception 'Expected team % (private %), got % (private %)',
      expected_team, expected_private, details.team_members, details.team_private;
  end if;
end;
$$;

-- A visitor sees a public team.
begin;
select tests.add_team_idea(false);
select tests.act_as_visitor();
select tests.expect_team('Ana', false);
rollback;

-- A visitor doesn't see a hidden team.
begin;
select tests.add_team_idea(true);
select tests.act_as_visitor();
select tests.expect_team(null, true);
rollback;

-- An investor signed in with a non-UPM email still sees a hidden team.
begin;
select tests.add_team_idea(true);
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
select tests.expect_team('Ana', true);
rollback;

-- Ideas saved without a choice, like every idea published before IH-69, keep the team hidden.
begin;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
do $$
declare
  saved record;
begin
  insert into public.ideas (title, pitch, problem, solution, team_members)
  values ('Old', 'Pitch', 'Problem', 'Solution', 'Ana')
  returning team_private into saved;
  if not saved.team_private then
    raise exception 'An idea saved without a choice should keep the team hidden';
  end if;
end $$;
rollback;

-- A public team doesn't make a private problem public.
begin;
select tests.add_team_idea(false);
update public.ideas set problem_private = true;
select tests.act_as_visitor();
select tests.expect_team('Ana', false);
select tests.expect_rows($sql$ select 1 from public.idea_details('00000000-0000-0000-0000-0000000000e1') where problem is null $sql$, 1);
rollback;

-- Anyone can read the flag, but the team itself only through idea_details.
begin;
select tests.add_team_idea(false);
select tests.act_as_visitor();
select tests.expect_rows($sql$ select team_private from public.ideas $sql$, 1);
select tests.expect_error($sql$ select team_members from public.ideas $sql$, '42501');
rollback;

-- The author can make the team public when editing, and visitors then see it.
begin;
select tests.add_team_idea(true);
select tests.sign_in_as('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
select tests.expect_rows($sql$ update public.ideas set team_private = false $sql$, 1);
select tests.act_as_visitor();
select tests.expect_team('Ana', false);
rollback;

-- Nobody else can change whether a team is public.
begin;
select tests.add_team_idea(true);
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000c', 'carla@upm.es');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000c', 'carla@upm.es');
select tests.expect_rows($sql$ update public.ideas set team_private = false $sql$, 0);
rollback;
