-- Bridge: sessions video + cancelled status, mentor URLs, mentee session updates,
-- user row deletes, resumes storage. Safe to re-run (IF NOT EXISTS / DROP IF EXISTS).

-- ── sessions ───────────────────────────────────────────────────────────────
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS video_room_url text;

ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_status_check;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_status_check
  CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled'));

-- ── mentor_profiles (public listing fields) ────────────────────────────────
ALTER TABLE public.mentor_profiles
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS availability_schedule jsonb;

-- ── mentee may cancel / update own session rows ─────────────────────────────
DROP POLICY IF EXISTS "sessions_update_mentee_own" ON public.sessions;
CREATE POLICY "sessions_update_mentee_own" ON public.sessions
  FOR UPDATE
  USING (auth.uid() = mentee_id)
  WITH CHECK (auth.uid() = mentee_id);

-- ── delete own app data (account cleanup from client) ───────────────────────
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
CREATE POLICY "Users can delete own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own settings" ON public.user_settings;
CREATE POLICY "Users can delete own settings" ON public.user_settings
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mentor_profiles_delete_own_user" ON public.mentor_profiles;
CREATE POLICY "mentor_profiles_delete_own_user" ON public.mentor_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- ── Storage: private resume files per user ─────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "resumes_select_own" ON storage.objects;
CREATE POLICY "resumes_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND name LIKE auth.uid()::text || '/%');

DROP POLICY IF EXISTS "resumes_insert_own" ON storage.objects;
CREATE POLICY "resumes_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND name LIKE auth.uid()::text || '/%');

DROP POLICY IF EXISTS "resumes_update_own" ON storage.objects;
CREATE POLICY "resumes_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'resumes' AND name LIKE auth.uid()::text || '/%');

DROP POLICY IF EXISTS "resumes_delete_own" ON storage.objects;
CREATE POLICY "resumes_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND name LIKE auth.uid()::text || '/%');
