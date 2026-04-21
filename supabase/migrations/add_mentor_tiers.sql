ALTER TABLE public.mentor_profiles
  ADD COLUMN IF NOT EXISTS session_rate INTEGER,
  ADD COLUMN IF NOT EXISTS tier TEXT;
