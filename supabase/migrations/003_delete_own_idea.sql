-- IH-45: Allow students to delete only their own ideas.
-- The author_id column already identifies the idea owner.

create policy "Students can delete their own ideas"
on public.ideas
for delete
to authenticated
using (
  author_id = (select auth.uid())
);

