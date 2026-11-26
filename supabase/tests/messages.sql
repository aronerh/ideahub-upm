-- Tests for 010_messages.sql: who can read and write the replies under a contact request, and the body rules.
-- Each test runs in its own transaction and rolls back, so they don't affect each other.
-- Ana (UPM) publishes the idea; Bob (any email) is the investor who contacted her; Carla is someone else.

-- Ana's idea with one request from Bob. Dan is a student too, with an idea of his own and no request.
create function tests.add_reply_thread() returns void
language sql
as $$
  insert into auth.users (id, email) values
    ('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es'),
    ('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com'),
    ('00000000-0000-0000-0000-00000000000c', 'carla@gmail.com'),
    ('00000000-0000-0000-0000-00000000000d', 'dan@alumnos.upm.es');
  insert into public.ideas (id, author_id, title, pitch, problem, solution, team_members) values
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a',
      'Idea', 'Pitch', 'Problem', 'Solution', 'Ana'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000d',
      'Dan''s idea', 'Pitch', 'Problem', 'Solution', 'Dan');
  insert into public.contact_requests (id, idea_id, requester_id, requester_email, message)
  values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-00000000000b', 'bob@gmail.com', 'Hello');
$$;

-- The investor and the idea's author can both reply, and the reply is theirs.
begin;
select tests.add_reply_thread();
select tests.sign_in_as('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
do $$
declare
  saved public.messages;
begin
  insert into public.messages (request_id, body)
  values ('20000000-0000-0000-0000-000000000001', 'Can we talk on Monday?')
  returning * into saved;

  if saved.sender_id is distinct from '00000000-0000-0000-0000-00000000000b' then
    raise exception 'The reply should belong to the signed-in user, got %', saved.sender_id;
  end if;
end $$;
select tests.sign_in_as('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
do $$
declare
  saved public.messages;
begin
  insert into public.messages (request_id, body)
  values ('20000000-0000-0000-0000-000000000001', 'Monday works.')
  returning * into saved;

  if saved.sender_id is distinct from '00000000-0000-0000-0000-00000000000a' then
    raise exception 'The reply should belong to the signed-in user, got %', saved.sender_id;
  end if;
end $$;
rollback;

-- Someone who is not part of the request can't reply to it, and a visitor can't either.
begin;
select tests.add_reply_thread();
select tests.sign_in_as('00000000-0000-0000-0000-00000000000c', 'carla@gmail.com');
select tests.expect_error($sql$
  insert into public.messages (request_id, body)
  values ('20000000-0000-0000-0000-000000000001', 'Let me in')
$sql$, '42501');
select tests.act_as_visitor();
select tests.expect_error($sql$
  insert into public.messages (request_id, sender_id, body)
  values ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'Hello')
$sql$, '42501');
rollback;

-- Nobody can reply in someone else's name, not even to a request they belong to.
begin;
select tests.add_reply_thread();
select tests.sign_in_as('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
select tests.expect_error($sql$
  insert into public.messages (request_id, sender_id, body)
  values ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'Ana says hi')
$sql$, '42501');
rollback;

-- The columns the app doesn't fill in (id, created_at) can't be chosen by the sender.
begin;
select tests.add_reply_thread();
select tests.sign_in_as('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
select tests.expect_error($sql$
  insert into public.messages (id, request_id, body)
  values ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'My own id')
$sql$, '42501');
select tests.expect_error($sql$
  insert into public.messages (request_id, body, created_at)
  values ('20000000-0000-0000-0000-000000000001', 'From the past', '2020-01-01')
$sql$, '42501');
rollback;

-- A student with their own idea is not part of someone else's request: Dan can't read or reply to Ana's thread.
begin;
select tests.add_reply_thread();
insert into public.messages (request_id, sender_id, body)
values ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'Hi Ana');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000d', 'dan@alumnos.upm.es');
do $$ begin
  if (select count(*) from public.messages) <> 0 then
    raise exception 'A student should not see a thread about someone else''s idea';
  end if;
end $$;
select tests.expect_error($sql$
  insert into public.messages (request_id, body)
  values ('20000000-0000-0000-0000-000000000001', 'Butting in')
$sql$, '42501');
rollback;

-- Both sides read the thread; anyone else sees nothing, and a visitor is refused.
begin;
select tests.add_reply_thread();
insert into public.messages (request_id, sender_id, body) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'Hi Ana'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'Hi Bob');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000a', 'ana@alumnos.upm.es');
do $$ begin
  if (select count(*) from public.messages) <> 2 then
    raise exception 'The idea''s author should see the whole thread';
  end if;
end $$;
select tests.sign_in_as('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
do $$ begin
  if (select count(*) from public.messages) <> 2 then
    raise exception 'The investor should see the whole thread';
  end if;
end $$;
select tests.sign_in_as('00000000-0000-0000-0000-00000000000c', 'carla@gmail.com');
do $$ begin
  if (select count(*) from public.messages) <> 0 then
    raise exception 'Someone else should not see the thread';
  end if;
end $$;
select tests.act_as_visitor();
select tests.expect_error($sql$ select * from public.messages $sql$, '42501');
rollback;

-- Two investors on the same idea can't read each other's threads.
begin;
select tests.add_reply_thread();
insert into public.contact_requests (id, idea_id, requester_id, requester_email, message)
values ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-00000000000c', 'carla@gmail.com', 'Hello too');
insert into public.messages (request_id, sender_id, body)
values ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'Hi Ana');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000c', 'carla@gmail.com');
do $$ begin
  if (select count(*) from public.messages) <> 0 then
    raise exception 'An investor should not see another investor''s thread';
  end if;
end $$;
select tests.expect_error($sql$
  insert into public.messages (request_id, body)
  values ('20000000-0000-0000-0000-000000000001', 'Butting in')
$sql$, '42501');
rollback;

-- Replies can't be edited or deleted, even by their sender.
begin;
select tests.add_reply_thread();
insert into public.messages (request_id, sender_id, body)
values ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'Hi Ana');
select tests.sign_in_as('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
select tests.expect_error($sql$ update public.messages set body = 'Changed' $sql$, '42501');
select tests.expect_error($sql$ delete from public.messages $sql$, '42501');
rollback;

-- Body rules: required, not blank, at most 1000 characters.
begin;
select tests.add_reply_thread();
select tests.sign_in_as('00000000-0000-0000-0000-00000000000b', 'bob@gmail.com');
select tests.expect_error($sql$
  insert into public.messages (request_id, body)
  values ('20000000-0000-0000-0000-000000000001', '   ')
$sql$, '23514');
select tests.expect_error($sql$
  insert into public.messages (request_id, body)
  values ('20000000-0000-0000-0000-000000000001', E' \n\t ')
$sql$, '23514');
select tests.expect_error($sql$
  insert into public.messages (request_id, body)
  values ('20000000-0000-0000-0000-000000000001', repeat('a', 1001))
$sql$, '23514');
select tests.expect_error($sql$
  insert into public.messages (request_id, body)
  values ('20000000-0000-0000-0000-000000000001', null)
$sql$, '23502');
do $$ begin
  insert into public.messages (request_id, body)
  values ('20000000-0000-0000-0000-000000000001', repeat('a', 1000));
end $$;
rollback;

-- Deleting an idea removes its requests and their replies.
begin;
select tests.add_reply_thread();
insert into public.messages (request_id, sender_id, body)
values ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'Hi Ana');
delete from public.ideas;
do $$ begin
  if (select count(*) from public.messages) <> 0 then
    raise exception 'Replies should go with their request';
  end if;
end $$;
rollback;
