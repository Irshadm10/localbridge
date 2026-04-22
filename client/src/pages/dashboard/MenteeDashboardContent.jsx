/**
 * MenteeDashboardContent — **logged-in mentee** dashboard body (tabs: overview | sessions | connections | settings)
 *
 * Mounted from: `pages/Dashboard.jsx` when `isMentorAccount(user)` is false.
 *
 * Props
 * -----
 * - `dash` — full object from `useDashboardData()`. Mentee branch relies heavily on:
 *   `mentorMap` (enriched mentor rows keyed by `mentor_id`), `uniqueMentors`, `sessions`,
 *   `handleStatusUpdate`, search/history toggles — see hook JSDoc for each key.
 * - `activeTab` / `setActiveTab` — owned by parent (`Dashboard.jsx`) for shared sticky chrome.
 * - `logout` — `useAuth()`; settings tab only.
 *
 * vs MentorDashboardContent
 * -------------------------
 * Same layout patterns, different copy and data: mentees see `MentorCard` + mentor names on sessions;
 * mentors see `menteeCards` and mentee names. Shared UI lives in `dashboardShared.jsx` + `dashboardUtils.js`.
 */

import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CalendarDays,
  CheckCircle2,
  ArrowUpRight,
  Search,
  ExternalLink,
  Users,
} from 'lucide-react';
import {
  StatCard,
  EmptyState,
  SessionCard,
  MentorCard,
  SectionHeading,
} from './dashboardShared';
import { formatSessionDate } from './dashboardUtils';
import DashboardSettingsPanel from './DashboardSettingsPanel';

export function MenteeDashboardContent({ dash, activeTab, setActiveTab, logout, user }) {
  const navigate = useNavigate();
  const {
    sessions,
    mentorMap,
    actionLoading,
    searchQuery,
    setSearchQuery,
    showAllHistory,
    setShowAllHistory,
    upcomingSessions,
    nextSession,
    historySessions,
    visibleHistory,
    uniqueMentors,
    handleStatusUpdate,
  } = dash;

  return (
      <>
        {activeTab === 'overview' && (
            <div className="space-y-8 pb-10">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Total Sessions" value={sessions.length} icon={CalendarDays} colorClass="bg-orange-100 text-orange-600" />
                <StatCard label="Upcoming" value={upcomingSessions.length} icon={Clock} colorClass="bg-sky-100 text-sky-600" />
                <StatCard label="Completed" value={sessions.filter((s) => s.status === 'completed').length} icon={CheckCircle2} colorClass="bg-emerald-100 text-emerald-600" />
                <StatCard label="My Mentors" value={uniqueMentors.length} icon={Users} colorClass="bg-violet-100 text-violet-600" />
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  {nextSession ? (
                      <div className="relative overflow-hidden rounded-[2rem] bg-stone-900 p-8 text-white shadow-xl shadow-stone-900/10">
                        <div className="absolute right-0 top-0 p-8 opacity-10">
                          <CalendarDays className="h-32 w-32" />
                        </div>
                        <div className="relative z-10">
                          <span className="inline-block rounded-full bg-orange-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Next Session</span>
                          <h3 className="mt-4 font-display text-2xl font-bold">Session with {nextSession.mentor_name}</h3>
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
                          <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={() => nextSession.video_room_url
                                  ? navigate(`/session/${nextSession.id}/video`)
                                  : alert('The video room will be available once your mentor accepts the session.')}
                                className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-stone-900 transition hover:bg-orange-50"
                            >
                              Join Meeting
                            </button>
                            <Link
                                to={`/mentors/${nextSession.mentor_id}`}
                                className="flex items-center justify-center rounded-xl bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                  ) : (
                      <div className="rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-500 p-8 text-white shadow-lg shadow-orange-950/25">
                        <h3 className="font-display text-2xl font-bold">No sessions scheduled</h3>
                        <p className="mt-2 text-sm text-orange-100/90">Ready to take the next step?</p>
                        <Link to="/mentors" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-stone-900 transition hover:bg-orange-50">
                          Browse Mentors
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
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
                              isMentor={false}
                              mentorProfile={mentorMap[s.mentor_id]}
                              onCancel={(id) => handleStatusUpdate(id, 'cancelled')}
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
                      <Link to="/mentors" className="flex items-center gap-3 rounded-xl border border-stone-100 p-3 transition-all hover:border-orange-200 hover:bg-orange-50 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                          <Search className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-stone-700">Find a Mentor</span>
                      </Link>
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
                                  <p className="mt-0.5 text-[10px] text-stone-500">with {s.mentor_name}</p>
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
            <MenteeSessionsTab
                upcomingSessions={upcomingSessions}
                historySessions={historySessions}
                mentorMap={mentorMap}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleStatusUpdate={handleStatusUpdate}
                actionLoading={actionLoading}
            />
        )}

        {activeTab === 'connections' && (
            <MenteeConnectionsTab uniqueMentors={uniqueMentors} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        )}

        {activeTab === 'settings' && <DashboardSettingsPanel user={user} logout={logout} isMentor={false} />}
      </>
  );
}

/** Sessions list; `SessionCard` is mentee mode (cancel on pending, no accept/decline). `mentorMap` supplies avatar/meta. */
function MenteeSessionsTab({ upcomingSessions, historySessions, mentorMap, searchQuery, setSearchQuery, handleStatusUpdate, actionLoading }) {
  const match = (s) =>
      s.mentor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
                      isMentor={false}
                      mentorProfile={mentorMap[s.mentor_id]}
                      onCancel={(id) => handleStatusUpdate(id, 'cancelled')}
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
                  <SessionCard key={s.id} session={s} isMentor={false} mentorProfile={mentorMap[s.mentor_id]} />
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

/** “My mentors” grid — one `MentorCard` per derived mentor from `uniqueMentors` (see hook memo). */
function MenteeConnectionsTab({ uniqueMentors, searchQuery, setSearchQuery }) {
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
          {uniqueMentors.filter((m) => m.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((m) => (
              <MentorCard key={m.id} mentor={m} />
          ))}
          {uniqueMentors.length === 0 && (
              <div className="col-span-full">
                <EmptyState message="You haven't booked with any mentors yet." cta="Find a Mentor" href="/mentors" />
              </div>
          )}
          {uniqueMentors.length > 0 &&
              uniqueMentors.filter((m) => m.name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <p className="col-span-full py-8 text-center text-sm italic text-stone-500">No mentors match your search.</p>
              )}
        </div>
      </div>
  );
}

// Settings tab renders DashboardSettingsPanel directly (see MenteeDashboardContent above).
