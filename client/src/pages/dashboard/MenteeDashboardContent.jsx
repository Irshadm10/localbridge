/**
 * MenteeDashboardContent — mentee dashboard body.
 */

import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, CalendarDays, CheckCircle2, ArrowUpRight,
  Search, Users, Star, Zap, TrendingUp, BookOpen,
  Video, X,
} from 'lucide-react';
import {
  StatCard, EmptyState, SessionCard, MentorCard, SectionHeading,
} from './dashboardShared';
import { formatSessionDate, getAvatarColor, getInitials } from './dashboardUtils';
import DashboardSettingsPanel from './DashboardSettingsPanel';
import { useState, useEffect, useCallback } from 'react';
import ReviewModal from '../../components/ReviewModal';
import { getMyReviewedSessionIds } from '../../api/reviews';

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

  useEffect(() => {
    getMyReviewedSessionIds().then(({ data }) => { if (data) setReviewedSessionIds(data); });
  }, []);

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
    historySessions, visibleHistory, uniqueMentors, handleStatusUpdate,
  } = dash;

  return (
    <>
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

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard label="Total Sessions"    value={sessions.length}                                     icon={CalendarDays}  gradient="from-orange-500 to-amber-500" />
            <StatCard label="Upcoming"          value={upcomingSessions.length}                             icon={Clock}         gradient="from-sky-500 to-blue-500" />
            <StatCard label="Completed"         value={sessions.filter(s => s.status === 'completed').length} icon={CheckCircle2} gradient="from-emerald-500 to-teal-500" />
            <StatCard label="My Mentors"        value={uniqueMentors.length}                                icon={Users}         gradient="from-violet-500 to-purple-500" />
          </div>

          {/* Hero: next session */}
          {nextSession ? (
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
                    onCancel={(id) => handleStatusUpdate(id, 'cancelled')}
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

              {/* Quick actions */}
              <div className="rounded-2xl bg-[var(--bridge-surface)] p-5 shadow-sm ring-1 ring-[var(--bridge-border)]">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-[var(--bridge-text-muted)]">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to="/mentors"
                    className="group flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-orange-50 dark:hover:bg-orange-500/10">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm">
                      <Search className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--bridge-text)]">Find a Mentor</p>
                      <p className="text-xs text-[var(--bridge-text-muted)]">Browse 2,400+ experts</p>
                    </div>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-[var(--bridge-text-faint)] transition group-hover:text-orange-500" />
                  </Link>
                  <Link to="/resume"
                    className="group flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-sky-50 dark:hover:bg-sky-500/10">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 text-white shadow-sm">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--bridge-text)]">AI Resume Review</p>
                      <p className="text-xs text-[var(--bridge-text-muted)]">Free analysis</p>
                    </div>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-[var(--bridge-text-faint)] transition group-hover:text-sky-500" />
                  </Link>
                  <button type="button" onClick={() => setActiveTab('connections')}
                    className="group flex w-full items-center gap-3 rounded-xl p-3 transition-all hover:bg-violet-50 dark:hover:bg-violet-500/10">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-sm">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--bridge-text)] text-left">My Mentors</p>
                      <p className="text-xs text-[var(--bridge-text-muted)] text-left">{uniqueMentors.length} connection{uniqueMentors.length !== 1 ? 's' : ''}</p>
                    </div>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-[var(--bridge-text-faint)] transition group-hover:text-violet-500" />
                  </button>
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
          upcomingSessions={upcomingSessions}
          historySessions={historySessions}
          mentorMap={mentorMap}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleStatusUpdate={handleStatusUpdate}
          actionLoading={actionLoading}
          reviewedSessionIds={reviewedSessionIds}
          onReview={(s) => openReviewForSession(s, mentorMap)}
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

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-stone-950 via-stone-900 to-orange-950 p-7 text-white shadow-[0_24px_60px_-16px_rgba(234,88,12,0.35)] sm:p-8">
      {/* Background accents */}
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />

      <div className="relative z-10">
        {/* Header row */}
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

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          {isAccepted && (
            <button type="button" onClick={onJoin}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-stone-900 shadow-sm transition hover:bg-orange-50">
              <Video className="h-4 w-4" />
              Join Meeting
            </button>
          )}
          <Link to={`/mentors/${session.mentor_id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
            View Profile
          </Link>
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
    <div className="relative overflow-hidden rounded-[2rem] p-7 sm:p-8"
      style={{ background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #ea580c 100%)' }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40' fill='%23000' fill-opacity='1'/%3E%3C/svg%3E\")" }}
      />
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90">
            <Zap className="h-3 w-3" />Ready to start
          </p>
          <h3 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">No sessions scheduled yet.</h3>
          <p className="mt-1.5 text-sm text-orange-50/90">Book your first session with a vetted mentor — from $25.</p>
        </div>
        <Link to="/mentors"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-orange-700 shadow-lg transition hover:bg-orange-50">
          Browse Mentors
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── ActivityFeed ──────────────────────────────────────────────────────────────
function ActivityFeed({ history, role, total, showAll, onToggle }) {
  return (
    <div className="rounded-2xl bg-[var(--bridge-surface)] p-5 shadow-sm ring-1 ring-[var(--bridge-border)]">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-[var(--bridge-text-muted)]">Recent Activity</h3>
      {history.length > 0 ? (
        <div className="relative space-y-4">
          <div aria-hidden className="absolute left-[1.1rem] top-2 bottom-2 w-px bg-[var(--bridge-border)]" />
          {history.map((s) => {
            const done = s.status === 'completed';
            const name = role === 'mentor' ? s.mentee_name : s.mentor_name;
            return (
              <div key={s.id} className="flex items-start gap-3.5 pl-1">
                <div className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-2 ring-[var(--bridge-canvas)] ${done ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'}`}>
                  {done ? <CheckCircle2 className="h-3 w-3 text-white" /> : <Clock className="h-3 w-3 text-white" />}
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-xs font-semibold text-[var(--bridge-text)]">
                    {done ? 'Session completed' : 'Session ' + s.status}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--bridge-text-muted)]">with {name}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs italic text-[var(--bridge-text-muted)]">No recent activity yet.</p>
      )}
      {total > 5 && (
        <button type="button" onClick={onToggle}
          className="mt-4 text-xs font-semibold text-orange-600 transition hover:text-orange-700 dark:text-orange-400">
          {showAll ? '↑ Show less' : `Show all ${total} →`}
        </button>
      )}
    </div>
  );
}

// ─── MenteeSessionsTab ────────────────────────────────────────────────────────
function MenteeSessionsTab({
  upcomingSessions, historySessions, mentorMap, searchQuery, setSearchQuery,
  handleStatusUpdate, actionLoading, onReview, reviewedSessionIds = new Set(),
}) {
  const match = (s) =>
    s.mentor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.session_type?.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--bridge-text)] sm:text-3xl">Sessions</h2>
          <p className="mt-1 text-sm text-[var(--bridge-text-secondary)]">Your mentorship session history and upcoming bookings.</p>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by mentor or type…" />
      </div>

      <section>
        <SectionHeading count={upcomingSessions.filter(match).length}>Upcoming</SectionHeading>
        <div className="space-y-3">
          {upcomingSessions.filter(match).map((s) => (
            <SessionCard key={s.id} session={s} isMentor={false}
              mentorProfile={mentorMap[s.mentor_id]}
              onCancel={(id) => handleStatusUpdate(id, 'cancelled')}
              actionLoading={actionLoading}
            />
          ))}
          {upcomingSessions.length === 0 && <EmptyState message="No upcoming sessions. Book one from a mentor's profile." cta="Find a Mentor" href="/mentors" />}
          {upcomingSessions.length > 0 && upcomingSessions.filter(match).length === 0 && <NoMatch />}
        </div>
      </section>

      <section>
        <SectionHeading count={historySessions.filter(match).length}>History</SectionHeading>
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
          <h2 className="font-display text-2xl font-bold text-[var(--bridge-text)] sm:text-3xl">My Mentors</h2>
          <p className="mt-1 text-sm text-[var(--bridge-text-secondary)]">People you've collaborated with on Bridge.</p>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name…" />
      </div>

      {uniqueMentors.length > 0 && (
        <div className="rounded-2xl bg-[var(--bridge-surface)] p-4 ring-1 ring-[var(--bridge-border)] sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-[var(--bridge-text)]">{uniqueMentors.length} mentor{uniqueMentors.length !== 1 ? 's' : ''} connected</p>
              <p className="text-xs text-[var(--bridge-text-muted)]">Keep growing your network</p>
            </div>
            <Link to="/mentors" className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-orange-600 transition hover:text-orange-700 dark:text-orange-400">
              Explore more <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
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

// ─── Shared helpers ───────────────────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative max-w-xs flex-1 sm:min-w-[14rem]">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bridge-text-muted)]" />
      <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] py-2.5 pl-10 pr-4 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
      />
    </div>
  );
}

function NoMatch() {
  return <p className="py-8 text-center text-sm italic text-[var(--bridge-text-muted)]">No results match your search.</p>;
}
