-- Keep public.mentor_profiles in sync with the client (api/mentorOnboarding.js, dashboard, mentors list).
-- Fixes PostgREST PGRST204: "Could not find the 'image_url' column of 'mentor_profiles' in the schema cache"
-- when production DB was created from an older schema.

ALTER TABLE public.mentor_profiles
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS tier text,
  ADD COLUMN IF NOT EXISTS session_rate integer;
