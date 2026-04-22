-- PostgREST embed: sessions?select=*,mentee:mentee_id(id,raw_user_meta_data) only works if
-- there is a foreign key from public.sessions(mentee_id) to auth.users(id).
-- Run in Supabase SQL Editor on the SAME project as VITE_SUPABASE_URL / production.
-- If ADD CONSTRAINT fails, clean orphan mentee_id values that are not in auth.users.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'sessions'
      AND c.conname = 'sessions_mentee_id_fkey'
  ) THEN
    ALTER TABLE public.sessions
      ADD CONSTRAINT sessions_mentee_id_fkey
      FOREIGN KEY (mentee_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
