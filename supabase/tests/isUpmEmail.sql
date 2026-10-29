-- Fails if public.is_upm_email disagrees with lib/auth/emailDomain.test.ts.
-- CI runs every migration on an empty Postgres first, then this file.
do $$
declare
  sample record;
begin
  for sample in
    select * from (values
      ('ana@alumnos.upm.es', true),
      ('ana@upm.es', true),
      ('ana@fi.upm.es', true),
      ('ana@dit.upm.es', true),
      ('ana@ALUMNOS.UPM.ES', false),
      ('ana@sub.fi.upm.es', false),
      ('ana@etsit.upm.es', false),
      ('ana@fakeupm.es', false),
      ('ana@fiXupm.es', false),
      ('ana@upm.es.evil.com', false),
      ('ana@gmail.com', false),
      ('@upm.es', false),
      ('upm.es', false),
      ('', false),
      (null, false)
    ) as samples(email, expected)
  loop
    if public.is_upm_email(sample.email) is distinct from sample.expected then
      raise exception 'is_upm_email(%) should be %', quote_nullable(sample.email), sample.expected;
    end if;
  end loop;
end $$;
