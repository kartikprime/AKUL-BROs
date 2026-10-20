-- AKUL BROs / MilkLedger schema
-- Apply in the Supabase SQL editor or with the Supabase CLI:
--   supabase db push
--   or paste this file into Project Settings → SQL → New query

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.app_users (
  id uuid primary key default gen_random_uuid(),
  pin_hash text not null,
  role text not null check (role in ('admin', 'owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.villages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.app_users(id) on delete cascade,
  name text not null,
  code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint villages_owner_code_unique unique (owner_id, code),
  constraint villages_name_not_blank check (char_length(btrim(name)) > 0),
  constraint villages_code_not_blank check (char_length(btrim(code)) > 0)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.app_users(id) on delete cascade,
  village_id uuid not null references public.villages(id) on delete cascade,
  customer_number integer not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_owner_number_unique unique (owner_id, customer_number),
  constraint customers_number_start check (customer_number >= 1001),
  constraint customers_name_not_blank check (char_length(btrim(name)) > 0)
);

create table public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.app_users(id) on delete cascade,
  village_id uuid not null references public.villages(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  customer_number integer not null,
  customer_name text not null,
  entry_date date not null,
  shift text not null check (shift in ('AM', 'PM')),
  weight numeric not null,
  fat numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_entries_unique_shift unique (customer_id, entry_date, shift),
  constraint daily_entries_fat_range check (fat >= 0 and fat <= 400),
  constraint daily_entries_weight_valid check (weight >= 0)
);

create table public.cycle_parameters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.app_users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  cycle integer not null check (cycle in (1, 2, 3)),
  fixed_fat numeric not null default 60,
  rate numeric not null default 54,
  fixed_number numeric not null default 0.015,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cycle_parameters_customer_cycle_unique unique (customer_id, cycle)
);

create index villages_owner_id_idx on public.villages (owner_id);
create index customers_owner_id_idx on public.customers (owner_id);
create index customers_village_id_idx on public.customers (village_id);
create index customers_updated_at_idx on public.customers (updated_at desc);
create index daily_entries_owner_id_idx on public.daily_entries (owner_id);
create index daily_entries_village_date_idx on public.daily_entries (village_id, entry_date);
create index daily_entries_customer_id_idx on public.daily_entries (customer_id);
create index cycle_parameters_customer_id_idx on public.cycle_parameters (customer_id);

create trigger app_users_set_updated_at
before update on public.app_users
for each row execute procedure public.set_updated_at();

create trigger villages_set_updated_at
before update on public.villages
for each row execute procedure public.set_updated_at();

create trigger customers_set_updated_at
before update on public.customers
for each row execute procedure public.set_updated_at();

create trigger daily_entries_set_updated_at
before update on public.daily_entries
for each row execute procedure public.set_updated_at();

create trigger cycle_parameters_set_updated_at
before update on public.cycle_parameters
for each row execute procedure public.set_updated_at();

alter table public.app_users enable row level security;
alter table public.villages enable row level security;
alter table public.customers enable row level security;
alter table public.daily_entries enable row level security;
alter table public.cycle_parameters enable row level security;

-- app_users is service-role only. No anon/authenticated policies on purpose.
revoke all on public.app_users from anon, authenticated;

grant select, insert, update, delete on public.villages to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.daily_entries to authenticated;
grant select, insert, update, delete on public.cycle_parameters to authenticated;

create policy villages_select on public.villages
  for select to authenticated
  using (owner_id = auth.uid());
create policy villages_insert on public.villages
  for insert to authenticated
  with check (owner_id = auth.uid());
create policy villages_update on public.villages
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
create policy villages_delete on public.villages
  for delete to authenticated
  using (owner_id = auth.uid());

create policy customers_select on public.customers
  for select to authenticated
  using (owner_id = auth.uid());
create policy customers_insert on public.customers
  for insert to authenticated
  with check (owner_id = auth.uid());
create policy customers_update on public.customers
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
create policy customers_delete on public.customers
  for delete to authenticated
  using (owner_id = auth.uid());

create policy daily_entries_select on public.daily_entries
  for select to authenticated
  using (owner_id = auth.uid());
create policy daily_entries_insert on public.daily_entries
  for insert to authenticated
  with check (owner_id = auth.uid());
create policy daily_entries_update on public.daily_entries
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
create policy daily_entries_delete on public.daily_entries
  for delete to authenticated
  using (owner_id = auth.uid());

create policy cycle_parameters_select on public.cycle_parameters
  for select to authenticated
  using (owner_id = auth.uid());
create policy cycle_parameters_insert on public.cycle_parameters
  for insert to authenticated
  with check (owner_id = auth.uid());
create policy cycle_parameters_update on public.cycle_parameters
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
create policy cycle_parameters_delete on public.cycle_parameters
  for delete to authenticated
  using (owner_id = auth.uid());
