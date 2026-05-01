-- Cancellation requests: users submit these; developer approves or denies.
-- Enforces a 3-per-month limit on the server before insert.

CREATE TABLE IF NOT EXISTS cancellation_requests (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  requester_id    uuid        NOT NULL,
  requester_role  text        NOT NULL CHECK (requester_role IN ('mentor', 'mentee')),
  reason          text        NOT NULL,
  details         text,
  status          text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewer_note   text,
  free_plan_granted boolean   DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  reviewed_at     timestamptz
);

ALTER TABLE cancellation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own cancellation requests"
  ON cancellation_requests FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can view own cancellation requests"
  ON cancellation_requests FOR SELECT TO authenticated
  USING (requester_id = auth.uid());

CREATE POLICY "Users can view requests for their sessions"
  ON cancellation_requests FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT id FROM sessions
      WHERE mentee_id = auth.uid()
         OR mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid())
    )
  );
