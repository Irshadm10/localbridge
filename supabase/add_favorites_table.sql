-- Run in Supabase SQL Editor if favorites are missing (rest of schema already applied).

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mentor_id uuid not null references public.mentor_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_user_mentor_unique unique (user_id, mentor_id)
);

alter table public.favorites enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
drop policy if exists "favorites_insert_own" on public.favorites;
drop policy if exists "favorites_delete_own" on public.favorites;

create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);

grant select, insert, delete on public.favorites to authenticated;
