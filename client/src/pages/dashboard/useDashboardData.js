/**
 * useDashboardData — all dashboard **server state** and **derived session lists**
 *
 * Linked from: `pages/Dashboard.jsx` (only consumer).
 * Feeds props into: `MentorDashboardContent.jsx`, `MenteeDashboardContent.jsx` via the `dash` object.
 *
 * Mentors vs mentees (different queries)
 * --------------------------------------
 * - **Mentor** (`isMentorAccount(user)` from `utils/accountRole.js`):
 *   1. Load `mentor_profiles.id` for this `user.id` → stored as `mentorProfileId` (public profile URL uses this).
 *   2. Load `sessions` where `mentor_id` = that profile id; join mentee metadata for display names → `mentee_name` on each row.
 * - **Mentee**:
 *   1. `getMySession(user.id)` from `api/sessions.js` — rows include `mentor_id`, snapshot `mentor_name` / `mentor_title`.
 *   2. Batch-load full `mentor_profiles` for those ids → `mentorMap[id]` (company, `image_url`, etc. for `SessionCard` / `MentorCard`).
 *
 * NOTE: If `getMySession` ever returns full mentor profile fields, you can drop the mentee batch query below.
 *
 * Return value (`dash`) — keys consumed by role UIs
 * --------------------------------------------------
 * | key               | Mentor UI | Mentee UI | Purpose |
 * |-------------------|-----------|-----------|---------|
 * | sessions          | ✓         | ✓         | Raw rows from DB/API |
 * | mentorMap         | (unused)  | ✓         | id → mentor_profiles row |
 * | mentorProfileId   | ✓         | ✗         | Link to `/mentors/:id` settings tab |
 * | dataLoading       | ✓         | ✓         | Gate shown in Dashboard.jsx |
 * | error / setError  | ✓         | ✓         | Banner in Dashboard.jsx |
 * | actionLoading     | ✓         | ✓         | Disables session action buttons |
 * | searchQuery       | ✓         | ✓         | Sessions + connections search |
 * | showAllHistory    | ✓         | ✓         | Overview "recent activity" expand |
 * | upcomingSessions  | ✓         | ✓         | pending/accepted, future |
 * | nextSession       | ✓         | ✓         | upcomingSessions[0] |
 * | historySessions   | ✓         | ✓         | completed / cancelled / past |
 * | visibleHistory    | ✓         | ✓         | Sliced history for overview widget |
 * | uniqueMentors     | ✗         | ✓         | Deduped mentors for Connections grid |
 * | menteeCards       | ✓         | ✗         | Deduped mentees + session counts |
 * | handleStatusUpdate| ✓         | ✓         | Wraps `updateSessionStatus` in api/sessions.js |
 *
 * `isMentor` is also returned for convenience (same as parent's `isMentorAccount(user)`).
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { isMentorAccount } from '../../utils/accountRole';
import { getMySession, updateSessionStatus, acceptSession } from '../../api/sessions';
import supabase from '../../api/supabase';

/** PostgREST needs sessions.mentee_id → auth.users FK for mentee:mentee_id(...) embeds (PGRST200 if missing). */
function isSessionsMenteeEmbedError(err) {
  if (!err) return false;
  if (err.code === 'PGRST200') return true;
  const m = String(err.message ?? '');
  return m.includes('Could not find a relationship') && m.includes('mentee_id');
}

export function useDashboardData(user, authLoading) {
  const isMentor = user ? isMentorAccount(user) : false;

  const [sessions, setSessions] = useState([]);
  /** Mentee-only: `mentor_profiles` rows keyed by profile id (enriches session list + connections). */
  const [mentorMap, setMentorMap] = useState({});
  /** Mentor-only: primary key of `mentor_profiles` for this auth user (for "View public profile" link). */
  const [mentorProfileId, setMentorProfileId] = useState(null);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [mentorOnboardingComplete, setMentorOnboardingComplete] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  /** Which session id is currently mutating (accept/decline/cancel). */
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [refetchNonce, setRefetchNonce] = useState(0);
  const refetch = useCallback(() => setRefetchNonce((n) => n + 1), []);

  // Re-fetch when user logs in/out or role changes (isMentor flips register vs mentor account).
  useEffect(() => {
    if (authLoading || !user) return;

    setDataLoading(true);
    setError(null);

    void (async () => {
      try {
        if (isMentor) {
          // maybeSingle: 0 rows is valid if onboarding insert failed (e.g. schema drift) or race before ensureMentorProfile finishes.
          const { data: profileData, error: profileErr } = await supabase
              .from('mentor_profiles')
              .select('id, calendar_connected, onboarding_complete')
              .eq('user_id', user.id)
              .maybeSingle();
          if (profileErr) throw profileErr;
          if (!profileData?.id) {
            setMentorProfileId(null);
            setCalendarConnected(false);
            setMentorOnboardingComplete(false);
            setSessions([]);
            return;
          }
          const mpId = profileData.id;
          setMentorProfileId(mpId);
          setCalendarConnected(!!profileData.calendar_connected);
          setMentorOnboardingComplete(profileData.onboarding_complete ?? false);

          let sessErr;
          let data;
          const withMentee = await supabase
              .from('sessions')
              .select('*, mentee:mentee_id(id, raw_user_meta_data)')
              .eq('mentor_id', mpId);
          ({ data, error: sessErr } = withMentee);

          if (sessErr && isSessionsMenteeEmbedError(sessErr)) {
            const { data: plain, error: plainErr } = await supabase
                .from('sessions')
                .select('*')
                .eq('mentor_id', mpId);
            if (plainErr) throw plainErr;
            console.warn(
                'Dashboard: mentee embed unavailable (add FK sessions.mentee_id → auth.users). Using generic labels. See supabase/ensure_sessions_mentee_fk.sql',
            );
            setSessions(
                (plain ?? []).map((s) => ({
                  ...s,
                  mentee_name: s.mentee_name ?? 'Mentee',
                })),
            );
          } else if (sessErr) {
            throw sessErr;
          } else {
            // Normalize a human-readable mentee label for cards (raw_user_meta_data shape from Supabase Auth).
            setSessions(
                (data ?? []).map((s) => ({
                  ...s,
                  mentee_name: s.mentee?.raw_user_meta_data?.first_name
                      ? `${s.mentee.raw_user_meta_data.first_name} ${s.mentee.raw_user_meta_data.last_name ?? ''}`.trim()
                      : s.mentee?.raw_user_meta_data?.full_name ?? s.mentee_name ?? 'Mentee',
                })),
            );
          }
        } else {
          const rows = await getMySession(user.id);
          setSessions(rows);

          // Enrich mentee view: session rows alone may lack avatar/company; mentor_profiles fills that.
          const ids = [...new Set(rows.map((s) => s.mentor_id).filter(Boolean))];
          if (ids.length > 0) {
            const { data: profiles, error: profErr } = await supabase
                .from('mentor_profiles')
                .select('*')
                .in('id', ids);
            if (profErr) throw profErr;
            setMentorMap(Object.fromEntries((profiles ?? []).map((p) => [p.id, p])));
          } else {
            // Avoid showing stale mentors after last session is removed.
            setMentorMap({});
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message ?? 'Could not load your dashboard.');
      } finally {
        setDataLoading(false);
      }
    })();
  }, [user, authLoading, isMentor, refetchNonce]);

  /** Pending or accepted, and still in the future (or missing date treated as upcoming). */
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions
        .filter(
            (s) =>
                (s.status === 'pending' || s.status === 'accepted') &&
                (!s.scheduled_date || new Date(s.scheduled_date) > now),
        )
        .sort((a, b) => {
          if (!a.scheduled_date) return 1;
          if (!b.scheduled_date) return -1;
          return new Date(a.scheduled_date) - new Date(b.scheduled_date);
        });
  }, [sessions]);

  const nextSession = upcomingSessions[0];

  /** Terminal statuses, or any session whose scheduled time has passed. */
  const historySessions = useMemo(() => {
    const now = new Date();
    return sessions
        .filter(
            (s) =>
                s.status === 'completed' ||
                s.status === 'declined' ||
                s.status === 'cancelled' ||
                (s.scheduled_date && new Date(s.scheduled_date) <= now),
        )
        .sort(
            (a, b) =>
                new Date(b.scheduled_date ?? b.created_at) -
                new Date(a.scheduled_date ?? a.created_at),
        );
  }, [sessions]);

  const visibleHistory = useMemo(
      () => (showAllHistory ? historySessions : historySessions.slice(0, 5)),
      [historySessions, showAllHistory],
  );

  /** One entry per mentor_id in sessions; prefers `mentorMap` row, falls back to snapshot fields on session. */
  const uniqueMentors = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const s of sessions) {
      if (!s.mentor_id || seen.has(s.mentor_id)) continue;
      seen.add(s.mentor_id);
      result.push(
          mentorMap[s.mentor_id] ?? {
            id: s.mentor_id,
            name: s.mentor_name,
            title: s.mentor_title,
            company: null,
            image_url: null,
          },
      );
    }
    return result;
  }, [sessions, mentorMap]);

  /** Mentor dashboard "connections": aggregate session counts per mentee_id. */
  const menteeCards = useMemo(() => {
    const map = {};
    for (const s of sessions) {
      if (!s.mentee_id) continue;
      if (!map[s.mentee_id]) map[s.mentee_id] = { name: s.mentee_name ?? 'Mentee', count: 0 };
      map[s.mentee_id].count += 1;
    }
    return Object.entries(map).map(([id, v]) => ({ id, ...v }));
  }, [sessions]);

  /** Persists via API then patches local `sessions` so UI updates without full refetch. */
  const handleStatusUpdate = useCallback(async (sessionId, status) => {
    setActionLoading(sessionId);
    setError(null);
    try {
      let updated;
      if (status === 'accepted') {
        updated = await acceptSession(sessionId);
      } else {
        updated = await updateSessionStatus(sessionId, status);
      }
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, ...updated } : s)));
    } catch (err) {
      console.error('Session status update failed:', err);
      setError(err.message ?? 'Failed to update session. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }, []);

  // Everything below is passed through as `dash` into Mentor* / Mentee* content components.
  return {
    isMentor,
    sessions,
    mentorMap,
    mentorProfileId,
    calendarConnected,
    mentorOnboardingComplete,
    dataLoading,
    error,
    setError,
    actionLoading,
    searchQuery,
    setSearchQuery,
    showAllHistory,
    setShowAllHistory,
    upcomingSessions,
    nextSession,
    historySessions,
    visibleHistory,
    uniqueMentors,
    menteeCards,
    handleStatusUpdate,
    refetch,
  };
}
