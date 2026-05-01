/**
 * dashboardLive — live, time-aware UI primitives for the dashboard.
 *
 * Pure presentational + small client-side hooks. Does NOT touch any API,
 * Supabase, Google Calendar OAuth, or video room logic. Safe to import
 * anywhere a session row is available.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Clock, ExternalLink, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─── useNow hook ────────────────────────────────────────────────── */
/** Returns a tick value that updates every `intervalMs`. Cheap. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/* ─── LiveCountdown ──────────────────────────────────────────────── */
/**
 * Ticks down to `targetIso`. Adapts granularity:
 *   > 24h  → days/hours
 *   > 1h   → hours/minutes
 *   ≤ 1h   → minutes/seconds (with pulse)
 *   ≤ 0    → "Live now"
 */
export function LiveCountdown({ targetIso, tone = 'orange', compact = false }) {
  const now = useNow(1000);
  if (!targetIso) return null;
  const target = new Date(targetIso).getTime();
  const diff = target - now;
  const tones = {
    orange: 'from-orange-500/20 to-amber-500/10 ring-orange-400/35 text-orange-100',
    emerald: 'from-emerald-500/20 to-teal-500/10 ring-emerald-400/35 text-emerald-100',
    amber: 'from-amber-500/22 to-orange-500/12 ring-amber-400/40 text-amber-100',
    sky: 'from-sky-500/20 to-blue-500/10 ring-sky-400/35 text-sky-100',
  };
  const cls = tones[tone] ?? tones.orange;

  if (diff <= -2 * 60 * 1000) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br ${cls} px-3 py-1.5 text-[11px] font-bold ring-1`}>
        <Clock className="h-3 w-3 opacity-70" /> Past
      </span>
    );
  }
  if (diff <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-200 ring-1 ring-emerald-400/40">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
        </span>
        Live now
      </span>
    );
  }

  const SEC = 1000, MIN = 60 * SEC, HR = 60 * MIN, DAY = 24 * HR;
  const days = Math.floor(diff / DAY);
  const hours = Math.floor((diff % DAY) / HR);
  const mins = Math.floor((diff % HR) / MIN);
  const secs = Math.floor((diff % MIN) / SEC);

  let label;
  let urgent = false;
  if (diff > DAY) label = `${days}d ${hours.toString().padStart(2, '0')}h`;
  else if (diff > HR) label = `${hours}h ${mins.toString().padStart(2, '0')}m`;
  else {
    label = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    urgent = true;
  }

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-[12px] font-bold tabular-nums ${urgent ? 'text-amber-200' : 'text-white/80'}`}>
        <Clock className={`h-3 w-3 ${urgent ? 'animate-pulse-soft' : ''}`} />
        {label}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br ${cls} px-3.5 py-2 ring-1`}>
      <Clock className={`h-3.5 w-3.5 ${urgent ? 'animate-pulse-soft' : ''}`} />
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-75">Starts in</span>
      <span className="font-mono text-sm font-black tabular-nums">{label}</span>
    </div>
  );
}

/* ─── Relative session label ─────────────────────────────────────── */
/** "Today at 3:00 PM" / "Tomorrow at 9:00 AM" / "in 3 days" / etc. */
export function getRelativeSession(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.round((d - now) / (24 * 60 * 60 * 1000));
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (Math.abs(d - now) < 60 * 60 * 1000) {
    const mins = Math.round((d - now) / (60 * 1000));
    if (mins <= 0) return 'right now';
    return `in ${mins} min`;
  }
  if (d.toDateString() === now.toDateString()) return `today at ${time}`;
  const tmrw = new Date(now); tmrw.setDate(tmrw.getDate() + 1);
  if (d.toDateString() === tmrw.toDateString()) return `tomorrow at ${time}`;
  if (diffDays > 1 && diffDays <= 7) return `${d.toLocaleDateString(undefined, { weekday: 'long' })} at ${time}`;
  if (diffDays > 7) return `in ${diffDays} days`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ` at ${time}`;
}

/* ─── Google Calendar deep-link ─────────────────────────────────── */
/** Generates a Google Calendar "add event" URL — works without the OAuth API. */
export function googleCalendarLink(session, { title, location } = {}) {
  if (!session?.scheduled_date) return null;
  const start = new Date(session.scheduled_date);
  const end = new Date(start.getTime() + (session.duration_minutes ?? 60) * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const text = encodeURIComponent(title ?? `Bridge session — ${session.session_type?.replace('_', ' ') ?? 'mentorship'}`);
  const dates = `${fmt(start)}/${fmt(end)}`;
  const details = encodeURIComponent(
    `Bridge mentorship session.\n\nJoin link: ${typeof window !== 'undefined' ? window.location.origin : ''}/session/${session.id}/video`
  );
  const loc = encodeURIComponent(location ?? 'Bridge video room');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${loc}`;
}

/* ─── Add-to-calendar button ─────────────────────────────────────── */
export function AddToCalendarButton({ session, label = 'Add to calendar', tone = 'glass' }) {
  const url = googleCalendarLink(session);
  if (!url) return null;
  const cls = tone === 'glass'
    ? 'bg-white/10 text-white hover:bg-white/20'
    : 'bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-secondary)] ring-1 ring-[var(--bridge-border)] hover:bg-[var(--bridge-surface)]';
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${cls}`}>
      <Calendar className="h-3.5 w-3.5" /> {label}
      <ExternalLink className="h-3 w-3 opacity-70" />
    </a>
  );
}

/* ─── Smart subtitle ─────────────────────────────────────────────── */
/** Generates a short context-aware line under the greeting. */
export function SmartSubtitle({ todayLabel, nextSession, pendingCount, isMentor }) {
  // Tick when next session approaches so the line refreshes.
  const now = useNow(60 * 1000);
  let pieces = [todayLabel];

  if (isMentor && pendingCount > 0) {
    pieces.push(
      <span key="pending" className="inline-flex items-center gap-1 font-bold text-amber-500">
        <Flame className="h-3 w-3" />
        {pendingCount} pending request{pendingCount === 1 ? '' : 's'}
      </span>
    );
  } else if (nextSession?.scheduled_date) {
    const rel = getRelativeSession(nextSession.scheduled_date);
    const diff = new Date(nextSession.scheduled_date).getTime() - now;
    const cls = diff <= 60 * 60 * 1000
      ? 'text-emerald-500 font-bold'
      : 'text-orange-500 font-semibold';
    pieces.push(
      <span key="next" className={`inline-flex items-center gap-1 ${cls}`}>
        <Clock className="h-3 w-3" />
        Next session {rel}
      </span>
    );
  } else {
    pieces.push(
      <span key="open" className="text-[var(--bridge-text-faint)]">
        {isMentor ? 'No upcoming sessions yet.' : 'No sessions booked yet.'}
      </span>
    );
  }

  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-[var(--bridge-text-faint)]">
      {pieces.map((p, i) => (
        <span key={i} className="inline-flex items-center">
          {i > 0 && <span aria-hidden className="mr-2 h-1 w-1 rounded-full bg-[var(--bridge-border-strong)]" />}
          {p}
        </span>
      ))}
    </div>
  );
}

/* ─── Today banner ───────────────────────────────────────────────── */
/**
 * Prominent strip shown when there's a confirmed session today/within next 6h.
 * Pure UI — uses LiveCountdown for ticks. Tap → navigate prop.
 */
export function TodayBanner({ session, onJoin, isMentor }) {
  const now = useNow(15 * 1000);
  if (!session?.scheduled_date) return null;
  const target = new Date(session.scheduled_date).getTime();
  const diff = target - now;
  // Show only if within next 6 hours and not more than 30 min past
  if (diff > 6 * 60 * 60 * 1000 || diff < -30 * 60 * 1000) return null;
  if (session.status !== 'accepted') return null;

  const live = diff <= 0 && diff > -30 * 60 * 1000;
  const partyName = isMentor ? (session.mentee_name ?? 'your mentee') : (session.mentor_name ?? 'your mentor');

  return (
    <div className="relative overflow-hidden rounded-2xl"
      style={{ background: live
        ? 'linear-gradient(90deg,#022c22 0%,#064e3b 50%,#0a3a2e 100%)'
        : 'linear-gradient(90deg,#1c0f06 0%,#3a1d08 50%,#1c0f06 100%)' }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize: '20px 20px' }} />
      <div aria-hidden className={`pointer-events-none absolute -right-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full blur-2xl ${live ? 'bg-emerald-400/30' : 'bg-orange-400/20'}`} />
      <div className="relative flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${live ? 'bg-emerald-400/25 text-emerald-200' : 'bg-orange-400/20 text-orange-200'}`}>
            <Clock className={`h-4 w-4 ${live ? 'animate-pulse-soft' : ''}`} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.22em] text-white/55">
              {live ? 'Live now' : 'Coming up today'}
            </p>
            <p className="truncate text-sm font-bold text-white">
              Session with {partyName} {!live && <span className="text-white/55">— {getRelativeSession(session.scheduled_date)}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <LiveCountdown targetIso={session.scheduled_date} tone={live ? 'emerald' : 'amber'} />
          {onJoin ? (
            <button type="button" onClick={onJoin}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${live ? 'bg-emerald-300 text-emerald-950 hover:bg-emerald-200' : 'bg-white text-stone-900 hover:bg-orange-50'}`}>
              Join meeting
            </button>
          ) : (
            <Link to={`/session/${session.id}/video`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-stone-900 transition hover:bg-orange-50">
              Join meeting
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Urgency badge for pending requests ─────────────────────────── */
/** Color-coded "respond in X" derived from session.created_at. */
export function UrgencyBadge({ createdAt }) {
  const now = useNow(60 * 1000);
  if (!createdAt) return null;
  const age = now - new Date(createdAt).getTime();
  const HR = 60 * 60 * 1000;
  const remaining = 24 * HR - age;

  let cls = 'bg-emerald-500/12 text-emerald-300 ring-emerald-500/30';
  let dot = 'bg-emerald-400';
  let label = '';

  if (remaining <= 0) {
    cls = 'bg-red-500/15 text-red-300 ring-red-500/35';
    dot = 'bg-red-400 animate-pulse-soft';
    label = 'Overdue';
  } else if (remaining < 4 * HR) {
    cls = 'bg-red-500/12 text-red-300 ring-red-500/30';
    dot = 'bg-red-400 animate-pulse-soft';
    label = `${Math.ceil(remaining / HR)}h to respond`;
  } else if (remaining < 12 * HR) {
    cls = 'bg-amber-500/12 text-amber-300 ring-amber-500/30';
    dot = 'bg-amber-400';
    label = `${Math.ceil(remaining / HR)}h to respond`;
  } else {
    label = `${Math.ceil(remaining / HR)}h to respond`;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ring-1 ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

/* ─── Trend delta ───────────────────────────────────────────────── */
/** Renders +N or -N vs previous period. Use under stat values. */
export function TrendDelta({ current = 0, previous = 0, label = 'vs last 30d' }) {
  const delta = current - previous;
  if (current === 0 && previous === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--bridge-text-faint)]">
        <Minus className="h-2.5 w-2.5" /> {label}
      </span>
    );
  }
  const up = delta > 0;
  const flat = delta === 0;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  const cls = flat
    ? 'text-[var(--bridge-text-faint)]'
    : up ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400';
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${cls}`}>
      <Icon className="h-2.5 w-2.5" />
      <span className="tabular-nums">{up ? '+' : ''}{delta}</span>
      <span className="font-medium opacity-70">{label}</span>
    </span>
  );
}

/* ─── Session-period stats hook ──────────────────────────────────── */
/**
 * Computes simple last-30 / prior-30 stats from a sessions array.
 * Pure derivation — no API calls.
 */
export function useSessionTrends(sessions) {
  return useMemo(() => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const last30 = sessions.filter((s) => {
      const t = new Date(s.created_at ?? s.scheduled_date).getTime();
      return Number.isFinite(t) && now - t < 30 * DAY;
    });
    const prior30 = sessions.filter((s) => {
      const t = new Date(s.created_at ?? s.scheduled_date).getTime();
      return Number.isFinite(t) && now - t >= 30 * DAY && now - t < 60 * DAY;
    });
    return {
      bookedLast30: last30.length,
      bookedPrior30: prior30.length,
      completedLast30: last30.filter((s) => s.status === 'completed').length,
      completedPrior30: prior30.filter((s) => s.status === 'completed').length,
    };
  }, [sessions]);
}

/* ─── Keyboard tab nav ───────────────────────────────────────────── */
/**
 * Wires Cmd/Ctrl+1..N (or plain 1..N when nothing focused) to switch tabs.
 * Skips when an input/textarea/contenteditable is focused.
 */
export function useTabKeyboardNav(tabs, setActiveTab) {
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const tag = (t?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || t?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        const tab = tabsRef.current[idx];
        if (tab) {
          e.preventDefault();
          setActiveTab(tab.id);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setActiveTab]);
}
