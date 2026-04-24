/**
 * Dashboard (route: `/dashboard` — see `App.jsx`)
 *
 * Architecture
 * ------------
 * This file is the **shell only**: auth gates, sticky header + tabs, error banner, and which
 * role-specific tree to render. All session data and Supabase fetching live in
 * `dashboard/useDashboardData.js`. Shared formatting/helpers: `dashboard/dashboardUtils.js`.
 * Reusable UI pieces (cards, badges): `dashboard/dashboardShared.jsx`.
 *
 * Role split (same URL, different components)
 * -------------------------------------------
 * - `isMentorAccount(user)` from `utils/accountRole.js` (reads Supabase user metadata / role).
 * - **Mentor** → `dashboard/MentorDashboardContent.jsx` (mentee names, accept/decline, mentee grid).
 * - **Mentee** → `dashboard/MenteeDashboardContent.jsx` (mentor profiles, cancel session, MentorCard links).
 */

import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, Settings, Plus, X, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/useAuth.js';
import { isMentorAccount } from '../../utils/accountRole.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import PageGutterAtmosphere from '../../components/PageGutterAtmosphere.jsx';
import Reveal from '../../components/Reveal.jsx';
import OnboardingModal from '../../components/OnboardingModal.jsx';
import { useDashboardData } from './useDashboardData.js';
import { getFirstName, getTimeGreeting, getTodayLabel } from './dashboardUtils.js';
import { MentorDashboardContent } from './MentorDashboardContent.jsx';
import { MenteeDashboardContent } from './MenteeDashboardContent.jsx';
import CalendarSuccessToast from '../../components/CalendarSuccessToast';

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const isMentor = isMentorAccount(user);

  const [activeTab, setActiveTab] = useState('overview');

  const dash = useDashboardData(user, authLoading);

  if (authLoading) return <LoadingSpinner label="Loading…" className="min-h-screen" size="lg" />;
  if (!user) return <Navigate to="/login" replace />;
  if (dash.dataLoading) return <LoadingSpinner label="Loading your dashboard…" className="min-h-[calc(100vh-4rem)]" size="lg" />;
  if (isMentor && !dash.mentorOnboardingComplete) return <Navigate to="/onboarding" replace />;

  const firstName = getFirstName(user);
  const greeting = getTimeGreeting();

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'sessions', label: 'Sessions', icon: CalendarDays },
    { id: 'connections', label: isMentor ? 'Mentees' : 'Mentors', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div
      data-route-atmo="dashboard"
      className="relative min-h-[calc(100vh-4rem)] selection:bg-orange-200/50 selection:text-stone-900 dark:selection:bg-orange-900/50 dark:selection:text-orange-50"
    >
      <PageGutterAtmosphere />

      {/* Sticky header + tabs */}
      <div className="sticky top-16 z-30 border-b border-[color-mix(in_srgb,var(--bridge-border)_75%,transparent)] bg-[color-mix(in_srgb,var(--bridge-canvas)_78%,transparent)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bridge-canvas)_68%,transparent)]">
        {/* Luminous hairline in dark mode */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent opacity-0 dark:opacity-100" />

        <div className="mx-auto max-w-bridge px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 pb-3 pt-6">
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-secondary)] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.55)]" />
                {isMentor ? 'Mentor dashboard' : 'Mentee dashboard'}
              </div>
              <h1 className="font-display text-[2.25rem] font-bold leading-[1.05] tracking-[-0.032em] text-[var(--bridge-text)] sm:text-[2.75rem]">
                Good {greeting},{' '}
                <span className="font-editorial italic text-gradient-bridge">{firstName}</span>
              </h1>
              <p className="mt-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">{getTodayLabel()}</p>
            </div>
            {!isMentor && (
              <Link
                to="/mentors"
                className="btn-sheen hidden items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_26px_-8px_rgba(28,25,23,0.45)] transition hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-[0_14px_32px_-8px_rgba(28,25,23,0.55)] dark:bg-gradient-to-r dark:from-orange-500 dark:to-amber-500 dark:text-stone-950 dark:shadow-[0_10px_28px_-8px_rgba(234,88,12,0.5)] sm:inline-flex"
              >
                <Plus className="h-4 w-4" />
                Find a mentor
              </Link>
            )}
          </div>

          {/* Tabs */}
          <div className="-mb-px flex gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? 'text-orange-700 dark:text-orange-300'
                      : 'text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)]'
                  }`}
                >
                  <Icon className={`h-4 w-4 transition ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {active ? (
                    <>
                      <span aria-hidden className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 shadow-[0_0_12px_rgba(251,146,60,0.5)]" />
                      <span aria-hidden className="absolute inset-0 -z-10 rounded-t-xl bg-gradient-to-b from-orange-50/80 to-transparent opacity-70 dark:from-orange-500/10 dark:opacity-100" />
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-bridge px-4 py-8 sm:px-6 lg:px-8">
        {dash.error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm dark:border-red-400/30 dark:bg-red-500/10">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="flex-1 text-red-800 dark:text-red-200">{dash.error}</p>
            <button
              type="button"
              onClick={() => dash.setError(null)}
              className="shrink-0 rounded-full p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/10"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Reveal>
          {isMentor ? (
            <MentorDashboardContent dash={dash} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} user={user} />
          ) : (
            <MenteeDashboardContent dash={dash} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} user={user} />
          )}
        </Reveal>
      </main>

      <OnboardingModal />
      <CalendarSuccessToast />
    </div>
  );
}
