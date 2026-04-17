-- Bridge mentorship schema (v2) — paste into Supabase SQL Editor.
-- Drops and recreates public tables: mentor_profiles, sessions, reviews, favorites.

drop table if exists public.favorites cascade;
drop table if exists public.reviews cascade;
drop table if exists public.sessions cascade;
drop table if exists public.mentor_profiles cascade;

-- mentor_profiles: user_id has no FK so seed rows can use gen_random_uuid().
create table public.mentor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  email text,
  title text,
  company text,
  industry text,
  bio text,
  years_experience int,
  expertise jsonb not null default '[]'::jsonb,
  rating decimal(4, 2) not null default 0,
  total_sessions int not null default 0,
  available boolean not null default true,
  image_url text,
  created_at timestamptz not null default now(),
  expertise_search text generated always as (lower(expertise::text)) stored
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references auth.users (id) on delete cascade,
  mentor_id uuid not null references public.mentor_profiles (id) on delete restrict,
  session_type text not null,
  scheduled_date timestamptz,
  status text not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  constraint sessions_session_type_check check (
    session_type in ('career_advice', 'interview_prep', 'resume_review', 'networking')
  ),
  constraint sessions_status_check check (
    status in ('pending', 'accepted', 'declined', 'completed')
  )
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  mentor_id uuid not null references public.mentor_profiles (id) on delete cascade,
  rating int not null,
  comment text,
  created_at timestamptz not null default now(),
  constraint reviews_rating_check check (rating >= 1 and rating <= 5)
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mentor_id uuid not null references public.mentor_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_user_mentor_unique unique (user_id, mentor_id)
);

-- Row Level Security ----------------------------------------------------------

alter table public.mentor_profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;

-- mentor_profiles
create policy "mentor_profiles_select_all"
  on public.mentor_profiles for select
  using (true);

create policy "mentor_profiles_insert_own_user"
  on public.mentor_profiles for insert
  with check (
    auth.uid() is not null
    and auth.uid() = user_id
  );

create policy "mentor_profiles_update_own_user"
  on public.mentor_profiles for update
  using (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

-- sessions
create policy "sessions_select_mentee_or_mentor"
  on public.sessions for select
  using (
    auth.uid() = mentee_id
    or mentor_id in (
      select mp.id from public.mentor_profiles mp where mp.user_id = auth.uid()
    )
  );

create policy "sessions_insert_authenticated_mentee"
  on public.sessions for insert
  with check (
    auth.uid() is not null
    and auth.uid() = mentee_id
  );

create policy "sessions_update_by_linked_mentor"
  on public.sessions for update
  using (
    exists (
      select 1
      from public.mentor_profiles mp
      where mp.id = sessions.mentor_id
        and mp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.mentor_profiles mp
      where mp.id = sessions.mentor_id
        and mp.user_id = auth.uid()
    )
  );

-- reviews
create policy "reviews_select_all"
  on public.reviews for select
  using (true);

create policy "reviews_insert_authenticated_reviewer"
  on public.reviews for insert
  with check (
    auth.uid() is not null
    and auth.uid() = reviewer_id
  );

create policy "reviews_delete_own"
  on public.reviews for delete
  using (auth.uid() = reviewer_id);

-- favorites
create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- API grants ------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on public.mentor_profiles to anon, authenticated;
grant insert, update on public.mentor_profiles to authenticated;

grant select, insert, update on public.sessions to authenticated;

grant select on public.reviews to anon, authenticated;
grant insert, delete on public.reviews to authenticated;

grant select, insert, delete on public.favorites to authenticated;

-- Seed (30 mentors) follows in bridge_schema.sql (concatenated).
