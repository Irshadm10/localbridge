/**
 * dashboardShared — premium presentational building blocks for both dashboards.
 */

import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, ChevronRight, Clock, CalendarDays, ArrowUpRight,
  Video, Sparkles, Check, X, Star,
} from 'lucide-react';
import { focusRing } from '../../ui';
import { SESSION_TYPE_MAP, getAvatarColor, getInitials, formatSessionDate } from './dashboardUtils';

// Session type → left accent bar gradient
const TYPE_BAR = {
  career_advice:  'from-amber-400 to-orange-500',
  interview_prep: 'from-emerald-400 to-teal-500',
  resume_review:  'from-sky-400 to-blue-500',
  networking:     'from-violet-400 to-purple-500',
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const cfg = {
    pending:   { cls: 'bg-amber-400/12 text-amber-700 ring-1 ring-amber-400/35 dark:text-amber-300 dark:bg-amber-500/15',  dot: 'bg-amber-500',  label: 'Pending'   },
    accepted:  { cls: 'bg-emerald-400/12 text-emerald-700 ring-1 ring-emerald-400/35 dark:text-emerald-300 dark:bg-emerald-500/15', dot: 'bg-emerald-500', label: 'Confirmed' },
    completed: { cls: 'bg-sky-400/12 text-sky-700 ring-1 ring-sky-400/35 dark:text-sky-300 dark:bg-sky-500/15', dot: 'bg-sky-500', label: 'Completed' },
    declined:  { cls: 'bg-red-400/12 text-red-700 ring-1 ring-red-400/35 dark:text-red-300 dark:bg-red-500/15', dot: 'bg-red-500', label: 'Declined'  },
    cancelled: { cls: 'bg-stone-400/10 text-stone-500 ring-1 ring-stone-300/40 dark:text-stone-400 dark:ring-white/10', dot: 'bg-stone-400', label: 'Cancelled' },
  };
  const { cls, dot, label } = cfg[status] ?? { cls: 'bg-stone-100 text-stone-600', dot: 'bg-stone-400', label: status ?? 'Unknown' };
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot} ${status === 'accepted' || status === 'pending' ? 'animate-pulse-soft' : ''}`} />
      {label}
    </span>
  );
}

// ─── SectionHeading ───────────────────────────────────────────────────────────
export function SectionHeading({ id, children, count, action }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <h2 id={id} className="font-display text-lg font-bold text-[var(--bridge-text)]">{children}</h2>
        {count != null && (
          <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--bridge-surface-muted)] px-1.5 text-[11px] font-bold tabular-nums text-[var(--bridge-text-secondary)] ring-1 ring-[var(--bridge-border)]">
            {count}
          </span>
        )}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, gradient = 'from-orange-500 to-amber-500', hint }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[var(--bridge-surface)] p-5 shadow-sm ring-1 ring-[var(--bridge-border)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-[var(--bridge-border-strong)]">
      <div aria-hidden className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-15 blur-2xl transition-opacity duration-300 group-hover:opacity-30 ${gradient}`} />
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${gradient}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-display text-[2.25rem] font-bold tabular-nums leading-none tracking-tight text-[var(--bridge-text)]">{value}</p>
      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--bridge-text-muted)]">{label}</p>
      {hint && (
        <span className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          {hint}
        </span>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ message, cta, href, icon: Icon = CalendarDays }) {
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)]/50 px-6 py-14 text-center">
      <div aria-hidden className="pointer-events-none absolute -top-12 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full bg-orange-300/20 blur-3xl dark:bg-orange-500/15" />
      <div className="relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_8px_24px_-4px_rgba(234,88,12,0.4)]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="relative max-w-xs text-sm font-medium leading-relaxed text-[var(--bridge-text-secondary)]">{message}</p>
      {cta && href && (
        <Link to={href} className={`mt-5 inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-stone-800 dark:bg-orange-500 dark:text-stone-950 ${focusRing}`}>
          {cta}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

// ─── SessionCard ──────────────────────────────────────────────────────────────
export function SessionCard({
  session, isMentor = false, mentorProfile, onAccept, onDecline, onCancel,
  actionLoading, onReview, reviewed, intakeSummary, onViewIntake,
}) {
  const navigate = useNavigate();
  const type = SESSION_TYPE_MAP[session.session_type];
  const name = isMentor
    ? (session.mentee_name ?? 'Unknown mentee')
    : (mentorProfile?.name ?? session.mentor_name ?? 'Unknown mentor');
  const subtitle = isMentor ? null : (mentorProfile?.title ?? session.mentor_title ?? null);
  const avatarUrl = !isMentor ? (mentorProfile?.image_url ?? null) : null;
  const avatarColor = getAvatarColor(name);
  const avatarInits = getInitials(name);
  const barGradient = TYPE_BAR[session.session_type] ?? 'from-orange-400 to-amber-400';

  const now = new Date();
  const isPast = session.scheduled_date && new Date(session.scheduled_date) < now;
  const canAct = !isPast && !['completed', 'declined', 'cancelled'].includes(session.status);

  const showMentorActions = canAct && isMentor && session.status === 'pending' && (onAccept || onDecline);
  const showCancelButton  = canAct && !isMentor && ['pending', 'accepted'].includes(session.status) && onCancel;
  const showJoinCall      = session.status === 'accepted' && !isPast && session.video_room_url;

  const [dateLabel, timeLabel] = (formatSessionDate(session.scheduled_date) || ' · ').split(' · ');

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-[var(--bridge-surface)] shadow-sm ring-1 ring-[var(--bridge-border)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-[var(--bridge-border-strong)]">
      {/* Type accent bar */}
      <div aria-hidden className={`absolute inset-y-0 left-0 w-[3px] rounded-l-2xl bg-gradient-to-b ${barGradient}`} />

      <div className="flex flex-col gap-4 py-4 pl-6 pr-5 sm:flex-row sm:items-center sm:gap-5">
        {/* Avatar / icon */}
        <div className="flex flex-1 min-w-0 items-center gap-4">
          {!isMentor ? (
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-12 w-12 rounded-xl object-cover ring-2 ring-[var(--bridge-canvas)]" />
              ) : (
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold ring-2 ring-[var(--bridge-canvas)] ${avatarColor}`} aria-hidden>{avatarInits}</div>
              )}
              <div className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg bg-[var(--bridge-surface)] text-xs ring-1 ring-[var(--bridge-border)] ${type?.accent?.iconTint ?? 'text-stone-500'}`}>
                {type?.icon ?? '📋'}
              </div>
            </div>
          ) : (
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ring-1 ring-[var(--bridge-border)] ${type?.accent?.iconBg ?? 'bg-stone-100 dark:bg-white/[0.06]'}`}>
              {type?.icon ?? '📋'}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-[var(--bridge-text)]">{name}</p>
              <StatusBadge status={session.status} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--bridge-text-muted)]">
              {dateLabel && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{dateLabel}</span>}
              {timeLabel && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{timeLabel}</span>}
              {type?.name && (
                <span className="rounded-full bg-[var(--bridge-surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--bridge-text-secondary)] ring-1 ring-[var(--bridge-border)]">
                  {type.name}
                </span>
              )}
              {subtitle && <span className="max-w-[160px] truncate">{subtitle}</span>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[var(--bridge-border)] pt-3 sm:border-t-0 sm:pt-0">
          {isMentor && intakeSummary && (
            <button type="button" onClick={() => onViewIntake?.(session.id, intakeSummary)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20">
              <Sparkles className="h-3.5 w-3.5" />Intake Notes
            </button>
          )}
          {showMentorActions && (
            <>
              <button type="button" onClick={() => onAccept(session.id)} disabled={actionLoading === session.id}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-400 disabled:opacity-50">
                <Check className="h-3.5 w-3.5" />Accept
              </button>
              <button type="button" onClick={() => onDecline(session.id)} disabled={actionLoading === session.id}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--bridge-border)] px-4 py-2 text-xs font-bold text-[var(--bridge-text-secondary)] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-300">
                <X className="h-3.5 w-3.5" />Decline
              </button>
            </>
          )}
          {showJoinCall && (
            <button type="button" onClick={() => navigate(`/session/${session.id}/video`)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:from-emerald-500 hover:to-emerald-400">
              <Video className="h-3.5 w-3.5" />Join Call
            </button>
          )}
          {showCancelButton && (
            <button type="button" onClick={() => onCancel(session.id)} disabled={actionLoading === session.id}
              className="inline-flex items-center rounded-xl border border-[var(--bridge-border)] px-4 py-2 text-xs font-bold text-[var(--bridge-text-secondary)] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-300">
              {actionLoading === session.id ? 'Cancelling…' : 'Cancel'}
            </button>
          )}
          {!showMentorActions && !showCancelButton && !showJoinCall && !isMentor && !(session.status === 'completed' && (onReview || reviewed)) && (
            <Link to={`/mentors/${session.mentor_id}`}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-500/10">
              Profile<ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
          {!isMentor && session.status === 'completed' && (onReview || reviewed) && (
            reviewed ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--bridge-text-muted)]">
                <Star className="h-3 w-3 fill-current" />Reviewed
              </span>
            ) : (
              <button type="button" onClick={onReview}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20">
                <Star className="h-3 w-3" />Leave Review
              </button>
            )
          )}
        </div>
      </div>
    </article>
  );
}

// ─── MentorCard ───────────────────────────────────────────────────────────────
export function MentorCard({ mentor }) {
  const color = getAvatarColor(mentor.name ?? '');
  const inits = getInitials(mentor.name ?? '');
  return (
    <Link to={`/mentors/${mentor.id}`}
      className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-[var(--bridge-surface)] p-4 shadow-sm ring-1 ring-[var(--bridge-border)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-orange-300/60 sm:p-5 ${focusRing}`}>
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-orange-300/15 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {mentor.image_url ? (
        <img src={mentor.image_url} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover ring-2 ring-[var(--bridge-canvas)]" />
      ) : (
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-2 ring-[var(--bridge-canvas)] ${color}`} aria-hidden>{inits}</div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[var(--bridge-text)] transition-colors group-hover:text-orange-700 dark:group-hover:text-orange-300">
          {mentor.name ?? 'Unknown mentor'}
        </p>
        {mentor.title && <p className="mt-0.5 truncate text-xs text-[var(--bridge-text-muted)]">{mentor.title}</p>}
        {mentor.company && (
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <Sparkles className="h-3 w-3" />{mentor.company}
          </p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--bridge-text-faint)] transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
    </Link>
  );
}
