
-- IH-46: Allow students to edit only their own ideas.
-- The author_id column identifies the idea owner.

create policy "Students can update their own ideas"
on public.ideas
for update
to authenticated
using (
  author_id = (select auth.uid())
)
with check (
  author_id = (select auth.uid())
);

