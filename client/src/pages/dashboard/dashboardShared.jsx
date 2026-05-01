/**
 * dashboardShared — premium presentational building blocks for both dashboards.
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, ChevronRight, Clock, CalendarDays, ArrowUpRight,
  Video, Sparkles, Check, X, Star, Search, CheckCircle2,
} from 'lucide-react';
import { focusRing } from '../../ui';
import { SESSION_TYPE_MAP, getAvatarColor, getInitials, formatSessionDate } from './dashboardUtils';

export function canJoinSession(scheduledDate) {
  if (!scheduledDate) return false;
  return Date.now() >= new Date(scheduledDate).getTime() - 3 * 60 * 60 * 1000;
}

// Session type → left accent bar gradient
const TYPE_BAR = {
  career_advice:  'from-amber-400 to-orange-500',
  interview_prep: 'from-emerald-400 to-teal-500',
  resume_review:  'from-sky-400 to-blue-500',
  networking:     'from-violet-400 to-purple-500',
};

// Inject scoped keyframes for status shimmer once.
function ensureStatusStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('bridge-status-shimmer')) return;
  const tag = document.createElement('style');
  tag.id = 'bridge-status-shimmer';
  tag.textContent = `
    @keyframes bStatusSweep{0%{transform:translateX(-100%)}60%,100%{transform:translateX(220%)}}
    .bd-status-shine{position:relative;overflow:hidden}
    .bd-status-shine::after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%);transform:translateX(-100%);animation:bStatusSweep 2.4s cubic-bezier(.2,.6,.2,1) infinite;mix-blend-mode:overlay;pointer-events:none}
  `;
  document.head.appendChild(tag);
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  useEffect(() => { ensureStatusStyles(); }, []);
  const cfg = {
    pending:   { cls: 'bg-amber-400/12 text-amber-700 ring-1 ring-amber-400/35 dark:text-amber-300 dark:bg-amber-500/15',  dot: 'bg-amber-500',  label: 'Pending'   },
    accepted:  { cls: 'bg-emerald-400/12 text-emerald-700 ring-1 ring-emerald-400/35 dark:text-emerald-300 dark:bg-emerald-500/15', dot: 'bg-emerald-500', label: 'Confirmed' },
    completed: { cls: 'bg-sky-400/12 text-sky-700 ring-1 ring-sky-400/35 dark:text-sky-300 dark:bg-sky-500/15', dot: 'bg-sky-500', label: 'Completed' },
    declined:  { cls: 'bg-red-400/12 text-red-700 ring-1 ring-red-400/35 dark:text-red-300 dark:bg-red-500/15', dot: 'bg-red-500', label: 'Declined'  },
    cancelled: { cls: 'bg-stone-400/10 text-stone-500 ring-1 ring-stone-300/40 dark:text-stone-400 dark:ring-white/10', dot: 'bg-stone-400', label: 'Cancelled' },
  };
  const { cls, dot, label } = cfg[status] ?? { cls: 'bg-stone-100 text-stone-600', dot: 'bg-stone-400', label: status ?? 'Unknown' };
  const shimmer = status === 'accepted';
  return (
    <span className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ${cls} ${shimmer ? 'bd-status-shine' : ''}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot} ${status === 'accepted' || status === 'pending' ? 'animate-pulse-soft' : ''}`} />
      {label}
    </span>
  );
}

// ─── SectionHeading ───────────────────────────────────────────────────────────
export function SectionHeading({ id, children, count, action, kicker }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="flex flex-col">
        {kicker && (
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">{kicker}</p>
        )}
        <div className="mt-0.5 flex items-center gap-2.5">
          <h2 id={id} className="font-display text-xl font-black tracking-[-0.015em] text-[var(--bridge-text)]">{children}</h2>
          {count != null && (
            <span className="flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-gradient-to-br from-orange-500/15 to-amber-500/10 px-1.5 text-[11px] font-black tabular-nums text-orange-600 ring-1 ring-orange-500/25 dark:text-orange-300">
              {count}
            </span>
          )}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, gradient = 'from-orange-500 to-amber-500', hint, trend, subValue, kinetic = true }) {
  const numeric = typeof value === 'number';
  return (
    <div className="bd-card-edge group relative overflow-hidden rounded-2xl bg-[var(--bridge-surface)] p-5 shadow-sm ring-1 ring-[var(--bridge-border)] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:ring-[var(--bridge-border-strong)]">
      <div aria-hidden className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-15 blur-2xl transition-opacity duration-500 group-hover:opacity-40 ${gradient}`} />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '14px 14px', color: 'currentColor' }} />
      <div className="relative flex items-start justify-between">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-[0_8px_22px_-6px_rgba(234,88,12,0.55)] ring-1 ring-white/15 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-[-3deg] ${gradient}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && <StatTrendInline {...trend} />}
      </div>
      <div className="relative mt-4 flex items-baseline gap-1.5">
        <p className="font-display text-[2.35rem] font-black tabular-nums leading-none tracking-[-0.02em] text-[var(--bridge-text)]">
          {kinetic && numeric ? <KineticInline to={value} /> : value}
        </p>
        {subValue != null && (
          <p className="text-sm font-semibold tabular-nums text-[var(--bridge-text-faint)]">/ {subValue}</p>
        )}
      </div>
      <p className="relative mt-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">{label}</p>
      {hint && (
        <span className="relative mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          {hint}
        </span>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}

// Lazy kinetic to avoid circular import at module scope.
function KineticInline({ to }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVal(to);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        let raf;
        const start = performance.now();
        const dur = 950;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 4);
          setVal(to * eased);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{Math.round(val).toLocaleString()}</span>;
}

// Local mini trend chip — kept inline to avoid a circular import with dashboardLive.
function StatTrendInline({ current = 0, previous = 0, label = '30d' }) {
  const delta = current - previous;
  if (current === 0 && previous === 0) {
    return <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--bridge-text-faint)]">— {label}</span>;
  }
  const up = delta > 0, flat = delta === 0;
  const cls = flat
    ? 'bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-faint)] ring-[var(--bridge-border)]'
    : up
      ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/22 dark:text-emerald-300'
      : 'bg-red-500/10 text-red-600 ring-red-500/22 dark:text-red-300';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${cls}`}>
      <span aria-hidden>{flat ? '·' : up ? '▲' : '▼'}</span>
      <span className="tabular-nums">{up ? '+' : ''}{delta}</span>
      <span className="font-medium opacity-70">{label}</span>
    </span>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ message, cta, href, icon: Icon = CalendarDays }) {
  return (
    <div className="bd-card-edge relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)]/50 px-6 py-14 text-center">
      <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-44 w-72 -translate-x-1/2 rounded-full bg-orange-400/22 blur-3xl dark:bg-orange-500/20" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '14px 14px' }} />
      <div className="relative mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 text-white shadow-[0_12px_32px_-6px_rgba(234,88,12,0.55)] ring-1 ring-white/15">
        <Icon className="h-5 w-5" />
      </div>
      <p className="relative max-w-xs text-sm font-semibold leading-relaxed text-[var(--bridge-text-secondary)]">{message}</p>
      {cta && href && (
        <Link to={href} data-cursor={cta} className={`mt-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 text-sm font-black text-white shadow-[0_8px_24px_-6px_rgba(234,88,12,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-6px_rgba(234,88,12,0.75)] ${focusRing}`}>
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

  const showMentorActions      = canAct && isMentor && session.status === 'pending' && (onAccept || onDecline);
  const showMentorCancelButton = canAct && isMentor && ['pending', 'accepted'].includes(session.status) && onCancel;
  const showCancelButton       = canAct && !isMentor && ['pending', 'accepted'].includes(session.status) && onCancel;
  const showJoinCall           = session.status === 'accepted' && !isPast && session.video_room_url;

  const [dateLabel, timeLabel] = (formatSessionDate(session.scheduled_date) || ' · ').split(' · ');

  return (
    <article className="bd-card-edge group relative overflow-hidden rounded-2xl bg-[var(--bridge-surface)] shadow-sm ring-1 ring-[var(--bridge-border)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl hover:ring-[var(--bridge-border-strong)]">
      {/* Type accent bar — animated on hover */}
      <div aria-hidden className={`absolute inset-y-0 left-0 w-[3px] rounded-l-2xl bg-gradient-to-b ${barGradient}`} />
      <div aria-hidden className={`absolute inset-y-0 left-0 w-[3px] rounded-l-2xl bg-gradient-to-b ${barGradient} opacity-0 blur-[6px] transition-opacity duration-500 group-hover:opacity-100`} />
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-orange-500/0 transition-all duration-500 group-hover:bg-orange-500/15 group-hover:blur-2xl" />

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
          {showMentorCancelButton && (
            <button type="button" onClick={() => onCancel(session)} disabled={actionLoading === session.id}
              className="inline-flex items-center rounded-xl border border-[var(--bridge-border)] px-4 py-2 text-xs font-bold text-[var(--bridge-text-secondary)] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-300">
              Cancel
            </button>
          )}
          {showCancelButton && (
            <button type="button" onClick={() => onCancel(session)} disabled={actionLoading === session.id}
              className="inline-flex items-center rounded-xl border border-[var(--bridge-border)] px-4 py-2 text-xs font-bold text-[var(--bridge-text-secondary)] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-300">
              Cancel
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
    <Link to={`/mentors/${mentor.id}`} data-cursor="View"
      className={`bd-card-edge group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-[var(--bridge-surface)] p-4 shadow-sm ring-1 ring-[var(--bridge-border)] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:ring-orange-400/60 sm:p-5 ${focusRing}`}>
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-400/0 blur-2xl transition-all duration-500 group-hover:bg-orange-400/30" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '14px 14px' }} />
      {mentor.image_url ? (
        <img src={mentor.image_url} alt="" className="relative h-12 w-12 shrink-0 rounded-xl object-cover ring-2 ring-[var(--bridge-canvas)] transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black ring-2 ring-[var(--bridge-canvas)] transition-transform duration-500 group-hover:scale-105 ${color}`} aria-hidden>{inits}</div>
      )}
      <div className="relative min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-[var(--bridge-text)] transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-300">
          {mentor.name ?? 'Unknown mentor'}
        </p>
        {mentor.title && <p className="mt-0.5 truncate text-xs text-[var(--bridge-text-muted)]">{mentor.title}</p>}
        {mentor.company && (
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400">
            <Sparkles className="h-3 w-3" />{mentor.company}
          </p>
        )}
      </div>
      <ChevronRight className="relative h-4 w-4 shrink-0 text-[var(--bridge-text-faint)] transition-all duration-500 group-hover:translate-x-1 group-hover:text-orange-500" />
    </Link>
  );
}

// ─── SearchBar ─────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative max-w-xs flex-1 sm:min-w-[16rem]">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bridge-text-muted)] transition-colors peer-focus:text-orange-500" />
      <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className="peer w-full rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] py-3 pl-11 pr-4 text-sm font-semibold text-[var(--bridge-text)] shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/25"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear"
          className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[var(--bridge-text-muted)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)]">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── NoMatch ───────────────────────────────────────────────────────────────────
export function NoMatch() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <Search className="h-5 w-5 text-[var(--bridge-text-faint)]" />
      <p className="text-sm font-bold italic text-[var(--bridge-text-muted)]">No results match your search.</p>
    </div>
  );
}

// ─── ActivityFeed ──────────────────────────────────────────────────────────────
export function ActivityFeed({ history, role, total, showAll, onToggle }) {
  return (
    <div className="bd-card-edge relative overflow-hidden rounded-3xl bg-[var(--bridge-surface)] p-5 shadow-sm ring-1 ring-[var(--bridge-border)]">
      <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-amber-400/12 blur-3xl" />
      <div className="relative mb-4 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">Recent activity</p>
        <span className="text-[9px] font-bold text-[var(--bridge-text-faint)]">{total} total</span>
      </div>
      {history.length > 0 ? (
        <div className="relative space-y-4">
          <div aria-hidden className="absolute left-[0.6rem] top-2 bottom-2 w-px bg-gradient-to-b from-orange-400/40 via-[var(--bridge-border)] to-transparent" />
          {history.map((s) => {
            const done = s.status === 'completed';
            const name = role === 'mentor' ? s.mentee_name : s.mentor_name;
            return (
              <div key={s.id} className="group relative flex items-start gap-3.5 pl-1">
                <div className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-2 ring-[var(--bridge-canvas)] transition-all duration-300 group-hover:scale-110 ${done ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_0_14px_rgba(16,185,129,0.5)]' : 'bg-stone-300 dark:bg-stone-600'}`}>
                  {done ? <CheckCircle2 className="h-3 w-3 text-white" /> : <Clock className="h-3 w-3 text-white" />}
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-xs font-bold text-[var(--bridge-text)]">
                    {done ? 'Session completed' : `Session ${s.status}`}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--bridge-text-muted)]">with {name}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="relative text-xs italic text-[var(--bridge-text-muted)]">No recent activity yet.</p>
      )}
      {total > 5 && (
        <button type="button" onClick={onToggle} data-cursor="hover"
          className="relative mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-600 transition hover:text-orange-700 dark:text-orange-400">
          {showAll ? '↑ Show less' : `Show all ${total} →`}
        </button>
      )}
    </div>
  );
}
