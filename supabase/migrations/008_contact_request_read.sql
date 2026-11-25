-- IH-96 (story IH-70): the idea's author can see which contact requests they haven't read yet.
-- read_at is null until the author opens the idea page that lists the request (IH-97).
-- Numbered 008 because IH-14 (#29) adds 007.
alter table public.contact_requests
  add column read_at timestamptz;

-- The author marks the requests for their own ideas as read.
create policy "Authors mark the requests for their ideas as read"
  on public.contact_requests for update
  to authenticated
  using (
    exists (
      select 1 from public.ideas
      where ideas.id = idea_id and ideas.author_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.ideas
      where ideas.id = idea_id and ideas.author_id = (select auth.uid())
    )
  );

-- RLS picks the rows; this keeps the update to read_at, so the message and email can't be changed.
revoke update on public.contact_requests from anon, authenticated;
grant update (read_at) on public.contact_requests to authenticated;

-- A sender could otherwise insert a request that is already marked as read, so the author would
-- never see it in the badge. Insert is limited to the columns the contact form fills in.
revoke insert on public.contact_requests from anon, authenticated;
grant insert (idea_id, requester_id, requester_email, message) on public.contact_requests to authenticated;
