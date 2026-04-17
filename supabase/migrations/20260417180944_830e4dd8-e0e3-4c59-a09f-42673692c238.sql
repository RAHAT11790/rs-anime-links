-- ============ ENUMS ============
create type public.app_role as enum ('admin', 'user');
create type public.withdrawal_status as enum ('pending', 'approved', 'rejected', 'paid');
create type public.link_status as enum ('active', 'disabled');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text unique not null,
  email text not null,
  balance numeric(12,4) not null default 0,
  total_earnings numeric(12,4) not null default 0,
  referral_earnings numeric(12,4) not null default 0,
  total_views bigint not null default 0,
  cpm_rate numeric(8,2) not null default 10.00,
  plan text not null default 'Default',
  referred_by uuid references auth.users(id),
  payment_method text,
  payment_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

-- ============ LINKS ============
create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  short_code text unique not null,
  original_url text not null,
  alias text,
  title text,
  hidden boolean not null default false,
  status link_status not null default 'active',
  views bigint not null default 0,
  earnings numeric(12,4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.links enable row level security;
create index idx_links_user on public.links(user_id);
create index idx_links_code on public.links(short_code);

-- ============ CLICKS ============
create table public.clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.links(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  country text,
  ip_hash text,
  user_agent text,
  earned numeric(10,5) not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.clicks enable row level security;
create index idx_clicks_link on public.clicks(link_id);
create index idx_clicks_user on public.clicks(user_id);
create index idx_clicks_date on public.clicks(created_at);

-- ============ WITHDRAWALS ============
create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,4) not null,
  method text not null,
  address text not null,
  status withdrawal_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.withdrawals enable row level security;

-- ============ REFERRALS ============
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_id uuid not null references auth.users(id) on delete cascade,
  earned numeric(12,4) not null default 0,
  created_at timestamptz not null default now(),
  unique(referrer_id, referred_id)
);
alter table public.referrals enable row level security;

-- ============ AD SLOTS ============
create table public.ad_slots (
  id uuid primary key default gen_random_uuid(),
  slot_key text unique not null,
  name text not null,
  script_code text default '',
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.ad_slots enable row level security;

-- ============ SETTINGS ============
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;

-- ============ API TOKENS ============
create table public.api_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  token text unique not null,
  created_at timestamptz not null default now()
);
alter table public.api_tokens enable row level security;

-- ============ TRIGGERS ============
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_profiles_upd before update on public.profiles for each row execute function public.update_updated_at_column();
create trigger trg_links_upd before update on public.links for each row execute function public.update_updated_at_column();
create trigger trg_withdrawals_upd before update on public.withdrawals for each row execute function public.update_updated_at_column();

create or replace function public.gen_short_code()
returns text language plpgsql as $$
declare chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result text := ''; i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, 1 + floor(random()*62)::int, 1);
  end loop;
  return result;
end; $$;

create or replace function public.gen_api_token()
returns text language sql as $$
  select encode(gen_random_bytes(16), 'hex');
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_username text;
  v_referrer uuid;
begin
  v_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1));
  v_referrer := nullif(new.raw_user_meta_data->>'referred_by','')::uuid;

  insert into public.profiles (user_id, username, email, referred_by)
  values (new.id, v_username, new.email, v_referrer)
  on conflict (user_id) do nothing;

  if lower(new.email) = 'rahatsarker224@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;

  insert into public.api_tokens (user_id, token) values (new.id, public.gen_api_token()) on conflict do nothing;

  if v_referrer is not null then
    insert into public.referrals (referrer_id, referred_id) values (v_referrer, new.id) on conflict do nothing;
  end if;

  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ RLS POLICIES ============
create policy "Users view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Admins view all profiles" on public.profiles for select using (public.has_role(auth.uid(),'admin'));
create policy "Users update own profile" on public.profiles for update using (auth.uid() = user_id);
create policy "Admins update profiles" on public.profiles for update using (public.has_role(auth.uid(),'admin'));

create policy "Users view own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "Admins view all roles" on public.user_roles for select using (public.has_role(auth.uid(),'admin'));
create policy "Admins manage roles" on public.user_roles for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "Users view own links" on public.links for select using (auth.uid() = user_id);
create policy "Admins view all links" on public.links for select using (public.has_role(auth.uid(),'admin'));
create policy "Users insert own links" on public.links for insert with check (auth.uid() = user_id);
create policy "Users update own links" on public.links for update using (auth.uid() = user_id);
create policy "Users delete own links" on public.links for delete using (auth.uid() = user_id);
create policy "Admins manage all links" on public.links for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "Users view own clicks" on public.clicks for select using (auth.uid() = user_id);
create policy "Admins view all clicks" on public.clicks for select using (public.has_role(auth.uid(),'admin'));

create policy "Users view own withdrawals" on public.withdrawals for select using (auth.uid() = user_id);
create policy "Users insert own withdrawals" on public.withdrawals for insert with check (auth.uid() = user_id);
create policy "Admins view all withdrawals" on public.withdrawals for select using (public.has_role(auth.uid(),'admin'));
create policy "Admins manage withdrawals" on public.withdrawals for update using (public.has_role(auth.uid(),'admin'));

create policy "Users view referrals they made" on public.referrals for select using (auth.uid() = referrer_id);
create policy "Admins view all referrals" on public.referrals for select using (public.has_role(auth.uid(),'admin'));

create policy "Anyone can read ad slots" on public.ad_slots for select using (true);
create policy "Admins manage ad slots" on public.ad_slots for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "Anyone can read settings" on public.settings for select using (true);
create policy "Admins manage settings" on public.settings for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "Users view own token" on public.api_tokens for select using (auth.uid() = user_id);
create policy "Admins view all tokens" on public.api_tokens for select using (public.has_role(auth.uid(),'admin'));

-- ============ SEED DATA ============
insert into public.ad_slots (slot_key, name, script_code, enabled) values
  ('step1_banner', 'Step 1 Banner Ad (300x250)', '', true),
  ('step2_banner', 'Step 2 Banner Ad', '', true),
  ('step3_banner', 'Step 3 Banner Ad (Final Gate)', '', true),
  ('popunder', 'Pop-under / Direct Link', '', true),
  ('header_banner', 'Header Banner', '', true),
  ('footer_banner', 'Footer Banner', '', true)
on conflict (slot_key) do nothing;

insert into public.settings (key, value) values
  ('site', '{"name":"RS ANIME LINK","cpm_default":10,"min_withdraw":5,"referral_percent":20,"step_wait":10,"final_wait":5}'::jsonb)
on conflict (key) do nothing;