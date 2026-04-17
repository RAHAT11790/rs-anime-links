create or replace function public.gen_short_code()
returns text language plpgsql set search_path = public as $$
declare chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result text := ''; i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, 1 + floor(random()*62)::int, 1);
  end loop;
  return result;
end; $$;

create or replace function public.gen_api_token()
returns text language sql set search_path = public, extensions as $$
  select encode(extensions.gen_random_bytes(16), 'hex');
$$;