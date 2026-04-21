// NOTE: getMySession() selects all session columns but only carries mentor_name/title
// from the join recorded at booking time. The secondary supabase batch query below
// fills in company/image_url for the My Mentors section. Remove it if getMySession()
// is ever updated to include those fields.

import { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  CalendarDays,
  ArrowUpRight,
  X,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { getMySession, updateSessionStatus } from '../api/sessions';
import { SESSION_TYPES } from '../constants/sessionTypes';
import supabase from '../api/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import Reveal from '../components/Reveal';

// ─── Constants ────────────────────────────────────────────────────────────────

const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2';

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

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const config = {
    pending:   { classes: 'bg-amber-50 text-amber-800 border border-amber-200/80',       label: 'Pending'   },
    accepted:  { classes: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80', label: 'Confirmed' },
    completed: { classes: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80', label: 'Completed' },
    declined:  { classes: 'bg-red-50 text-red-800 border border-red-200/80',             label: 'Declined'  },
    cancelled: { classes: 'bg-stone-100 text-stone-500 border border-stone-200/80',      label: 'Cancelled' },
  };
  const { classes, label } = config[status] ?? {
    classes: 'bg-stone-100 text-stone-600',
    label: status ?? 'Unknown',
  };
  return (
      <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${classes}`}>
      {label}
    </span>
  );
}

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

function StatCard({ label, value, icon: Icon, colorClass }) {
  return (
      <div className="group relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-orange-200/50 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClass} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="font-display text-2xl font-bold tabular-nums text-stone-900">{value}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-stone-500">{label}</p>
        </div>
      </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message, cta, href, icon: Icon = CalendarDays }) {
  return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200/90 bg-stone-50/40 px-6 py-12 text-center">
        <div className="mb-4 rounded-full bg-stone-100 p-3 text-stone-400">
          <Icon className="h-6 w-6" />
        </div>
        <p className="max-w-[200px] text-sm font-medium leading-relaxed text-stone-600">{message}</p>
        {cta && href ? (
            <Link
                to={href}
                className={`mt-5 inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-sm transition hover:bg-stone-800 ${focusRing}`}
            >
              {cta}
              <ChevronRight className="h-4 w-4" />
            </Link>
        ) : null}
      </div>
  );
}

// ─── Session card ─────────────────────────────────────────────────────────────

function SessionCard({ session, isMentor = false, mentorProfile, onAccept, onDecline, onCancel, actionLoading }) {
  const type = SESSION_TYPE_MAP[session.session_type];
  const name = isMentor
      ? (session.mentee_name ?? 'Unknown mentee')
      : (mentorProfile?.name ?? session.mentor_name ?? 'Unknown mentor');
  const subtitle = isMentor ? null : (mentorProfile?.title ?? session.mentor_title ?? null);
  const avatarUrl = !isMentor ? (mentorProfile?.image_url ?? null) : null;
  const avatarColor = getAvatarColor(name);
  const avatarInits = getInitials(name);

  const now = new Date();
  const isPast = session.scheduled_date && new Date(session.scheduled_date) < now;

  // Show action buttons for non-terminal, non-past sessions
  const canAct =
      !isPast &&
      session.status !== 'completed' &&
      session.status !== 'declined' &&
      session.status !== 'cancelled';

  const showMentorActions = canAct && isMentor && session.status === 'pending' && (onAccept || onDecline);
  // Mentees can cancel both pending and accepted sessions
  const showCancelButton = canAct && !isMentor && (session.status === 'pending' || session.status === 'accepted') && onCancel;

  return (
      <div className="group relative flex flex-col gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:border-orange-200/50 hover:shadow-md sm:flex-row sm:items-center sm:gap-5">
        <div className="flex flex-1 min-w-0 items-center gap-4">
          {!isMentor ? (
              <div className="relative shrink-0">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover ring-2 ring-white shadow-sm"
                    />
                ) : (
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold shadow-sm ring-2 ring-white ${avatarColor}`}
                        aria-hidden
                    >
                      {avatarInits}
                    </div>
                )}
                <div className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-stone-100 ${type?.accent.text ?? 'text-stone-500'}`}>
                  <span className="text-[10px]">{type?.icon ?? '📋'}</span>
                </div>
              </div>
          ) : (
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg shadow-sm ${type?.accent.iconBg ?? 'bg-stone-100'}`}>
                {type?.icon ?? '📋'}
              </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-bold text-stone-900">{name}</p>
              <StatusBadge status={session.status} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatSessionDate(session.scheduled_date).split(' · ')[0]}
            </span>
              <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
                {formatSessionDate(session.scheduled_date).split(' · ')[1]}
            </span>
              {subtitle && (
                  <span className="flex max-w-[150px] items-center gap-1 truncate">
                {subtitle}
              </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-stone-100 pt-3 sm:border-t-0 sm:pt-0">
          {showMentorActions && (
              <div className="flex w-full gap-2 sm:w-auto">
                <button
                    onClick={() => onAccept(session.id)}
                    disabled={actionLoading === session.id}
                    className="flex-1 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-stone-800 disabled:opacity-50 sm:flex-none"
                >
                  Accept
                </button>
                <button
                    onClick={() => onDecline(session.id)}
                    disabled={actionLoading === session.id}
                    className="flex-1 rounded-xl bg-stone-100 px-4 py-2 text-xs font-bold text-stone-600 transition hover:bg-stone-200 disabled:opacity-50 sm:flex-none"
                >
                  Decline
                </button>
              </div>
          )}
          {showCancelButton && (
              <button
                  onClick={() => onCancel(session.id)}
                  disabled={actionLoading === session.id}
                  className="w-full rounded-xl bg-stone-100 px-4 py-2 text-xs font-bold text-stone-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:w-auto"
              >
                {actionLoading === session.id ? 'Cancelling…' : 'Cancel'}
              </button>
          )}
          {!showMentorActions && !showCancelButton && !isMentor && (
              <Link
                  to={`/mentors/${session.mentor_id}`}
                  className="flex items-center gap-1 text-xs font-bold text-orange-600 transition hover:text-orange-700"
              >
                View Profile
                <ArrowUpRight className="h-3 w-3" />
              </Link>
          )}
        </div>
      </div>
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

        <ChevronRight className="h-4 w-4 shrink-0 text-stone-300 transition group-hover:text-orange-400" />
      </Link>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const isMentor = user?.user_metadata?.role === 'mentor';

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const [sessions, setSessions] = useState([]);
  const [mentorMap, setMentorMap] = useState({});
  const [mentorProfileId, setMentorProfileId] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    setDataLoading(true);
    setError(null);

    void (async () => {
      try {
        if (isMentor) {
          const { data: profileData, error: profileErr } = await supabase
              .from('mentor_profiles')
              .select('id')
              .eq('user_id', user.id)
              .single();
          if (profileErr) throw profileErr;
          const mpId = profileData.id;
          setMentorProfileId(mpId);

          const { data, error: sessErr } = await supabase
              .from('sessions')
              .select('*, mentee:mentee_id(id, raw_user_meta_data)')
              .eq('mentor_id', mpId);
          if (sessErr) throw sessErr;

          setSessions(
              (data ?? []).map((s) => ({
                ...s,
                mentee_name: s.mentee?.raw_user_meta_data?.first_name
                    ? `${s.mentee.raw_user_meta_data.first_name} ${s.mentee.raw_user_meta_data.last_name ?? ''}`.trim()
                    : s.mentee?.raw_user_meta_data?.full_name ?? s.mentee_name ?? 'Mentee',
              })),
          );
        } else {
          const rows = await getMySession(user.id);
          setSessions(rows);

          const ids = [...new Set(rows.map((s) => s.mentor_id).filter(Boolean))];
          if (ids.length > 0) {
            const { data: profiles, error: profErr } = await supabase
                .from('mentor_profiles')
                .select('*')
                .in('id', ids);
            if (profErr) throw profErr;
            setMentorMap(Object.fromEntries((profiles ?? []).map((p) => [p.id, p])));
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message ?? 'Could not load your dashboard.');
      } finally {
        setDataLoading(false);
      }
    })();
  }, [user, authLoading, isMentor]);

  // ── Derived data ─────────────────────────────────────────────────────────────

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

  const menteeCards = useMemo(() => {
    const map = {};
    for (const s of sessions) {
      if (!s.mentee_id) continue;
      if (!map[s.mentee_id]) map[s.mentee_id] = { name: s.mentee_name ?? 'Mentee', count: 0 };
      map[s.mentee_id].count += 1;
    }
    return Object.entries(map).map(([id, v]) => ({ id, ...v }));
  }, [sessions]);

  // ── Session action handler ────────────────────────────────────────────────────

  async function handleStatusUpdate(sessionId, status) {
    setActionLoading(sessionId);
    setError(null);
    try {
      await updateSessionStatus(sessionId, status);
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status } : s)));
    } catch (err) {
      console.error('Session status update failed:', err);
      setError(err.message ?? 'Failed to update session. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  if (authLoading) return <LoadingSpinner label="Loading…" className="min-h-screen" />;
  if (!user) return <Navigate to="/login" replace />;
  if (dataLoading) return <LoadingSpinner label="Loading your dashboard…" className="min-h-[calc(100vh-4rem)]" />;

  const firstName = getFirstName(user);
  const greeting = getTimeGreeting();

  const TABS = [
    { id: 'overview',     label: 'Overview',                         icon: LayoutDashboard },
    { id: 'sessions',     label: 'Sessions',                         icon: CalendarDays    },
    { id: 'connections',  label: isMentor ? 'Mentees' : 'Mentors',   icon: Users           },
    { id: 'settings',     label: 'Settings',                         icon: Settings        },
  ];

  return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#fffaf3] selection:bg-orange-100 selection:text-orange-900">
        <PageGutterAtmosphere />

        {/* ── Sticky page header + tabs ──────────────────────────────────────── */}
        <div className="sticky top-16 z-30 border-b border-stone-200/60 bg-white/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Greeting row */}
            <div className="flex items-end justify-between pt-6 pb-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-stone-900">
                  Good {greeting},{' '}
                  <span className="text-orange-600">{firstName}</span>
                </h1>
                <p className="mt-0.5 text-xs text-stone-400">{getTodayLabel()}</p>
              </div>
              {!isMentor && (
                  <Link
                      to="/mentors"
                      className="hidden sm:flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800"
                  >
                    <Plus className="h-4 w-4" />
                    Find a Mentor
                  </Link>
              )}
            </div>

            {/* Tab bar */}
            <div className="flex -mb-px">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                            active
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-stone-500 hover:text-stone-700'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Main content ───────────────────────────────────────────────────── */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Error banner */}
          {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="flex-1 text-sm text-red-700">{error}</p>
                <button
                    type="button"
                    onClick={() => setError(null)}
                    className="shrink-0 rounded-full p-0.5 text-red-400 transition hover:text-red-600"
                    aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
          )}

          <Reveal>
            {/* ── Overview ─────────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
                <div className="space-y-8 pb-10">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard
                        label="Total Sessions"
                        value={sessions.length}
                        icon={CalendarDays}
                        colorClass="bg-orange-100 text-orange-600"
                    />
                    <StatCard
                        label="Upcoming"
                        value={upcomingSessions.length}
                        icon={Clock}
                        colorClass="bg-sky-100 text-sky-600"
                    />
                    <StatCard
                        label="Completed"
                        value={sessions.filter((s) => s.status === 'completed').length}
                        icon={CheckCircle2}
                        colorClass="bg-emerald-100 text-emerald-600"
                    />
                    <StatCard
                        label={isMentor ? 'Active Mentees' : 'My Mentors'}
                        value={isMentor ? menteeCards.length : uniqueMentors.length}
                        icon={Users}
                        colorClass="bg-violet-100 text-violet-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left column */}
                    <div className="space-y-6 lg:col-span-2">
                      {/* Next session hero */}
                      {nextSession ? (
                          <div className="relative overflow-hidden rounded-[2rem] bg-stone-900 p-8 text-white shadow-xl shadow-stone-900/10">
                            <div className="absolute right-0 top-0 p-8 opacity-10">
                              <CalendarDays className="h-32 w-32" />
                            </div>
                            <div className="relative z-10">
                        <span className="inline-block rounded-full bg-orange-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                          Next Session
                        </span>
                              <h3 className="mt-4 font-display text-2xl font-bold">
                                Session with{' '}
                                {isMentor ? nextSession.mentee_name : nextSession.mentor_name}
                              </h3>
                              <div className="mt-6 flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-orange-400" />
                                  <span className="text-sm font-medium">
                              {formatSessionDate(nextSession.scheduled_date).split(' · ')[0]}
                            </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-orange-400" />
                                  <span className="text-sm font-medium">
                              {formatSessionDate(nextSession.scheduled_date).split(' · ')[1]}
                            </span>
                                </div>
                              </div>
                              <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => alert('The meeting room will be available 5 minutes before the scheduled time.')}
                                    className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-stone-900 transition hover:bg-orange-50"
                                >
                                  Join Meeting
                                </button>
                                <Link
                                    to={isMentor ? '#' : `/mentors/${nextSession.mentor_id}`}
                                    onClick={isMentor ? () => alert('Please contact your mentee to reschedule.') : undefined}
                                    className="flex items-center justify-center rounded-xl bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                                >
                                  {isMentor ? 'Reschedule' : 'View Profile'}
                                </Link>
                              </div>
                            </div>
                          </div>
                      ) : (
                          <div className="rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-500 p-8 text-white shadow-lg shadow-orange-200">
                            <h3 className="font-display text-2xl font-bold">No sessions scheduled</h3>
                            <p className="mt-2 text-sm text-orange-100/90">Ready to take the next step?</p>
                            <Link
                                to="/mentors"
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-stone-900 transition hover:bg-orange-50"
                            >
                              Browse Mentors
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </div>
                      )}

                      {/* Upcoming sessions list */}
                      <div>
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="font-display text-xl font-bold text-stone-900">Upcoming Sessions</h3>
                          <button
                              onClick={() => setActiveTab('sessions')}
                              className="text-xs font-bold text-orange-600 hover:underline"
                          >
                            View all
                          </button>
                        </div>
                        <div className="space-y-3">
                          {upcomingSessions.slice(0, 3).map((s) => (
                              <SessionCard
                                  key={s.id}
                                  session={s}
                                  isMentor={isMentor}
                                  mentorProfile={!isMentor ? mentorMap[s.mentor_id] : undefined}
                                  onAccept={isMentor ? (id) => handleStatusUpdate(id, 'accepted') : undefined}
                                  onDecline={isMentor ? (id) => handleStatusUpdate(id, 'declined') : undefined}
                                  onCancel={!isMentor ? (id) => handleStatusUpdate(id, 'cancelled') : undefined}
                                  actionLoading={actionLoading}
                              />
                          ))}
                          {upcomingSessions.length === 0 && (
                              <EmptyState message="No upcoming sessions found." />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right column — widgets */}
                    <div className="space-y-6">
                      {/* Quick actions */}
                      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 font-display text-lg font-bold text-stone-900">Quick Actions</h3>
                        <div className="space-y-2">
                          {!isMentor ? (
                              <Link
                                  to="/mentors"
                                  className="flex items-center gap-3 rounded-xl border border-stone-100 p-3 transition-all hover:border-orange-200 hover:bg-orange-50 group"
                              >
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                                  <Search className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold text-stone-700">Find a Mentor</span>
                              </Link>
                          ) : (
                              <button
                                  onClick={() => setActiveTab('settings')}
                                  className="flex w-full items-center gap-3 rounded-xl border border-stone-100 p-3 transition-all hover:border-orange-200 hover:bg-orange-50 group"
                              >
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                                  <Plus className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold text-stone-700">Update Availability</span>
                              </button>
                          )}
                          <Link
                              to="/pricing"
                              className="flex items-center gap-3 rounded-xl border border-stone-100 p-3 transition-all hover:border-emerald-200 hover:bg-emerald-50 group"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                              <ExternalLink className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-bold text-stone-700">Manage Plan</span>
                          </Link>
                        </div>
                      </div>

                      {/* Recent activity */}
                      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 font-display text-lg font-bold text-stone-900">Recent Activity</h3>
                        <div className="space-y-4">
                          {visibleHistory.length > 0 ? (
                              visibleHistory.map((s) => (
                                  <div key={s.id} className="flex gap-3">
                                    <div
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${
                                            s.status === 'completed'
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-stone-50 text-stone-400'
                                        }`}
                                    >
                                      {s.status === 'completed' ? (
                                          <CheckCircle2 className="h-4 w-4" />
                                      ) : (
                                          <Clock className="h-4 w-4" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-bold text-stone-900">
                                        {s.status === 'completed' ? 'Session completed' : 'Session recorded'}
                                      </p>
                                      <p className="mt-0.5 text-[10px] text-stone-500">
                                        with {isMentor ? s.mentee_name : s.mentor_name}
                                      </p>
                                    </div>
                                  </div>
                              ))
                          ) : (
                              <p className="text-xs italic text-stone-500">No recent activity</p>
                          )}
                        </div>
                        {historySessions.length > 5 && (
                            <button
                                onClick={() => setShowAllHistory((v) => !v)}
                                className="mt-4 text-xs font-bold text-orange-600 hover:underline"
                            >
                              {showAllHistory ? 'Show less' : `Show all ${historySessions.length}`}
                            </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {/* ── Sessions ─────────────────────────────────────────────────── */}
            {activeTab === 'sessions' && (
                <div className="space-y-8 pb-10">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h1 className="font-display text-3xl font-bold text-stone-900">Your Sessions</h1>
                      <p className="mt-1 text-sm text-stone-500">Manage your upcoming and past mentorship sessions.</p>
                    </div>
                    <div className="relative max-w-sm flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <input
                          type="text"
                          placeholder="Search by name or type…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-10 pr-4 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <SectionHeading
                          count={upcomingSessions.filter((s) =>
                              (isMentor ? s.mentee_name : s.mentor_name)
                                  ?.toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                              s.session_type?.toLowerCase().includes(searchQuery.toLowerCase()),
                          ).length}
                      >
                        Upcoming
                      </SectionHeading>
                      <div className="space-y-3">
                        {upcomingSessions
                            .filter(
                                (s) =>
                                    (isMentor ? s.mentee_name : s.mentor_name)
                                        ?.toLowerCase()
                                        .includes(searchQuery.toLowerCase()) ||
                                    s.session_type?.toLowerCase().includes(searchQuery.toLowerCase()),
                            )
                            .map((s) => (
                                <SessionCard
                                    key={s.id}
                                    session={s}
                                    isMentor={isMentor}
                                    mentorProfile={!isMentor ? mentorMap[s.mentor_id] : undefined}
                                    onAccept={isMentor ? (id) => handleStatusUpdate(id, 'accepted') : undefined}
                                    onDecline={isMentor ? (id) => handleStatusUpdate(id, 'declined') : undefined}
                                    onCancel={!isMentor ? (id) => handleStatusUpdate(id, 'cancelled') : undefined}
                                    actionLoading={actionLoading}
                                />
                            ))}
                        {upcomingSessions.length === 0 && (
                            <EmptyState message="No upcoming sessions found." />
                        )}
                        {upcomingSessions.length > 0 &&
                            upcomingSessions.filter(
                                (s) =>
                                    (isMentor ? s.mentee_name : s.mentor_name)
                                        ?.toLowerCase()
                                        .includes(searchQuery.toLowerCase()) ||
                                    s.session_type?.toLowerCase().includes(searchQuery.toLowerCase()),
                            ).length === 0 && (
                                <p className="py-8 text-center text-sm italic text-stone-500">
                                  No sessions match your search.
                                </p>
                            )}
                      </div>
                    </section>

                    <section>
                      <SectionHeading
                          count={historySessions.filter((s) =>
                              (isMentor ? s.mentee_name : s.mentor_name)
                                  ?.toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                              s.session_type?.toLowerCase().includes(searchQuery.toLowerCase()),
                          ).length}
                      >
                        History
                      </SectionHeading>
                      <div className="space-y-3">
                        {historySessions
                            .filter(
                                (s) =>
                                    (isMentor ? s.mentee_name : s.mentor_name)
                                        ?.toLowerCase()
                                        .includes(searchQuery.toLowerCase()) ||
                                    s.session_type?.toLowerCase().includes(searchQuery.toLowerCase()),
                            )
                            .map((s) => (
                                <SessionCard
                                    key={s.id}
                                    session={s}
                                    isMentor={isMentor}
                                    mentorProfile={!isMentor ? mentorMap[s.mentor_id] : undefined}
                                />
                            ))}
                        {historySessions.length === 0 && (
                            <EmptyState message="No past sessions yet." />
                        )}
                        {historySessions.length > 0 &&
                            historySessions.filter(
                                (s) =>
                                    (isMentor ? s.mentee_name : s.mentor_name)
                                        ?.toLowerCase()
                                        .includes(searchQuery.toLowerCase()) ||
                                    s.session_type?.toLowerCase().includes(searchQuery.toLowerCase()),
                            ).length === 0 && (
                                <p className="py-8 text-center text-sm italic text-stone-500">
                                  No history matches your search.
                                </p>
                            )}
                      </div>
                    </section>
                  </div>
                </div>
            )}

            {/* ── Connections ──────────────────────────────────────────────── */}
            {activeTab === 'connections' && (
                <div className="space-y-8 pb-10">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h1 className="font-display text-3xl font-bold text-stone-900">Connections</h1>
                      <p className="mt-1 text-sm text-stone-500">People you&apos;ve collaborated with.</p>
                    </div>
                    <div className="relative max-w-sm flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <input
                          type="text"
                          placeholder="Search by name…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-10 pr-4 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>

                  {!isMentor ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {uniqueMentors
                            .filter((m) => m.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((m) => (
                                <MentorCard key={m.id} mentor={m} />
                            ))}
                        {uniqueMentors.length === 0 && (
                            <div className="col-span-full">
                              <EmptyState
                                  message="You haven't booked with any mentors yet."
                                  cta="Find a Mentor"
                                  href="/mentors"
                              />
                            </div>
                        )}
                        {uniqueMentors.length > 0 &&
                            uniqueMentors.filter((m) =>
                                m.name?.toLowerCase().includes(searchQuery.toLowerCase()),
                            ).length === 0 && (
                                <p className="col-span-full py-8 text-center text-sm italic text-stone-500">
                                  No mentors match your search.
                                </p>
                            )}
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {menteeCards
                            .filter((m) => m.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((m) => {
                              const color = getAvatarColor(m.name);
                              const inits = getInitials(m.name);
                              return (
                                  <div
                                      key={m.id}
                                      className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:border-orange-200 hover:shadow-md"
                                  >
                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ring-2 ring-white ${color}`}
                                    >
                                      {inits}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate font-bold text-stone-900 transition-colors group-hover:text-orange-900">
                                        {m.name}
                                      </p>
                                      <p className="mt-0.5 text-xs text-stone-500">
                                        {m.count} {m.count === 1 ? 'session' : 'sessions'} together
                                      </p>
                                    </div>
                                  </div>
                              );
                            })}
                        {menteeCards.length === 0 && (
                            <div className="col-span-full">
                              <EmptyState message="No mentees have booked with you yet." />
                            </div>
                        )}
                        {menteeCards.length > 0 &&
                            menteeCards.filter((m) =>
                                m.name?.toLowerCase().includes(searchQuery.toLowerCase()),
                            ).length === 0 && (
                                <p className="col-span-full py-8 text-center text-sm italic text-stone-500">
                                  No mentees match your search.
                                </p>
                            )}
                      </div>
                  )}
                </div>
            )}

            {/* ── Settings ─────────────────────────────────────────────────── */}
            {activeTab === 'settings' && (
                <div className="pb-10">
                  <div className="mx-auto max-w-md text-center py-20">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                      <Settings className="h-8 w-8" />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-stone-900">Settings</h1>
                    <p className="mt-2 text-sm text-stone-500">
                      Profile and account settings are coming soon. For now, you can view your public profile.
                    </p>
                    <div className="mt-8 flex flex-col gap-3">
                      {isMentor && mentorProfileId && (
                          <Link
                              to={`/mentors/${mentorProfileId}`}
                              className="flex w-full items-center justify-center rounded-xl bg-stone-900 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
                          >
                            View Public Profile
                          </Link>
                      )}
                      <button
                          onClick={logout}
                          className="w-full rounded-xl border border-red-200 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
            )}
          </Reveal>
        </main>
      </div>
  );
}
