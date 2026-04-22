import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, Settings, Plus, X } from 'lucide-react';
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

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const isMentor = isMentorAccount(user);

  const [activeTab, setActiveTab] = useState('overview');

  const dash = useDashboardData(user, authLoading);

  if (authLoading) return <LoadingSpinner label="Loading…" className="min-h-screen" />;
  if (!user) return <Navigate to="/login" replace />;
  if (dash.dataLoading) return <LoadingSpinner label="Loading your dashboard…" className="min-h-[calc(100vh-4rem)]" />;

  const firstName = getFirstName(user);
  const greeting = getTimeGreeting();

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'sessions', label: 'Sessions', icon: CalendarDays },
    { id: 'connections', label: isMentor ? 'Mentees' : 'Mentors', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--bridge-canvas)] selection:bg-orange-200/50 selection:text-stone-900 dark:selection:bg-orange-900/50 dark:selection:text-orange-50">
        <PageGutterAtmosphere />

        <div className="sticky top-16 z-30 border-b border-[var(--bridge-border)] bg-[var(--bridge-surface)]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--bridge-surface)]/72">
          <div className="mx-auto max-w-bridge px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between pb-3 pt-6">
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
                      className="hidden items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 sm:flex"
                  >
                    <Plus className="h-4 w-4" />
                    Find a Mentor
                  </Link>
              )}
            </div>

            <div className="-mb-px flex">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
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

        <main className="mx-auto max-w-bridge px-4 py-8 sm:px-6 lg:px-8">
          {dash.error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="flex-1 text-sm text-red-700">{dash.error}</p>
                <button
                    type="button"
                    onClick={() => dash.setError(null)}
                    className="shrink-0 rounded-full p-0.5 text-red-400 transition hover:text-red-600"
                    aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
          )}

          <Reveal>
            {isMentor ? (
                <MentorDashboardContent dash={dash} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />
            ) : (
                <MenteeDashboardContent dash={dash} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />
            )}
          </Reveal>
        </main>
        <OnboardingModal />
      </div>
  );
}
