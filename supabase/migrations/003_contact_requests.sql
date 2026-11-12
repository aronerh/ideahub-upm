-- IH-42: an investor's request to contact an idea's team (story IH-15).
-- Any signed-in user can send one about someone else's idea. The idea's author sees the requests for their
-- ideas (IH-43) and the sender sees their own. Requests can't be changed or deleted yet.
create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas (id) on delete cascade,
  requester_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- The sender's account email, so the team can reply. Filled in from the session and checked
  -- by the insert policy, so nobody can send a request under someone else's address.
  requester_email text not null default (auth.jwt() ->> 'email'),
  message text not null check (btrim(message) <> '' and char_length(message) <= 1000),
  created_at timestamptz not null default now()
);

-- Newest first on the team's list (IH-43).
create index contact_requests_idea_id_idx on public.contact_requests (idea_id, created_at desc);
create index contact_requests_requester_id_idx on public.contact_requests (requester_id);

alter table public.contact_requests enable row level security;

create policy "Signed-in users can contact other people's ideas"
  on public.contact_requests for insert
  to authenticated
  with check (
    requester_id = (select auth.uid())
    and requester_email = (select auth.jwt()) ->> 'email'
    and exists (
      select 1 from public.ideas
      where ideas.id = idea_id and ideas.author_id <> (select auth.uid())
    )
  );

create policy "Authors read the requests for their ideas"
  on public.contact_requests for select
  to authenticated
  using (
    exists (
      select 1 from public.ideas
      where ideas.id = idea_id and ideas.author_id = (select auth.uid())
    )
  );

create policy "Senders read their own requests"
  on public.contact_requests for select
  to authenticated
  using (requester_id = (select auth.uid()));
