-- IH-30: only UPM emails can publish ideas; signing up is open to any email.
-- The ideas insert policy (IH-22) calls this with auth.jwt() ->> 'email'.
-- Keep the domains in sync with allowedEmailDomains in lib/auth/emailDomain.ts.
create or replace function public.is_upm_email(email text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(email ~ '^.+@(alumnos\.upm\.es|upm\.es|fi\.upm\.es|dit\.upm\.es)$', false);
$$;
