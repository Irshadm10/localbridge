/**
 * MenteeDashboardContent — mentee dashboard body.
 */

import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, CalendarDays, CheckCircle2, ArrowUpRight,
  Users, Star, Zap, TrendingUp, BookOpen,
  Video, X,
} from 'lucide-react';
import {
  StatCard, EmptyState, SessionCard, MentorCard, SectionHeading, canJoinSession,
  SearchBar, NoMatch, ActivityFeed,
} from './dashboardShared';
import { formatSessionDate, getAvatarColor, getInitials } from './dashboardUtils';
import { LiveCountdown, AddToCalendarButton, useSessionTrends, getRelativeSession } from './dashboardLive.jsx';
import { GoalRing, Sparkline, Tilt3D, Magnetic, useDailyActivity, useGoalProgress, KineticNumber } from './dashboardCinematic.jsx';
import DashboardSettingsPanel from './DashboardSettingsPanel';
import { useState, useEffect, useCallback } from 'react';
import SessionCalendar from './SessionCalendar';
import ReviewModal from '../../components/ReviewModal';
import CancellationModal from '../../components/CancellationModal';
import { getMyReviewedSessionIds } from '../../api/reviews';
import { getMyCancellationRequests, getFreePlanGrant } from '../../api/cancellations';

function isWithinReviewWindow(session) {
  if (session.status !== 'completed') return false;
  const ref = new Date(session.scheduled_date ?? session.created_at);
  return Date.now() - ref.getTime() <= 5 * 24 * 60 * 60 * 1000;
}

export function MenteeDashboardContent({ dash, activeTab, setActiveTab, logout, user, initialReviewSession }) {
  const navigate = useNavigate();
  const [heroHint, setHeroHint] = useState(null);
  const [reviewModal, setReviewModal] = useState(initialReviewSession ? { ...initialReviewSession } : null);
  const [reviewedSessionIds, setReviewedSessionIds] = useState(new Set());
  const [cancellationModal, setCancellationModal] = useState(null);
  const [cancellationBanners, setCancellationBanners] = useState([]);
  const [freePlanGrant, setFreePlanGrant] = useState(null);

  useEffect(() => {
    getMyReviewedSessionIds().then(({ data }) => { if (data) setReviewedSessionIds(data); });
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const SEEN_KEY = `bridge_cancel_seen_${user.id}`;
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

    getFreePlanGrant(user.id).then(grant => {
      if (grant?.active && grant.expires_at && new Date(grant.expires_at) > new Date()) {
        setFreePlanGrant(grant);
      }
    });
  }, [user?.id]);

  useEffect(() => {
    if (initialReviewSession) window.history.replaceState({}, '');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openReviewForSession = useCallback((session, mentorMap) => {
    const mentor = mentorMap[session.mentor_id];
    setReviewModal({
      sessionId: session.id,
      mentorId: session.mentor_id,
      mentorName: mentor?.name ?? session.mentor_name ?? 'your mentor',
      mentorEmail: mentor?.email ?? null,
    });
  }, []);

  const handleReviewSubmitted = useCallback((review) => {
    if (review?.session_id) setReviewedSessionIds((prev) => new Set([...prev, review.session_id]));
  }, []);

  const {
    sessions, mentorMap, actionLoading, searchQuery, setSearchQuery,
    showAllHistory, setShowAllHistory, upcomingSessions, nextSession,
    historySessions, visibleHistory, uniqueMentors, handleStatusUpdate, refetch,
  } = dash;

  // 30-day trend deltas (pure derivation — no API).
  const trends = useSessionTrends(sessions);
  const completedTotal = sessions.filter((s) => s.status === 'completed').length;
  const daily = useDailyActivity(sessions, 14);
  const dailyTotal = daily.reduce((a, b) => a + b, 0);
  const goal = useGoalProgress(sessions, 4);

  return (
    <>
      {cancellationModal && (
        <CancellationModal
          session={cancellationModal.session}
          isMentor={false}
          onClose={() => setCancellationModal(null)}
          onSuccess={() => { setCancellationModal(null); refetch?.(); }}
        />
      )}
      {reviewModal && (
        <ReviewModal
          sessionId={reviewModal.sessionId}
          mentorId={reviewModal.mentorId}
          mentorName={reviewModal.mentorName}
          mentorEmail={reviewModal.mentorEmail}
          onClose={() => setReviewModal(null)}
          onSubmitted={handleReviewSubmitted}
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
                  : <p className="font-semibold">Your cancellation request was denied.{r.reviewer_note ? ` Reason: ${r.reviewer_note}` : ' Please reach out to your mentor to reschedule.'}</p>}
              </div>
              <button type="button" onClick={() => setCancellationBanners(b => b.filter(x => x.id !== r.id))}
                className="ml-auto shrink-0 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
            </div>
          ))}

          {/* Free Pro plan banner */}
          {freePlanGrant && (
            <div className="flex items-start gap-3 rounded-2xl bg-violet-500/8 px-5 py-4 text-sm text-violet-700 ring-1 ring-violet-500/20 dark:text-violet-300">
              <span className="mt-0.5 text-base shrink-0">🎁</span>
              <div className="min-w-0">
                <p className="font-bold">You have a complimentary Pro plan!</p>
                <p className="mt-0.5 text-xs opacity-80">Your mentor cancelled a session, so we've given you 2 weeks of Pro free. Expires {new Date(freePlanGrant.expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>
              </div>
              <button type="button" onClick={() => setFreePlanGrant(null)}
                className="ml-auto shrink-0 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
            </div>
          )}

          {/* Stats grid — kinetic counters + 30d trend deltas */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard label="Total Sessions" value={sessions.length}
              icon={CalendarDays} gradient="from-orange-500 to-amber-500"
              trend={{ current: trends.bookedLast30, previous: trends.bookedPrior30, label: '30d' }} />
            <StatCard label="Upcoming" value={upcomingSessions.length}
              icon={Clock} gradient="from-sky-500 to-blue-500" />
            <StatCard label="Completed" value={completedTotal}
              icon={CheckCircle2} gradient="from-emerald-500 to-teal-500"
              trend={{ current: trends.completedLast30, previous: trends.completedPrior30, label: '30d' }} />
            <StatCard label="My Mentors" value={uniqueMentors.length}
              icon={Users} gradient="from-violet-500 to-purple-500" />
          </div>

          {/* Pulse — monthly goal ring + 14-day activity sparkline */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
            <Tilt3D max={4} className="rounded-3xl">
              <div className="bd-card-edge relative flex h-full items-center gap-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--bridge-surface)] via-[var(--bridge-surface)] to-orange-500/[0.04] p-6 ring-1 ring-[var(--bridge-border)] shadow-sm">
                <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/15 blur-3xl" />
                <GoalRing value={goal.completed} max={goal.target} label="Monthly" sub={`${goal.completed} / ${goal.target}`} />
                <div className="relative">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">Monthly goal</p>
                  <h3 className="mt-1 font-display text-lg font-black tracking-tight text-[var(--bridge-text)]">
                    {goal.completed >= goal.target ? 'Goal hit. Stack the next.' : `${goal.target - goal.completed} to go this month.`}
                  </h3>
                  <p className="mt-1 text-[12px] text-[var(--bridge-text-muted)]">Sessions completed roll forward into your record.</p>
                </div>
              </div>
            </Tilt3D>
            <Tilt3D max={4} className="rounded-3xl lg:col-span-2">
              <div className="bd-card-edge relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--bridge-surface)] to-[var(--bridge-surface-muted)]/40 p-6 ring-1 ring-[var(--bridge-border)] shadow-sm">
                <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-amber-400/12 blur-3xl" />
                <div className="relative flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-500">Activity · last 14 days</p>
                    <h3 className="mt-1 flex items-baseline gap-2 font-display text-2xl font-black tracking-tight text-[var(--bridge-text)]">
                      <KineticNumber to={dailyTotal} ms={900} />
                      <span className="text-sm font-bold text-[var(--bridge-text-muted)]">bookings</span>
                    </h3>
                  </div>
                  <span className="rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-2.5 py-1 text-[10px] font-bold text-[var(--bridge-text-secondary)]">
                    {dailyTotal === 0 ? 'No movement yet' : 'Keep going'}
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

          {/* Hero: next session — cinematic 3D tilt */}
          {nextSession ? (
            <Tilt3D max={3} className="rounded-[2rem]">
              <NextSessionHero
                session={nextSession}
                mentorProfile={mentorMap[nextSession.mentor_id]}
                heroHint={heroHint}
                setHeroHint={setHeroHint}
                onJoin={() => {
                  if (nextSession.video_room_url) {
                    setHeroHint(null);
                    navigate(`/session/${nextSession.id}/video`);
                  } else {
                    setHeroHint('Your mentor needs to accept the session before the video room opens.');
                  }
                }}
              />
            </Tilt3D>
          ) : (
            <NoSessionCTA role="mentee" />
          )}

          {/* Main two-column area */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* Upcoming sessions */}
            <div className="lg:col-span-2">
              <SectionHeading
                count={upcomingSessions.slice(0, 4).length}
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
                {upcomingSessions.slice(0, 4).map((s) => (
                  <SessionCard
                    key={s.id} session={s} isMentor={false}
                    mentorProfile={mentorMap[s.mentor_id]}
                    onCancel={(session) => setCancellationModal({ session })}
                    actionLoading={actionLoading}
                  />
                ))}
                {upcomingSessions.length === 0 && (
                  <EmptyState message="No upcoming sessions. Find a mentor and book your first session." cta="Browse Mentors" href="/mentors" />
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
                    { to: '/mentors', icon: Search, title: 'Find a Mentor', sub: 'Browse 2,400+ experts', g: 'from-orange-500 to-amber-500', hover: 'hover:bg-orange-500/8', accent: 'text-orange-500', cursor: 'Browse' },
                    { to: '/resume', icon: BookOpen, title: 'AI Resume Review', sub: 'Free analysis', g: 'from-sky-500 to-blue-500', hover: 'hover:bg-sky-500/8', accent: 'text-sky-500', cursor: 'Resume' },
                    { onClick: () => setActiveTab('connections'), icon: Users, title: 'My Mentors', sub: `${uniqueMentors.length} connection${uniqueMentors.length !== 1 ? 's' : ''}`, g: 'from-violet-500 to-purple-500', hover: 'hover:bg-violet-500/8', accent: 'text-violet-500', cursor: 'Mentors' },
                  ].map((q, i) => {
                    const Icon = q.icon;
                    const inner = (
                      <div className={`group flex w-full items-center gap-3 rounded-2xl p-3 transition-all duration-300 ${q.hover}`}>
                        <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${q.g} text-white shadow-[0_8px_22px_-6px_rgba(234,88,12,0.45)] ring-1 ring-white/15 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-sm font-bold text-[var(--bridge-text)]">{q.title}</p>
                          <p className="text-xs text-[var(--bridge-text-muted)]">{q.sub}</p>
                        </div>
                        <ArrowUpRight className="ml-auto h-4 w-4 text-[var(--bridge-text-faint)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--bridge-accent)]" />
                      </div>
                    );
                    return q.to ? (
                      <Link key={i} to={q.to} data-cursor={q.cursor}>{inner}</Link>
                    ) : (
                      <button key={i} type="button" onClick={q.onClick} data-cursor={q.cursor} className="w-full">{inner}</button>
                    );
                  })}
                </div>
              </div>

              {/* Activity feed */}
              <ActivityFeed history={visibleHistory} role="mentee" total={historySessions.length} showAll={showAllHistory} onToggle={() => setShowAllHistory(v => !v)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Sessions tab ─────────────────────────────────────────────── */}
      {activeTab === 'sessions' && (
        <MenteeSessionsTab
          sessions={sessions}
          upcomingSessions={upcomingSessions}
          historySessions={historySessions}
          mentorMap={mentorMap}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleStatusUpdate={handleStatusUpdate}
          actionLoading={actionLoading}
          reviewedSessionIds={reviewedSessionIds}
          onReview={(s) => openReviewForSession(s, mentorMap)}
          onCancel={(session) => setCancellationModal({ session })}
        />
      )}

      {/* ── Connections tab ──────────────────────────────────────────── */}
      {activeTab === 'connections' && (
        <MenteeConnectionsTab
          uniqueMentors={uniqueMentors}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {/* ── Settings tab ─────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <DashboardSettingsPanel user={user} logout={logout} isMentor={false} />
      )}
    </>
  );
}

// ─── NextSessionHero ──────────────────────────────────────────────────────────
function NextSessionHero({ session, mentorProfile, heroHint, setHeroHint, onJoin }) {
  const navigate = useNavigate();
  const avatarColor = getAvatarColor(mentorProfile?.name ?? session.mentor_name ?? '');
  const avatarInits = getInitials(mentorProfile?.name ?? session.mentor_name ?? '');
  const [date, time] = (formatSessionDate(session.scheduled_date) || ' · ').split(' · ');
  const isPending  = session.status === 'pending';
  const isAccepted = session.status === 'accepted';
  const canJoin = canJoinSession(session.scheduled_date);

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-stone-950 via-stone-900 to-orange-950 p-7 text-white shadow-[0_24px_60px_-16px_rgba(234,88,12,0.35)] sm:p-8">
      {/* Background accents */}
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />

      <div className="relative z-10">
        {/* Header row — status chips + live countdown */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-200 ring-1 ring-orange-400/30">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse-soft" />
            Next Session
          </span>
          {isPending && (
            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-200 ring-1 ring-amber-400/30">
              Awaiting acceptance
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

        {/* Mentor info */}
        <div className="mt-5 flex items-center gap-4">
          <div className="relative shrink-0">
            {mentorProfile?.image_url ? (
              <img src={mentorProfile.image_url} alt="" className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white/20" />
            ) : (
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold ring-2 ring-white/20 ${avatarColor}`} aria-hidden>
                {avatarInits}
              </div>
            )}
            {isAccepted && (
              <span aria-hidden className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-stone-900 text-[8px] font-bold text-emerald-950">✓</span>
            )}
          </div>
          <div>
            <p className="font-display text-xl font-bold sm:text-2xl">
              {mentorProfile?.name ?? session.mentor_name ?? 'Your mentor'}
            </p>
            {mentorProfile?.title && (
              <p className="mt-0.5 text-sm text-stone-300">
                {mentorProfile.title}{mentorProfile.company ? ` · ${mentorProfile.company}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-5 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-white/8 px-3.5 py-2">
            <Calendar className="h-4 w-4 text-orange-300" />
            <span className="text-sm font-medium">{date}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/8 px-3.5 py-2">
            <Clock className="h-4 w-4 text-orange-300" />
            <span className="text-sm font-medium">{time}</span>
          </div>
        </div>

        {/* Actions — magnetic */}
        <div className="mt-6 flex flex-wrap gap-3">
          {isAccepted && (
            canJoin ? (
              <Magnetic strength={0.18}>
                <button type="button" onClick={onJoin} data-cursor="Join"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-stone-900 shadow-[0_8px_24px_-6px_rgba(255,255,255,0.5)] transition hover:bg-orange-50 hover:shadow-[0_12px_32px_-8px_rgba(255,255,255,0.65)]">
                  <Video className="h-4 w-4" />
                  Join Meeting
                </button>
              </Magnetic>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-black text-white/40 ring-1 ring-white/10 cursor-not-allowed" title="Available 3 hours before the session">
                <Video className="h-4 w-4" />
                Join Meeting
              </div>
            )
          )}
          <Magnetic strength={0.14}>
            <Link to={`/mentors/${session.mentor_id}`} data-cursor="Profile"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-white/20">
              View Profile
            </Link>
          </Magnetic>
          {isAccepted && <AddToCalendarButton session={session} label="Add to calendar" />}
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
function NoSessionCTA() {
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
              <Zap className="h-3 w-3" />Ready to start
            </p>
            <h3 className="mt-3 font-display text-3xl font-black tracking-[-0.025em] text-white sm:text-[2.4rem] sm:leading-[1.05]">No sessions yet.<br/><span className="italic">Let's change that.</span></h3>
            <p className="mt-2 text-sm text-orange-50/95">Book your first session with a vetted mentor — from $25.</p>
          </div>
          <Magnetic strength={0.2}>
            <Link to="/mentors" data-cursor="Browse"
              className="btn-sheen inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-black text-orange-700 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.4)] ring-1 ring-white/40 transition-all hover:-translate-y-0.5 hover:bg-orange-50">
              Browse Mentors
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Magnetic>
        </div>
      </div>
    </Tilt3D>
  );
}

// ─── MenteeSessionsTab ────────────────────────────────────────────────────────
function MenteeSessionsTab({
  sessions, upcomingSessions, historySessions, mentorMap, searchQuery, setSearchQuery,
  handleStatusUpdate, actionLoading, onReview, reviewedSessionIds = new Set(), onCancel,
}) {
  const match = (s) =>
    s.mentor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.session_type?.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div className="space-y-8 pb-12">
      {/* Header — editorial */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-500">Your sessions</p>
          <h2 className="mt-2 font-display font-black tracking-[-0.025em] text-[var(--bridge-text)]" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: '1.02' }}>
            Sessions <span className="text-gradient-bridge italic">in motion</span>
          </h2>
          <p className="mt-1.5 text-sm text-[var(--bridge-text-secondary)]">Your mentorship history and upcoming bookings, all in one place.</p>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by mentor or type…" />
      </div>

      <SessionCalendar
        sessions={sessions}
        handleStatusUpdate={handleStatusUpdate}
        actionLoading={actionLoading}
        isMentor={false}
        mentorMap={mentorMap}
        onReview={onReview}
        reviewedSessionIds={reviewedSessionIds}
        onCancel={onCancel}
      />

      <section>
        <SectionHeading kicker="Coming up" count={upcomingSessions.filter(match).length}>Upcoming</SectionHeading>
        <div className="space-y-3">
          {upcomingSessions.filter(match).map((s) => (
            <SessionCard key={s.id} session={s} isMentor={false}
              mentorProfile={mentorMap[s.mentor_id]}
              onCancel={onCancel}
              actionLoading={actionLoading}
            />
          ))}
          {upcomingSessions.length === 0 && <EmptyState message="No upcoming sessions. Book one from a mentor's profile." cta="Find a Mentor" href="/mentors" />}
          {upcomingSessions.length > 0 && upcomingSessions.filter(match).length === 0 && <NoMatch />}
        </div>
      </section>

      <section>
        <SectionHeading kicker="Already done" count={historySessions.filter(match).length}>History</SectionHeading>
        <div className="space-y-3">
          {historySessions.filter(match).map((s) => (
            <SessionCard key={s.id} session={s} isMentor={false}
              mentorProfile={mentorMap[s.mentor_id]}
              actionLoading={actionLoading}
              onReview={isWithinReviewWindow(s) && !reviewedSessionIds.has(s.id) ? () => onReview(s) : undefined}
              reviewed={reviewedSessionIds.has(s.id)}
            />
          ))}
          {historySessions.length === 0 && <EmptyState message="No past sessions yet." />}
          {historySessions.length > 0 && historySessions.filter(match).length === 0 && <NoMatch />}
        </div>
      </section>
    </div>
  );
}

// ─── MenteeConnectionsTab ────────────────────────────────────────────────────
function MenteeConnectionsTab({ uniqueMentors, searchQuery, setSearchQuery }) {
  const filtered = uniqueMentors.filter(m => m.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-500">Your network</p>
          <h2 className="mt-2 font-display font-black tracking-[-0.025em] text-[var(--bridge-text)]" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: '1.02' }}>
            My <span className="text-gradient-bridge italic">Mentors</span>
          </h2>
          <p className="mt-1.5 text-sm text-[var(--bridge-text-secondary)]">People you've collaborated with on Bridge.</p>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name…" />
      </div>

      {uniqueMentors.length > 0 && (
        <Tilt3D max={3} className="rounded-3xl">
          <div className="bd-card-edge relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--bridge-surface)] via-[var(--bridge-surface)] to-violet-500/[0.04] p-5 ring-1 ring-[var(--bridge-border)] shadow-sm sm:p-6">
            <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-400/15 blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-[0_8px_24px_-6px_rgba(139,92,246,0.55)] ring-1 ring-white/15">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-lg font-black tracking-tight text-[var(--bridge-text)]">
                  <KineticNumber to={uniqueMentors.length} ms={900} /> mentor{uniqueMentors.length !== 1 ? 's' : ''} connected
                </p>
                <p className="text-xs text-[var(--bridge-text-muted)]">Keep growing your network</p>
              </div>
              <Magnetic strength={0.16}>
                <Link to="/mentors" data-cursor="More" className="ml-auto inline-flex items-center gap-1 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2 text-xs font-black text-orange-600 transition hover:border-orange-400/45 hover:text-orange-700 dark:text-orange-400">
                  Explore more <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Magnetic>
            </div>
          </div>
        </Tilt3D>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(m => <MentorCard key={m.id} mentor={m} />)}
        {uniqueMentors.length === 0 && (
          <div className="col-span-full">
            <EmptyState message="You haven't booked with any mentors yet. Start by finding someone who's done what you want to do." cta="Browse Mentors" href="/mentors" icon={Users} />
          </div>
        )}
        {uniqueMentors.length > 0 && filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-[var(--bridge-text-muted)]">No mentors match your search.</p>
        )}
      </div>
    </div>
  );
}

