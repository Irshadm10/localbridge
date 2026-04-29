/**
 * MentorDashboardContent — mentor dashboard body.
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, Clock, CalendarDays, CheckCircle2, ArrowUpRight,
  Search, Users, Video, Check, X, Plus, Zap,
  TrendingUp,
} from 'lucide-react';
import {
  StatCard, EmptyState, SessionCard, SectionHeading,
} from './dashboardShared';
import { formatSessionDate, getAvatarColor, getInitials } from './dashboardUtils';
import DashboardSettingsPanel from './DashboardSettingsPanel';
import MentorAvailabilityModal from './MentorAvailabilityModal';
import IntakeSummaryModal from './IntakeSummaryModal';
import CalendarConnectButton from '../../components/CalendarConnectButton';
import { useState, useEffect } from 'react';

export function MentorDashboardContent({ dash, activeTab, setActiveTab, logout, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [heroHint, setHeroHint] = useState(null);
  const [calendarBanner, setCalendarBanner] = useState(null);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [intakeData, setIntakeData] = useState({ summary: '', menteeName: '' });

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

  const {
    sessions, mentorProfileId, calendarConnected, refetch, actionLoading,
    searchQuery, setSearchQuery, showAllHistory, setShowAllHistory,
    upcomingSessions, nextSession, historySessions, visibleHistory,
    menteeCards, handleStatusUpdate,
  } = dash;

  const pendingSessions = upcomingSessions.filter(s => s.status === 'pending');

  return (
    <>
      <MentorAvailabilityModal
        open={availabilityOpen}
        onClose={() => setAvailabilityOpen(false)}
        mentorProfileId={mentorProfileId}
        onSaved={() => refetch?.()}
      />

      {/* ── Overview tab ─────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8 pb-12">

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

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard label="Total Sessions"  value={sessions.length}                                       icon={CalendarDays}  gradient="from-orange-500 to-amber-500" />
            <StatCard label="Upcoming"        value={upcomingSessions.length}                               icon={Clock}         gradient="from-sky-500 to-blue-500" />
            <StatCard label="Completed"       value={sessions.filter(s => s.status === 'completed').length} icon={CheckCircle2}  gradient="from-emerald-500 to-teal-500" />
            <StatCard label="Active Mentees"  value={menteeCards.length}                                    icon={Users}         gradient="from-violet-500 to-purple-500" />
          </div>

          {/* Pending requests — highest priority for mentors */}
          {pendingSessions.length > 0 && (
            <PendingRequestsSection
              pendingSessions={pendingSessions}
              handleStatusUpdate={handleStatusUpdate}
              actionLoading={actionLoading}
            />
          )}

          {/* Hero: next session */}
          {nextSession ? (
            <MentorNextSessionHero
              session={nextSession}
              heroHint={heroHint}
              setHeroHint={setHeroHint}
              handleStatusUpdate={handleStatusUpdate}
              actionLoading={actionLoading}
              setActiveTab={setActiveTab}
              navigate={navigate}
            />
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

              {/* Quick actions */}
              <div className="rounded-2xl bg-[var(--bridge-surface)] p-5 shadow-sm ring-1 ring-[var(--bridge-border)]">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-[var(--bridge-text-muted)]">Quick Actions</h3>
                <div className="space-y-2">
                  <button type="button"
                    onClick={() => mentorProfileId ? setAvailabilityOpen(true) : setActiveTab('settings')}
                    className="group flex w-full items-center gap-3 rounded-xl p-3 transition-all hover:bg-orange-50 dark:hover:bg-orange-500/10">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--bridge-text)] text-left">Update Availability</p>
                      <p className="text-xs text-[var(--bridge-text-muted)] text-left">Set your open time slots</p>
                    </div>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-[var(--bridge-text-faint)] transition group-hover:text-orange-500" />
                  </button>
                  <button type="button" onClick={() => setActiveTab('connections')}
                    className="group flex w-full items-center gap-3 rounded-xl p-3 transition-all hover:bg-violet-50 dark:hover:bg-violet-500/10">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-sm">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--bridge-text)] text-left">My Mentees</p>
                      <p className="text-xs text-[var(--bridge-text-muted)] text-left">{menteeCards.length} connection{menteeCards.length !== 1 ? 's' : ''}</p>
                    </div>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-[var(--bridge-text-faint)] transition group-hover:text-violet-500" />
                  </button>
                  {mentorProfileId && (
                    <div className="pt-1">
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
          upcomingSessions={upcomingSessions}
          historySessions={historySessions}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleStatusUpdate={handleStatusUpdate}
          actionLoading={actionLoading}
          onViewIntake={(s, text) => { setIntakeData({ summary: text, menteeName: s.mentee_name ?? 'Mentee' }); setIntakeOpen(true); }}
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
    <div className="rounded-2xl bg-[var(--bridge-surface)] shadow-sm ring-1 ring-amber-300/50 dark:ring-amber-400/25 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--bridge-border)] bg-amber-50/80 px-5 py-4 dark:bg-amber-500/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <p className="font-bold text-[var(--bridge-text)]">
            Pending Requests
            <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
              {pendingSessions.length}
            </span>
          </p>
          <p className="text-xs text-[var(--bridge-text-secondary)]">Respond within 24 hours to keep your acceptance rate up.</p>
        </div>
      </div>

      {/* Cards — horizontal scroll on mobile, wrap on desktop */}
      <div className="flex gap-3 overflow-x-auto p-4 sm:flex-wrap sm:overflow-visible sm:p-5">
        {pendingSessions.map((s) => (
          <PendingRequestCard
            key={s.id} session={s}
            onAccept={() => handleStatusUpdate(s.id, 'accepted')}
            onDecline={() => handleStatusUpdate(s.id, 'declined')}
            loading={actionLoading === s.id}
          />
        ))}
      </div>
    </div>
  );
}

function PendingRequestCard({ session, onAccept, onDecline, loading }) {
  const color = getAvatarColor(session.mentee_name ?? '');
  const inits = getInitials(session.mentee_name ?? '');
  const [date, time] = (formatSessionDate(session.scheduled_date) || ' · ').split(' · ');

  return (
    <div className="flex w-[14rem] shrink-0 flex-col gap-3 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/60 p-4 sm:w-auto sm:min-w-[13rem] sm:max-w-[16rem]">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-2 ring-[var(--bridge-canvas)] ${color}`} aria-hidden>
          {inits}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--bridge-text)]">{session.mentee_name ?? 'Mentee'}</p>
          <p className="truncate text-[11px] text-[var(--bridge-text-muted)]">{date}</p>
        </div>
      </div>
      {session.session_type && (
        <span className="self-start rounded-full bg-[var(--bridge-surface)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--bridge-text-secondary)] ring-1 ring-[var(--bridge-border)] capitalize">
          {session.session_type.replace('_', ' ')}
        </span>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={onAccept} disabled={loading}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-500 py-2 text-xs font-bold text-white transition hover:bg-emerald-400 disabled:opacity-50">
          <Check className="h-3.5 w-3.5" />Accept
        </button>
        <button type="button" onClick={onDecline} disabled={loading}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-[var(--bridge-border)] py-2 text-xs font-bold text-[var(--bridge-text-secondary)] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-300">
          <X className="h-3.5 w-3.5" />Decline
        </button>
      </div>
    </div>
  );
}

// ─── MentorNextSessionHero ────────────────────────────────────────────────────
function MentorNextSessionHero({ session, heroHint, setHeroHint, handleStatusUpdate, actionLoading, setActiveTab, navigate }) {
  const [date, time] = (formatSessionDate(session.scheduled_date) || ' · ').split(' · ');
  const isPending  = session.status === 'pending';
  const isAccepted = session.status === 'accepted';
  const mentee = session.mentee_name ?? 'Your mentee';

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
              <button type="button"
                onClick={() => {
                  if (session.video_room_url) { setHeroHint(null); navigate(`/session/${session.id}/video`); }
                  else setHeroHint('Video link is still preparing — try again in a few seconds.');
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-stone-900 transition hover:bg-orange-50">
                <Video className="h-4 w-4" />Join Meeting
              </button>
              <button type="button" onClick={() => setActiveTab('connections')}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">
                View Mentees
              </button>
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
    <div className="relative overflow-hidden rounded-[2rem] p-7 sm:p-8"
      style={{ background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #ea580c 100%)' }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40' fill='%23000' fill-opacity='1'/%3E%3C/svg%3E\")" }}
      />
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90">
            <Plus className="h-3 w-3" />Getting started
          </p>
          <h3 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">No sessions yet.</h3>
          <p className="mt-1.5 text-sm text-orange-50/90">Make sure your profile is visible and your availability is set.</p>
        </div>
        <button type="button" onClick={onSettings}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-orange-700 shadow-lg transition hover:bg-orange-50">
          Set Availability
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── ActivityFeed ─────────────────────────────────────────────────────────────
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
                    {done ? 'Session completed' : `Session ${s.status}`}
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

// ─── MentorSessionsTab ────────────────────────────────────────────────────────
function MentorSessionsTab({ upcomingSessions, historySessions, searchQuery, setSearchQuery, handleStatusUpdate, actionLoading, onViewIntake }) {
  const match = (s) =>
    s.mentee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.session_type?.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--bridge-text)] sm:text-3xl">Sessions</h2>
          <p className="mt-1 text-sm text-[var(--bridge-text-secondary)]">Manage incoming requests and view session history.</p>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by mentee or type…" />
      </div>

      <section>
        <SectionHeading count={upcomingSessions.filter(match).length}>Upcoming</SectionHeading>
        <div className="space-y-3">
          {upcomingSessions.filter(match).map((s) => (
            <SessionCard key={s.id} session={s} isMentor
              onAccept={(id) => handleStatusUpdate(id, 'accepted')}
              onDecline={(id) => handleStatusUpdate(id, 'declined')}
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
        <SectionHeading count={historySessions.filter(match).length}>History</SectionHeading>
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
          <h2 className="font-display text-2xl font-bold text-[var(--bridge-text)] sm:text-3xl">Mentees</h2>
          <p className="mt-1 text-sm text-[var(--bridge-text-secondary)]">Everyone you've worked with on Bridge.</p>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name…" />
      </div>

      {menteeCards.length > 0 && (
        <div className="rounded-2xl bg-[var(--bridge-surface)] p-4 ring-1 ring-[var(--bridge-border)] sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-[var(--bridge-text)]">{menteeCards.length} mentee{menteeCards.length !== 1 ? 's' : ''} so far</p>
              <p className="text-xs text-[var(--bridge-text-muted)]">Keep your availability up to attract more</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => {
          const color = getAvatarColor(m.name ?? '');
          const inits = getInitials(m.name ?? '');
          return (
            <div key={m.id}
              className="group flex items-center gap-4 rounded-2xl bg-[var(--bridge-surface)] p-4 shadow-sm ring-1 ring-[var(--bridge-border)] transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-[var(--bridge-border-strong)] sm:p-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-2 ring-[var(--bridge-canvas)] ${color}`} aria-hidden>
                {inits}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--bridge-text)]">{m.name}</p>
                <p className="mt-0.5 text-xs text-[var(--bridge-text-muted)]">
                  {m.count} {m.count === 1 ? 'session' : 'sessions'} together
                </p>
              </div>
            </div>
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
