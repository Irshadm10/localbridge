<<<<<<< HEAD
// TODO: getMySessions() batch-selects only 'id, name, title' from mentor_profiles, so sessions
// arrive enriched with mentor_name and mentor_title but NOT company or image_url.
// The secondary batch query below (supabase directly, selecting id/name/title/company/image_url/tier)
// fills that gap for the My Mentors section. If getMySessions() is ever updated to include those
// fields in its batch select, the secondary fetch in this component can be removed.

import { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getMySessions } from '../api/sessions';
import { SESSION_TYPES } from '../constants/sessionTypes';
import supabase from '../api/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import Reveal from '../components/Reveal';

// ─── Constants ────────────────────────────────────────────────────────────────

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

const SESSION_TYPE_MAP = Object.fromEntries(SESSION_TYPES.map((t) => [t.key, t]));

const AVATAR_COLORS = [
  'bg-violet-200 text-violet-800',
  'bg-amber-200 text-amber-800',
  'bg-emerald-200 text-emerald-800',
  'bg-sky-200 text-sky-800',
  'bg-rose-200 text-rose-800',
  'bg-indigo-200 text-indigo-800',
  'bg-teal-200 text-teal-800',
  'bg-orange-200 text-orange-800',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function getFirstName(user) {
  const full = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  if (full.trim()) return full.trim().split(/\s+/)[0];
  return user?.email?.split('@')[0] ?? 'there';
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getTodayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatSessionDate(iso) {
  if (!iso) return 'No date set';
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconCalendar({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconClock({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function IconCheckCircle({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m22 4-10 10-3-3" />
    </svg>
  );
}

function IconUsers({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconChevronRight({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconSearch({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const config = {
    pending:   { classes: 'bg-amber-50 text-amber-800 border border-amber-200/80',   label: 'Pending' },
    accepted:  { classes: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80', label: 'Confirmed' },
    completed: { classes: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80', label: 'Completed' },
    declined:  { classes: 'bg-red-50 text-red-800 border border-red-200/80',         label: 'Declined' },
  };
  const { classes, label } = config[status] ?? {
    classes: 'bg-stone-100 text-stone-600',
    label: status ?? 'Unknown',
  };
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${classes}`}>
      {label}
=======
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMySession, updateSessionStatus } from "../api/sessions";
import { getMentorById } from "../api/mentors";
import supabase from "../api/supabase";
import LoadingSpinner from "../components/LoadingSpinner";

const SESSION_TYPE_ICONS = {
  "career-advice":      { icon: "💼", label: "Career Advice" },
  "mock-interview":     { icon: "🎤", label: "Mock Interview" },
  "resume-review":      { icon: "📄", label: "Resume Review" },
  "code-review":        { icon: "💻", label: "Code Review" },
  "general-mentorship": { icon: "🌱", label: "General Mentorship" },
  "networking":         { icon: "🤝", label: "Networking" },
  "skill-building":     { icon: "🛠️", label: "Skill Building" },
  default:              { icon: "📅", label: "Session" },
};

function getSessionTypeInfo(type) {
  if (!type) return SESSION_TYPE_ICONS.default;
  const key = type.toLowerCase().replace(/\s+/g, "-");
  return SESSION_TYPE_ICONS[key] || { icon: "📅", label: type };
}

function StatusBadge({ status }) {
  const styles = {
    pending:   "bg-amber-100 text-amber-800 border border-amber-200",
    accepted:  "bg-green-100 text-green-800 border border-green-200",
    declined:  "bg-red-100 text-red-800 border border-red-200",
    completed: "bg-stone-100 text-stone-600 border border-stone-200",
    cancelled: "bg-stone-100 text-stone-500 border border-stone-200",
  };
  const labels = { pending: "Pending", accepted: "Accepted", declined: "Declined", completed: "Completed", cancelled: "Cancelled" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${styles[status] || styles.pending}`}>
      {labels[status] || status}
>>>>>>> ea43786 (feat: user dashboard with sessions, stats, mentor/mentee views)
    </span>
  );
}

<<<<<<< HEAD
// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ id, children, count }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <h2 id={id} className="font-display text-xl font-semibold text-stone-900">
        {children}
      </h2>
      {count != null && (
        <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-stone-100 px-1.5 text-xs font-semibold text-stone-500">
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, barClass, iconBgClass }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-stone-900/[0.02] sm:p-6">
      <div
        aria-hidden
        className={`absolute inset-x-0 top-0 h-0.5 ${barClass}`}
      />
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${iconBgClass}`}>
        {icon}
      </div>
      <p className="font-display text-3xl font-bold tabular-nums leading-none text-stone-900">{value}</p>
      <p className="mt-1.5 text-sm text-stone-500">{label}</p>
=======
function StatCard({ icon, value, label, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-5 py-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-stone-800 leading-none">{value}</p>
        <p className="text-xs text-stone-500 mt-1 font-medium tracking-wide">{label}</p>
      </div>
>>>>>>> ea43786 (feat: user dashboard with sessions, stats, mentor/mentee views)
    </div>
  );
}

<<<<<<< HEAD
// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message, cta, href }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200/90 bg-stone-50/60 px-6 py-12 text-center">
      <p className="text-sm font-medium text-stone-600">{message}</p>
      {cta && href ? (
        <Link
          to={href}
          className={`mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-md transition hover:from-stone-800 hover:to-stone-700 ${focusRing}`}
        >
          {cta}
        </Link>
      ) : null}
    </div>
  );
}

// ─── Session card ─────────────────────────────────────────────────────────────

function SessionCard({ session }) {
  const type = SESSION_TYPE_MAP[session.session_type];
  const name = session.mentor_name ?? 'Unknown mentor';
  const title = session.mentor_title;

  return (
    <Link
      to={`/mentors/${session.mentor_id}`}
      className={`group flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white/95 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200/55 hover:shadow-md sm:flex-row sm:items-center sm:gap-5 sm:p-5 ${focusRing}`}
    >
      {/* Session-type icon */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${type?.accent.iconBg ?? 'bg-stone-100'}`}
        aria-hidden
      >
        {type?.icon ?? '📋'}
      </div>

      {/* Mentor + session-type info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-stone-900 transition group-hover:text-orange-900">{name}</p>
        {title ? <p className="truncate text-sm text-stone-500">{title}</p> : null}
        <p className="mt-0.5 text-xs font-medium text-stone-400">{type?.name ?? session.session_type}</p>
      </div>

      {/* Date + status badge */}
      <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
        <StatusBadge status={session.status} />
        <p className="text-xs text-stone-400">{formatSessionDate(session.scheduled_date)}</p>
      </div>

      <IconChevronRight className="hidden h-4 w-4 shrink-0 text-stone-300 transition group-hover:text-orange-400 sm:block" />
    </Link>
  );
}

// ─── Mentor card ──────────────────────────────────────────────────────────────

function MentorCard({ mentor }) {
  const color = getAvatarColor(mentor.name ?? '');
  const inits = getInitials(mentor.name ?? '');

  return (
    <Link
      to={`/mentors/${mentor.id}`}
      className={`group flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white/95 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200/55 hover:shadow-md sm:p-5 ${focusRing}`}
    >
      {mentor.image_url ? (
        <img
          src={mentor.image_url}
          alt=""
          className="h-12 w-12 shrink-0 rounded-xl object-cover ring-2 ring-white shadow-sm"
        />
      ) : (
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ring-2 ring-white ${color}`}
          aria-hidden
        >
          {inits}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-stone-900 transition group-hover:text-orange-900">
          {mentor.name ?? 'Unknown mentor'}
        </p>
        {mentor.title ? (
          <p className="truncate text-xs text-stone-500">{mentor.title}</p>
        ) : null}
        {mentor.company ? (
          <p className="truncate text-xs font-medium text-amber-800">{mentor.company}</p>
        ) : null}
      </div>

      <IconChevronRight className="h-4 w-4 shrink-0 text-stone-300 transition group-hover:text-orange-400" />
    </Link>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [mentorMap, setMentorMap] = useState({});
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;

    setDataLoading(true);
    setError(null);

    void (async () => {
      const { data, error: sessErr } = await getMySessions();

      if (sessErr) {
        setError(sessErr.message ?? 'Could not load your sessions.');
        setDataLoading(false);
        return;
      }

      // Keep only sessions where the logged-in user is the mentee.
      const rows = (data ?? []).filter((s) => s.mentee_id === user.id);
      setSessions(rows);

      // Batch-fetch mentor profile details needed for the My Mentors section.
      // getMySessions() only gives us name + title; we need company and image_url too.
      const ids = [...new Set(rows.map((s) => s.mentor_id).filter(Boolean))];
      if (ids.length > 0) {
        const { data: profiles } = await supabase
          .from('mentor_profiles')
          .select('id, name, title, company, image_url, tier')
          .in('id', ids);
        setMentorMap(Object.fromEntries((profiles ?? []).map((p) => [p.id, p])));
      }

      setDataLoading(false);
    })();
  }, [user, authLoading]);

  // ── Derived data ────────────────────────────────────────────────────────────

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

  const historySessions = useMemo(() => {
    const now = new Date();
    return sessions
      .filter(
        (s) =>
          s.status === 'completed' ||
          s.status === 'declined' ||
          (s.scheduled_date && new Date(s.scheduled_date) <= now),
      )
      .sort(
        (a, b) =>
          new Date(b.scheduled_date ?? b.created_at) -
          new Date(a.scheduled_date ?? a.created_at),
      );
  }, [sessions]);

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

  // ── Early returns ───────────────────────────────────────────────────────────

  if (authLoading) return <LoadingSpinner label="Loading…" className="min-h-screen" />;
  if (!user) return <Navigate to="/login" replace />;
  if (dataLoading) return <LoadingSpinner label="Loading your dashboard…" className="min-h-screen" />;

  // ── Stats ───────────────────────────────────────────────────────────────────

  const totalBooked = sessions.length;
  const upcomingCount = upcomingSessions.length;
  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const mentorCount = uniqueMentors.length;

  const firstName = getFirstName(user);
  const greeting = getTimeGreeting();
  const todayLabel = getTodayLabel();

  const stats = [
    {
      label: 'Sessions Booked',
      value: totalBooked,
      icon: <IconCalendar className="h-5 w-5 text-orange-700" />,
      barClass: 'bg-gradient-to-r from-orange-400/60 via-amber-300/40 to-orange-400/60',
      iconBgClass: 'bg-orange-50',
    },
    {
      label: 'Upcoming',
      value: upcomingCount,
      icon: <IconClock className="h-5 w-5 text-sky-700" />,
      barClass: 'bg-gradient-to-r from-sky-400/60 via-sky-300/40 to-sky-400/60',
      iconBgClass: 'bg-sky-50',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: <IconCheckCircle className="h-5 w-5 text-emerald-700" />,
      barClass: 'bg-gradient-to-r from-emerald-400/60 via-teal-300/40 to-emerald-400/60',
      iconBgClass: 'bg-emerald-50',
    },
    {
      label: 'Mentors Worked With',
      value: mentorCount,
      icon: <IconUsers className="h-5 w-5 text-violet-700" />,
      barClass: 'bg-gradient-to-r from-violet-400/60 via-purple-300/40 to-violet-400/60',
      iconBgClass: 'bg-violet-50',
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#fef9f1] via-[#fdf7ef] to-[#faf4eb]"
      aria-label="Dashboard"
    >
      <PageGutterAtmosphere />

      {/* ── Welcome header ──────────────────────────────────────────────────── */}
      <header className="relative z-[2] border-b border-stone-200/70 bg-gradient-to-b from-white/70 via-orange-50/30 to-transparent px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-10 h-64 w-64 rounded-full bg-gradient-to-br from-amber-300/25 via-orange-200/15 to-transparent blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl pb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                {todayLabel}
              </p>
              <h1 className="mt-1.5 font-display text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-[2.25rem]">
                Good {greeting},{' '}
                <span className="text-gradient-bridge">{firstName}</span>
              </h1>
              <p className="mt-2 text-sm text-stone-500">
                {upcomingCount > 0
                  ? `You have ${upcomingCount} upcoming ${upcomingCount === 1 ? 'session' : 'sessions'}.`
                  : 'No upcoming sessions — find a mentor whenever you\'re ready.'}
              </p>
            </div>

            <Link
              to="/mentors"
              className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-md transition hover:from-stone-800 hover:to-stone-700 sm:self-auto ${focusRing}`}
            >
              <IconSearch className="h-4 w-4" />
              Find a Mentor
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <div className="relative z-[2] mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-8">

        {/* Error banner */}
        {error ? (
          <div className="mb-8 rounded-2xl border border-red-200/90 bg-red-50/95 px-5 py-5 text-sm text-red-900 shadow-sm">
            <p className="font-semibold">Couldn&apos;t load your dashboard</p>
            <p className="mt-1 text-red-800/90">{error}</p>
          </div>
        ) : null}

        {/* ── Section 2: Stats ──────────────────────────────────────────────── */}
        <Reveal>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </Reveal>

        {/* ── Section 3: Upcoming Sessions ──────────────────────────────────── */}
        <Reveal delay={60} className="mt-10">
          <section aria-labelledby="upcoming-heading">
            <SectionHeading id="upcoming-heading" count={upcomingSessions.length}>
              Upcoming Sessions
            </SectionHeading>

            {upcomingSessions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {upcomingSessions.map((s) => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            ) : (
              <EmptyState
                message="No upcoming sessions"
                cta="Browse Mentors"
                href="/mentors"
              />
            )}
          </section>
        </Reveal>

        {/* ── Section 4: Session History ────────────────────────────────────── */}
        <Reveal delay={80} className="mt-10">
          <section aria-labelledby="history-heading">
            <SectionHeading id="history-heading" count={historySessions.length}>
              Session History
            </SectionHeading>

            {historySessions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {historySessions.map((s) => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            ) : (
              <EmptyState message="No past sessions yet" />
            )}
          </section>
        </Reveal>

        {/* ── Section 5: My Mentors ─────────────────────────────────────────── */}
        <Reveal delay={100} className="mt-10">
          <section aria-labelledby="my-mentors-heading">
            <SectionHeading id="my-mentors-heading" count={uniqueMentors.length}>
              My Mentors
            </SectionHeading>

            {uniqueMentors.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {uniqueMentors.map((m) => (
                  <MentorCard key={m.id} mentor={m} />
                ))}
              </div>
            ) : (
              <EmptyState
                message="You haven't booked with any mentors yet"
                cta="Browse Mentors"
                href="/mentors"
              />
            )}
          </section>
        </Reveal>

      </div>
    </main>
=======
function SessionCard({ session, isMentor, onAccept, onDecline, onCancel, actionLoading }) {
  const typeInfo = getSessionTypeInfo(session.session_type);
  const otherName = isMentor ? session.mentee_name || "Mentee" : session.mentor_name || "Mentor";
  const formattedDate = session.scheduled_date
    ? new Date(session.scheduled_date).toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      })
    : "TBD";

  const now = new Date();
  const isPast = session.scheduled_date && new Date(session.scheduled_date) < now;
  const showActions = !isPast && session.status !== "completed" && session.status !== "declined" && session.status !== "cancelled";

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-5 py-4 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
        {typeInfo.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <p className="font-semibold text-stone-800 text-sm">{otherName}</p>
          <StatusBadge status={session.status} />
        </div>
        <p className="text-xs text-stone-500">{typeInfo.label}</p>
        <p className="text-xs text-stone-400 mt-0.5">🗓 {formattedDate}</p>
      </div>
      {showActions && (
        <div className="flex gap-2 flex-shrink-0">
          {isMentor && session.status === "pending" && (
            <>
              <button onClick={() => onAccept(session.id)} disabled={actionLoading === session.id}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                {actionLoading === session.id ? "…" : "Accept"}
              </button>
              <button onClick={() => onDecline(session.id)} disabled={actionLoading === session.id}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                Decline
              </button>
            </>
          )}
          {!isMentor && session.status === "pending" && (
            <button onClick={() => onCancel(session.id)} disabled={actionLoading === session.id}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
              {actionLoading === session.id ? "…" : "Cancel"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.user_metadata?.role || "mentee";
  const isMentor = role === "mentor";
  const firstName = user?.user_metadata?.first_name || user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [mentorProfileId, setMentorProfileId] = useState(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        let rawSessions = [];

        if (isMentor) {
          const { data: profileData, error: profileError } = await supabase
            .from("mentor_profiles").select("id").eq("user_id", user.id).single();
          if (profileError) throw profileError;
          const mpId = profileData.id;
          setMentorProfileId(mpId);

          const { data, error: sessErr } = await supabase
            .from("sessions").select("*, mentee:mentee_id(id, raw_user_meta_data)").eq("mentor_id", mpId);
          if (sessErr) throw sessErr;

          rawSessions = (data || []).map((s) => ({
            ...s,
            mentee_name:
              s.mentee?.raw_user_meta_data?.first_name
                ? `${s.mentee.raw_user_meta_data.first_name} ${s.mentee.raw_user_meta_data.last_name || ""}`.trim()
                : s.mentee?.raw_user_meta_data?.full_name || s.mentee_name || "Mentee",
          }));
        } else {
          let data;
          try {
            data = await getMySession(user.id);
          } catch {
            const { data: d, error: e } = await supabase.from("sessions").select("*").eq("mentee_id", user.id);
            if (e) throw e;
            data = d || [];
          }

          const uniqueMentorIds = [...new Set((data || []).map((s) => s.mentor_id).filter(Boolean))];
          const mentorMap = {};
          await Promise.all(uniqueMentorIds.map(async (mid) => {
            try { const m = await getMentorById(mid); if (m) mentorMap[mid] = m; } catch {}
          }));

          rawSessions = (data || []).map((s) => {
            const m = mentorMap[s.mentor_id];
            return {
              ...s,
              mentor_name: m ? m.full_name || `${m.first_name || ""} ${m.last_name || ""}`.trim() || "Mentor" : s.mentor_name || "Mentor",
              mentor_title: m?.title || m?.headline || "",
              mentor_company: m?.company || "",
            };
          });
        }
        setSessions(rawSessions);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load your dashboard. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchData();
  }, [user, isMentor]);

  const now = new Date();

  const upcomingSessions = useMemo(() =>
    sessions.filter((s) =>
      (s.status === "pending" || s.status === "accepted") &&
      (!s.scheduled_date || new Date(s.scheduled_date) >= now)
    ).sort((a, b) => {
      if (!a.scheduled_date) return 1;
      if (!b.scheduled_date) return -1;
      return new Date(a.scheduled_date) - new Date(b.scheduled_date);
    }), [sessions]);

  const pastSessions = useMemo(() =>
    sessions.filter((s) =>
      s.status === "completed" || s.status === "cancelled" || s.status === "declined" ||
      (s.scheduled_date && new Date(s.scheduled_date) < now && s.status !== "pending" && s.status !== "accepted")
    ).sort((a, b) => new Date(b.scheduled_date || 0) - new Date(a.scheduled_date || 0)),
  [sessions]);

  const visibleHistory = showAllHistory ? pastSessions : pastSessions.slice(0, 10);
  const totalSessions = sessions.length;
  const completedCount = sessions.filter((s) => s.status === "completed").length;

  const uniqueMentors = useMemo(() => [...new Set(sessions.map((s) => s.mentor_id).filter(Boolean))], [sessions]);

  const mentorCards = useMemo(() => {
    const seen = new Set();
    return sessions.filter((s) => s.mentor_id && !seen.has(s.mentor_id) && !seen.add(s.mentor_id))
      .map((s) => ({ mentor_id: s.mentor_id, name: s.mentor_name || "Mentor", title: s.mentor_title || "", company: s.mentor_company || "" }));
  }, [sessions]);

  const menteeCards = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      if (!s.mentee_id) return;
      if (!map[s.mentee_id]) map[s.mentee_id] = { name: s.mentee_name || "Mentee", count: 0 };
      map[s.mentee_id].count += 1;
    });
    return Object.entries(map).map(([id, v]) => ({ id, ...v }));
  }, [sessions]);

  async function handleStatusUpdate(sessionId, status) {
    setActionLoading(sessionId);
    try {
      await updateSessionStatus(sessionId, status);
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, status } : s));
    } catch (err) {
      alert("Failed to update session. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center shadow-sm">
        <p className="text-3xl mb-3">⚠️</p>
        <p className="text-stone-700 font-medium">{error}</p>
        <button onClick={() => window.location.reload()}
          className="mt-4 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 tracking-tight">
              Welcome back, <span className="text-amber-600">{firstName}</span> 👋
            </h1>
            <p className="text-stone-400 text-sm mt-1">{today}</p>
          </div>
          {isMentor && mentorProfileId && (
            <Link to={`/mentors/${mentorProfileId}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl transition-colors">
              👤 View My Profile
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="📊" value={totalSessions} label="Total Sessions" accent="bg-stone-100" />
          <StatCard icon="📅" value={upcomingSessions.length} label="Upcoming" accent="bg-amber-50" />
          <StatCard icon="✅" value={completedCount} label="Completed" accent="bg-green-50" />
          {isMentor
            ? <StatCard icon="⭐" value="—" label="Avg. Rating" accent="bg-yellow-50" />
            : <StatCard icon="🧑‍🏫" value={uniqueMentors.length} label="Mentors Worked With" accent="bg-blue-50" />
          }
        </div>

        {/* Upcoming Sessions */}
        <section>
          <h2 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-amber-400 rounded-full inline-block"></span>
            Upcoming Sessions
          </h2>
          {upcomingSessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-sm">
              <p className="text-3xl mb-3">🗓</p>
              <p className="text-stone-600 font-medium">No upcoming sessions.</p>
              {!isMentor && (
                <p className="text-stone-400 text-sm mt-1">
                  <Link to="/mentors" className="text-amber-600 hover:underline font-semibold">Browse mentors</Link> to book your first one!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <SessionCard key={session.id} session={session} isMentor={isMentor}
                  actionLoading={actionLoading}
                  onAccept={(id) => handleStatusUpdate(id, "accepted")}
                  onDecline={(id) => handleStatusUpdate(id, "declined")}
                  onCancel={(id) => handleStatusUpdate(id, "cancelled")}
                />
              ))}
            </div>
          )}
        </section>

        {/* Session History */}
        <section>
          <h2 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-stone-400 rounded-full inline-block"></span>
            Session History
          </h2>
          {pastSessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-sm">
              <p className="text-3xl mb-3">📭</p>
              <p className="text-stone-500 text-sm">No past sessions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleHistory.map((session) => (
                <SessionCard key={session.id} session={session} isMentor={isMentor}
                  actionLoading={null} onAccept={null} onDecline={null} onCancel={null}
                />
              ))}
              {pastSessions.length > 10 && (
                <button onClick={() => setShowAllHistory((v) => !v)}
                  className="w-full py-2.5 text-sm font-semibold text-stone-500 hover:text-stone-700 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-colors">
                  {showAllHistory ? "Show less ↑" : `View all ${pastSessions.length} sessions →`}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Mentee: Your Mentors */}
        {!isMentor && mentorCards.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-400 rounded-full inline-block"></span>
              Your Mentors
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentorCards.map((m) => (
                <div key={m.mentor_id} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-lg font-bold text-amber-800">
                    {(m.name || "M")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{m.name}</p>
                    {m.title && <p className="text-xs text-stone-500 mt-0.5">{m.title}</p>}
                    {m.company && <p className="text-xs text-stone-400">{m.company}</p>}
                  </div>
                  <Link to={`/mentors/${m.mentor_id}`}
                    className="mt-auto inline-block text-center px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs rounded-xl border border-amber-200 transition-colors">
                    Book Again →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mentee: Find a Mentor CTA */}
        {!isMentor && totalSessions < 3 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-stone-800">🌱 You're just getting started!</p>
              <p className="text-stone-500 text-sm mt-1">Browse our mentors to find the right fit for your goals.</p>
            </div>
            <Link to="/mentors"
              className="flex-shrink-0 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm">
              Browse Mentors →
            </Link>
          </div>
        )}

        {/* Mentor: Your Mentees */}
        {isMentor && menteeCards.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-green-400 rounded-full inline-block"></span>
              Your Mentees
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menteeCards.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-200 to-green-400 flex items-center justify-center text-lg font-bold text-green-800 flex-shrink-0">
                    {(m.name || "M")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{m.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{m.count} session{m.count !== 1 ? "s" : ""} together</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mentor: Profile CTA */}
        {isMentor && mentorProfileId && (
          <div className="bg-gradient-to-r from-stone-50 to-amber-50 rounded-2xl border border-stone-200 p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-stone-800">✨ Your Mentor Profile</p>
              <p className="text-stone-500 text-sm mt-1">Keep your profile up to date to attract the right mentees.</p>
            </div>
            <Link to={`/mentors/${mentorProfileId}`}
              className="flex-shrink-0 px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm">
              View Profile →
            </Link>
          </div>
        )}

      </div>
    </div>
>>>>>>> ea43786 (feat: user dashboard with sessions, stats, mentor/mentee views)
  );
}
