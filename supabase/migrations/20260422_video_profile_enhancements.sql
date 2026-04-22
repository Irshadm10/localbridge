-- Video calling + profile enhancements migration
-- Run this in the Supabase SQL Editor.

-- 1. Add video_room_url to sessions so each accepted session has a Jitsi room link
alter table public.sessions
  add column if not exists video_room_url text;

-- 2. Drop and recreate the sessions status constraint to include 'cancelled'
--    (original constraint was missing 'cancelled' but the app code uses it)
alter table public.sessions
  drop constraint if exists sessions_status_check;

alter table public.sessions
  add constraint sessions_status_check check (
    status in ('pending', 'accepted', 'declined', 'completed', 'cancelled')
  );

-- 3. Add social/contact link columns to mentor_profiles
alter table public.mentor_profiles
  add column if not exists linkedin_url text;

alter table public.mentor_profiles
  add column if not exists github_url text;

alter table public.mentor_profiles
  add column if not exists website_url text;

-- 4. Add tier and session_rate columns to mentor_profiles if they don't exist yet
--    (some deployments may have applied the earlier migration already)
alter table public.mentor_profiles
  add column if not exists tier text default 'rising';

alter table public.mentor_profiles
  add column if not exists session_rate integer default 0;

-- 5. Ensure user_profiles and user_settings tables exist (idempotent)
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  personal_info jsonb default '{}'::jsonb,
  experience jsonb default '[]'::jsonb,
  education jsonb default '[]'::jsonb,
  skills jsonb default '[]'::jsonb,
  achievements jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_user_id_unique unique (user_id)
);

alter table public.user_profiles enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_profiles' and policyname = 'user_profiles_select_own'
  ) then
    create policy "user_profiles_select_own"
      on public.user_profiles for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_profiles' and policyname = 'user_profiles_insert_own'
  ) then
    create policy "user_profiles_insert_own"
      on public.user_profiles for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_profiles' and policyname = 'user_profiles_update_own'
  ) then
    create policy "user_profiles_update_own"
      on public.user_profiles for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_settings_user_id_unique unique (user_id)
);

alter table public.user_settings enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_settings' and policyname = 'user_settings_select_own'
  ) then
    create policy "user_settings_select_own"
      on public.user_settings for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_settings' and policyname = 'user_settings_insert_own'
  ) then
    create policy "user_settings_insert_own"
      on public.user_settings for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_settings' and policyname = 'user_settings_update_own'
  ) then
    create policy "user_settings_update_own"
      on public.user_settings for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
