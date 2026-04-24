/**
 * dashboardShared — presentational building blocks for both mentor and mentee dashboards.
 *
 * Used by: `MentorDashboardContent.jsx`, `MenteeDashboardContent.jsx`. SessionCard / MentorCard
 * are role-aware at the **props** level: pass `isMentor` / `mentorProfile` as needed.
 */

import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronRight,
  Clock,
  CalendarDays,
  ArrowUpRight,
  Video,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { focusRing } from '../../ui';
import { SESSION_TYPE_MAP, getAvatarColor, getInitials, formatSessionDate } from './dashboardUtils';

export function StatusBadge({ status }) {
  const config = {
    pending: {
      classes:
        'bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-400/30',
      label: 'Pending',
      dot: 'bg-amber-500',
    },
    accepted: {
      classes:
        'bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/30',
      label: 'Confirmed',
      dot: 'bg-emerald-500',
    },
    completed: {
      classes:
        'bg-sky-50 text-sky-800 border border-sky-200/80 dark:bg-sky-500/15 dark:text-sky-200 dark:border-sky-400/30',
      label: 'Completed',
      dot: 'bg-sky-500',
    },
    declined: {
      classes:
        'bg-red-50 text-red-800 border border-red-200/80 dark:bg-red-500/15 dark:text-red-200 dark:border-red-400/30',
      label: 'Declined',
      dot: 'bg-red-500',
    },
    cancelled: {
      classes:
        'bg-stone-100 text-stone-500 border border-stone-200/80 dark:bg-white/[0.06] dark:text-stone-300 dark:border-white/10',
      label: 'Cancelled',
      dot: 'bg-stone-400',
    },
  };
  const { classes, label, dot } = config[status] ?? {
    classes: 'bg-stone-100 text-stone-600',
    label: status ?? 'Unknown',
    dot: 'bg-stone-400',
  };
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot} ${status === 'accepted' || status === 'pending' ? 'animate-pulse-soft' : ''}`} />
      {label}
    </span>
  );
}

export function SectionHeading({ id, children, count, action }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <h2 id={id} className="font-display text-xl font-semibold text-[var(--bridge-text)]">
          {children}
        </h2>
        {count != null && (
          <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-1.5 text-xs font-bold tabular-nums text-[var(--bridge-text-secondary)]">
            {count}
          </span>
        )}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, colorClass, hint }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 shadow-bridge-tile transition-all duration-500 hover:-translate-y-0.5 hover:shadow-bridge-card cursor-glow">
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-orange-400/15 to-transparent opacity-0 blur-2xl transition group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm ring-1 ring-[var(--bridge-border)] transition-transform duration-500 group-hover:scale-110 ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        {hint ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)]">
            {hint}
          </span>
        ) : null}
      </div>
      <div className="relative mt-5">
        <p className="font-display text-[2.5rem] font-bold tabular-nums leading-none tracking-[-0.04em] text-[var(--bridge-text)]">{value}</p>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">{label}</p>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent opacity-0 transition group-hover:opacity-100" />
    </div>
  );
}

export function EmptyState({ message, cta, href, icon: Icon = CalendarDays }) {
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-dashed border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)]/60 px-6 py-14 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.04] dark:opacity-[0.09]" />
      <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-300/25 via-amber-200/10 to-transparent blur-3xl dark:from-orange-500/25" />
      <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 text-white shadow-[0_10px_30px_-6px_rgba(234,88,12,0.55)]">
        <Icon className="h-6 w-6" />
      </div>
      <p className="relative max-w-[24rem] text-sm font-medium leading-relaxed text-[var(--bridge-text-secondary)]">
        {message}
      </p>
      {cta && href ? (
        <Link
          to={href}
          className={`btn-sheen relative mt-6 inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-[0_10px_28px_-8px_rgba(28,25,23,0.45)] transition hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-[0_16px_36px_-10px_rgba(28,25,23,0.55)] dark:bg-gradient-to-r dark:from-orange-500 dark:to-amber-500 dark:text-stone-950 dark:shadow-[0_12px_30px_-8px_rgba(234,88,12,0.55)] ${focusRing}`}
        >
          {cta}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function SessionCard({ session, isMentor = false, mentorProfile, onAccept, onDecline, onCancel, actionLoading, onReview, reviewed }) {
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

  const [dateLabel, timeLabel] = (formatSessionDate(session.scheduled_date) || ' · ').split(' · ');

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-tile transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300/60 hover:shadow-bridge-card cursor-glow">
      <div aria-hidden className={`absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b ${type?.accent?.bar ?? 'from-orange-400 to-amber-300'} opacity-70 transition group-hover:opacity-100`} />
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div className="flex flex-1 min-w-0 items-center gap-4">
          {!isMentor ? (
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-14 w-14 rounded-2xl object-cover ring-2 ring-[var(--bridge-canvas)] shadow-sm" />
              ) : (
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold shadow-sm ring-2 ring-[var(--bridge-canvas)] ${avatarColor}`} aria-hidden>
                  {avatarInits}
                </div>
              )}
              <div className={`absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-xl bg-[var(--bridge-surface)] text-sm shadow-sm ring-1 ring-[var(--bridge-border)] ${type?.accent?.text ?? 'text-stone-500'}`}>
                {type?.icon ?? '📋'}
              </div>
            </div>
          ) : (
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl shadow-sm ring-1 ring-[var(--bridge-border)] ${type?.accent?.iconBg ?? 'bg-stone-100 dark:bg-white/[0.06]'}`}>
              {type?.icon ?? '📋'}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-bold text-[var(--bridge-text)]">{name}</p>
              <StatusBadge status={session.status} />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--bridge-text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {dateLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {timeLabel}
              </span>
              {type?.name && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--bridge-text-secondary)]">
                  {type.name}
                </span>
              )}
              {subtitle && <span className="max-w-[180px] truncate">{subtitle}</span>}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-[var(--bridge-border)] pt-3 sm:border-t-0 sm:pt-0">
          {showMentorActions && (
            <div className="flex w-full gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => onAccept(session.id)}
                disabled={actionLoading === session.id}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-[0_6px_16px_-4px_rgba(16,185,129,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-6px_rgba(16,185,129,0.6)] disabled:opacity-50 sm:flex-none"
              >
                <Check className="h-3.5 w-3.5" />
                Accept
              </button>
              <button
                type="button"
                onClick={() => onDecline(session.id)}
                disabled={actionLoading === session.id}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-4 py-2.5 text-xs font-bold text-[var(--bridge-text-secondary)] transition hover:border-red-300/70 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-300 sm:flex-none"
              >
                <X className="h-3.5 w-3.5" />
                Decline
              </button>
            </div>
          )}
          {showJoinCall && (
            <button
              type="button"
              onClick={() => navigate(`/session/${session.id}/video`)}
              className="btn-sheen inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_22px_-6px_rgba(16,185,129,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-8px_rgba(16,185,129,0.7)]"
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
              className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-4 py-2.5 text-xs font-bold text-[var(--bridge-text-secondary)] transition hover:border-red-300/70 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-300 sm:w-auto"
            >
              {actionLoading === session.id ? 'Cancelling…' : 'Cancel'}
            </button>
          )}
          {!showMentorActions && !showCancelButton && !showJoinCall && !isMentor && (
            <Link
              to={`/mentors/${session.mentor_id}`}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-orange-700 transition hover:bg-orange-50 hover:text-orange-800 dark:text-orange-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-200"
            >
              View profile
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
          {!isMentor && session.status === 'completed' && onReview && (
            reviewed ? (
              <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-stone-400 dark:text-stone-500">
                Reviewed
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onReview(session)}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-700 transition hover:bg-amber-50 hover:text-amber-800 dark:text-amber-300 dark:hover:bg-amber-500/10 dark:hover:text-amber-200"
              >
                Leave Review
              </button>
            )
          )}
        </div>
      </div>
    </article>
  );
}

export function MentorCard({ mentor }) {
  const color = getAvatarColor(mentor.name ?? '');
  const inits = getInitials(mentor.name ?? '');

  return (
    <Link
      to={`/mentors/${mentor.id}`}
      className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-4 shadow-bridge-tile transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300/60 hover:shadow-bridge-card sm:p-5 ${focusRing}`}
    >
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-orange-400/15 to-transparent opacity-0 blur-2xl transition group-hover:opacity-100" />
      {mentor.image_url ? (
        <img src={mentor.image_url} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-[var(--bridge-canvas)] shadow-sm" />
      ) : (
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-sm ring-2 ring-[var(--bridge-canvas)] ${color}`} aria-hidden>
          {inits}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[var(--bridge-text)] transition group-hover:text-orange-800 dark:group-hover:text-orange-300">
          {mentor.name ?? 'Unknown mentor'}
        </p>
        {mentor.title ? <p className="mt-0.5 truncate text-xs text-[var(--bridge-text-muted)]">{mentor.title}</p> : null}
        {mentor.company ? (
          <p className="mt-0.5 inline-flex items-center gap-1 truncate text-xs font-semibold text-amber-700 dark:text-amber-300">
            <Sparkles className="h-3 w-3" />
            {mentor.company}
          </p>
        ) : null}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--bridge-text-faint)] transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
    </Link>
  );
}
