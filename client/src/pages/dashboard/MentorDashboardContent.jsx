/**
 * MentorDashboardContent — mentor dashboard body.
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, Clock, CalendarDays, CheckCircle2, ArrowUpRight,
  Users, Video, Check, X, Plus, Zap,
  TrendingUp,
} from 'lucide-react';
import {
  StatCard, EmptyState, SessionCard, SectionHeading, canJoinSession,
  SearchBar, NoMatch, ActivityFeed,
} from './dashboardShared';
import { formatSessionDate, getAvatarColor, getInitials } from './dashboardUtils';
import { LiveCountdown, AddToCalendarButton, UrgencyBadge, useSessionTrends } from './dashboardLive.jsx';
import { GoalRing, Sparkline, Tilt3D, Magnetic, useDailyActivity, useGoalProgress, KineticNumber } from './dashboardCinematic.jsx';
import DashboardSettingsPanel from './DashboardSettingsPanel';
import MentorAvailabilityModal from './MentorAvailabilityModal';
import IntakeSummaryModal from './IntakeSummaryModal';
import CalendarConnectButton from '../../components/CalendarConnectButton';
import { useState, useEffect } from 'react';
import SessionCalendar from './SessionCalendar';
import CancellationModal from '../../components/CancellationModal';
import { getMyCancellationRequests } from '../../api/cancellations';

export function MentorDashboardContent({ dash, activeTab, setActiveTab, logout, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [heroHint, setHeroHint] = useState(null);
  const [calendarBanner, setCalendarBanner] = useState(null);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [intakeData, setIntakeData] = useState({ summary: '', menteeName: '' });
  const [cancellationModal, setCancellationModal] = useState(null);
  const [cancellationBanners, setCancellationBanners] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cp = params.get('calendar');
    if (cp === 'connected' || cp === 'error') {
      setCalendarBanner(cp);
      window.history.replaceState({}, '', '/dashboard');
      const t = setTimeout(() => setCalendarBanner(null), 5000);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user?.id) return;
    const SEEN_KEY = `bridge_cancel_seen_mentor_${user.id}`;
    const seenIds = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
    getMyCancellationRequests().then(({ data }) => {
      if (!data) return;
      const unseen = data.filter(r =>
        ['approved', 'denied'].includes(r.status) && !seenIds.includes(r.id)
      );
      if (unseen.length) {
        setCancellationBanners(unseen);
        localStorage.setItem(SEEN_KEY, JSON.stringify([...seenIds, ...unseen.map(r => r.id)]));
      }
    });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    sessions, mentorProfileId, calendarConnected, refetch, actionLoading,
    searchQuery, setSearchQuery, showAllHistory, setShowAllHistory,
    upcomingSessions, nextSession, historySessions, visibleHistory,
    menteeCards, handleStatusUpdate,
  } = dash;

  const pendingSessions = upcomingSessions.filter(s => s.status === 'pending');

  // 30-day session trends — pure derivation.
  const trends = useSessionTrends(sessions);
  const completedTotal = sessions.filter(s => s.status === 'completed').length;
  const daily = useDailyActivity(sessions, 14);
  const dailyTotal = daily.reduce((a, b) => a + b, 0);
  const goal = useGoalProgress(sessions, 10);

  return (
    <>
      <MentorAvailabilityModal
        open={availabilityOpen}
        onClose={() => setAvailabilityOpen(false)}
        mentorProfileId={mentorProfileId}
        onSaved={() => refetch?.()}
      />

      {cancellationModal && (
        <CancellationModal
          session={cancellationModal.session}
          isMentor
          onClose={() => setCancellationModal(null)}
          onSuccess={() => { setCancellationModal(null); refetch?.(); }}
        />
      )}

      {/* ── Overview tab ─────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8 pb-12">

          {/* Cancellation outcome banners */}
          {cancellationBanners.map(r => (
            <div key={r.id} className={`flex items-start gap-3 rounded-2xl px-5 py-4 text-sm ring-1 ${
              r.status === 'approved'
                ? 'bg-emerald-500/8 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300'
                : 'bg-red-500/8 text-red-600 ring-red-500/20 dark:text-red-400'
            }`}>
              <span className="mt-0.5 text-base shrink-0">{r.status === 'approved' ? '✓' : '⚠'}</span>
              <div className="min-w-0">
                {r.status === 'approved'
                  ? <p className="font-semibold">Your cancellation request was approved. The session has been cancelled.</p>
                  : <p className="font-semibold">Your cancellation request was denied.{r.reviewer_note ? ` Reason: ${r.reviewer_note}` : ' Please contact your mentee to reschedule.'}</p>}
              </div>
              <button type="button" onClick={() => setCancellationBanners(b => b.filter(x => x.id !== r.id))}
                className="ml-auto shrink-0 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
            </div>
          ))}

          {/* Calendar banners */}
          {calendarBanner === 'connected' && (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25">
              <span className="text-base">✓</span> Google Calendar connected successfully!
            </div>
          )}
          {calendarBanner === 'error' && (
            <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3.5 text-sm text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25">
              <span className="text-base">⚠</span> Failed to connect Google Calendar. Please try again.
            </div>
          )}

          {/* Stats — kinetic counters + 30d trend deltas */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard label="Total Sessions" value={sessions.length}
              icon={CalendarDays} gradient="from-orange-500 to-amber-500"
              trend={{ current: trends.bookedLast30, previous: trends.bookedPrior30, label: '30d' }} />
            <StatCard label="Upcoming" value={upcomingSessions.length}
              icon={Clock} gradient="from-sky-500 to-blue-500" />
            <StatCard label="Completed" value={completedTotal}
              icon={CheckCircle2} gradient="from-emerald-500 to-teal-500"
              trend={{ current: trends.completedLast30, previous: trends.completedPrior30, label: '30d' }} />
            <StatCard label="Active Mentees" value={menteeCards.length}
              icon={Users} gradient="from-violet-500 to-purple-500" />
          </div>

          {/* Pulse — monthly goal ring + 14-day demand sparkline */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
            <Tilt3D max={4} className="rounded-3xl">
              <div className="bd-card-edge relative flex h-full items-center gap-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--bridge-surface)] via-[var(--bridge-surface)] to-orange-500/[0.04] p-6 ring-1 ring-[var(--bridge-border)] shadow-sm">
                <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/15 blur-3xl" />
                <GoalRing value={goal.completed} max={goal.target} label="Monthly" sub={`${goal.completed} / ${goal.target}`} />
                <div className="relative">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">Monthly target</p>
                  <h3 className="mt-1 font-display text-lg font-black tracking-tight text-[var(--bridge-text)]">
                    {goal.completed >= goal.target ? 'Target hit. Lift it next month.' : `${goal.target - goal.completed} more to reach target.`}
                  </h3>
                  <p className="mt-1 text-[12px] text-[var(--bridge-text-muted)]">Each completed session strengthens your acceptance signal.</p>
                </div>
              </div>
            </Tilt3D>
            <Tilt3D max={4} className="rounded-3xl lg:col-span-2">
              <div className="bd-card-edge relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--bridge-surface)] to-[var(--bridge-surface-muted)]/40 p-6 ring-1 ring-[var(--bridge-border)] shadow-sm">
                <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-amber-400/12 blur-3xl" />
                <div className="relative flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-500">Demand · last 14 days</p>
                    <h3 className="mt-1 flex items-baseline gap-2 font-display text-2xl font-black tracking-tight text-[var(--bridge-text)]">
                      <KineticNumber to={dailyTotal} ms={900} />
                      <span className="text-sm font-bold text-[var(--bridge-text-muted)]">incoming</span>
                    </h3>
                  </div>
                  <span className="rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-2.5 py-1 text-[10px] font-bold text-[var(--bridge-text-secondary)]">
                    {dailyTotal === 0 ? 'Quiet stretch' : 'On the move'}
                  </span>
                </div>
                <div className="relative mt-5 flex-1">
                  <Sparkline data={daily} height={84} />
                  <div className="mt-2 flex justify-between text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--bridge-text-faint)]">
                    <span>14d ago</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>
            </Tilt3D>
          </div>

          {/* Pending requests — highest priority for mentors */}
          {pendingSessions.length > 0 && (
            <PendingRequestsSection
              pendingSessions={pendingSessions}
              handleStatusUpdate={handleStatusUpdate}
              actionLoading={actionLoading}
            />
          )}

          {/* Hero: next session — cinematic 3D tilt */}
          {nextSession ? (
            <Tilt3D max={3} className="rounded-[2rem]">
              <MentorNextSessionHero
                session={nextSession}
                heroHint={heroHint}
                setHeroHint={setHeroHint}
                handleStatusUpdate={handleStatusUpdate}
                actionLoading={actionLoading}
                setActiveTab={setActiveTab}
                navigate={navigate}
              />
            </Tilt3D>
          ) : (
            <NoSessionCTA onSettings={() => setActiveTab('settings')} />
          )}

          {/* Two-column */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* Upcoming sessions */}
            <div className="lg:col-span-2">
              <SectionHeading
                count={upcomingSessions.filter(s => s.status !== 'pending').slice(0, 4).length}
                action={
                  upcomingSessions.length > 0 && (
                    <button type="button" onClick={() => setActiveTab('sessions')}
                      className="text-xs font-semibold text-orange-600 transition hover:text-orange-700 dark:text-orange-400">
                      View all →
                    </button>
                  )
                }
              >
                Upcoming Sessions
              </SectionHeading>
              <div className="space-y-3">
                {upcomingSessions.filter(s => s.status !== 'pending').slice(0, 4).map((s) => (
                  <SessionCard
                    key={s.id} session={s} isMentor
                    onAccept={(id) => handleStatusUpdate(id, 'accepted')}
                    onDecline={(id) => handleStatusUpdate(id, 'declined')}
                    actionLoading={actionLoading}
                    intakeSummary={s.intake_summary}
                    onViewIntake={(_, text) => { setIntakeData({ summary: text, menteeName: s.mentee_name ?? 'Mentee' }); setIntakeOpen(true); }}
                  />
                ))}
                {upcomingSessions.filter(s => s.status !== 'pending').length === 0 && (
                  <EmptyState message="No confirmed sessions yet. Pending requests are shown above." />
                )}
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-5">

              {/* Quick actions — cinematic bento */}
              <div className="bd-card-edge relative overflow-hidden rounded-3xl bg-[var(--bridge-surface)] p-5 shadow-sm ring-1 ring-[var(--bridge-border)]">
                <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-orange-400/15 blur-3xl" />
                <div className="relative mb-4 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">Quick actions</p>
                  <span className="text-[9px] font-bold text-[var(--bridge-text-faint)]">Tap to jump</span>
                </div>
                <div className="relative space-y-1.5">
                  {[
                    { onClick: () => mentorProfileId ? setAvailabilityOpen(true) : setActiveTab('settings'), icon: Calendar, title: 'Update Availability', sub: 'Set your open time slots', g: 'from-orange-500 to-amber-500', hover: 'hover:bg-orange-500/8', cursor: 'Edit' },
                    { onClick: () => setActiveTab('connections'), icon: Users, title: 'My Mentees', sub: `${menteeCards.length} connection${menteeCards.length !== 1 ? 's' : ''}`, g: 'from-violet-500 to-purple-500', hover: 'hover:bg-violet-500/8', cursor: 'Mentees' },
                  ].map((q, i) => {
                    const Icon = q.icon;
                    return (
                      <button key={i} type="button" onClick={q.onClick} data-cursor={q.cursor}
                        className={`group flex w-full items-center gap-3 rounded-2xl p-3 transition-all duration-300 ${q.hover}`}>
                        <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${q.g} text-white shadow-[0_8px_22px_-6px_rgba(234,88,12,0.45)] ring-1 ring-white/15 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-sm font-bold text-[var(--bridge-text)]">{q.title}</p>
                          <p className="text-xs text-[var(--bridge-text-muted)]">{q.sub}</p>
                        </div>
                        <ArrowUpRight className="ml-auto h-4 w-4 text-[var(--bridge-text-faint)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-orange-500" />
                      </button>
                    );
                  })}
                  {mentorProfileId && (
                    <div className="pt-2">
                      <CalendarConnectButton isConnected={!!calendarConnected} mentorProfileId={mentorProfileId} />
                    </div>
                  )}
                </div>
              </div>

              {/* Activity feed */}
              <ActivityFeed history={visibleHistory} role="mentor" total={historySessions.length} showAll={showAllHistory} onToggle={() => setShowAllHistory(v => !v)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Sessions tab ─────────────────────────────────────────────── */}
      {activeTab === 'sessions' && (
        <MentorSessionsTab
          sessions={sessions}
          upcomingSessions={upcomingSessions}
          historySessions={historySessions}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleStatusUpdate={handleStatusUpdate}
          actionLoading={actionLoading}
          onViewIntake={(s, text) => { setIntakeData({ summary: text, menteeName: s.mentee_name ?? 'Mentee' }); setIntakeOpen(true); }}
          onCancel={(session) => setCancellationModal({ session })}
        />
      )}

      {/* ── Connections tab ──────────────────────────────────────────── */}
      {activeTab === 'connections' && (
        <MentorConnectionsTab
          menteeCards={menteeCards}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {/* ── Settings tab ─────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <DashboardSettingsPanel user={user} logout={logout} isMentor mentorProfileId={mentorProfileId} calendarConnected={calendarConnected} />
      )}
      <IntakeSummaryModal
        open={intakeOpen}
        onClose={() => setIntakeOpen(false)}
        summary={intakeData.summary}
        menteeName={intakeData.menteeName}
      />
    </>
  );
}

// ─── PendingRequestsSection ──────────────────────────────────────────────────
function PendingRequestsSection({ pendingSessions, handleStatusUpdate, actionLoading }) {
  return (
    <div className="bd-card-edge relative overflow-hidden rounded-3xl bg-[var(--bridge-surface)] shadow-sm ring-1 ring-amber-400/35 dark:ring-amber-400/30">
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-amber-400/20 blur-3xl bd-aurora" />
      <div className="relative flex items-center gap-3 border-b border-amber-300/40 bg-gradient-to-r from-amber-50/90 to-orange-50/40 px-5 py-4 dark:from-amber-500/12 dark:to-orange-500/6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-[0_8px_22px_-6px_rgba(245,158,11,0.6)] ring-1 ring-white/15">
          <Zap className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="flex items-center gap-2 font-display text-base font-black tracking-tight text-[var(--bridge-text)]">
            Pending Requests
            <span className="inline-flex h-5 min-w-[1.4rem] items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 px-1.5 text-[10px] font-black text-white shadow-[0_0_12px_rgba(245,158,11,0.55)]">
              {pendingSessions.length}
            </span>
          </p>
          <p className="text-xs text-[var(--bridge-text-secondary)]">Respond within 24 hours to keep your acceptance rate strong.</p>
        </div>
      </div>

      <div className="relative flex gap-3 overflow-x-auto p-4 sm:flex-wrap sm:overflow-visible sm:p-5">
        {pendingSessions.map((s) => (
          <PendingRequestCard
            key={s.id} session={s}
            onAccept={() => handleStatusUpdate(s.id, 'accepted')}
            onDecline={() => handleStatusUpdate(s.id, 'declined')}
            actionLoading={actionLoading}
          />
        ))}
      </div>
    </div>
  );
}

function PendingRequestCard({ session, onAccept, onDecline, actionLoading }) {
  const color = getAvatarColor(session.mentee_name ?? '');
  const inits = getInitials(session.mentee_name ?? '');
  const [date, time] = (formatSessionDate(session.scheduled_date) || ' · ').split(' · ');
  const busy = actionLoading === session.id;

  return (
    <Tilt3D max={4} className="rounded-2xl shrink-0 sm:shrink">
      <div className="bd-card-edge relative flex w-[15rem] flex-col gap-3 overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-gradient-to-br from-[var(--bridge-surface-muted)]/70 to-[var(--bridge-surface)]/90 p-4 transition-shadow duration-500 hover:shadow-xl sm:w-auto sm:min-w-[14rem] sm:max-w-[17rem]">
        <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-400/0 blur-2xl transition-all duration-500 hover:bg-amber-400/25" />
        <div className="relative flex items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black ring-2 ring-[var(--bridge-canvas)] ${color}`} aria-hidden>
            {inits}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[var(--bridge-text)]">{session.mentee_name ?? 'Mentee'}</p>
            <p className="truncate text-[11px] text-[var(--bridge-text-muted)]">{date}{time ? ` · ${time}` : ''}</p>
          </div>
        </div>
        <div className="relative flex flex-wrap items-center gap-1.5">
          {session.session_type && (
            <span className="rounded-full bg-[var(--bridge-surface)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--bridge-text-secondary)] ring-1 ring-[var(--bridge-border)] capitalize">
              {session.session_type.replace('_', ' ')}
            </span>
          )}
          <UrgencyBadge createdAt={session.created_at} />
        </div>
        <div className="relative flex gap-2">
          <Magnetic strength={0.16} className="flex-1">
            <button type="button" onClick={onAccept} disabled={busy} data-cursor="Accept"
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-2.5 text-xs font-black text-white shadow-[0_6px_18px_-4px_rgba(16,185,129,0.55)] ring-1 ring-white/15 transition hover:shadow-[0_10px_24px_-4px_rgba(16,185,129,0.7)] disabled:opacity-50">
              <Check className="h-3.5 w-3.5" />Accept
            </button>
          </Magnetic>
          <button type="button" onClick={onDecline} disabled={busy} data-cursor="Decline"
            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-[var(--bridge-border)] py-2.5 text-xs font-black text-[var(--bridge-text-secondary)] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-300">
            <X className="h-3.5 w-3.5" />Decline
          </button>
        </div>
      </div>
    </Tilt3D>
  );
}

// ─── MentorNextSessionHero ────────────────────────────────────────────────────
function MentorNextSessionHero({ session, heroHint, setHeroHint, handleStatusUpdate, actionLoading, setActiveTab, navigate }) {
  const [date, time] = (formatSessionDate(session.scheduled_date) || ' · ').split(' · ');
  const isPending  = session.status === 'pending';
  const isAccepted = session.status === 'accepted';
  const mentee = session.mentee_name ?? 'Your mentee';
  const canJoin = canJoinSession(session.scheduled_date);

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-stone-950 via-stone-900 to-orange-950 p-7 text-white shadow-[0_24px_60px_-16px_rgba(234,88,12,0.35)] sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-200 ring-1 ring-orange-400/30">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse-soft" />
            Next Session
          </span>
          {isPending && (
            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-200 ring-1 ring-amber-400/30">
              Awaiting your response
            </span>
          )}
          {isAccepted && (
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-200 ring-1 ring-emerald-400/30">
              Confirmed
            </span>
          )}
          <span className="ml-auto">
            <LiveCountdown targetIso={session.scheduled_date} tone={isAccepted ? 'emerald' : 'amber'} />
          </span>
        </div>

        <h3 className="mt-4 font-display text-2xl font-bold sm:text-3xl">Session with {mentee}</h3>

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white/8 px-3.5 py-2">
            <Calendar className="h-4 w-4 text-orange-300" />
            <span className="text-sm font-medium">{date}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/8 px-3.5 py-2">
            <Clock className="h-4 w-4 text-orange-300" />
            <span className="text-sm font-medium">{time}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {isPending ? (
            <>
              <button type="button" onClick={() => handleStatusUpdate(session.id, 'accepted')} disabled={actionLoading === session.id}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-50">
                <Check className="h-4 w-4" />
                {actionLoading === session.id ? 'Accepting…' : 'Accept Session'}
              </button>
              <button type="button" onClick={() => handleStatusUpdate(session.id, 'declined')} disabled={actionLoading === session.id}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50">
                <X className="h-4 w-4" />Decline
              </button>
            </>
          ) : (
            <>
              {canJoin ? (
                <Magnetic strength={0.18}>
                  <button type="button" data-cursor="Join"
                    onClick={() => {
                      if (session.video_room_url) { setHeroHint(null); navigate(`/session/${session.id}/video`); }
                      else setHeroHint('Video link is still preparing — try again in a few seconds.');
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-stone-900 shadow-[0_8px_24px_-6px_rgba(255,255,255,0.5)] transition hover:bg-orange-50 hover:shadow-[0_12px_32px_-8px_rgba(255,255,255,0.65)]">
                    <Video className="h-4 w-4" />Join Meeting
                  </button>
                </Magnetic>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-black text-white/40 ring-1 ring-white/10 cursor-not-allowed" title="Available 3 hours before the session">
                  <Video className="h-4 w-4" />Join Meeting
                </div>
              )}
              <Magnetic strength={0.14}>
                <button type="button" onClick={() => setActiveTab('connections')} data-cursor="Mentees"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-white/20">
                  View Mentees
                </button>
              </Magnetic>
              {isAccepted && <AddToCalendarButton session={session} label="Add to calendar" />}
            </>
          )}
        </div>

        {heroHint && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-400/15 px-4 py-3 ring-1 ring-amber-400/25">
            <span className="text-amber-300 mt-0.5">⚠</span>
            <p className="text-sm text-amber-100">{heroHint}</p>
            <button type="button" onClick={() => setHeroHint(null)} className="ml-auto shrink-0 text-amber-300 transition hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NoSessionCTA ─────────────────────────────────────────────────────────────
function NoSessionCTA({ onSettings }) {
  return (
    <Tilt3D max={4} className="rounded-[2rem]">
      <div className="relative overflow-hidden rounded-[2rem] p-7 sm:p-9"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 45%, #ea580c 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40' fill='%23000' fill-opacity='1'/%3E%3C/svg%3E\")" }}
        />
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/22 blur-3xl bd-aurora" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl bd-aurora" style={{ animationDelay: '-8s' }} />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/95 ring-1 ring-white/20">
              <Plus className="h-3 w-3" />Getting started
            </p>
            <h3 className="mt-3 font-display text-3xl font-black tracking-[-0.025em] text-white sm:text-[2.4rem] sm:leading-[1.05]">No sessions yet.<br/><span className="italic">Open your calendar.</span></h3>
            <p className="mt-2 text-sm text-orange-50/95">Make sure your profile is visible and your availability is set.</p>
          </div>
          <Magnetic strength={0.2}>
            <button type="button" onClick={onSettings} data-cursor="Settings"
              className="btn-sheen inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-black text-orange-700 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.4)] ring-1 ring-white/40 transition-all hover:-translate-y-0.5 hover:bg-orange-50">
              Set Availability
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </Magnetic>
        </div>
      </div>
    </Tilt3D>
  );
}

// ─── MentorSessionsTab ────────────────────────────────────────────────────────
function MentorSessionsTab({ sessions, upcomingSessions, historySessions, searchQuery, setSearchQuery, handleStatusUpdate, actionLoading, onViewIntake, onCancel }) {
  const match = (s) =>
    s.mentee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.session_type?.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-500">Your inbox</p>
          <h2 className="mt-2 font-display font-black tracking-[-0.025em] text-[var(--bridge-text)]" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: '1.02' }}>
            Sessions <span className="text-gradient-bridge italic">incoming</span>
          </h2>
          <p className="mt-1.5 text-sm text-[var(--bridge-text-secondary)]">Manage incoming requests and view session history.</p>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by mentee or type…" />
      </div>

      <SessionCalendar
        sessions={sessions}
        handleStatusUpdate={handleStatusUpdate}
        actionLoading={actionLoading}
        isMentor
        onViewIntake={onViewIntake}
        onCancel={onCancel}
      />

      <section>
        <SectionHeading kicker="Coming up" count={upcomingSessions.filter(match).length}>Upcoming</SectionHeading>
        <div className="space-y-3">
          {upcomingSessions.filter(match).map((s) => (
            <SessionCard key={s.id} session={s} isMentor
              onAccept={(id) => handleStatusUpdate(id, 'accepted')}
              onDecline={(id) => handleStatusUpdate(id, 'declined')}
              onCancel={onCancel}
              actionLoading={actionLoading}
              intakeSummary={s.intake_summary}
              onViewIntake={(_, text) => onViewIntake(s, text)}
            />
          ))}
          {upcomingSessions.length === 0 && <EmptyState message="No upcoming sessions yet." />}
          {upcomingSessions.length > 0 && upcomingSessions.filter(match).length === 0 && <NoMatch />}
        </div>
      </section>

      <section>
        <SectionHeading kicker="Already done" count={historySessions.filter(match).length}>History</SectionHeading>
        <div className="space-y-3">
          {historySessions.filter(match).map((s) => (
            <SessionCard key={s.id} session={s} isMentor
              intakeSummary={s.intake_summary}
              onViewIntake={(_, text) => onViewIntake(s, text)}
            />
          ))}
          {historySessions.length === 0 && <EmptyState message="No past sessions yet." />}
          {historySessions.length > 0 && historySessions.filter(match).length === 0 && <NoMatch />}
        </div>
      </section>
    </div>
  );
}

// ─── MentorConnectionsTab ─────────────────────────────────────────────────────
function MentorConnectionsTab({ menteeCards, searchQuery, setSearchQuery }) {
  const filtered = menteeCards.filter(m => m.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-500">Your circle</p>
          <h2 className="mt-2 font-display font-black tracking-[-0.025em] text-[var(--bridge-text)]" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: '1.02' }}>
            <span className="text-gradient-bridge italic">Mentees</span>
          </h2>
          <p className="mt-1.5 text-sm text-[var(--bridge-text-secondary)]">Everyone you've worked with on Bridge.</p>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name…" />
      </div>

      {menteeCards.length > 0 && (
        <Tilt3D max={3} className="rounded-3xl">
          <div className="bd-card-edge relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--bridge-surface)] via-[var(--bridge-surface)] to-violet-500/[0.04] p-5 ring-1 ring-[var(--bridge-border)] shadow-sm sm:p-6">
            <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-400/15 blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-[0_8px_24px_-6px_rgba(139,92,246,0.55)] ring-1 ring-white/15">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-lg font-black tracking-tight text-[var(--bridge-text)]">
                  {menteeCards.length} mentee{menteeCards.length !== 1 ? 's' : ''} so far
                </p>
                <p className="text-xs text-[var(--bridge-text-muted)]">Keep your availability up to attract more</p>
              </div>
            </div>
          </div>
        </Tilt3D>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => {
          const color = getAvatarColor(m.name ?? '');
          const inits = getInitials(m.name ?? '');
          return (
            <Tilt3D key={m.id} max={4} className="rounded-2xl">
              <div className="bd-card-edge group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-[var(--bridge-surface)] p-4 shadow-sm ring-1 ring-[var(--bridge-border)] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:ring-violet-400/50 sm:p-5">
                <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-400/0 blur-2xl transition-all duration-500 group-hover:bg-violet-400/25" />
                <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black ring-2 ring-[var(--bridge-canvas)] transition-transform duration-500 group-hover:scale-105 ${color}`} aria-hidden>
                  {inits}
                </div>
                <div className="relative min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-[var(--bridge-text)]">{m.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--bridge-text-muted)]">
                    {m.count} {m.count === 1 ? 'session' : 'sessions'} together
                  </p>
                </div>
              </div>
            </Tilt3D>
          );
        })}
        {menteeCards.length === 0 && (
          <div className="col-span-full">
            <EmptyState message="No mentees have booked with you yet. Make sure your profile is complete and available." icon={Users} />
          </div>
        )}
        {menteeCards.length > 0 && filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-[var(--bridge-text-muted)]">No mentees match your search.</p>
        )}
      </div>
    </div>
  );
}

