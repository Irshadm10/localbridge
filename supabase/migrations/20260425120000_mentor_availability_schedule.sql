ALTER TABLE public.mentor_profiles
  ADD COLUMN IF NOT EXISTS availability_schedule jsonb;

COMMENT ON COLUMN public.mentor_profiles.availability_schedule IS
  'Weekly bookable slots: {"weekly":{"0":["09:00",...],...},"timezone":"UTC"} — day keys 0=Sun..6=Sat; times from the app slot list.';
