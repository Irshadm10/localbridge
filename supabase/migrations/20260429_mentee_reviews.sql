-- Private mentor reviews of mentees (never shown publicly)
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS mentee_reviews (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id          UUID        REFERENCES sessions(id)    ON DELETE CASCADE,
  mentor_reviewer_id  UUID,       -- auth.users id of the mentor who wrote this
  mentee_id           UUID,       -- auth.users id of the reviewed mentee
  rating              INT         CHECK (rating BETWEEN 1 AND 5),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mentee_reviews ENABLE ROW LEVEL SECURITY;

-- Mentor can insert reviews for their own sessions
CREATE POLICY "mentor_insert_mentee_review" ON mentee_reviews
  FOR INSERT WITH CHECK (auth.uid() = mentor_reviewer_id);

-- Mentor can read their own reviews
CREATE POLICY "mentor_read_own_mentee_reviews" ON mentee_reviews
  FOR SELECT USING (auth.uid() = mentor_reviewer_id);

-- No public/mentee access — admins query via service role
