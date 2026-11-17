-- IH-38: problem and solution can only be read through idea_details (004), which hides
-- private ones. RLS filters rows, not columns, so the API roles lose read access to those two.
-- Apply right after the IH-38 deploy: the app before it still reads the columns directly.
-- A column added to ideas later is not readable until it's added to this grant.
revoke select on public.ideas from anon, authenticated;
grant select (id, author_id, title, pitch, team_members, created_at, problem_private, solution_private)
  on public.ideas to anon, authenticated;
