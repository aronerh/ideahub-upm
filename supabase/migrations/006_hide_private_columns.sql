-- IH-38: problem, solution and team members can only be read through idea_details (005),
-- which hides them when needed. RLS filters rows, not columns, so the API roles lose read
-- access to those three.
-- Apply right after the IH-38 deploy: the app before it still reads the columns directly.
-- A column added to ideas later is not readable until it's added to this grant.
revoke select on public.ideas from anon, authenticated;
grant select (id, author_id, title, pitch, created_at, problem_private, solution_private)
  on public.ideas to anon, authenticated;
