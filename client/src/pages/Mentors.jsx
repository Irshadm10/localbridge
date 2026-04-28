import { useState, useEffect, useCallback, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAllMentors } from '../api/mentors';
import MentorAvatar from '../components/MentorAvatar';
import { getMyFavorites, toggleFavorite } from '../api/favorites';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import Reveal from '../components/Reveal';
import { focusRing } from '../ui';
import MentorMatchWizard from '../components/MentorMatchWizard';
import { getAIMatchedMentors, saveMenteeAssessment, loadMenteeAssessment } from '../api/aiMatching';
import { getRemainingUses, hasReachedLimit, recordUsage, LIMITS } from '../api/aiUsage';

const PAGE_SIZE = 12;

// ─── Mentor tiers data ────────────────────────────────────────────────────────

const MENTOR_TIERS = [
  {
    name: 'Rising',
    rateRange: '$40–$70',
    experienceDesc: '0–4 years · Early-career professionals and recent grads who have earned their first real wins.',
    useCases: ['First job search and resume polish', 'Breaking into competitive entry-level roles', 'Building professional habits and early momentum'],
    accentFrom: 'from-emerald-500',
    accentTo: 'to-emerald-400',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/30',
    glowColor: 'rgba(16,185,129,0.18)',
  },
  {
    name: 'Established',
    rateRange: '$75–$120',
    experienceDesc: '5–9 years · Mid-career contributors with a proven track record and a clear area of focus.',
    useCases: ['Mid-level to senior career transitions', 'Navigating promotion cycles and leveling up', 'Changing industries or switching functions'],
    accentFrom: 'from-sky-500',
    accentTo: 'to-sky-400',
    badgeBg: 'bg-sky-500/15',
    badgeText: 'text-sky-300',
    badgeBorder: 'border-sky-500/30',
    glowColor: 'rgba(14,165,233,0.18)',
  },
  {
    name: 'Expert',
    rateRange: '$125–$175',
    experienceDesc: '10–15 years · Senior leaders with deep functional expertise and meaningful organizational scope.',
    useCases: ['Senior or staff-level interview preparation', 'Executive communication and cross-functional influence', 'High-stakes career pivots and role expansions'],
    accentFrom: 'from-violet-500',
    accentTo: 'to-violet-400',
    badgeBg: 'bg-violet-500/15',
    badgeText: 'text-violet-300',
    badgeBorder: 'border-violet-500/30',
    glowColor: 'rgba(139,92,246,0.18)',
  },
  {
    name: 'Elite',
    rateRange: '$180–$250',
    experienceDesc: '15+ years · C-suite executives and industry-defining practitioners at the top of their fields.',
    useCases: ['VP and C-suite transition coaching', 'Board-level presence and strategic positioning', 'Legacy career decisions, exits, and portfolio moves'],
    accentFrom: 'from-amber-500',
    accentTo: 'to-orange-500',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    badgeText: 'text-white',
    badgeBorder: '',
    glowColor: 'rgba(245,158,11,0.22)',
  },
];

// ─── Mentor Tiers Modal ────────────────────────────────────────────────────────

function MentorTiersModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog" aria-modal="true" aria-labelledby="tiers-modal-title">
      <button type="button" className="absolute inset-0 bg-stone-950/75 backdrop-blur-[3px]" aria-label="Close" onClick={onClose} />
      <div className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-[var(--bridge-surface)] shadow-2xl ring-1 ring-[var(--bridge-border)] sm:rounded-3xl">
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 px-6 py-5 sm:px-8">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-orange-600/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-300/80">Bridge</p>
              <h2 id="tiers-modal-title" className="mt-1 font-display text-2xl font-black text-white sm:text-3xl">Mentor Tiers</h2>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-stone-400">
                Every mentor on Bridge is placed in one of four tiers based on experience and expertise.
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-stone-300 transition hover:bg-white/20 hover:text-white ${focusRing}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {MENTOR_TIERS.map((tier) => (
              <div key={tier.name} className="group relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-5 transition hover:border-[var(--bridge-border-strong)] hover:shadow-bridge-card">
                <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle, ${tier.glowColor}, transparent 70%)` }} />
                <div aria-hidden className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${tier.accentFrom} ${tier.accentTo} opacity-70`} />
                <div className="relative">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] border ${tier.badgeBg} ${tier.badgeText} ${tier.badgeBorder}`}>
                      {tier.name}
                    </span>
                    <span className={`font-display text-xl font-black tabular-nums bg-gradient-to-r ${tier.accentFrom} ${tier.accentTo} bg-clip-text text-transparent`}>
                      {tier.rateRange}
                    </span>
                  </div>
                  <p className="mb-3 text-xs leading-relaxed text-[var(--bridge-text-muted)]">{tier.experienceDesc}</p>
                  <ul className="space-y-1.5">
                    {tier.useCases.map((uc) => (
                      <li key={uc} className="flex items-start gap-2 text-xs text-[var(--bridge-text-secondary)]">
                        <svg className={`mt-0.5 h-3.5 w-3.5 shrink-0`} viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="6" style={{ fill: `url(#g-${tier.name})` }} />
                          <defs>
                            <linearGradient id={`g-${tier.name}`} x1="0" y1="0" x2="14" y2="14" gradientUnits="userSpaceOnUse">
                              <stop stopColor={tier.name === 'Rising' ? '#10b981' : tier.name === 'Established' ? '#0ea5e9' : tier.name === 'Expert' ? '#8b5cf6' : '#f59e0b'} />
                              <stop offset="1" stopColor={tier.name === 'Rising' ? '#34d399' : tier.name === 'Established' ? '#38bdf8' : tier.name === 'Expert' ? '#a78bfa' : '#f97316'} />
                            </linearGradient>
                          </defs>
                          <path d="M4.5 7l1.75 1.75L9.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {uc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-[var(--bridge-text-faint)]">
            Rates shown are typical ranges. Each mentor sets their own session price.
          </p>
        </div>
      </div>
    </div>
  , document.body);
}

const INDUSTRIES = [
  { label: 'All', value: '' },
  { label: 'Technology', value: 'technology' },
  { label: 'Finance', value: 'finance' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Data Science', value: 'data science' },
  { label: 'Education', value: 'education' },
  { label: 'Law', value: 'law' },
];

const TIERS = [
  { label: 'All tiers', value: '' },
  { label: 'Rising', value: 'rising' },
  { label: 'Established', value: 'established' },
  { label: 'Expert', value: 'expert' },
  { label: 'Elite', value: 'elite' },
];

const SORT_OPTIONS = [
  { label: 'Best reviewed', value: 'rating' },
  { label: 'Most experienced', value: 'experience' },
  { label: 'Most sessions', value: 'sessions' },
];

function tierBadge(tier) {
  switch (tier) {
    case 'rising':      return 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-400/30 dark:text-emerald-300';
    case 'established': return 'bg-sky-500/10 text-sky-600 ring-1 ring-sky-400/30 dark:text-sky-300';
    case 'expert':      return 'bg-violet-500/10 text-violet-600 ring-1 ring-violet-400/30 dark:text-violet-300';
    case 'elite':       return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_2px_10px_rgba(234,88,12,0.45)]';
    default:            return 'bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-muted)] ring-1 ring-[var(--bridge-border)]';
  }
}

function normalizeMentorId(id) { return id == null ? '' : String(id).toLowerCase(); }

// ─── Star rating ──────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  const uid = useId().replace(/:/g, '');
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = i < full ? '100%' : i === full && partial > 0 ? `${Math.round(partial * 100)}%` : '0%';
          const gid = `${uid}-s${i}`;
          return (
            <svg key={i} className="h-3 w-3" viewBox="0 0 20 20" aria-hidden>
              <defs><linearGradient id={gid}><stop offset={fill} stopColor="#f59e0b" /><stop offset={fill} stopColor="currentColor" className="text-[var(--bridge-border-strong)]" /></linearGradient></defs>
              <polygon points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7" fill={`url(#${gid})`} />
            </svg>
          );
        })}
      </span>
      <span className="text-[11px] font-bold text-[var(--bridge-text-secondary)] tabular-nums">{rating.toFixed(1)}</span>
    </span>
  );
}

// ─── Heart button ─────────────────────────────────────────────────────────────
function HeartButton({ filled, onClick, label, disabled }) {
  return (
    <button type="button" disabled={disabled} onClick={e => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      className={`group/heart relative flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bridge-surface)]/90 text-[var(--bridge-text-faint)] ring-1 ring-[var(--bridge-border)] backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-rose-50 hover:text-rose-500 hover:ring-rose-300/60 hover:shadow-[0_4px_12px_rgba(244,63,94,0.25)] disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-rose-500/10 ${focusRing}`}
      aria-label={label}>
      {filled
        ? <svg className="h-3.5 w-3.5 fill-rose-500" viewBox="0 0 24 24" aria-hidden><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
        : <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
      }
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function MentorGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5">
          <div aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-orange-200/10 to-transparent dark:via-orange-400/8"
            style={{ animation: 'bridge-sheen 2.2s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-[var(--bridge-surface-muted)] animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-3/4 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
              <div className="h-3 w-1/2 rounded-full bg-[var(--bridge-surface-muted)]/70 animate-pulse" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
            <div className="h-3 w-4/5 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
          </div>
          <div className="mt-4 flex gap-1.5">
            <div className="h-5 w-16 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
            <div className="h-5 w-20 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--bridge-border)] pt-4">
            <div className="h-4 w-16 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
            <div className="h-7 w-24 rounded-lg bg-[var(--bridge-surface-muted)] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Mentor card ──────────────────────────────────────────────────────────────
function MentorCard({ mentor, isFavorite, onToggleFavorite, user, navigate, favoriteBusy, favoritesEnabled }) {
  function handleHeart() {
    if (!user) { navigate('/login', { state: { from: '/mentors' } }); return; }
    onToggleFavorite(mentor.id);
  }

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-card transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--bridge-border-strong)] hover:shadow-bridge-float">

      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-3.5 p-5">

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <MentorAvatar name={mentor.name} size="card"
              className="rounded-xl ring-2 ring-[var(--bridge-canvas)] shadow-sm" />
            {mentor.available && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-[var(--bridge-surface)] bg-emerald-400">
                <span aria-hidden className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="truncate text-[14px] font-bold text-[var(--bridge-text)]">{mentor.name}</h3>
            <p className="truncate text-[12px] text-[var(--bridge-text-muted)]">{mentor.title}</p>
            <p className="truncate text-[12px] font-medium text-[var(--bridge-text-secondary)]">{mentor.company}</p>
          </div>

          {favoritesEnabled && (
            <HeartButton filled={isFavorite} disabled={Boolean(favoriteBusy)} onClick={handleHeart}
              label={isFavorite ? 'Remove from favorites' : 'Save to favorites'} />
          )}
        </div>

        {/* Rating + tier */}
        <div className="flex items-center justify-between">
          <StarRating rating={mentor.rating} />
          <div className="flex items-center gap-1.5">
            {mentor.tier && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tierBadge(mentor.tier)}`}>
                {mentor.tier}
              </span>
            )}
            {mentor.years_experience > 0 && (
              <span className="text-[11px] text-[var(--bridge-text-faint)]">{mentor.years_experience}yr</span>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="line-clamp-2 text-[12px] leading-relaxed text-[var(--bridge-text-secondary)]">{mentor.bio}</p>

        {/* Expertise tags */}
        <div className="flex flex-wrap gap-1">
          {mentor.expertise.slice(0, 3).map(tag => (
            <span key={tag} className="rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--bridge-text-secondary)]">
              {tag}
            </span>
          ))}
          {mentor.expertise.length > 3 && (
            <span className="rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--bridge-text-faint)]">
              +{mentor.expertise.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-[var(--bridge-border)] pt-3.5">
          <div>
            {mentor.session_rate ? (
              <p className="font-display text-[15px] font-bold tabular-nums text-[var(--bridge-text)]">
                ${mentor.session_rate}<span className="text-[11px] font-normal text-[var(--bridge-text-faint)]">/session</span>
              </p>
            ) : (
              <p className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">Free</p>
            )}
            <p className="text-[10px] text-[var(--bridge-text-faint)]">{mentor.total_sessions} sessions</p>
          </div>
          <Link to={`/mentors/${mentor.id}`}
            className={`inline-flex items-center gap-1 rounded-lg bg-[var(--bridge-surface-muted)] px-3.5 py-2 text-[12px] font-semibold text-[var(--bridge-text)] ring-1 ring-[var(--bridge-border)] transition hover:bg-[var(--bridge-surface-raised)] hover:ring-[var(--bridge-border-strong)] ${focusRing}`}>
            View profile
            <svg className="h-3 w-3 text-[var(--bridge-text-faint)]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── AI match cards ────────────────────────────────────────────────────────────
function MatchChip({ label }) {
  const c = label === 'Strong Match'
    ? 'bg-emerald-500/12 text-emerald-600 ring-emerald-400/30 dark:text-emerald-300'
    : label === 'Good Match'
    ? 'bg-sky-500/12 text-sky-600 ring-sky-400/30 dark:text-sky-300'
    : 'bg-amber-500/12 text-amber-600 ring-amber-400/30 dark:text-amber-300';
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${c}`}>{label}</span>;
}

function AiMatchCard({ mentor, match }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="group relative flex h-full flex-col gap-3.5 overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 shadow-bridge-card transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/40 hover:shadow-[0_16px_40px_-12px_rgba(139,92,246,0.2)]">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-400/8 blur-3xl" />

      {/* Score badge */}
      <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(139,92,246,0.4)]">
          <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>
          {match.match_score}%
        </span>
        <MatchChip label={match.match_label} />
      </div>

      <div className="flex items-start gap-3 pr-24">
        <MentorAvatar name={mentor.name} size="card" className="rounded-xl ring-2 ring-[var(--bridge-canvas)] shadow-sm" />
        <div className="min-w-0 pt-0.5">
          <h3 className="truncate text-[14px] font-bold text-[var(--bridge-text)]">{mentor.name}</h3>
          <p className="truncate text-[12px] text-[var(--bridge-text-muted)]">{mentor.title}</p>
          <p className="mt-0.5 truncate text-[12px] font-medium text-[var(--bridge-text-secondary)]">{mentor.company}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <StarRating rating={mentor.rating} />
        {mentor.tier && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tierBadge(mentor.tier)}`}>{mentor.tier}</span>}
      </div>

      <p className="line-clamp-2 text-[12px] leading-relaxed text-[var(--bridge-text-secondary)]">{mentor.bio}</p>

      <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/60">
        <button type="button" onClick={() => setExpanded(v => !v)}
          className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[12px] font-semibold text-violet-600 transition hover:text-violet-700 dark:text-violet-400 ${focusRing}`}>
          Why this mentor?
          <svg className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {expanded && (
          <ul className="border-t border-[var(--bridge-border)] px-3.5 pb-3 pt-2.5 space-y-1.5">
            {match.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--bridge-text-secondary)]">
                <span className="mt-0.5 shrink-0 text-violet-500">•</span>{r}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-[var(--bridge-border)] pt-3.5">
        <span className="text-[11px] text-[var(--bridge-text-faint)]">{mentor.total_sessions} sessions</span>
        <Link to={`/mentors/${mentor.id}`}
          className={`inline-flex items-center gap-1 rounded-lg bg-[var(--bridge-surface-muted)] px-3.5 py-2 text-[12px] font-semibold text-[var(--bridge-text)] ring-1 ring-[var(--bridge-border)] transition hover:bg-[var(--bridge-surface-raised)] hover:ring-violet-400/40 ${focusRing}`}>
          View profile
          <svg className="h-3 w-3 text-[var(--bridge-text-faint)]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" /></svg>
        </Link>
      </div>
    </div>
  );
}

function AiHonorableCard({ mentor, match }) {
  return (
    <div className="group flex items-center gap-3.5 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-3.5 transition-all hover:-translate-y-0.5 hover:border-[var(--bridge-border-strong)] hover:shadow-bridge-card">
      <MentorAvatar name={mentor.name} size="sm" className="ring-2 ring-[var(--bridge-canvas)] shadow" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-[13px] font-semibold text-[var(--bridge-text)]">{mentor.name}</h4>
          <span className="shrink-0 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-300">{match.match_score}%</span>
        </div>
        <p className="truncate text-[12px] text-[var(--bridge-text-muted)]">{mentor.title} · {mentor.company}</p>
        {match.reason && <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--bridge-text-faint)]">{match.reason}</p>}
      </div>
      <Link to={`/mentors/${mentor.id}`}
        className={`shrink-0 rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-3 py-1.5 text-[11px] font-semibold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-raised)] ${focusRing}`}>
        View
      </Link>
    </div>
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────
function FetchErrorBanner({ message, onRetry }) {
  return (
    <div className="relative mb-6 flex items-start gap-4 overflow-hidden rounded-2xl border border-red-200/80 bg-red-50/90 px-5 py-4 shadow-sm dark:border-red-400/25 dark:bg-red-500/8">
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="font-semibold text-red-800 dark:text-red-200">Mentors didn't load</p>
        <p className="mt-0.5 text-[13px] text-red-700/80 dark:text-red-300/80">{message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry}
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-red-500 ${focusRing}`}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Mentors() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const asMentor  = user ? isMentorAccount(user) : false;

  const [search, setSearch]                   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeIndustry, setActiveIndustry]   = useState('');
  const [activeTier, setActiveTier]           = useState('');
  const [sortBy, setSortBy]                   = useState('rating');
  const [page, setPage]                       = useState(0);
  const [mentors, setMentors]                 = useState([]);
  const [totalCount, setTotalCount]           = useState(0);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [reloadKey, setReloadKey]             = useState(0);
  const [favoriteIds, setFavoriteIds]         = useState(() => new Set());
  const [favoriteBusyId, setFavoriteBusyId]   = useState(null);
  const [favoriteMessage, setFavoriteMessage] = useState(null);
  const [filterOpen, setFilterOpen]           = useState(false);
  const [sortOpen, setSortOpen]               = useState(false);
  const [rateMin, setRateMin]                 = useState('');
  const [rateMax, setRateMax]                 = useState('');
  const [availableOnly, setAvailableOnly]     = useState(false);
  const gridRef  = useRef(null);
  const sortRef  = useRef(null);

  const [showTiersModal, setShowTiersModal]   = useState(false);
  const [wizardOpen, setWizardOpen]           = useState(false);
  const [aiMode, setAiMode]                   = useState(false);
  const [aiLoading, setAiLoading]             = useState(false);
  const [aiError, setAiError]                 = useState(null);
  const [remainingUses, setRemainingUses]     = useState(null);
  const [aiResults, setAiResults]             = useState(null);
  const [allMentorsForAi, setAllMentorsForAi] = useState([]);
  const [savedMenteeProfile, setSavedMenteeProfile] = useState(null);
  const [prefillData, setPrefillData]         = useState(null);
  const didAutoOpenRef = useRef(false);

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 350); return () => clearTimeout(t); }, [search]);
  useEffect(() => { setPage(0); }, [debouncedSearch, activeIndustry, sortBy]);

  useEffect(() => {
    if (!user || isMentorAccount(user)) { setFavoriteIds(new Set()); return; }
    void getMyFavorites().then(({ data, error: e }) => {
      if (e) { const m = e.message || String(e); if (m.includes('favorites') || m.includes('schema cache') || m.includes('does not exist')) setFavoriteMessage("Hearts need a favorites table."); setFavoriteIds(new Set()); return; }
      setFavoriteMessage(null); setFavoriteIds(new Set(data ?? []));
    });
  }, [user]);

  useEffect(() => {
    if (!sortOpen) return;
    function outside(e) { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [sortOpen]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    void (async () => {
      const { data, error: fetchError, totalCount: count } = await getAllMentors({ search: debouncedSearch, industry: activeIndustry, sortBy, page, pageSize: PAGE_SIZE });
      if (cancelled) return;
      setLoading(false);
      if (fetchError) { setMentors([]); setTotalCount(0); setError(fetchError.message || 'Something went wrong.'); return; }
      setMentors(data ?? []); setTotalCount(count ?? 0);
    })();
    return () => { cancelled = true; };
  }, [debouncedSearch, activeIndustry, sortBy, page, reloadKey]);

  const loadMentors = useCallback(() => { setLoading(true); setError(null); setReloadKey(k => k + 1); }, []);

  async function handleAiMatchClick() {
    if (!user) { navigate('/login', { state: { message: 'Please log in to use AI mentor matching' } }); return; }
    if (await hasReachedLimit(user.id, 'mentor_match')) return;
    const { data: existing } = await loadMenteeAssessment(user.id);
    setPrefillData(existing ?? null); setWizardOpen(true);
  }

  useEffect(() => { if (!user || isMentorAccount(user)) return; void getRemainingUses(user.id, 'mentor_match').then(setRemainingUses); }, [user]);

  useEffect(() => {
    if (didAutoOpenRef.current) return;
    if (location.state?.openAIMatch && user) { didAutoOpenRef.current = true; navigate(location.pathname, { replace: true, state: {} }); handleAiMatchClick(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.state?.openAIMatch]);

  async function handleWizardComplete(formData) {
    setWizardOpen(false); setAiLoading(true); setAiError(null); setAiMode(true);
    try {
      const profilePayload = { current_position: formData.currentPosition, target_role: formData.targetRole, target_industry: formData.targetIndustry, years_experience: formData.yearsExperience, top_goals: formData.topGoals, session_types_needed: formData.sessionTypesNeeded, availability: formData.availability, bio_summary: formData.bioSummary, resume_uploaded: Boolean(formData.resumeBase64), assessment_completed_at: new Date().toISOString() };
      const { data: savedProfile } = await saveMenteeAssessment(user.id, profilePayload);
      setSavedMenteeProfile(savedProfile ?? profilePayload);
      const { data: mentorData } = await getAllMentors({ pageSize: 200 });
      const fetchedMentors = mentorData ?? [];
      setAllMentorsForAi(fetchedMentors);
      const results = await getAIMatchedMentors({ menteeProfile: savedProfile ?? profilePayload, mentors: fetchedMentors, resumeText: formData.resumeBase64 ?? null });
      setAiResults(results);
      try { await recordUsage(user.id, 'mentor_match'); setRemainingUses(prev => Math.max(0, (prev ?? 1) - 1)); } catch { /* non-fatal */ }
    } catch (e) { setAiError(e.message || 'Something went wrong. Please try again.'); }
    finally { setAiLoading(false); }
  }

  function exitAiMode() { setAiMode(false); setAiResults(null); setAiError(null); setAllMentorsForAi([]); }
  function getMentorById(id) { return allMentorsForAi.find(m => m.id === id) ?? mentors.find(m => m.id === id) ?? null; }

  const onToggleFavorite = useCallback(async mentorId => {
    const key = normalizeMentorId(mentorId);
    setFavoriteBusyId(key); setFavoriteMessage(null);
    const { error: err } = await toggleFavorite(mentorId);
    if (err) { const msg = err.message || String(err); setFavoriteMessage(msg.includes('favorites') || msg.includes('does not exist') || msg.includes('schema cache') ? 'Could not save — favorites table missing.' : msg); }
    const { data, error: reloadErr } = await getMyFavorites();
    if (!reloadErr && data) setFavoriteIds(new Set(data));
    setFavoriteBusyId(null);
  }, []);

  function changePage(next) {
    setLoading(true); setPage(next);
    const rect = gridRef.current?.getBoundingClientRect();
    if (rect && rect.top < 0) gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function resetFilters() { setSearch(''); setActiveIndustry(''); setActiveTier(''); setSortBy('rating'); setRateMin(''); setRateMax(''); setAvailableOnly(false); setPage(0); }

  const startIdx = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
  const endIdx   = Math.min((page + 1) * PAGE_SIZE, totalCount);
  const canPrev  = page > 0;
  const canNext  = endIdx < totalCount;
  const activeFilterCount = (activeIndustry ? 1 : 0) + (activeTier ? 1 : 0) + (debouncedSearch ? 1 : 0) + (rateMin !== '' || rateMax !== '' ? 1 : 0) + (availableOnly ? 1 : 0);
  const visibleMentors = mentors.filter(m => {
    if (asMentor && user?.id && m.user_id === user.id) return false;
    if (activeTier && m.tier !== activeTier) return false;
    if (rateMin !== '' && (m.session_rate == null || m.session_rate < Number(rateMin))) return false;
    if (rateMax !== '' && (m.session_rate == null || m.session_rate > Number(rateMax))) return false;
    if (availableOnly && !m.available) return false;
    return true;
  });

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden">

      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 70% 40% at 50% -10%, var(--bridge-aurora-1), transparent 60%)' }} />

      {/* ═══════════════════════════════════════════════════════════
          HERO HEADER
      ═══════════════════════════════════════════════════════════ */}
      {!aiMode && (
        <section className="relative overflow-hidden border-b border-[var(--bridge-border)] bg-[var(--bridge-canvas)] pb-5 pt-8">
          {/* Ambient orbs */}
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-12 h-64 w-64 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.22) 0%, transparent 70%)' }} />
          <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />

          <div className="relative mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3 py-1 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">
                    {totalCount > 0 ? `${totalCount} mentors available` : 'Browse mentors'}
                  </span>
                </div>
                <h1 className="font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl">
                  Find your <span className="text-gradient-bridge">mentor</span>
                </h1>
                <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[var(--bridge-text-muted)]">
                  Connect with professionals who've been where you want to go. Real advice, real experience.
                </p>
                <button type="button" onClick={() => setShowTiersModal(true)}
                  className={`mt-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--bridge-text-secondary)] shadow-sm transition hover:border-orange-400/50 hover:bg-orange-500/6 hover:text-orange-600 dark:hover:border-orange-400/40 dark:hover:text-orange-300 ${focusRing}`}>
                  <svg className="h-3.5 w-3.5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>
                  See Mentor Tiers
                </button>
              </div>

              {/* AI Match CTA in header */}
              {!asMentor && (
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  {remainingUses !== null && remainingUses > 0 && (
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: LIMITS.mentor_match }).map((_, i) => (
                        <span key={i} className={`h-1.5 w-1.5 rounded-full transition-all ${i < LIMITS.mentor_match - remainingUses ? 'bg-[var(--bridge-border-strong)]' : 'bg-violet-500 shadow-[0_0_4px_rgba(139,92,246,0.5)]'}`} />
                      ))}
                      <span className="text-[11px] text-[var(--bridge-text-faint)]">{remainingUses} use{remainingUses !== 1 ? 's' : ''} left</span>
                    </div>
                  )}
                  {remainingUses === 0 ? (
                    <span className="rounded-full border border-[var(--bridge-border)] px-4 py-2 text-[12px] font-medium text-[var(--bridge-text-faint)]">AI matching used up</span>
                  ) : (
                    <button type="button" onClick={handleAiMatchClick}
                      className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_16px_-4px_rgba(139,92,246,0.55)] transition hover:brightness-110 hover:shadow-[0_8px_24px_-4px_rgba(139,92,246,0.7)] ${focusRing}`}>
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>
                      AI Match
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STICKY CONTROL BAR
      ═══════════════════════════════════════════════════════════ */}
      <div className={`sticky top-[3.75rem] z-30 border-b border-[var(--bridge-border)] bg-[var(--bridge-canvas)]/95 backdrop-blur-xl sm:top-16 ${aiMode ? 'opacity-60 pointer-events-none' : ''}`}>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 dark:opacity-100"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(251,146,60,0.12) 40%, rgba(251,146,60,0.12) 60%, transparent)' }} />

        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">

          {/* Search + controls row */}
          <div className="flex items-center gap-2 py-2.5">

            {/* Search */}
            <div className="group relative flex-1">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--bridge-text-faint)] transition group-focus-within:text-orange-500"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input type="text" placeholder="Search by name, role, company…" value={search} onChange={e => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface)] py-0 pl-9 pr-8 text-[13px] text-[var(--bridge-text)] placeholder:text-[var(--bridge-text-faint)] transition focus:border-orange-400/60 focus:outline-none focus:shadow-[0_0_0_3px_rgba(251,146,60,0.12)]" />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear"
                  className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-[var(--bridge-text-faint)] transition hover:text-[var(--bridge-text)]">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>

            {/* Sort */}
            <div ref={sortRef} className="relative hidden sm:block">
              <button type="button" onClick={() => setSortOpen(o => !o)} aria-haspopup="listbox" aria-expanded={sortOpen}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3 text-[12px] font-medium text-[var(--bridge-text-secondary)] transition hover:border-[var(--bridge-border-strong)] hover:text-[var(--bridge-text)] ${focusRing}`}>
                <svg className="h-3.5 w-3.5 shrink-0 text-[var(--bridge-text-faint)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h18M6 12h12M10 16.5h4" /></svg>
                <span className="hidden lg:inline">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
                <span className="lg:hidden">Sort</span>
                <svg className={`h-3 w-3 shrink-0 text-[var(--bridge-text-faint)] transition-transform ${sortOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
              </button>
              {sortOpen && (
                <div role="listbox" className="animate-pop-in absolute right-0 top-full z-20 mt-1.5 w-48 overflow-hidden rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)] shadow-bridge-float backdrop-blur-xl">
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent" />
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" role="option" aria-selected={sortBy === opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] transition ${sortBy === opt.value ? 'bg-[var(--bridge-surface-muted)] font-semibold text-[var(--bridge-text)]' : 'text-[var(--bridge-text-secondary)] hover:bg-[var(--bridge-surface-muted)]'} ${focusRing}`}>
                      {opt.label}
                      {sortBy === opt.value && (
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-orange-500 text-white" aria-hidden>
                          <svg className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter toggle */}
            <button type="button" onClick={() => setFilterOpen(o => !o)} aria-expanded={filterOpen}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-medium transition ${filterOpen || activeFilterCount > 0 ? 'border-orange-400/50 bg-orange-500/8 text-orange-600 dark:text-orange-300' : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)] hover:border-[var(--bridge-border-strong)] hover:text-[var(--bridge-text)]'} ${focusRing}`}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">{activeFilterCount}</span>
              )}
            </button>

            {/* Divider */}
            <div className="hidden h-5 w-px bg-[var(--bridge-border)] sm:block" />

            {/* Industry chips row label (hidden, shown below) */}
            {activeFilterCount > 0 && (
              <button type="button" onClick={resetFilters}
                className={`hidden items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-[var(--bridge-text-faint)] transition hover:text-[var(--bridge-text)] sm:inline-flex ${focusRing}`}>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" /></svg>
                Clear
              </button>
            )}
          </div>

          {/* Industry chips */}
          <div className="flex gap-1 overflow-x-auto pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {INDUSTRIES.map(({ label, value }) => (
              <button key={value || 'all'} type="button" onClick={() => { setActiveIndustry(value); setPage(0); }}
                className={`inline-flex shrink-0 items-center rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
                  activeIndustry === value
                    ? 'bg-[var(--bridge-text)] text-[var(--bridge-canvas)]'
                    : 'text-[var(--bridge-text-muted)] hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)]'
                } ${focusRing}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Collapsible advanced filters */}
        {filterOpen && (
          <div className="border-t border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/40">
            <div className="mx-auto max-w-[90rem] px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-start gap-6">

                {/* Tier */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-faint)]">Tier</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TIERS.map(({ label, value }) => (
                      <button key={value || 'all-t'} type="button" onClick={() => setActiveTier(value)}
                        className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition ${activeTier === value ? 'bg-[var(--bridge-text)] text-[var(--bridge-canvas)]' : 'border border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)] hover:bg-[var(--bridge-surface-muted)]'} ${focusRing}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rate */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-faint)]">Rate / session</p>
                  <div className="flex items-center gap-2">
                    {[['rateMin', rateMin, setRateMin, 'Min'], ['rateMax', rateMax, setRateMax, 'Max']].map(([key, val, set, ph]) => (
                      <div key={key} className="relative">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[var(--bridge-text-faint)]">$</span>
                        <input type="number" min="0" placeholder={ph} value={val} onChange={e => set(e.target.value)} aria-label={`${ph} rate`}
                          className="w-20 rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface)] py-1.5 pl-5 pr-2.5 text-[13px] text-[var(--bridge-text)] placeholder:text-[var(--bridge-text-faint)] focus:border-orange-400/60 focus:outline-none" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available toggle */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-faint)]">Status</p>
                  <button type="button" role="switch" aria-checked={availableOnly} onClick={() => setAvailableOnly(v => !v)}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-medium transition ${availableOnly ? 'bg-emerald-500/12 text-emerald-600 ring-1 ring-emerald-400/30 dark:text-emerald-300' : 'border border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)]'} ${focusRing}`}>
                    <span className={`flex h-3 w-5 rounded-full transition-colors ${availableOnly ? 'bg-emerald-500' : 'bg-[var(--bridge-border-strong)]'}`}>
                      <span className={`m-0.5 h-2 w-2 rounded-full bg-white shadow transition-transform ${availableOnly ? 'translate-x-2' : ''}`} />
                    </span>
                    Available now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          AI MODE
      ═══════════════════════════════════════════════════════════ */}
      {aiMode && (
        <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
          {aiLoading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] py-24 text-center shadow-bridge-card">
              <div className="animate-blob-breathe relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-[0_0_32px_rgba(139,92,246,0.4)]">
                <svg className="h-8 w-8 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="mt-5 font-display text-xl font-bold text-[var(--bridge-text)]">Finding your best mentors…</p>
              <p className="mt-1.5 text-[13px] text-[var(--bridge-text-muted)]">Our AI is reviewing all profiles for you.</p>
            </div>
          )}

          {!aiLoading && aiError && (
            <div className="rounded-2xl border border-red-200/80 bg-red-50/90 px-6 py-8 text-center dark:border-red-400/25 dark:bg-red-500/8">
              <p className="font-semibold text-red-800 dark:text-red-200">Something went wrong.</p>
              <p className="mt-1 text-[13px] text-red-700/80 dark:text-red-300/80">{aiError}</p>
              <div className="mt-5 flex items-center justify-center gap-2.5">
                <button type="button" onClick={() => { setAiError(null); handleAiMatchClick(); }}
                  className={`rounded-full bg-red-600 px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-red-500 ${focusRing}`}>Retry</button>
                <button type="button" onClick={exitAiMode}
                  className={`rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-2 text-[13px] font-semibold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] ${focusRing}`}>← Browse all</button>
              </div>
            </div>
          )}

          {!aiLoading && !aiError && aiResults && (
            <>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-violet-600 dark:text-violet-300">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>
                    AI-Powered Matches
                  </div>
                  <h2 className="font-display text-2xl font-bold text-[var(--bridge-text)] sm:text-3xl">Your Top Mentor Matches</h2>
                  {savedMenteeProfile && (
                    <p className="mt-1.5 text-[13px] text-[var(--bridge-text-muted)]">
                      Goal: <span className="font-semibold text-[var(--bridge-text)]">{savedMenteeProfile.target_role ?? 'your target role'}</span>
                      {savedMenteeProfile.target_industry && <> in <span className="font-semibold text-[var(--bridge-text)]">{savedMenteeProfile.target_industry}</span></>}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleAiMatchClick}
                    className={`rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2 text-[13px] font-medium text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] ${focusRing}`}>Retake</button>
                  <button type="button" onClick={exitAiMode}
                    className={`rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2 text-[13px] font-medium text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] ${focusRing}`}>← Browse all</button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {aiResults.top_matches.map(match => {
                  const mentor = getMentorById(match.mentor_id);
                  if (!mentor) return null;
                  return <AiMatchCard key={match.mentor_id} mentor={mentor} match={match} />;
                })}
              </div>

              {aiResults.honorable_mentions.length > 0 && (
                <div className="mt-10">
                  <h3 className="mb-4 font-display text-lg font-bold text-[var(--bridge-text-secondary)]">Honorable Mentions</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {aiResults.honorable_mentions.map(match => {
                      const mentor = getMentorById(match.mentor_id);
                      if (!mentor) return null;
                      return <AiHonorableCard key={match.mentor_id} mentor={mentor} match={match} />;
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MENTOR GRID
      ═══════════════════════════════════════════════════════════ */}
      <div ref={gridRef} className={`mx-auto max-w-[90rem] scroll-mt-28 px-4 py-6 sm:px-6 lg:px-8 ${aiMode ? 'hidden' : ''}`}>

        {asMentor && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-500/6 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
            <p className="text-[13px] text-amber-700 dark:text-amber-300">
              You're signed in as a mentor.{' '}
              <Link to="/dashboard" className={`font-semibold underline underline-offset-2 hover:no-underline ${focusRing} rounded-sm`}>Open your dashboard →</Link>
            </p>
          </div>
        )}

        {favoriteMessage && (
          <div className="mb-5 rounded-xl border border-amber-400/25 bg-amber-500/6 px-4 py-3 text-[13px] text-amber-700 dark:text-amber-300" role="status">{favoriteMessage}</div>
        )}

        {error && <FetchErrorBanner message={error} onRetry={loadMentors} />}

        {/* Count + pagination top */}
        {!loading && !error && totalCount > 0 && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-[var(--bridge-text-muted)]">
              Showing <span className="font-semibold text-[var(--bridge-text)]">{startIdx}–{endIdx}</span> of <span className="font-semibold text-[var(--bridge-text)]">{totalCount}</span> mentors
              {activeFilterCount > 0 && <span className="ml-2 text-[11px] text-[var(--bridge-text-faint)]">· filtered</span>}
            </p>
            {(canPrev || canNext) && (
              <div className="flex items-center gap-2">
                <button type="button" disabled={!canPrev} onClick={() => changePage(Math.max(0, page - 1))}
                  className={`rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 text-[12px] font-medium text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}>← Prev</button>
                <span className="rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-3 py-1.5 text-[12px] font-semibold text-[var(--bridge-text-faint)]">{page + 1}</span>
                <button type="button" disabled={!canNext} onClick={() => changePage(page + 1)}
                  className={`rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 text-[12px] font-medium text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}>Next →</button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <MentorGridSkeleton />
        ) : visibleMentors.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleMentors.map((mentor, i) => (
                <Reveal key={mentor.id} delay={Math.min(i * 25, 120)} className="h-full">
                  <MentorCard mentor={mentor} isFavorite={favoriteIds.has(normalizeMentorId(mentor.id))}
                    onToggleFavorite={onToggleFavorite} user={user} navigate={navigate}
                    favoriteBusy={favoriteBusyId === normalizeMentorId(mentor.id)} favoritesEnabled={!asMentor} />
                </Reveal>
              ))}
            </div>

            {(canPrev || canNext) && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button type="button" disabled={!canPrev} onClick={() => changePage(Math.max(0, page - 1))}
                  className={`rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-2.5 text-[13px] font-medium text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}>← Previous</button>
                <span className="rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-2 text-[12px] font-bold text-[var(--bridge-text-faint)]">Page {page + 1}</span>
                <button type="button" disabled={!canNext} onClick={() => changePage(page + 1)}
                  className={`rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-2.5 text-[13px] font-medium text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}>Next →</button>
              </div>
            )}
          </div>
        ) : !error ? (
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--bridge-border)] bg-[var(--bridge-surface)]/60 px-6 py-24 text-center">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)]">
              <svg className="h-6 w-6 text-[var(--bridge-text-faint)]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>
            </div>
            <p className="relative mt-4 font-display text-xl font-bold text-[var(--bridge-text)]">Nobody fits that combo</p>
            <p className="relative mt-2 max-w-sm text-[13px] leading-relaxed text-[var(--bridge-text-muted)]">Try loosening a filter or using a different keyword.</p>
            <button type="button" onClick={resetFilters}
              className={`relative mt-5 rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-2 text-[13px] font-medium text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] ${focusRing}`}>
              Reset filters
            </button>
          </div>
        ) : null}
      </div>

      {wizardOpen && (
        <MentorMatchWizard prefill={prefillData} onComplete={handleWizardComplete} onClose={() => setWizardOpen(false)} />
      )}
      {showTiersModal && <MentorTiersModal onClose={() => setShowTiersModal(false)} />}
    </main>
  );
}
