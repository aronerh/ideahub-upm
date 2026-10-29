-- Helpers for the database tests. Use them inside a transaction that ends with rollback.
create schema tests;
grant usage on schema tests to anon, authenticated;

-- Acts as a signed-in user, the way a request through the Supabase API would.
create function tests.sign_in_as(user_id uuid, email text) returns void
language plpgsql
as $$
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_id, 'email', email, 'role', 'authenticated')::text,
    true
  );
  perform set_config('role', 'authenticated', true);
end;
$$;

-- Acts as a visitor without an account.
create function tests.act_as_visitor() returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', '', true);
  perform set_config('role', 'anon', true);
end;
$$;

-- Fails unless the statement raises an error with the given SQLSTATE.
create function tests.expect_error(statement text, expected_state text) returns void
language plpgsql
as $$
declare
  raised_expected_error boolean := false;
begin
  begin
    execute statement;
  exception
    when others then
      if sqlstate <> expected_state then
        raise exception 'Expected "%" to fail with %, but it failed with % (%)',
          statement, expected_state, sqlstate, sqlerrm;
      end if;
      raised_expected_error := true;
  end;

  if not raised_expected_error then
    raise exception 'Expected "%" to fail with %, but it succeeded', statement, expected_state;
  end if;
end;
$$;

-- Fails unless the statement changes exactly the given number of rows.
create function tests.expect_rows(statement text, expected_count integer) returns void
language plpgsql
as $$
declare
  changed_count integer;
begin
  execute statement;
  get diagnostics changed_count = row_count;

  if changed_count <> expected_count then
    raise exception 'Expected "%" to change % rows, but it changed %',
      statement, expected_count, changed_count;
  end if;
end;
$$;
