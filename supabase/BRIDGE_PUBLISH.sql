-- ═══════════════════════════════════════════════════════════════════════════
-- Bridge — paste ENTIRE file into Supabase → SQL Editor → Run
-- Idempotent: safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Core profile + settings (mentor + mentee) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  personal_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  experience jsonb NOT NULL DEFAULT '[]'::jsonb,
  education jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  achievements jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_profiles_user_id_key UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_settings_user_id_key UNIQUE (user_id)
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Clear old policy names (both legacy + newer) then recreate one canonical set
DO $$ DECLARE r record;
BEGIN
  FOR r IN (
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_profiles'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', r.policyname);
  END LOOP;
  FOR r IN (
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_settings'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_settings', r.policyname);
  END LOOP;
END $$;

CREATE POLICY user_profiles_select ON public.user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY user_profiles_insert ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_profiles_update ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_profiles_delete ON public.user_profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY user_settings_select ON public.user_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY user_settings_insert ON public.user_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_settings_update ON public.user_settings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_settings_delete ON public.user_settings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 2. Sessions: video link + cancelled (app expects both) ─────────────────
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS video_room_url text;

ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_status_check;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_status_check
  CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled'));

-- Mentee can update own rows (e.g. cancel)
DROP POLICY IF EXISTS sessions_update_mentee_own ON public.sessions;
CREATE POLICY sessions_update_mentee_own ON public.sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = mentee_id)
  WITH CHECK (auth.uid() = mentee_id);

-- ── 3. Mentor public profile columns ───────────────────────────────────────
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS github_url text;
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS tier text DEFAULT 'rising';
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS session_rate integer DEFAULT 0;

ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS availability_schedule jsonb;

DROP POLICY IF EXISTS mentor_profiles_delete_own_user ON public.mentor_profiles;
CREATE POLICY mentor_profiles_delete_own_user ON public.mentor_profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── 4. Résumé storage (private files per user) ─────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

DO $$ DECLARE r record;
BEGIN
  FOR r IN (
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname LIKE 'resumes_%'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

CREATE POLICY resumes_select_own ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND name LIKE auth.uid()::text || '/%');

CREATE POLICY resumes_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND name LIKE auth.uid()::text || '/%');

CREATE POLICY resumes_update_own ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'resumes' AND name LIKE auth.uid()::text || '/%');

CREATE POLICY resumes_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND name LIKE auth.uid()::text || '/%');
