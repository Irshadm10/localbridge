/**
 * dashboardShared — **presentational** building blocks for both mentor and mentee dashboards
 *
 * Used by: `MentorDashboardContent.jsx`, `MenteeDashboardContent.jsx` (not imported by `Dashboard.jsx` directly).
 * Depends on: `./dashboardUtils.js` for `SESSION_TYPE_MAP`, avatars, dates.
 *
 * SessionCard / MentorCard are role-aware at the **props** level:
 * - Pass `isMentor={true}` when the logged-in user is the mentor (shows mentee side actions).
 * - Pass `mentorProfile` for mentee rows so avatars and titles resolve from `mentorMap`.
 */

import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronRight,
  Clock,
  CalendarDays,
  ArrowUpRight,
  Video,
} from 'lucide-react';
import { focusRing } from '../../ui';
import { SESSION_TYPE_MAP, getAvatarColor, getInitials, formatSessionDate } from './dashboardUtils';

export function StatusBadge({ status }) {
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

export function SectionHeading({ id, children, count }) {
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

export function StatCard({ label, value, icon: Icon, colorClass }) {
  return (
      <div className="group relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 shadow-sm transition-all duration-300 hover:border-orange-200/50 hover:shadow-md">
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

export function EmptyState({ message, cta, href, icon: Icon = CalendarDays }) {
  return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/50 px-6 py-12 text-center">
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

/**
 * One session row. Action buttons depend on role + status:
 * - Mentor + pending: `onAccept` / `onDecline` (wired to `handleStatusUpdate` in hook).
 * - Mentee + pending|accepted: `onCancel` → cancelled.
 * - Mentee + otherwise: “View Profile” link to `/mentors/:mentor_id`.
 */
export function SessionCard({ session, isMentor = false, mentorProfile, onAccept, onDecline, onCancel, actionLoading }) {
  const navigate = useNavigate();
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

  const canAct =
      !isPast &&
      session.status !== 'completed' &&
      session.status !== 'declined' &&
      session.status !== 'cancelled';

  const showMentorActions = canAct && isMentor && session.status === 'pending' && (onAccept || onDecline);
  const showCancelButton = canAct && !isMentor && (session.status === 'pending' || session.status === 'accepted') && onCancel;
  const showJoinCall = session.status === 'accepted' && !isPast && session.video_room_url;

  return (
      <div className="group relative flex flex-col gap-4 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-4 shadow-sm transition-all duration-300 hover:border-orange-200/50 hover:shadow-md sm:flex-row sm:items-center sm:gap-5">
        <div className="flex flex-1 min-w-0 items-center gap-4">
          {!isMentor ? (
              <div className="relative shrink-0">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover ring-2 ring-[var(--bridge-canvas)] shadow-sm"
                    />
                ) : (
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold shadow-sm ring-2 ring-[var(--bridge-canvas)] ${avatarColor}`}
                        aria-hidden
                    >
                      {avatarInits}
                    </div>
                )}
                <div className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg bg-[var(--bridge-surface)] shadow-sm ring-1 ring-[var(--bridge-border)] ${type?.accent.text ?? 'text-stone-500'}`}>
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
                    type="button"
                    onClick={() => onAccept(session.id)}
                    disabled={actionLoading === session.id}
                    className="flex-1 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-stone-800 disabled:opacity-50 sm:flex-none"
                >
                  Accept
                </button>
                <button
                    type="button"
                    onClick={() => onDecline(session.id)}
                    disabled={actionLoading === session.id}
                    className="flex-1 rounded-xl bg-stone-100 px-4 py-2 text-xs font-bold text-stone-600 transition hover:bg-stone-200 disabled:opacity-50 sm:flex-none"
                >
                  Decline
                </button>
              </div>
          )}
          {showJoinCall && (
              <button
                  type="button"
                  onClick={() => navigate(`/session/${session.id}/video`)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 sm:w-auto"
              >
                <Video className="h-3.5 w-3.5" />
                Join Call
              </button>
          )}
          {showCancelButton && (
              <button
                  type="button"
                  onClick={() => onCancel(session.id)}
                  disabled={actionLoading === session.id}
                  className="w-full rounded-xl bg-stone-100 px-4 py-2 text-xs font-bold text-stone-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:w-auto"
              >
                {actionLoading === session.id ? 'Cancelling…' : 'Cancel'}
              </button>
          )}
          {!showMentorActions && !showCancelButton && !showJoinCall && !isMentor && (
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

/** Mentee connections grid: links to `/mentors/:id` (expects `mentor_profiles` shape or compatible). */
export function MentorCard({ mentor }) {
  const color = getAvatarColor(mentor.name ?? '');
  const inits = getInitials(mentor.name ?? '');

  return (
      <Link
          to={`/mentors/${mentor.id}`}
          className={`group flex items-center gap-4 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200/55 hover:shadow-md sm:p-5 ${focusRing}`}
      >
        {mentor.image_url ? (
            <img
                src={mentor.image_url}
                alt=""
                className="h-12 w-12 shrink-0 rounded-xl object-cover ring-2 ring-[var(--bridge-canvas)] shadow-sm"
            />
        ) : (
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ring-2 ring-[var(--bridge-canvas)] ${color}`}
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
