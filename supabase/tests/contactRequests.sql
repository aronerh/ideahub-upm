-- Tests for 003_contact_requests.sql: who can send and read contact requests, and the message rules.
-- Each test runs in its own transaction and rolls back, so they don't affect each other.
-- Ana (UPM) publishes the idea; Bob (any email) is the investor; Carla is someone else.

-- A signed-in investor can contact a team; the request is theirs, with their account email.
begin;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
insert into public.ideas (id, author_id, title, pitch, problem, solution, team_members)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a',
  'Idea', 'Pitch', 'Problem', 'Solution', 'Ana');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
do $$
declare
  saved public.contact_requests;
begin
  insert into public.contact_requests (idea_id, message)
  values ('10000000-0000-0000-0000-000000000001', 'I would like to talk.')
  returning * into saved;

  if saved.requester_id is distinct from '00000000-0000-0000-0000-00000000000b'
    or saved.requester_email is distinct from 'bob@gmail.com' then
    raise exception 'The request should belong to the signed-in user, got % / %',
      saved.requester_id, saved.requester_email;
  end if;
end $$;
rollback;

-- A visitor can't send a request.
begin;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
insert into public.ideas (id, author_id, title, pitch, problem, solution, team_members)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a',
  'Idea', 'Pitch', 'Problem', 'Solution', 'Ana');
select tests.act_as_visitor();
select tests.expect_error($sql$
  insert into public.contact_requests (idea_id, requester_id, requester_email, message)
  values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a',
    'someone@gmail.com', 'Hello')
$sql$, '42501');
rollback;

-- Nobody can send a request in someone else's name or with someone else's email.
begin;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com'),
  ('00000000-0000-0000-0000-00000000000c', 'carla@gmail.com');
insert into public.ideas (id, author_id, title, pitch, problem, solution, team_members)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a',
  'Idea', 'Pitch', 'Problem', 'Solution', 'Ana');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
select tests.expect_error($sql$
  insert into public.contact_requests (idea_id, requester_id, message)
  values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000c', 'Hello')
$sql$, '42501');
select tests.expect_error($sql$
  insert into public.contact_requests (idea_id, requester_email, message)
  values ('10000000-0000-0000-0000-000000000001', 'carla@gmail.com', 'Hello')
$sql$, '42501');
rollback;

-- An author can't contact their own idea.
begin;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
insert into public.ideas (id, author_id, title, pitch, problem, solution, team_members)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a',
  'Idea', 'Pitch', 'Problem', 'Solution', 'Ana');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
select tests.expect_error($sql$
  insert into public.contact_requests (idea_id, message)
  values ('10000000-0000-0000-0000-000000000001', 'Hello me')
$sql$, '42501');
rollback;

-- The author and the sender read the request; anyone else sees nothing.
begin;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com'),
  ('00000000-0000-0000-0000-00000000000c', 'carla@gmail.com');
insert into public.ideas (id, author_id, title, pitch, problem, solution, team_members)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a',
  'Idea', 'Pitch', 'Problem', 'Solution', 'Ana');
insert into public.contact_requests (idea_id, requester_id, requester_email, message)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b',
  'bob@gmail.com', 'Hello');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
do $$ begin
  if (select count(*) from public.contact_requests) <> 1 then
    raise exception 'The author should see the request for their idea';
  end if;
end $$;
select tests.sign_in_as('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
do $$ begin
  if (select count(*) from public.contact_requests) <> 1 then
    raise exception 'The sender should see their own request';
  end if;
end $$;
select tests.sign_in_as('00000000-0000-0000-0000-00000000000c', 'carla@gmail.com');
do $$ begin
  if (select count(*) from public.contact_requests) <> 0 then
    raise exception 'Someone else should not see the request';
  end if;
end $$;
select tests.act_as_visitor();
do $$ begin
  if (select count(*) from public.contact_requests) <> 0 then
    raise exception 'A visitor should not see the request';
  end if;
end $$;
rollback;

-- Requests can't be edited or deleted, even by the people who can read them.
begin;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
insert into public.ideas (id, author_id, title, pitch, problem, solution, team_members)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a',
  'Idea', 'Pitch', 'Problem', 'Solution', 'Ana');
insert into public.contact_requests (idea_id, requester_id, requester_email, message)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b',
  'bob@gmail.com', 'Hello');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
select tests.expect_rows($sql$ update public.contact_requests set message = 'Changed' $sql$, 0);
select tests.expect_rows($sql$ delete from public.contact_requests $sql$, 0);
select tests.sign_in_as('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
select tests.expect_rows($sql$ delete from public.contact_requests $sql$, 0);
rollback;

-- Message rules: required, not blank, at most 1000 characters.
begin;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
insert into public.ideas (id, author_id, title, pitch, problem, solution, team_members)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a',
  'Idea', 'Pitch', 'Problem', 'Solution', 'Ana');
select tests.expect_error($sql$
  insert into public.contact_requests (idea_id, requester_id, requester_email, message)
  values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'bob@gmail.com', '   ')
$sql$, '23514');
select tests.expect_error($sql$
  insert into public.contact_requests (idea_id, requester_id, requester_email, message)
  values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'bob@gmail.com',
    repeat('a', 1001))
$sql$, '23514');
do $$ begin
  insert into public.contact_requests (idea_id, requester_id, requester_email, message)
  values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'bob@gmail.com',
    repeat('a', 1000));
end $$;
rollback;

-- Deleting an idea removes its requests.
begin;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
insert into public.ideas (id, author_id, title, pitch, problem, solution, team_members)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a',
  'Idea', 'Pitch', 'Problem', 'Solution', 'Ana');
insert into public.contact_requests (idea_id, requester_id, requester_email, message)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b',
  'bob@gmail.com', 'Hello');
delete from public.ideas;
do $$ begin
  if (select count(*) from public.contact_requests) <> 0 then
    raise exception 'Requests should go with their idea';
  end if;
end $$;
rollback;
