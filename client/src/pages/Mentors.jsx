import { useState, useEffect, useCallback, useId, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllMentors } from '../api/mentors';
import { getMyFavorites, toggleFavorite } from '../api/favorites';
import { useAuth } from '../context/useAuth';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import Reveal from '../components/Reveal';

const PAGE_SIZE = 12;

const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';
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
    case 'rising':      return 'bg-emerald-50 text-emerald-800 border border-emerald-200/80';
    case 'established': return 'bg-sky-50 text-sky-800 border border-sky-200/80';
    case 'expert':      return 'bg-violet-50 text-violet-800 border border-violet-200/80';
    case 'elite':       return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
    default:            return 'bg-stone-100 text-stone-600';
  }
}

const SORT_OPTIONS = [
  { label: 'Best reviews first', value: 'rating' },
  { label: 'Most years in the game', value: 'experience' },
  { label: 'Most sessions logged', value: 'sessions' },
];

const AVATAR_COLORS = [
  'bg-violet-200 text-violet-800',
  'bg-amber-200 text-amber-800',
  'bg-emerald-200 text-emerald-800',
  'bg-sky-200 text-sky-800',
  'bg-rose-200 text-rose-800',
  'bg-indigo-200 text-indigo-800',
  'bg-teal-200 text-teal-800',
  'bg-orange-200 text-orange-800',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
}

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
                className="flex flex-col h-[320px] animate-pulse rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-6 shadow-bridge-card"
            >
              <div className="flex gap-4">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-stone-200" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <div className="h-4 w-3/4 rounded-full bg-stone-200" />
                  <div className="h-3 w-1/2 rounded-full bg-stone-100" />
                  <div className="h-3 w-1/3 rounded-full bg-amber-100/50" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="h-3 w-20 rounded-full bg-stone-100" />
                <div className="h-4 w-24 rounded-full bg-stone-100" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded-full bg-stone-100" />
                <div className="h-3 w-5/6 rounded-full bg-stone-100" />
              </div>
              <div className="mt-4 flex gap-1.5">
                <div className="h-6 w-16 rounded-full bg-orange-50" />
                <div className="h-6 w-16 rounded-full bg-orange-50" />
                <div className="h-6 w-16 rounded-full bg-orange-50" />
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-stone-100/90 pt-4">
                <div className="space-y-1.5">
                  <div className="h-3 w-16 rounded-full bg-stone-100" />
                  <div className="h-3 w-20 rounded-full bg-stone-200" />
                </div>
                <div className="h-9 w-28 rounded-full bg-stone-200" />
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
          className={`rounded-full bg-white/95 p-2 text-stone-400 shadow-sm ring-1 ring-stone-200/80 transition hover:bg-rose-50 hover:text-rose-500 hover:ring-rose-200/60 disabled:pointer-events-none disabled:opacity-40 ${focusRing}`}
          aria-label={label}
      >
        {filled ? (
            <svg className="h-5 w-5 fill-rose-500 text-rose-500" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        )}
      </button>
  );
}

function MentorCard({ mentor, isFavorite, onToggleFavorite, user, navigate, favoriteBusy }) {
  const avatarColor = getAvatarColor(mentor.name);

  function handleHeart() {
    if (!user) {
      navigate('/login', { state: { from: '/mentors' } });
      return;
    }
    onToggleFavorite(mentor.id);
  }

  return (
      <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white/95 p-6 shadow-bridge-card transition duration-300 hover:-translate-y-1 hover:border-orange-200/55 hover:shadow-bridge-glow">
        <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400/70 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        <div className="absolute right-4 top-5">
          <HeartButton
              filled={isFavorite}
              disabled={Boolean(favoriteBusy)}
              onClick={handleHeart}
              label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          />
        </div>

        <div className="flex items-start gap-4 pr-12">
          {mentor.image_url ? (
              <img
                  src={mentor.image_url}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-white shadow-md"
              />
          ) : (
              <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-md ring-2 ring-white ${avatarColor}`}
              >
                {getInitials(mentor.name)}
              </div>
          )}
          <div className="min-w-0 pt-0.5">
            <h3 className="truncate font-semibold text-stone-900">{mentor.name}</h3>
            <p className="truncate text-sm text-stone-500">{mentor.title}</p>
            <p className="truncate text-sm font-medium text-amber-800">{mentor.company}</p>
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

        <p className="line-clamp-2 text-sm leading-relaxed text-stone-600">{mentor.bio}</p>

        <div className="flex flex-wrap gap-1.5">
          {mentor.expertise.slice(0, 3).map((tag) => (
              <span
                  key={tag}
                  className="rounded-full border border-orange-100 bg-orange-50/80 px-2.5 py-0.5 text-xs font-medium text-orange-900"
              >
            {tag}
          </span>
          ))}
          {mentor.expertise.length > 3 && (
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-500">
            +{mentor.expertise.length - 3}
          </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-stone-100/90 pt-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-stone-400">{mentor.total_sessions} sessions</span>
            {mentor.session_rate ? (
                <span className="text-xs font-semibold text-stone-700">${mentor.session_rate} / session</span>
            ) : null}
          </div>
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

function FetchErrorBanner({ message, onRetry }) {
  return (
      <div className="mb-8 rounded-[1.75rem] border border-red-200/90 bg-red-50/95 px-5 py-5 text-sm text-red-900 shadow-sm">
        <p className="font-semibold">Mentors didn&apos;t load</p>
        <p className="mt-1 text-red-800/90">That&apos;s usually us or the Wi‑Fi. Want to try once more?</p>
        <p className="mt-2 font-mono text-xs text-red-800/70">{message}</p>
        {onRetry ? (
            <button
                type="button"
                onClick={onRetry}
                className={`mt-4 rounded-full bg-red-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 ${focusRing}`}
            >
              Retry
            </button>
        ) : null}
      </div>
  );
}

export default function Mentors() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    if (!user) {
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
    if (activeTier && m.tier !== activeTier) return false;
    if (rateMin !== '' && (m.session_rate == null || m.session_rate < Number(rateMin))) return false;
    if (rateMax !== '' && (m.session_rate == null || m.session_rate > Number(rateMax))) return false;
    if (availableOnly && !m.available) return false;
    return true;
  });

  return (
      <main id="mentors-directory" aria-label="Mentor directory" className="relative min-h-screen overflow-x-hidden">
        <PageGutterAtmosphere />

        {/* Compact top strip — title + count + inline search/sort + filter toggle.
          Everything fits in ~140px so mentors appear immediately below. */}
        <section
            aria-labelledby="mentors-heading"
            className="relative border-b border-stone-200/70 bg-gradient-to-b from-white/70 via-orange-50/30 to-transparent px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8"
        >
          <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-10 h-64 w-64 rounded-full bg-gradient-to-br from-amber-300/25 via-orange-200/15 to-transparent blur-3xl"
          />
          <div className="relative mx-auto max-w-7xl">
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
                <li>
                  <Link
                      to="/"
                      className={`rounded-md font-medium text-stone-600 transition hover:text-orange-800 ${focusRing}`}
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden className="text-stone-300">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                  </svg>
                </li>
                <li className="font-medium text-stone-800">Mentors</li>
              </ol>
            </nav>

            <div className="flex flex-col gap-5 pb-6 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1
                    id="mentors-heading"
                    className="font-display text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-[2.25rem]"
                >
                  Browse <span className="text-gradient-bridge">mentors</span>
                </h1>
                <p className="mt-1.5 text-sm text-stone-600 sm:text-base">
                  {loading ? (
                      <span className="text-stone-500">Loading the directory…</span>
                  ) : (
                      <>
                        <span className="font-semibold text-stone-900">{totalCount.toLocaleString()}</span>{' '}
                        {totalCount === 1 ? 'person' : 'people'} ready to talk
                        {activeFilterCount > 0 ? (
                            <span className="text-stone-500"> · filtered</span>
                        ) : null}
                      </>
                  )}
                </p>
              </div>

              {/* Inline control cluster — search + sort + filter toggle */}
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="relative flex-1 sm:w-72 sm:flex-initial">
                  <svg
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
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
                      placeholder="Name, title, company…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-full border border-stone-200 bg-white py-2.5 pl-10 pr-9 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/25"
                  />
                  {search ? (
                      <button
                          type="button"
                          onClick={() => setSearch('')}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 ${focusRing}`}
                          aria-label="Clear search"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                  ) : null}
                </div>

                <div className="flex gap-2.5">
                  {/* Custom sort dropdown */}
                  <div ref={sortRef} className="relative flex-1 sm:flex-initial">
                    <button
                        type="button"
                        onClick={() => setSortOpen((o) => !o)}
                        aria-haspopup="listbox"
                        aria-expanded={sortOpen}
                        className={`inline-flex w-full items-center justify-between gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-orange-300/70 sm:w-auto ${focusRing}`}
                    >
                      <span className="truncate">{SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Sort'}</span>
                      <svg
                          className={`h-3.5 w-3.5 shrink-0 text-stone-400 transition-transform duration-150 ${sortOpen ? 'rotate-180' : ''}`}
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
                            className="absolute right-0 top-full z-20 mt-1.5 min-w-[220px] overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-lg ring-1 ring-stone-900/[0.04]"
                        >
                          {SORT_OPTIONS.map((opt) => (
                              <button
                                  key={opt.value}
                                  type="button"
                                  role="option"
                                  aria-selected={sortBy === opt.value}
                                  onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition first:pt-3.5 last:pb-3.5 ${
                                      sortBy === opt.value
                                          ? 'bg-orange-50/80 font-semibold text-orange-900'
                                          : 'font-medium text-stone-700 hover:bg-stone-50'
                                  } ${focusRing}`}
                              >
                                {opt.label}
                                {sortBy === opt.value ? (
                                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white" aria-hidden>
                                      ✓
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
                              ? 'border-transparent bg-gradient-to-r from-stone-900 to-stone-800 text-amber-50 hover:from-stone-800 hover:to-stone-700'
                              : 'border-stone-200 bg-white text-stone-800 hover:border-orange-300/70'
                      } ${focusRing}`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12M10 18h4" />
                    </svg>
                    Filter
                    {activeFilterCount > 0 ? (
                        <span className="ml-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-stone-900">
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

        {/* Mentors grid — now directly under the strip */}
        <div ref={gridRef} className="relative mx-auto max-w-7xl scroll-mt-24 px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-8">
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
      </main>
  );
}
