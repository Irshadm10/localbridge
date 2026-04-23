import { useState, useEffect, useCallback, useId, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAllMentors } from '../api/mentors';
import MentorAvatar from '../components/MentorAvatar';
import { getMyFavorites, toggleFavorite } from '../api/favorites';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import Reveal from '../components/Reveal';
import { focusRing } from '../ui';
import MentorMatchWizard from '../components/MentorMatchWizard';
import { getAIMatchedMentors, saveMenteeAssessment, loadMenteeAssessment } from '../api/aiMatching';

const PAGE_SIZE = 12;
const focusRingDarkChip =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900';

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

function tierBadgeClasses(tier) {
  switch (tier) {
    case 'rising':      return 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/30';
    case 'established': return 'bg-sky-50 text-sky-800 border border-sky-200/80 dark:bg-sky-500/15 dark:text-sky-200 dark:border-sky-400/30';
    case 'expert':      return 'bg-violet-50 text-violet-800 border border-violet-200/80 dark:bg-violet-500/15 dark:text-violet-200 dark:border-violet-400/30';
    case 'elite':       return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_4px_14px_-2px_rgba(234,88,12,0.55)]';
    default:            return 'bg-stone-100 text-stone-600 dark:bg-white/[0.06] dark:text-stone-300';
  }
}

const SORT_OPTIONS = [
  { label: 'Best reviews first', value: 'rating' },
  { label: 'Most years in the game', value: 'experience' },
  { label: 'Most sessions logged', value: 'sessions' },
];

function normalizeMentorId(id) {
  return id == null ? '' : String(id).toLowerCase();
}

function StarRating({ rating }) {
  const uid = useId().replace(/:/g, '');
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
      <span className="flex items-center gap-1">
      <span className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill =
              i < full ? '100%' : i === full && partial > 0 ? `${Math.round(partial * 100)}%` : '0%';
          const gid = `${uid}-star-${i}`;
          return (
              <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 20 20" aria-hidden>
                <defs>
                  <linearGradient id={gid}>
                    <stop offset={fill} stopColor="#d97706" />
                    <stop offset={fill} stopColor="#d4d4d4" />
                  </linearGradient>
                </defs>
                <polygon
                    points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
                    fill={`url(#${gid})`}
                />
              </svg>
          );
        })}
      </span>
      <span className="text-xs font-medium text-stone-500">{rating.toFixed(1)}</span>
    </span>
  );
}

function MentorGridSkeleton() {
  return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
            <div
                key={i}
                className="relative flex h-[340px] flex-col overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-orange-200/15 to-transparent dark:via-orange-400/10"
                style={{ animation: 'bridge-sheen 2.2s ease-in-out infinite' }}
              />
              <div className="relative flex gap-4">
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-[var(--bridge-surface-muted)] animate-pulse" />
                <div className="flex-1 space-y-2.5 pt-1">
                  <div className="h-4 w-3/4 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
                  <div className="h-3 w-1/2 rounded-full bg-[var(--bridge-surface-muted)]/70 animate-pulse" />
                  <div className="h-3 w-1/3 rounded-full bg-amber-100/60 animate-pulse dark:bg-amber-500/15" />
                </div>
              </div>
              <div className="relative mt-5 flex items-center justify-between">
                <div className="h-3 w-24 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-[var(--bridge-surface-muted)]/70 animate-pulse" />
              </div>
              <div className="relative mt-5 space-y-2">
                <div className="h-3 w-full rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
                <div className="h-3 w-5/6 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
              </div>
              <div className="relative mt-5 flex gap-1.5">
                <div className="h-6 w-20 rounded-full bg-orange-100/70 animate-pulse dark:bg-orange-500/15" />
                <div className="h-6 w-16 rounded-full bg-orange-100/70 animate-pulse dark:bg-orange-500/15" />
                <div className="h-6 w-24 rounded-full bg-orange-100/70 animate-pulse dark:bg-orange-500/15" />
              </div>
              <div className="relative mt-auto flex items-center justify-between border-t border-[var(--bridge-border)] pt-4">
                <div className="space-y-1.5">
                  <div className="h-3 w-16 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
                  <div className="h-4 w-24 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
                </div>
                <div className="h-10 w-32 rounded-full bg-stone-900/10 animate-pulse dark:bg-white/[0.08]" />
              </div>
            </div>
        ))}
      </div>
  );
}

function HeartButton({ filled, onClick, label, disabled }) {
  return (
      <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
          }}
          className={`group/heart relative rounded-full bg-[var(--bridge-surface)]/95 p-2.5 text-[var(--bridge-text-muted)] shadow-sm ring-1 ring-[var(--bridge-border)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:bg-rose-50 hover:text-rose-500 hover:ring-rose-300/60 hover:shadow-[0_8px_22px_-4px_rgba(244,63,94,0.35)] disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-rose-500/10 dark:hover:ring-rose-400/40 ${focusRing}`}
          aria-label={label}
      >
        {filled ? (
            <svg className="h-5 w-5 fill-rose-500 text-rose-500 drop-shadow-[0_2px_6px_rgba(244,63,94,0.45)]" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        ) : (
            <svg className="h-5 w-5 transition group-hover/heart:fill-rose-500/20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        )}
      </button>
  );
}

function MentorCard({ mentor, isFavorite, onToggleFavorite, user, navigate, favoriteBusy, favoritesEnabled = true }) {
  function handleHeart() {
    if (!user) {
      navigate('/login', { state: { from: '/mentors' } });
      return;
    }
    onToggleFavorite(mentor.id);
  }

  return (
      <div
        data-tilt="5"
        className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card tilt-card cursor-glow transition-[box-shadow,border-color] duration-500 hover:border-orange-300/60 hover:shadow-bridge-glow"
      >
        {/* Hover aurora */}
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-orange-400/20 via-amber-300/10 to-transparent opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/80 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        {favoritesEnabled ? (
            <div className="absolute right-4 top-5 z-[2]">
              <HeartButton
                  filled={isFavorite}
                  disabled={Boolean(favoriteBusy)}
                  onClick={handleHeart}
                  label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              />
            </div>
        ) : null}

        <div className={`relative flex items-start gap-4 ${favoritesEnabled ? 'pr-14' : ''}`}>
          <MentorAvatar
            name={mentor.name}
            size="card"
            className="shadow-md ring-2 ring-[var(--bridge-canvas)] transition group-hover:scale-[1.04]"
          />
          <div className="min-w-0 pt-1">
            <h3 className="truncate font-display text-lg font-semibold text-[var(--bridge-text)] transition group-hover:text-orange-800 dark:group-hover:text-orange-200">
              {mentor.name}
            </h3>
            <p className="truncate text-sm text-[var(--bridge-text-muted)]">{mentor.title}</p>
            <p className="inline-flex max-w-full items-center gap-1 truncate text-sm font-semibold text-amber-700 dark:text-amber-300">
              <span className="h-1 w-1 shrink-0 rounded-full bg-amber-500" aria-hidden />
              <span className="truncate">{mentor.company}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <StarRating rating={mentor.rating} />
          <div className="flex items-center gap-2">
            {mentor.tier ? (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tierBadgeClasses(mentor.tier)}`}>
                  {mentor.tier.charAt(0).toUpperCase() + mentor.tier.slice(1)}
                </span>
            ) : null}
            <span className="text-xs text-stone-400">{mentor.years_experience} yrs in</span>
          </div>
        </div>

        <p className="relative line-clamp-2 text-sm leading-relaxed text-[var(--bridge-text-secondary)]">{mentor.bio}</p>

        <div className="relative flex flex-wrap gap-1.5">
          {mentor.expertise.slice(0, 3).map((tag) => (
              <span
                  key={tag}
                  className="rounded-full border border-orange-200/70 bg-orange-50/80 px-2.5 py-0.5 text-xs font-semibold text-orange-900 dark:border-orange-400/25 dark:bg-orange-500/10 dark:text-orange-200"
              >
            {tag}
          </span>
          ))}
          {mentor.expertise.length > 3 && (
              <span className="rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--bridge-text-muted)]">
            +{mentor.expertise.length - 3}
          </span>
          )}
        </div>

        <div className="relative mt-auto flex items-center justify-between border-t border-[var(--bridge-border)] pt-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--bridge-text-muted)]">
              {mentor.total_sessions} sessions
            </span>
            {mentor.session_rate ? (
                <span className="font-display text-base font-semibold tabular-nums text-[var(--bridge-text)]">
                  ${mentor.session_rate}
                  <span className="text-xs font-normal text-[var(--bridge-text-muted)]"> / session</span>
                </span>
            ) : null}
          </div>
          <Link
              to={`/mentors/${mentor.id}`}
              className={`btn-sheen inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-4 py-2.5 text-sm font-semibold text-amber-50 shadow-[0_8px_22px_-6px_rgba(28,25,23,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(28,25,23,0.55)] dark:from-orange-500 dark:to-amber-500 dark:text-stone-950 dark:shadow-[0_10px_26px_-6px_rgba(234,88,12,0.55)] ${focusRing}`}
          >
            Open profile
            <svg className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
  );
}

function FetchErrorBanner({ message, onRetry }) {
  return (
      <div className="relative mb-8 flex items-start gap-4 overflow-hidden rounded-[1.75rem] border border-red-200/80 bg-red-50/95 px-6 py-5 text-sm text-red-900 shadow-[0_12px_32px_-10px_rgba(239,68,68,0.3)] dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/15 blur-3xl" />
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 text-white shadow">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <div className="relative min-w-0 flex-1">
          <p className="font-display text-lg font-semibold">Mentors didn&apos;t load</p>
          <p className="mt-1 text-red-800/90 dark:text-red-300/90">That&apos;s usually us or the Wi‑Fi. Want to try once more?</p>
          <p className="mt-2 truncate font-mono text-xs text-red-700/70 dark:text-red-300/70">{message}</p>
          {onRetry ? (
              <button
                  type="button"
                  onClick={onRetry}
                  className={`btn-sheen mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_-4px_rgba(239,68,68,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-6px_rgba(239,68,68,0.65)] ${focusRing}`}
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Retry
              </button>
          ) : null}
        </div>
      </div>
  );
}

function MatchLabelChip({ label }) {
  const colors =
    label === 'Strong Match'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/30'
      : label === 'Good Match'
      ? 'bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-500/15 dark:text-sky-200 dark:border-sky-400/30'
      : 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-400/30';
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${colors}`}>
      {label}
    </span>
  );
}

function AiMatchCard({ mentor, match, navigate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-[1.75rem] border border-transparent border-gradient-bridge animate-border-bridge bg-gradient-to-br from-[var(--bridge-surface)] via-[var(--bridge-surface)] to-orange-50/30 p-6 shadow-[0_20px_54px_-18px_rgba(234,88,12,0.35)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_-20px_rgba(234,88,12,0.5)] dark:to-orange-500/[0.06]">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-orange-400/25 to-amber-300/10 blur-3xl" />

      {/* Match score badge */}
      <div className="absolute right-4 top-4 z-[2] flex flex-col items-end gap-1.5">
        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-3 py-1 text-xs font-bold text-white shadow-[0_8px_22px_-4px_rgba(234,88,12,0.55)]">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          {match.match_score}% Match
        </span>
        <MatchLabelChip label={match.match_label} />
      </div>

      <div className="flex items-start gap-4 pr-24">
        <MentorAvatar name={mentor.name} size="md" className="ring-2 ring-white shadow-md" />
        <div className="min-w-0 pt-0.5">
          <h3 className="truncate font-semibold text-stone-900">{mentor.name}</h3>
          <p className="truncate text-sm text-stone-500">{mentor.title}</p>
          <p className="truncate text-sm font-medium text-amber-800">{mentor.company}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <StarRating rating={mentor.rating} />
        {mentor.tier ? (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tierBadgeClasses(mentor.tier)}`}>
            {mentor.tier.charAt(0).toUpperCase() + mentor.tier.slice(1)}
          </span>
        ) : null}
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-stone-600">{mentor.bio}</p>

      {/* "Why this mentor?" expandable */}
      <div className="rounded-xl border border-amber-100 bg-amber-50/40">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold text-amber-800 transition hover:text-amber-900 ${focusRing}`}
        >
          Why this mentor?
          <svg
            className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {expanded && (
          <ul className="border-t border-amber-100 px-4 pb-3 pt-2 space-y-1.5">
            {match.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-stone-700">
                <span className="mt-0.5 shrink-0 text-amber-500">•</span>
                {r}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-stone-100/90 pt-4">
        <span className="text-xs text-stone-400">{mentor.total_sessions} sessions</span>
        <Link
          to={`/mentors/${mentor.id}`}
          className={`rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-4 py-2 text-sm font-semibold text-amber-50 shadow-md transition hover:from-stone-800 hover:to-stone-700 ${focusRing}`}
        >
          Open profile
        </Link>
      </div>
    </div>
  );
}

function AiHonorableCard({ mentor, match }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white/95 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200/60 hover:shadow-md">
      <MentorAvatar name={mentor.name} size="sm" className="ring-2 ring-white shadow" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-semibold text-stone-900">{mentor.name}</h4>
          <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            {match.match_score}%
          </span>
        </div>
        <p className="truncate text-xs text-stone-500">{mentor.title} · {mentor.company}</p>
        <p className="mt-1 line-clamp-2 text-xs text-stone-600">{match.reason}</p>
      </div>
      <Link
        to={`/mentors/${mentor.id}`}
        className={`shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition hover:border-orange-300/70 ${focusRing}`}
      >
        View
      </Link>
    </div>
  );
}

export default function Mentors() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const asMentor = user ? isMentorAccount(user) : false;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeIndustry, setActiveIndustry] = useState('');
  const [activeTier, setActiveTier] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(0);
  const [mentors, setMentors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [favoriteBusyId, setFavoriteBusyId] = useState(null);
  const [favoriteMessage, setFavoriteMessage] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [rateMin, setRateMin] = useState('');
  const [rateMax, setRateMax] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const gridRef = useRef(null);
  const sortRef = useRef(null);

  // ── AI Match state ──────────────────────────────────────────────────────────
  const [wizardOpen, setWizardOpen] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResults, setAiResults] = useState(null); // { top_matches, honorable_mentions }
  const [allMentorsForAi, setAllMentorsForAi] = useState([]);
  const [savedMenteeProfile, setSavedMenteeProfile] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  const didAutoOpenRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- pagination must reset when filters change */
    setPage(0);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [debouncedSearch, activeIndustry, sortBy]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- sync favorites with auth session */
    if (!user || isMentorAccount(user)) {
      setFavoriteIds(new Set());
      return;
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    void getMyFavorites().then(({ data, error: favErr }) => {
      if (favErr) {
        const msg = favErr.message || String(favErr);
        if (msg.includes('favorites') || msg.includes('schema cache') || msg.includes('does not exist')) {
          setFavoriteMessage(
              "Hearts need a favorites table in Supabase. If you're the admin, run bridge_schema.sql — we can't fake that on the frontend.",
          );
        }
        setFavoriteIds(new Set());
        return;
      }
      setFavoriteMessage(null);
      setFavoriteIds(new Set(data ?? []));
    });
  }, [user]);

  useEffect(() => {
    if (!sortOpen) return;
    function handleOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [sortOpen]);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    void (async () => {
      const { data, error: fetchError, totalCount: count } = await getAllMentors({
        search: debouncedSearch,
        industry: activeIndustry,
        sortBy,
        page,
        pageSize: PAGE_SIZE,
      });
      if (cancelled) return;
      setLoading(false);
      if (fetchError) {
        setMentors([]);
        setTotalCount(0);
        setError(fetchError.message || 'Something went wrong.');
        return;
      }
      setMentors(data ?? []);
      setTotalCount(count ?? 0);
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, activeIndustry, sortBy, page, reloadKey]);

  const loadMentors = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  async function handleAiMatchClick() {
    if (!user) {
      navigate('/login', { state: { message: 'Please log in to use AI mentor matching' } });
      return;
    }
    const { data: existing } = await loadMenteeAssessment(user.id);
    setPrefillData(existing ?? null);
    setWizardOpen(true);
  }

  // Auto-open wizard when navigated here from Resume Review page
  useEffect(() => {
    if (didAutoOpenRef.current) return;
    if (location.state?.openAIMatch && user) {
      didAutoOpenRef.current = true;
      navigate(location.pathname, { replace: true, state: {} });
      handleAiMatchClick();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.state?.openAIMatch]);

  async function handleWizardComplete(formData) {
    setWizardOpen(false);
    setAiLoading(true);
    setAiError(null);
    setAiMode(true);

    try {
      const profilePayload = {
        current_position: formData.currentPosition,
        target_role: formData.targetRole,
        target_industry: formData.targetIndustry,
        years_experience: formData.yearsExperience,
        top_goals: formData.topGoals,
        session_types_needed: formData.sessionTypesNeeded,
        availability: formData.availability,
        bio_summary: formData.bioSummary,
        resume_uploaded: Boolean(formData.resumeBase64),
        assessment_completed_at: new Date().toISOString(),
      };

      const { data: savedProfile } = await saveMenteeAssessment(user.id, profilePayload);
      setSavedMenteeProfile(savedProfile ?? profilePayload);

      const { data: mentorData } = await getAllMentors({ pageSize: 200 });
      const fetchedMentors = mentorData ?? [];
      setAllMentorsForAi(fetchedMentors);

      const results = await getAIMatchedMentors({
        menteeProfile: savedProfile ?? profilePayload,
        mentors: fetchedMentors,
        resumeText: formData.resumeBase64 ?? null,
      });

      setAiResults(results);
    } catch (e) {
      setAiError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }

  function exitAiMode() {
    setAiMode(false);
    setAiResults(null);
    setAiError(null);
    setAllMentorsForAi([]);
  }

  function getMentorById(id) {
    return allMentorsForAi.find((m) => m.id === id) ?? mentors.find((m) => m.id === id) ?? null;
  }

  const onToggleFavorite = useCallback(async (mentorId) => {
    const key = normalizeMentorId(mentorId);
    setFavoriteBusyId(key);
    setFavoriteMessage(null);

    const { error: err } = await toggleFavorite(mentorId);

    if (err) {
      const msg = err.message || String(err);
      setFavoriteMessage(
          msg.includes('favorites') || msg.includes('does not exist') || msg.includes('schema cache')
              ? 'Could not save that — favorites table missing in Supabase (see bridge_schema.sql).'
              : msg,
      );
    }

    const { data, error: reloadErr } = await getMyFavorites();
    if (!reloadErr && data) {
      setFavoriteIds(new Set(data));
    }

    setFavoriteBusyId(null);
  }, []);

  function changePage(nextPage) {
    setLoading(true); // Immediate loading state for better feedback
    setPage(nextPage);

    // Only scroll back to the top of the grid if the top is currently off-screen (e.g. user is at the bottom pagination)
    const rect = gridRef.current?.getBoundingClientRect();
    if (rect && rect.top < 0) {
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function resetFilters() {
    setSearch('');
    setActiveIndustry('');
    setActiveTier('');
    setSortBy('rating');
    setRateMin('');
    setRateMax('');
    setAvailableOnly(false);
    setPage(0);
  }

  const startIdx = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
  const endIdx = Math.min((page + 1) * PAGE_SIZE, totalCount);
  const canPrev = page > 0;
  const canNext = endIdx < totalCount;
  const activeFilterCount =
    (activeIndustry ? 1 : 0) +
    (activeTier ? 1 : 0) +
    (debouncedSearch ? 1 : 0) +
    (rateMin !== '' || rateMax !== '' ? 1 : 0) +
    (availableOnly ? 1 : 0);
  const visibleMentors = mentors.filter((m) => {
    if (asMentor && user?.id && m.user_id === user.id) return false;
    if (activeTier && m.tier !== activeTier) return false;
    if (rateMin !== '' && (m.session_rate == null || m.session_rate < Number(rateMin))) return false;
    if (rateMax !== '' && (m.session_rate == null || m.session_rate > Number(rateMax))) return false;
    if (availableOnly && !m.available) return false;
    return true;
  });

  return (
      <main id="mentors-directory" aria-label="Mentor directory" data-route-atmo="mentors" className="relative isolate min-h-screen overflow-x-hidden">
        <PageGutterAtmosphere />

        {/* Compact top strip — title + count + inline search/sort + filter toggle.
          Everything fits in ~140px so mentors appear immediately below. */}
        <section
            aria-labelledby="mentors-heading"
            className="bridge-hero-strip relative px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8"
        >
          <div aria-hidden className="bridge-ambient-orb absolute -right-16 -top-12 h-56 w-56" />
          <div className="relative mx-auto max-w-bridge">
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--bridge-text-muted)]">
                <li>
                  <Link
                      to="/"
                      className={`rounded-md font-medium text-[var(--bridge-text-secondary)] transition hover:text-orange-700 dark:hover:text-orange-400 ${focusRing}`}
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden className="text-[var(--bridge-text-faint)]">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                  </svg>
                </li>
                <li className="font-medium text-[var(--bridge-text)]">Mentors</li>
              </ol>
            </nav>

            {asMentor ? (
                <div className="mb-6 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/95 to-orange-50/50 px-4 py-4 shadow-sm sm:px-5 sm:py-4">
                  <p className="text-sm font-semibold text-amber-950">Signed in as a mentor</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-amber-950/85">
                    Browse profiles for inspiration or market context—you can&apos;t book sessions or save favorites on this account. Incoming requests and your calendar live on your dashboard.
                  </p>
                  <Link
                      to="/dashboard"
                      className={`mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-900 underline decoration-orange-300/60 underline-offset-2 hover:text-orange-950 ${focusRing} rounded-sm`}
                  >
                    Open mentor dashboard
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </div>
            ) : null}

            <div className="flex flex-col gap-5 pb-6 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-secondary)] shadow-sm backdrop-blur-md">
                  <span className="relative flex h-1.5 w-1.5">
                    <span aria-hidden className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 animate-pulse-soft" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.55)]" />
                  </span>
                  Live directory
                </div>
                <h1
                    id="mentors-heading"
                    className="font-display text-[2.25rem] font-bold leading-[1.08] tracking-[-0.012em] text-[var(--bridge-text)] sm:text-[2.75rem]"
                >
                  Browse <span className="font-editorial italic text-gradient-bridge">mentors</span>
                </h1>
                <p className="mt-2 text-sm text-[var(--bridge-text-secondary)] sm:text-base">
                  {loading ? (
                      <span className="text-[var(--bridge-text-muted)]">Loading the directory…</span>
                  ) : (
                      <>
                        <span className="font-display text-lg font-semibold tabular-nums text-[var(--bridge-text)]">{totalCount.toLocaleString()}</span>{' '}
                        {totalCount === 1 ? 'person' : 'people'} ready to talk
                        {activeFilterCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/70 bg-orange-50/80 px-2 py-0.5 text-[11px] font-bold text-orange-900 dark:border-orange-400/30 dark:bg-orange-500/15 dark:text-orange-200">
                              <span className="h-1 w-1 rounded-full bg-orange-500" /> filtered
                            </span>
                        ) : null}
                      </>
                  )}
                </p>
              </div>

              {/* Inline control cluster — search + sort + filter toggle */}
              <div className={`flex flex-col gap-2.5 sm:flex-row sm:items-center ${aiMode ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="group relative flex-1 sm:w-80 sm:flex-initial">
                  <svg
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bridge-text-faint)] transition group-focus-within:text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                      type="text"
                      placeholder="Search by name, role, company…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-full border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] py-2.5 pl-11 pr-10 text-sm text-[var(--bridge-text)] shadow-sm placeholder:text-[var(--bridge-text-faint)] transition focus:border-orange-400 focus:outline-none focus:shadow-[0_0_0_4px_rgba(251,146,60,0.2)]"
                  />
                  {search ? (
                      <button
                          type="button"
                          onClick={() => setSearch('')}
                          className={`absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--bridge-text-muted)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] ${focusRing}`}
                          aria-label="Clear search"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                  ) : null}
                </div>

                {!asMentor ? (
                  <button
                    type="button"
                    onClick={handleAiMatchClick}
                    className={`btn-sheen group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_26px_-6px_rgba(234,88,12,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-8px_rgba(234,88,12,0.7)] ${focusRing}`}
                  >
                    <svg className="h-4 w-4 transition group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                    </svg>
                    AI Match
                  </button>
                ) : null}

                <div className="flex gap-2.5">
                  {/* Custom sort dropdown */}
                  <div ref={sortRef} className="relative flex-1 sm:flex-initial">
                    <button
                        type="button"
                        onClick={() => setSortOpen((o) => !o)}
                        aria-haspopup="listbox"
                        aria-expanded={sortOpen}
                        className={`inline-flex w-full items-center justify-between gap-2 rounded-full border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--bridge-text)] shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300/70 hover:shadow-md sm:w-auto ${focusRing}`}
                    >
                      <svg className="h-3.5 w-3.5 shrink-0 text-[var(--bridge-text-muted)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h18M6 12h12M10 16.5h4" />
                      </svg>
                      <span className="truncate">{SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Sort'}</span>
                      <svg
                          className={`h-3.5 w-3.5 shrink-0 text-[var(--bridge-text-muted)] transition-transform duration-300 ${sortOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>

                    {sortOpen ? (
                        <div
                            role="listbox"
                            aria-label="Sort mentors"
                            className="absolute right-0 top-full z-20 mt-2 min-w-[260px] overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-float backdrop-blur-xl animate-pop-in"
                        >
                          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
                          {SORT_OPTIONS.map((opt) => (
                              <button
                                  key={opt.value}
                                  type="button"
                                  role="option"
                                  aria-selected={sortBy === opt.value}
                                  onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                                      sortBy === opt.value
                                          ? 'bg-gradient-to-r from-orange-50/90 to-amber-50/40 font-semibold text-orange-900 dark:from-orange-500/10 dark:to-amber-500/5 dark:text-orange-200'
                                          : 'font-medium text-[var(--bridge-text-secondary)] hover:bg-[var(--bridge-surface-muted)]'
                                  } ${focusRing}`}
                              >
                                {opt.label}
                                {sortBy === opt.value ? (
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow" aria-hidden>
                                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                      </svg>
                                    </span>
                                ) : null}
                              </button>
                          ))}
                        </div>
                    ) : null}
                  </div>

                  <button
                      type="button"
                      onClick={() => setFilterPanelOpen((o) => !o)}
                      aria-expanded={filterPanelOpen}
                      aria-controls="mentors-filter-panel"
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
                          filterPanelOpen || activeFilterCount > 0
                              ? 'btn-sheen border-transparent bg-gradient-to-r from-stone-900 to-stone-800 text-amber-50 shadow-[0_10px_26px_-6px_rgba(28,25,23,0.45)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-8px_rgba(28,25,23,0.55)] dark:from-orange-500 dark:to-amber-500 dark:text-stone-950'
                              : 'border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] text-[var(--bridge-text)] hover:-translate-y-0.5 hover:border-orange-300/70 hover:shadow-md'
                      } ${focusRing}`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                    </svg>
                    Filter
                    {activeFilterCount > 0 ? (
                        <span className="ml-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-300 px-1.5 text-[10px] font-bold text-stone-900 shadow-[0_0_10px_rgba(253,230,138,0.6)]">
                          {activeFilterCount}
                        </span>
                    ) : null}
                  </button>
                </div>
              </div>
            </div>

            {/* Collapsible filter panel */}
            {filterPanelOpen ? (
                <div id="mentors-filter-panel" className="relative mt-1 pb-6">
                  <div className="rounded-2xl border border-stone-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">

                    {/* Panel header row */}
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Filters</span>
                      {activeFilterCount > 0 ? (
                          <button
                              type="button"
                              onClick={resetFilters}
                              className={`rounded-full px-3 py-1 text-xs font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 ${focusRing}`}
                          >
                            Clear all
                          </button>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-4">

                      {/* Industry */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-1 w-[4.5rem] shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                          Industry
                        </span>
                        {INDUSTRIES.map(({ label, value }) => (
                            <button
                                key={value || 'all'}
                                type="button"
                                onClick={() => setActiveIndustry(value)}
                                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                                    activeIndustry === value
                                        ? `border-transparent bg-gradient-to-r from-stone-900 to-stone-800 text-amber-50 shadow-sm ${focusRingDarkChip}`
                                        : `border-stone-200 bg-white text-stone-600 hover:border-orange-300/60 ${focusRing}`
                                }`}
                            >
                              {label}
                            </button>
                        ))}
                      </div>

                      {/* Tier */}
                      <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
                        <span className="mr-1 w-[4.5rem] shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                          Tier
                        </span>
                        {TIERS.map(({ label, value }) => (
                            <button
                                key={value || 'all-tiers'}
                                type="button"
                                onClick={() => setActiveTier(value)}
                                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                                    activeTier === value
                                        ? `border-transparent bg-gradient-to-r from-stone-900 to-stone-800 text-amber-50 shadow-sm ${focusRingDarkChip}`
                                        : `border-stone-200 bg-white text-stone-600 hover:border-orange-300/60 ${focusRing}`
                                }`}
                            >
                              {label}
                            </button>
                        ))}
                      </div>

                      {/* Session rate range */}
                      <div className="flex flex-wrap items-center gap-3 border-t border-stone-100 pt-4">
                        <span className="w-[4.5rem] shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                          Rate
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400" aria-hidden>$</span>
                            <input
                                type="number"
                                min="0"
                                placeholder="Min"
                                value={rateMin}
                                onChange={(e) => setRateMin(e.target.value)}
                                aria-label="Minimum session rate"
                                className="w-24 rounded-full border border-stone-200 bg-white py-1.5 pl-6 pr-3 text-sm text-stone-800 shadow-sm placeholder:text-stone-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/25"
                            />
                          </div>
                          <span className="text-stone-300" aria-hidden>—</span>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400" aria-hidden>$</span>
                            <input
                                type="number"
                                min="0"
                                placeholder="Max"
                                value={rateMax}
                                onChange={(e) => setRateMax(e.target.value)}
                                aria-label="Maximum session rate"
                                className="w-24 rounded-full border border-stone-200 bg-white py-1.5 pl-6 pr-3 text-sm text-stone-800 shadow-sm placeholder:text-stone-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/25"
                            />
                          </div>
                          <span className="text-xs text-stone-400">per session</span>
                        </div>
                      </div>

                      {/* Availability toggle */}
                      <div className="flex items-center gap-3 border-t border-stone-100 pt-4">
                        <span className="w-[4.5rem] shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                          Status
                        </span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={availableOnly}
                            onClick={() => setAvailableOnly((v) => !v)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                                availableOnly ? 'bg-orange-500' : 'bg-stone-200'
                            } ${focusRing}`}
                        >
                          <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                                  availableOnly ? 'translate-x-4' : 'translate-x-0'
                              }`}
                          />
                        </button>
                        <span
                            className="cursor-pointer select-none text-sm font-medium text-stone-700"
                            onClick={() => setAvailableOnly((v) => !v)}
                        >
                          Available now
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
            ) : null}
          </div>
        </section>

        {/* ── AI Match Mode ──────────────────────────────────────────────── */}
        {aiMode ? (
          <div className="relative mx-auto max-w-bridge scroll-mt-24 px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-8">

            {/* Loading state */}
            {aiLoading && (
              <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-orange-200/60 bg-gradient-to-b from-orange-50/40 to-amber-50/20 py-24 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-bridge-card ring-1 ring-orange-200/60">
                  <svg className="h-8 w-8 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <p className="mt-6 font-display text-xl font-semibold text-stone-900">Finding your best mentors…</p>
                <p className="mt-2 text-sm text-stone-500">Our AI is reviewing all profiles for you.</p>
              </div>
            )}

            {/* Error state */}
            {!aiLoading && aiError && (
              <div className="rounded-[1.75rem] border border-red-200/90 bg-red-50/95 px-6 py-8 text-center shadow-sm">
                <p className="font-semibold text-red-900">Something went wrong finding your matches.</p>
                <p className="mt-1 text-sm text-red-800/80">Please try again.</p>
                <p className="mt-2 font-mono text-xs text-red-800/60">{aiError}</p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setAiError(null); handleAiMatchClick(); }}
                    className={`rounded-full bg-red-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-800 ${focusRing}`}
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={exitAiMode}
                    className={`rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 ${focusRing}`}
                  >
                    Back to Browse
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            {!aiLoading && !aiError && aiResults && (
              <>
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-orange-200/60 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                      </svg>
                      AI-Powered Matches
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-stone-900 sm:text-3xl">
                      Your Top Mentor Matches
                    </h2>
                    {savedMenteeProfile && (
                      <p className="mt-1.5 text-sm text-stone-500">
                        Based on your goal to become a{' '}
                        <span className="font-semibold text-stone-700">{savedMenteeProfile.target_role ?? 'your target role'}</span>
                        {savedMenteeProfile.target_industry ? (
                          <> in <span className="font-semibold text-stone-700">{savedMenteeProfile.target_industry}</span></>
                        ) : null}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2.5">
                    <button
                      type="button"
                      onClick={handleAiMatchClick}
                      className={`rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 ${focusRing}`}
                    >
                      Retake Assessment
                    </button>
                    <button
                      type="button"
                      onClick={exitAiMode}
                      className={`rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 ${focusRing}`}
                    >
                      ← Back to Browse
                    </button>
                  </div>
                </div>

                {/* Top 3 matches */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {aiResults.top_matches.map((match) => {
                    const mentor = getMentorById(match.mentor_id);
                    if (!mentor) return null;
                    return (
                      <AiMatchCard
                        key={match.mentor_id}
                        mentor={mentor}
                        match={match}
                        navigate={navigate}
                      />
                    );
                  })}
                </div>

                {/* Honorable mentions */}
                {aiResults.honorable_mentions.length > 0 && (
                  <div className="mt-12">
                    <h3 className="mb-5 font-display text-lg font-semibold text-stone-700">
                      Honorable Mentions
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {aiResults.honorable_mentions.map((match) => {
                        const mentor = getMentorById(match.mentor_id);
                        if (!mentor) return null;
                        return (
                          <AiHonorableCard
                            key={match.mentor_id}
                            mentor={mentor}
                            match={match}
                            navigate={navigate}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}

        {/* Mentors grid — now directly under the strip */}
        <div ref={gridRef} className={`relative mx-auto max-w-bridge scroll-mt-24 px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-8 ${aiMode ? 'hidden' : ''}`}>
          {favoriteMessage ? (
              <div
                  className="mb-6 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/95 to-orange-50/40 px-5 py-4 text-sm text-amber-950 shadow-sm backdrop-blur-sm"
                  role="status"
              >
                {favoriteMessage}
              </div>
          ) : null}

          {error ? <FetchErrorBanner message={error} onRetry={loadMentors} /> : null}

          {!loading && !error && totalCount > 0 ? (
              <div className="mb-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-stone-600">
                  Showing{' '}
                  <span className="font-semibold text-stone-900">
                {startIdx}–{endIdx}
              </span>{' '}
                  of <span className="font-semibold text-stone-900">{totalCount}</span>
                </p>
                {(canPrev || canNext) ? (
                    <div className="flex items-center gap-2">
                      <button
                          type="button"
                          disabled={!canPrev}
                          onClick={() => changePage(Math.max(0, page - 1))}
                          className={`rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}
                      >
                        Back
                      </button>
                      <span className="rounded-full bg-stone-100 px-3.5 py-1.5 text-xs font-semibold text-stone-600">
                  Page {page + 1}
                </span>
                      <button
                          type="button"
                          disabled={!canNext}
                          onClick={() => changePage(page + 1)}
                          className={`rounded-full border border-transparent bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 disabled:pointer-events-none disabled:opacity-35 disabled:shadow-none ${focusRing}`}
                      >
                        Next
                      </button>
                    </div>
                ) : null}
              </div>
          ) : null}

          {loading ? (
              <MentorGridSkeleton />
          ) : visibleMentors.length > 0 ? (
              <div className="animate-in fade-in duration-500">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleMentors.map((mentor, i) => (
                      <Reveal key={mentor.id} delay={Math.min(i * 30, 150)} className="h-full">
                        <MentorCard
                            mentor={mentor}
                            isFavorite={favoriteIds.has(normalizeMentorId(mentor.id))}
                            onToggleFavorite={onToggleFavorite}
                            user={user}
                            navigate={navigate}
                            favoriteBusy={favoriteBusyId === normalizeMentorId(mentor.id)}
                            favoritesEnabled={!asMentor}
                        />
                      </Reveal>
                  ))}
                </div>

                {/* Bottom pagination mirror — saves the user scrolling back up */}
                {(canPrev || canNext) ? (
                    <div className="mt-10 flex items-center justify-center gap-2">
                      <button
                          type="button"
                          disabled={!canPrev}
                          onClick={() => changePage(Math.max(0, page - 1))}
                          className={`rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:pointer-events-none disabled:opacity-35 ${focusRing}`}
                      >
                        Back
                      </button>
                      <span className="rounded-full bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-600">
                  Page {page + 1}
                </span>
                      <button
                          type="button"
                          disabled={!canNext}
                          onClick={() => changePage(page + 1)}
                          className={`rounded-full border border-transparent bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 disabled:pointer-events-none disabled:opacity-35 disabled:shadow-none ${focusRing}`}
                      >
                        Next
                      </button>
                    </div>
                ) : null}
              </div>
          ) : !error ? (
              <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-dashed border-stone-200/90 bg-gradient-to-b from-stone-50/90 to-orange-50/30 px-6 py-20 text-center shadow-sm backdrop-blur-sm sm:py-24">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-orange-200/30 blur-3xl"
                />
                <div
                    aria-hidden
                    className="flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-200/60 bg-white/90 shadow-bridge-card"
                >
                  <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="relative mt-6 font-display text-balance text-xl font-semibold text-stone-900 sm:text-2xl">
                  Nobody fits that combo
                </p>
                <p className="relative mt-3 max-w-md text-sm leading-relaxed text-stone-600 sm:text-base">
                  Loosen a filter or kill a keyword—sometimes the best profiles use weird titles.
                </p>
                <button
                    type="button"
                    onClick={resetFilters}
                    className={`relative mt-8 rounded-full border-2 border-stone-900/12 bg-white px-7 py-3 text-sm font-semibold text-stone-900 shadow-md transition hover:border-orange-300/70 hover:shadow-lg ${focusRing}`}
                >
                  Reset filters
                </button>
              </div>
          ) : null}
        </div>
        {wizardOpen && (
          <MentorMatchWizard
            prefill={prefillData}
            onComplete={handleWizardComplete}
            onClose={() => setWizardOpen(false)}
          />
        )}
      </main>
  );
}
