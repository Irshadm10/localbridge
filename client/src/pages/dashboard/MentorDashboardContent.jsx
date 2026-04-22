/**
 * MentorDashboardContent — **logged-in mentor** dashboard body (tabs: overview | sessions | connections | settings)
 *
 * Mounted from: `pages/Dashboard.jsx` when `isMentorAccount(user)` is true (same route `/dashboard` as mentees).
 *
 * Props
 * -----
 * - `dash` — full object returned by `useDashboardData()`; this file uses mentor-relevant slices:
 *   sessions, menteeCards, mentorProfileId, handleStatusUpdate, search filters, history widgets, etc.
 *   (`mentorMap` is normally empty for mentors — mentee enrichment is for the mentee branch.)
 * - `activeTab` / `setActiveTab` — owned by parent so the sticky tab bar stays in Dashboard.jsx.
 * - `logout` — from `useAuth()`; only used in settings tab.
 *
 * Internal structure
 * ------------------
 * - `MentorDashboardContent` switches on `activeTab`.
 * - `MentorSessionsTab`, `MentorConnectionsTab`, `MentorAvailabilityModal` (quick availability) + settings via `DashboardSettingsPanel`.
 */

import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CalendarDays,
  CheckCircle2,
  ArrowUpRight,
  Plus,
  Search,
  ExternalLink,
  Users,
} from 'lucide-react';
import {
  StatCard,
  EmptyState,
  SessionCard,
  SectionHeading,
} from './dashboardShared';
import { getAvatarColor, getInitials, formatSessionDate } from './dashboardUtils';
import DashboardSettingsPanel from './DashboardSettingsPanel';
import MentorAvailabilityModal from './MentorAvailabilityModal';
import { useState } from 'react';

export function MentorDashboardContent({ dash, activeTab, setActiveTab, logout, user }) {
  const navigate = useNavigate();
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const {
    sessions,
    mentorMap,
    mentorProfileId,
    refetch,
    actionLoading,
    searchQuery,
    setSearchQuery,
    showAllHistory,
    setShowAllHistory,
    upcomingSessions,
    nextSession,
    historySessions,
    visibleHistory,
    menteeCards,
    handleStatusUpdate,
  } = dash;

  return (
      <>
        <MentorAvailabilityModal
          open={availabilityOpen}
          onClose={() => setAvailabilityOpen(false)}
          mentorProfileId={mentorProfileId}
          onSaved={() => refetch?.()}
        />
        {activeTab === 'overview' && (
            <div className="space-y-8 pb-10">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Total Sessions" value={sessions.length} icon={CalendarDays} colorClass="bg-orange-100 text-orange-600" />
                <StatCard label="Upcoming" value={upcomingSessions.length} icon={Clock} colorClass="bg-sky-100 text-sky-600" />
                <StatCard label="Completed" value={sessions.filter((s) => s.status === 'completed').length} icon={CheckCircle2} colorClass="bg-emerald-100 text-emerald-600" />
                <StatCard label="Active Mentees" value={menteeCards.length} icon={Users} colorClass="bg-violet-100 text-violet-600" />
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  {nextSession ? (
                      <div className="relative overflow-hidden rounded-[2rem] bg-stone-900 p-8 text-white shadow-xl shadow-stone-900/10">
                        <div className="absolute right-0 top-0 p-8 opacity-10">
                          <CalendarDays className="h-32 w-32" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-block rounded-full bg-orange-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Next Session</span>
                            {nextSession.status === 'pending' && (
                              <span className="inline-block rounded-full bg-amber-400/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200 ring-1 ring-amber-300/40">
                                Awaiting your response
                              </span>
                            )}
                            {nextSession.status === 'accepted' && (
                              <span className="inline-block rounded-full bg-emerald-400/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200 ring-1 ring-emerald-300/40">
                                Confirmed
                              </span>
                            )}
                          </div>
                          <h3 className="mt-4 font-display text-2xl font-bold">Session with {nextSession.mentee_name}</h3>
                          <div className="mt-6 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-orange-400" />
                              <span className="text-sm font-medium">{formatSessionDate(nextSession.scheduled_date).split(' · ')[0]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-400" />
                              <span className="text-sm font-medium">{formatSessionDate(nextSession.scheduled_date).split(' · ')[1]}</span>
                            </div>
                          </div>
                          <div className="mt-8 flex flex-wrap gap-3">
                            {nextSession.status === 'pending' ? (
                              <>
                                <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(nextSession.id, 'accepted')}
                                    disabled={actionLoading === nextSession.id}
                                    className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:opacity-50"
                                >
                                  {actionLoading === nextSession.id ? 'Accepting…' : 'Accept Session'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(nextSession.id, 'declined')}
                                    disabled={actionLoading === nextSession.id}
                                    className="rounded-xl bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-50"
                                >
                                  Decline
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                    type="button"
                                    onClick={() => nextSession.video_room_url
                                      ? navigate(`/session/${nextSession.id}/video`)
                                      : alert('Video room is not ready yet. Refresh in a moment.')}
                                    className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-stone-900 transition hover:bg-orange-50"
                                >
                                  Join Meeting
                                </button>
                                <button
                                    type="button"
                                    onClick={() => alert('Please contact your mentee to reschedule.')}
                                    className="flex items-center justify-center rounded-xl bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                                >
                                  Reschedule
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                  ) : (
                      <div className="rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-500 p-8 text-white shadow-lg shadow-orange-950/25">
                        <h3 className="font-display text-2xl font-bold">No sessions scheduled</h3>
                        <p className="mt-2 text-sm text-orange-100/90">When mentees book you, requests show up here for you to confirm.</p>
                        <button
                            type="button"
                            onClick={() => setActiveTab('settings')}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-stone-900 transition hover:bg-orange-50"
                        >
                          View your public profile
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>
                  )}

                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-display text-xl font-bold text-stone-900">Upcoming Sessions</h3>
                      <button type="button" onClick={() => setActiveTab('sessions')} className="text-xs font-bold text-orange-600 hover:underline">
                        View all
                      </button>
                    </div>
                    <div className="space-y-3">
                      {upcomingSessions.slice(0, 3).map((s) => (
                          <SessionCard
                              key={s.id}
                              session={s}
                              isMentor
                              onAccept={(id) => handleStatusUpdate(id, 'accepted')}
                              onDecline={(id) => handleStatusUpdate(id, 'declined')}
                              actionLoading={actionLoading}
                          />
                      ))}
                      {upcomingSessions.length === 0 && <EmptyState message="No upcoming sessions found." />}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-sm">
                    <h3 className="mb-4 font-display text-lg font-bold text-stone-900">Quick Actions</h3>
                    <div className="space-y-2">
                      <button
                          type="button"
                          onClick={() => (mentorProfileId ? setAvailabilityOpen(true) : setActiveTab('settings'))}
                          className="flex w-full items-center gap-3 rounded-xl border border-stone-100 p-3 transition-all hover:border-orange-200 hover:bg-orange-50 group"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                          <Plus className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-stone-700">Update Availability</span>
                      </button>
                      <Link to="/pricing" className="flex items-center gap-3 rounded-xl border border-stone-100 p-3 transition-all hover:border-emerald-200 hover:bg-emerald-50 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-stone-700">Manage Plan</span>
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-sm">
                    <h3 className="mb-4 font-display text-lg font-bold text-stone-900">Recent Activity</h3>
                    <div className="space-y-4">
                      {visibleHistory.length > 0 ? (
                          visibleHistory.map((s) => (
                              <div key={s.id} className="flex gap-3">
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${
                                        s.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-400'
                                    }`}
                                >
                                  {s.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-stone-900">
                                    {s.status === 'completed' ? 'Session completed' : 'Session recorded'}
                                  </p>
                                  <p className="mt-0.5 text-[10px] text-stone-500">with {s.mentee_name}</p>
                                </div>
                              </div>
                          ))
                      ) : (
                          <p className="text-xs italic text-stone-500">No recent activity</p>
                      )}
                    </div>
                    {historySessions.length > 5 && (
                        <button type="button" onClick={() => setShowAllHistory((v) => !v)} className="mt-4 text-xs font-bold text-orange-600 hover:underline">
                          {showAllHistory ? 'Show less' : `Show all ${historySessions.length}`}
                        </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
        )}

        {activeTab === 'sessions' && (
            <MentorSessionsTab
                upcomingSessions={upcomingSessions}
                historySessions={historySessions}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleStatusUpdate={handleStatusUpdate}
                actionLoading={actionLoading}
            />
        )}

        {activeTab === 'connections' && (
            <MentorConnectionsTab menteeCards={menteeCards} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        )}

        {activeTab === 'settings' && (
            <DashboardSettingsPanel user={user} logout={logout} isMentor mentorProfileId={mentorProfileId} />
        )}
      </>
  );
}

/** Full sessions list with search; `SessionCard` always `isMentor` with accept/decline on pending rows. */
function MentorSessionsTab({ upcomingSessions, historySessions, searchQuery, setSearchQuery, handleStatusUpdate, actionLoading }) {
  const match = (s) =>
      s.mentee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.session_type?.toLowerCase().includes(searchQuery.toLowerCase());

  return (
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
                className="w-full rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] py-2 pl-10 pr-4 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <SectionHeading count={upcomingSessions.filter(match).length}>Upcoming</SectionHeading>
            <div className="space-y-3">
              {upcomingSessions.filter(match).map((s) => (
                  <SessionCard
                      key={s.id}
                      session={s}
                      isMentor
                      onAccept={(id) => handleStatusUpdate(id, 'accepted')}
                      onDecline={(id) => handleStatusUpdate(id, 'declined')}
                      actionLoading={actionLoading}
                  />
              ))}
              {upcomingSessions.length === 0 && <EmptyState message="No upcoming sessions found." />}
              {upcomingSessions.length > 0 && upcomingSessions.filter(match).length === 0 && (
                  <p className="py-8 text-center text-sm italic text-stone-500">No sessions match your search.</p>
              )}
            </div>
          </section>

          <section>
            <SectionHeading count={historySessions.filter(match).length}>History</SectionHeading>
            <div className="space-y-3">
              {historySessions.filter(match).map((s) => (
                  <SessionCard key={s.id} session={s} isMentor />
              ))}
              {historySessions.length === 0 && <EmptyState message="No past sessions yet." />}
              {historySessions.length > 0 && historySessions.filter(match).length === 0 && (
                  <p className="py-8 text-center text-sm italic text-stone-500">No history matches your search.</p>
              )}
            </div>
          </section>
        </div>
      </div>
  );
}

/** “Mentees” tab — aggregated cards (not links); data from `menteeCards` memo in the hook. */
function MentorConnectionsTab({ menteeCards, searchQuery, setSearchQuery }) {
  return (
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
                className="w-full rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] py-2 pl-10 pr-4 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menteeCards
              .filter((m) => m.name?.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((m) => {
                const color = getAvatarColor(m.name);
                const inits = getInitials(m.name);
                return (
                    <div
                        key={m.id}
                        className="group flex items-center gap-4 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 shadow-sm transition-all hover:border-orange-200 hover:shadow-md"
                    >
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ring-2 ring-[var(--bridge-canvas)] ${color}`}>
                        {inits}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-stone-900 transition-colors group-hover:text-orange-900">{m.name}</p>
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
              menteeCards.filter((m) => m.name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <p className="col-span-full py-8 text-center text-sm italic text-stone-500">No mentees match your search.</p>
              )}
        </div>
      </div>
  );
}

