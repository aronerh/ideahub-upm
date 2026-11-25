-- IH-99 (story 17): investors say who they are when they contact an idea's team.
-- The two fields are required for new requests, while legacy requests remain nullable.
alter table public.contact_requests
  add column investor_name text,
  add column investor_organisation text;

alter table public.contact_requests
  add constraint contact_requests_investor_name_check
    check (
      investor_name is null
      or (btrim(investor_name) <> '' and char_length(investor_name) <= 100)
    ),
  add constraint contact_requests_investor_organisation_check
    check (
      investor_organisation is null
      or (btrim(investor_organisation) <> '' and char_length(investor_organisation) <= 120)
    );

-- The 008 insert grant is column-specific. Include the two investor details filled by the form.
-- Updates remain limited to read_at by 008.
revoke insert on public.contact_requests from anon, authenticated;
grant insert (
  idea_id,
  requester_id,
  requester_email,
  investor_name,
  investor_organisation,
  message
) on public.contact_requests to authenticated;
