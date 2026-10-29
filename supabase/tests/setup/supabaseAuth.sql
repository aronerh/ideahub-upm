-- The parts of Supabase our migrations rely on, so they run on a plain Postgres in CI.
-- auth.uid() and auth.jwt() read the request's JWT claims the same way Supabase's versions do.
create role anon nologin;
create role authenticated nologin;

create schema auth;
grant usage on schema auth to anon, authenticated;

create table auth.users (
  id uuid primary key,
  email text
);

create function auth.jwt() returns jsonb
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb;
$$;

create function auth.uid() returns uuid
language sql
stable
as $$
  select (auth.jwt() ->> 'sub')::uuid;
$$;

-- Supabase gives the API roles access to every new table in public; RLS policies then decide.
alter default privileges in schema public grant all on tables to anon, authenticated;
