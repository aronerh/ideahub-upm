-- IH-104 (story IH-73): replies under a contact request, so the investor and the idea's team talk on the site.
-- Only the two sides of a request can read or write its replies: the investor who sent it and the
-- author of the idea. Replies can't be edited or deleted yet.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.contact_requests (id) on delete cascade,
  -- Filled in from the session and checked by the insert policy, so nobody replies in someone else's name.
  sender_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (btrim(body, E' \t\r\n') <> '' and char_length(body) <= 1000),
  created_at timestamptz not null default now()
);

-- Oldest first inside one thread (IH-105).
create index messages_request_id_idx on public.messages (request_id, created_at);
create index messages_sender_id_idx on public.messages (sender_id);

alter table public.messages enable row level security;

-- Supabase gives the API roles every right on a new table; keep only what the policies below decide.
revoke all on public.messages from anon, authenticated;
grant select on public.messages to authenticated;
grant insert (request_id, sender_id, body) on public.messages to authenticated;

create policy "The two sides of a request read its replies"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1
      from public.contact_requests
      join public.ideas on ideas.id = contact_requests.idea_id
      where contact_requests.id = messages.request_id
        and (select auth.uid()) in (contact_requests.requester_id, ideas.author_id)
    )
  );

create policy "The two sides of a request reply to it"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1
      from public.contact_requests
      join public.ideas on ideas.id = contact_requests.idea_id
      where contact_requests.id = messages.request_id
        and (select auth.uid()) in (contact_requests.requester_id, ideas.author_id)
    )
  );
