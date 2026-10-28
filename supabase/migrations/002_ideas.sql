-- IH-22: ideas table for the 5-field form (IH-10) and the public list (IH-11).
-- Anyone can read ideas; only signed-in users with a UPM email (is_upm_email, 001) can publish.
-- No update/delete policies yet, so ideas can't be changed once published.
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (btrim(title) <> '' and char_length(title) <= 80),
  pitch text not null check (btrim(pitch) <> '' and char_length(pitch) <= 140),
  problem text not null check (btrim(problem) <> '' and char_length(problem) <= 2000),
  solution text not null check (btrim(solution) <> '' and char_length(solution) <= 2000),
  team_members text not null check (btrim(team_members) <> '' and char_length(team_members) <= 500),
  created_at timestamptz not null default now()
);

-- Newest first on the list page.
create index ideas_created_at_idx on public.ideas (created_at desc);
create index ideas_author_id_idx on public.ideas (author_id);

alter table public.ideas enable row level security;

create policy "Anyone can read ideas"
  on public.ideas for select
  to anon, authenticated
  using (true);

create policy "UPM users can publish their own ideas"
  on public.ideas for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and public.is_upm_email((select auth.jwt()) ->> 'email')
  );
