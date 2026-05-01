/**
 * Dashboard — full top-tab layout (no sidebar).
 * Header band with greeting + stats, then horizontal tabs, then content.
 */

import { useState, useRef, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, Settings,
  Plus, X, AlertCircle, LogOut, Sparkles, TrendingUp,
  Clock, Star, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth.js';
import { isMentorAccount } from '../../utils/accountRole.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import OnboardingModal from '../../components/OnboardingModal.jsx';
import { useDashboardData } from './useDashboardData.js';
import {
  getFirstName, getTimeGreeting, getTodayLabel,
  getAvatarColor, getInitials,
} from './dashboardUtils.js';
import { MentorDashboardContent } from './MentorDashboardContent.jsx';
import { MenteeDashboardContent } from './MenteeDashboardContent.jsx';
import CalendarSuccessToast from '../../components/CalendarSuccessToast';
import { SmartSubtitle, TodayBanner, useTabKeyboardNav } from './dashboardLive.jsx';
import { AuroraBg, Magnetic } from './dashboardCinematic.jsx';
import CustomCursor from '../../components/CustomCursor.jsx';

// ─── Animated tab indicator ────────────────────────────────────────────────────
function TabBar({ tabs, activeTab, setActiveTab }) {
  const tabRefs = useRef({});
  const [pill, setPill] = useState({ left: 0, width: 0 });

  // Use offsetLeft so measurement is always relative to the same scroll container
  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (!el) return;
    setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeTab, tabs]);

  return (
    <div className="border-b border-[var(--bridge-border)] bg-[var(--bridge-canvas)]/80 backdrop-blur-2xl">
      <div className="relative mx-auto flex max-w-[90rem] overflow-x-auto px-4 sm:px-6 lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Active background pill — floats behind active tab */}
        <div aria-hidden
          className="pointer-events-none absolute bottom-1.5 top-1.5 rounded-full bg-gradient-to-br from-orange-500/[0.10] to-amber-500/[0.06] ring-1 ring-orange-500/20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ left: pill.left, width: pill.width, opacity: pill.width ? 1 : 0 }} />
        {/* Sliding underline glow */}
        <div aria-hidden
          className="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 shadow-[0_0_18px_rgba(234,88,12,0.7)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ left: pill.left, width: pill.width }} />

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} type="button"
              ref={el => { tabRefs.current[tab.id] = el; }}
              onClick={() => setActiveTab(tab.id)}
              aria-current={active ? 'page' : undefined}
              data-cursor="hover"
              className={`relative z-10 flex shrink-0 items-center gap-2 px-4 py-3.5 text-[13px] font-bold whitespace-nowrap transition-colors duration-200 sm:px-5 ${
                active
                  ? 'text-orange-500 dark:text-orange-400'
                  : 'text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)]'
              }`}>
              <Icon className={`h-4 w-4 shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-black tabular-nums transition-colors ${
                  active
                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_0_12px_rgba(234,88,12,0.55)]'
                    : 'bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-muted)] ring-1 ring-[var(--bridge-border)]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ icon: Icon, value, label, accent = false }) {
  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold ring-1 transition hover:ring-orange-400/40 ${
      accent
        ? 'bg-orange-500/10 text-orange-600 ring-orange-400/25 dark:text-orange-300'
        : 'bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)] ring-[var(--bridge-border)]'
    }`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="font-bold text-[var(--bridge-text)]">{value}</span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

// Stable tab id order — referenced by the global keyboard nav hook.
// Must be defined at module scope so the hook can run before any conditional return.
const TAB_IDS = [
  { id: 'overview' },
  { id: 'sessions' },
  { id: 'connections' },
  { id: 'settings' },
];

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const isMentor = isMentorAccount(user);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const initialReviewSession = location.state?.reviewSession ?? null;
  const dash = useDashboardData(user, authLoading);

  // Keyboard 1..4 → tab switch. MUST be called before any early-return so React
  // sees the same number of hooks on every render (Rules of Hooks).
  useTabKeyboardNav(TAB_IDS, setActiveTab);

  if (authLoading)      return <LoadingSpinner label="Loading…" className="min-h-screen" size="lg" />;
  if (!user)            return <Navigate to="/login" replace />;
  if (dash.dataLoading) return <LoadingSpinner label="Loading your dashboard…" className="min-h-[calc(100vh-4rem)]" size="lg" />;
  if (isMentor && !dash.mentorOnboardingComplete) return <Navigate to="/onboarding" replace />;

  const firstName    = getFirstName(user);
  const greeting     = getTimeGreeting();
  const avatarColor  = getAvatarColor(user?.user_metadata?.full_name ?? user?.email ?? '');
  const avatarInits  = getInitials(user?.user_metadata?.full_name ?? user?.email ?? '');
  const upcomingCount = dash.upcomingSessions?.length ?? 0;
  const totalSessions = dash.sessions?.length ?? 0;
  const pendingCount  = dash.sessions?.filter(s => s.status === 'pending').length ?? 0;

  const TABS = [
    { id: 'overview',    label: 'Overview',                         icon: LayoutDashboard              },
    { id: 'sessions',    label: 'Sessions',                         icon: CalendarDays, count: upcomingCount },
    { id: 'connections', label: isMentor ? 'Mentees' : 'My Mentors', icon: Users                      },
    { id: 'settings',   label: 'Settings',                          icon: Settings                     },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] selection:bg-orange-200/50 selection:text-stone-900 dark:selection:bg-orange-900/50">
      <CustomCursor />
      <AuroraBg />

      {/* Ambient base layer for color cohesion */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 60% -10%, rgba(251,146,60,0.05), transparent 65%)' }} />

      {/* ═══════════════════════════════════════════════════════
          DASHBOARD HEADER — sticky under main navbar
      ═══════════════════════════════════════════════════════ */}
      <div className="sticky top-[3.75rem] z-30 sm:top-16">

        {/* Greeting + actions band */}
        <div className="relative border-b border-[var(--bridge-border)] bg-[var(--bridge-canvas)]/80 backdrop-blur-2xl">
          {/* Top accent */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(251,146,60,0.32) 35%, rgba(251,191,36,0.32) 65%, transparent)' }} />
          {/* Noise */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.018]" />

          <div className="relative mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">

            {/* Left: greeting + meta */}
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar with glow ring */}
              <div className="relative hidden shrink-0 sm:block">
                <span aria-hidden className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-orange-500/40 via-amber-400/30 to-rose-400/25 opacity-70 blur-md" />
                <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black ring-2 ring-[var(--bridge-border-strong)] ${avatarColor}`}>
                  {user.user_metadata?.avatar_url
                    ? <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full rounded-2xl object-cover" />
                    : avatarInits}
                </div>
              </div>

              <div className="min-w-0">
                {/* Editorial greeting */}
                <h1 className="truncate font-display text-2xl font-black tracking-[-0.025em] text-[var(--bridge-text)] sm:text-[1.85rem]" style={{ lineHeight: '1.05' }}>
                  Good {greeting},{' '}
                  <span className="text-gradient-bridge italic">{firstName}</span>
                  <span aria-hidden className="ml-2 inline-block align-baseline">
                    {greeting === 'morning' ? '☀️' : greeting === 'afternoon' ? '🌤' : '🌙'}
                  </span>
                </h1>
                {/* Smart contextual subtitle (live: ticks, pending counts, next-session relative) */}
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-px text-[10px] font-bold uppercase tracking-[0.12em] ${
                    isMentor
                      ? 'bg-orange-500/12 text-orange-600 dark:text-orange-300'
                      : 'bg-sky-500/10 text-sky-600 dark:text-sky-300'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full animate-pulse-soft ${isMentor ? 'bg-orange-500' : 'bg-sky-500'}`} />
                    {isMentor ? 'Mentor' : 'Mentee'}
                  </span>
                  <SmartSubtitle
                    todayLabel={getTodayLabel()}
                    nextSession={dash.nextSession}
                    pendingCount={pendingCount}
                    isMentor={isMentor}
                  />
                </div>
              </div>
            </div>

            {/* Right: stat chips + CTA */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Mini stat chips */}
              <div className="hidden items-center gap-1.5 sm:flex">
                <StatChip icon={CalendarDays} value={totalSessions}  label="total sessions" />
                <StatChip icon={Clock}        value={upcomingCount}  label="upcoming"       accent={upcomingCount > 0} />
                {isMentor && pendingCount > 0 && (
                  <StatChip icon={TrendingUp} value={pendingCount}   label="pending"        accent />
                )}
              </div>

              {/* Primary action — magnetic */}
              <Magnetic strength={0.18}>
                {!isMentor ? (
                  <Link to="/mentors" data-cursor="Browse"
                    className="btn-sheen relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 pl-4 pr-5 py-2.5 text-[12px] font-black text-white shadow-[0_8px_28px_-6px_rgba(234,88,12,0.65)] ring-1 ring-white/15 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-6px_rgba(234,88,12,0.85)]">
                    <Plus className="h-3.5 w-3.5" />
                    Find a Mentor
                  </Link>
                ) : (
                  <button type="button" onClick={() => setActiveTab('sessions')} data-cursor="Schedule"
                    className="btn-sheen relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 pl-4 pr-5 py-2.5 text-[12px] font-black text-white shadow-[0_8px_28px_-6px_rgba(234,88,12,0.65)] ring-1 ring-white/15 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-6px_rgba(234,88,12,0.85)]">
                    <CalendarDays className="h-3.5 w-3.5" />
                    View Schedule
                  </button>
                )}
              </Magnetic>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <TabBar tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* ═══════════════════════════════════════════════════════
          CONTENT
      ═══════════════════════════════════════════════════════ */}
      <main className="mx-auto max-w-[90rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Today / live banner — only renders when an accepted session is within 6h */}
        {dash.nextSession && (
          <div className="mb-6">
            <TodayBanner
              session={dash.nextSession}
              isMentor={isMentor}
              onJoin={() => {
                if (dash.nextSession?.video_room_url) {
                  navigate(`/session/${dash.nextSession.id}/video`);
                }
              }}
            />
          </div>
        )}

        {/* Error banner */}
        {dash.error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50 px-4 py-3.5 text-sm shadow-sm dark:border-red-400/25 dark:bg-red-500/10">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="flex-1 text-red-700 dark:text-red-200">{dash.error}</p>
            <button type="button" onClick={() => dash.setError(null)}
              className="shrink-0 rounded-full p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/10">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isMentor ? (
          <MentorDashboardContent
            dash={dash} activeTab={activeTab} setActiveTab={setActiveTab}
            logout={logout} user={user} />
        ) : (
          <MenteeDashboardContent
            dash={dash} activeTab={activeTab} setActiveTab={setActiveTab}
            logout={logout} user={user} initialReviewSession={initialReviewSession} />
        )}
      </main>

      <OnboardingModal />
      <CalendarSuccessToast />
    </div>
  );
}
