create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (full_name is null or char_length(full_name) between 1 and 120),
  cycle smallint not null default 1 check (cycle between 1 and 20),
  cumulative_gpa numeric(4, 2) not null default 0 check (cumulative_gpa between 0 and 20),
  approved_credits smallint not null default 0 check (approved_credits between 0 and 400),
  preferred_categories text[] not null default '{}'::text[] check (
    preferred_categories <@ array['Becas', 'Intercambios', 'Empleabilidad', 'Convenios']::text[]
  ),
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  credits numeric(4, 1) not null check (credits > 0 and credits <= 30),
  grade numeric(4, 2) not null check (grade between 0 and 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_user_id_idx on public.courses (user_id);

create table public.saved_opportunities (
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id text not null check (char_length(opportunity_id) between 1 and 120),
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.saved_opportunities enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.courses from anon;
revoke all on table public.saved_opportunities from anon;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.courses to authenticated;
grant select, insert, update, delete on table public.saved_opportunities to authenticated;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "profiles_delete_own"
on public.profiles for delete
to authenticated
using ((select auth.uid()) = id);

create policy "courses_select_own"
on public.courses for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "courses_insert_own"
on public.courses for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "courses_update_own"
on public.courses for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "courses_delete_own"
on public.courses for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "saved_opportunities_select_own"
on public.saved_opportunities for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "saved_opportunities_insert_own"
on public.saved_opportunities for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "saved_opportunities_delete_own"
on public.saved_opportunities for delete
to authenticated
using ((select auth.uid()) = user_id);
