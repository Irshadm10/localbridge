import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, X, CheckCircle, XCircle, Clock,
  AlertCircle, ChevronRight, Inbox, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import supabase from '../api/supabase';

const SESSION_TYPE_LABELS = {
  career_advice:  'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review:  'Resume Review',
  networking:     'Networking',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

/**
 * Only real events that happened TO the user:
 *
 * Mentor:
 *   - pending  → someone sent a new booking request (action required)
 *   - cancelled → a mentee cancelled an accepted session (FYI)
 *
 * Mentee:
 *   - accepted  → mentor confirmed the session
 *   - declined  → mentor declined the session
 */
function buildNotifications(sessions, isMentor) {
  const notes = [];

  for (const s of sessions) {
    const type = SESSION_TYPE_LABELS[s.session_type] ?? s.session_type ?? 'Session';
    const date = formatDate(s.scheduled_date);
    const datePart = date ? ` on ${date}` : '';

    if (isMentor) {
      if (s.status === 'pending') {
        notes.push({
          id:    `pending-${s.id}`,
          session: s,
          kind:  'pending',
          icon:  Clock,
          color: 'text-amber-500',
          bg:    'bg-amber-500/10',
          ring:  'ring-amber-400/20',
          title: 'New session request',
          body:  `${s.mentee_name ?? 'A mentee'} requested a ${type} session${datePart}.`,
          ts:    s.created_at,
        });
      }

      if (s.status === 'cancelled') {
        notes.push({
          id:    `cancelled-${s.id}`,
          session: s,
          kind:  'cancelled',
          icon:  XCircle,
          color: 'text-red-400',
          bg:    'bg-red-500/10',
          ring:  'ring-red-400/20',
          title: 'Session cancelled',
          body:  `${s.mentee_name ?? 'A mentee'} cancelled the ${type} session${datePart}.`,
          ts:    s.updated_at ?? s.created_at,
        });
      }
    } else {
      if (s.status === 'accepted') {
        notes.push({
          id:    `accepted-${s.id}`,
          session: s,
          kind:  'accepted',
          icon:  CheckCircle,
          color: 'text-emerald-500',
          bg:    'bg-emerald-500/10',
          ring:  'ring-emerald-400/20',
          title: 'Session confirmed',
          body:  `Your ${type} session has been confirmed${datePart}.`,
          ts:    s.updated_at ?? s.created_at,
        });
      }

      if (s.status === 'declined') {
        notes.push({
          id:    `declined-${s.id}`,
          session: s,
          kind:  'declined',
          icon:  XCircle,
          color: 'text-red-500',
          bg:    'bg-red-500/10',
          ring:  'ring-red-400/20',
          title: 'Session declined',
          body:  `Your ${type} request was declined by the mentor.`,
          ts:    s.updated_at ?? s.created_at,
        });
      }
    }
  }

  return notes.sort((a, b) => {
    // Pending always first for mentors (action required)
    if (a.kind === 'pending' && b.kind !== 'pending') return -1;
    if (b.kind === 'pending' && a.kind !== 'pending') return  1;
    return new Date(b.ts) - new Date(a.ts);
  });
}

function getReadIds() {
  try { return new Set(JSON.parse(localStorage.getItem('bridge_notif_read') ?? '[]')); }
  catch { return new Set(); }
}

function persistRead(ids) {
  localStorage.setItem('bridge_notif_read', JSON.stringify([...ids]));
}

export default function NotificationPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMentor = user ? isMentorAccount(user) : false;

  const [open, setOpen]       = useState(false);
  const [notifs, setNotifs]   = useState([]);
  const [readIds, setReadIds] = useState(() => getReadIds());
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const panelRef              = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let rows = [];
      if (isMentor) {
        const { data: profile } = await supabase
          .from('mentor_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.id) {
          const { data, error: err } = await supabase
            .from('sessions')
            .select('*')
            .eq('mentor_id', profile.id)
            .in('status', ['pending', 'cancelled'])
            .order('created_at', { ascending: false })
            .limit(20);
          if (err) throw err;
          rows = data ?? [];
        }
      } else {
        const { data, error: err } = await supabase
          .from('sessions')
          .select('*')
          .eq('mentee_id', user.id)
          .in('status', ['accepted', 'declined'])
          .order('created_at', { ascending: false })
          .limit(20);
        if (err) throw err;
        rows = data ?? [];
      }
      setNotifs(buildNotifications(rows, isMentor));
    } catch (e) {
      console.error('Notifications fetch error:', e);
      setError('Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, [user, isMentor]);

  // Fetch on open
  useEffect(() => { if (open) fetchNotifications(); }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const unreadCount = notifs.filter(n => !readIds.has(n.id)).length;

  function handleNotifClick(notif) {
    const next = new Set(readIds);
    next.add(notif.id);
    persistRead(next);
    setReadIds(next);
    setOpen(false);
    navigate('/dashboard');
  }

  function handleMarkAllRead() {
    const next = new Set(readIds);
    notifs.forEach(n => next.add(n.id));
    persistRead(next);
    setReadIds(next);
  }

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>

      {/* Bell */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--bridge-text-muted)] transition hover:bg-[var(--bridge-surface)] hover:text-[var(--bridge-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <Bell className={`h-[18px] w-[18px] transition-transform duration-200 ${open ? 'scale-90' : ''}`} />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-orange-500 px-0.5 text-[9px] font-black text-white ring-2 ring-[var(--bridge-canvas)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={null}
          className="animate-pop-in absolute right-0 top-11 z-50 flex w-[22rem] flex-col overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)]/97 shadow-[0_24px_64px_-16px_rgba(28,25,23,0.3),0_0_0_1px_rgba(234,88,12,0.06)] backdrop-blur-2xl dark:shadow-[0_24px_80px_-16px_rgba(0,0,0,0.7),0_0_0_1px_rgba(234,88,12,0.1)]"
          style={{ maxHeight: '76vh' }}
          role="dialog"
          aria-label="Notifications"
        >
          {/* Top accent line */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--bridge-border)]/60 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10">
                <Bell className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <span className="text-[13px] font-bold text-[var(--bridge-text)]">Notifications</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-orange-500 px-1.5 py-px text-[10px] font-black text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="rounded-lg px-2 py-1 text-[11px] font-semibold text-orange-500 transition hover:bg-orange-500/8"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={fetchNotifications}
                disabled={loading}
                aria-label="Refresh"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--bridge-text-faint)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] disabled:opacity-40"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--bridge-text-faint)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--bridge-border)] border-t-orange-500" />
                <span className="text-[12px] text-[var(--bridge-text-faint)]">Loading…</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <p className="text-[12px] text-[var(--bridge-text-faint)]">{error}</p>
                <button
                  type="button"
                  onClick={fetchNotifications}
                  className="rounded-lg bg-[var(--bridge-surface-muted)] px-3 py-1.5 text-[12px] font-semibold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface)]"
                >
                  Try again
                </button>
              </div>
            ) : notifs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bridge-surface-muted)]">
                  <Inbox className="h-6 w-6 text-[var(--bridge-text-faint)]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--bridge-text-secondary)]">All caught up</p>
                  <p className="mt-0.5 text-[12px] text-[var(--bridge-text-faint)]">No new notifications.</p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--bridge-border)]/40">
                {notifs.map(notif => {
                  const isRead = readIds.has(notif.id);
                  const Icon = notif.icon;
                  return (
                    <li key={notif.id}>
                      <button
                        type="button"
                        onClick={() => handleNotifClick(notif)}
                        className={`group w-full text-left transition-colors hover:bg-[var(--bridge-surface-muted)] ${isRead ? 'opacity-55' : ''}`}
                      >
                        <div className="flex items-start gap-3 px-4 py-3.5">
                          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${notif.bg} ${notif.ring}`}>
                            <Icon className={`h-4 w-4 ${notif.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-[12px] font-bold leading-snug ${isRead ? 'text-[var(--bridge-text-secondary)]' : 'text-[var(--bridge-text)]'}`}>
                                {notif.title}
                              </p>
                              {!isRead && (
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                              )}
                            </div>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--bridge-text-faint)]">
                              {notif.body}
                            </p>
                            <p className="mt-1.5 text-[10px] font-medium text-[var(--bridge-text-faint)]/60">
                              {timeAgo(notif.ts)}
                            </p>
                          </div>
                          <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--bridge-text-faint)] transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && !loading && (
            <div className="shrink-0 border-t border-[var(--bridge-border)]/60 px-4 py-3">
              <button
                type="button"
                onClick={() => { setOpen(false); navigate('/dashboard'); }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--bridge-surface-muted)] py-2 text-[12px] font-semibold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface)] hover:text-[var(--bridge-text)]"
              >
                View all in Dashboard
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
