import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllMentors } from '../api/mentors';
import { getMyFavorites, toggleFavorite } from '../api/favorites';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getRecentlyViewedMentors } from '../utils/recentlyViewed';

const PAGE_SIZE = 12;

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

const SORT_OPTIONS = [
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Most Experienced', value: 'experience' },
  { label: 'Most Sessions', value: 'sessions' },
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

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <span className="flex items-center gap-1">
      <span className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill =
            i < full ? '100%' : i === full && partial > 0 ? `${Math.round(partial * 100)}%` : '0%';
          return (
            <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20">
              <defs>
                <linearGradient id={`star-${i}-${rating}`}>
                  <stop offset={fill} stopColor="#d97706" />
                  <stop offset={fill} stopColor="#d4d4d4" />
                </linearGradient>
              </defs>
              <polygon
                points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
                fill={`url(#star-${i}-${rating})`}
              />
            </svg>
          );
        })}
      </span>
      <span className="text-xs text-stone-500 font-medium">{rating.toFixed(1)}</span>
    </span>
  );
}

function MentorGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-stone-100 bg-white p-6 space-y-4 animate-pulse"
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-stone-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-stone-200 rounded w-3/4" />
              <div className="h-3 bg-stone-100 rounded w-1/2" />
            </div>
          </div>
          <div className="h-12 bg-stone-100 rounded" />
          <div className="h-8 bg-stone-100 rounded w-2/3" />
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
      className="rounded-full p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
      aria-label={label}
    >
      {filled ? (
        <svg className="w-5 h-5 fill-rose-500 text-rose-500" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
    </button>
  );
}

function MentorCard({ mentor, isFavorite, onToggleFavorite, user, navigate, favoriteBusy }) {
  const avatarColor = getAvatarColor(mentor.name);
  const filled = isFavorite;

  function handleHeart() {
    if (!user) {
      navigate('/login', { state: { from: '/mentors' } });
      return;
    }
    onToggleFavorite(mentor.id);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-200 relative">
      <div className="absolute top-4 right-4">
        <HeartButton
          filled={filled}
          disabled={Boolean(favoriteBusy)}
          onClick={handleHeart}
          label={filled ? 'Remove from favorites' : 'Add to favorites'}
        />
      </div>

      <div className="flex items-start gap-4 pr-10">
        {mentor.image_url ? (
          <img
            src={mentor.image_url}
            alt=""
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor}`}
          >
            {getInitials(mentor.name)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-stone-900 truncate">{mentor.name}</h3>
          <p className="text-sm text-stone-500 truncate">{mentor.title}</p>
          <p className="text-sm text-amber-700 font-medium truncate">{mentor.company}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <StarRating rating={mentor.rating} />
        <span className="text-xs text-stone-400">{mentor.years_experience} yrs exp</span>
      </div>

      <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">{mentor.bio}</p>

      <div className="flex flex-wrap gap-1.5">
        {mentor.expertise.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
          >
            {tag}
          </span>
        ))}
        {mentor.expertise.length > 3 && (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-500">
            +{mentor.expertise.length - 3}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-stone-100">
        <span className="text-xs text-stone-400">{mentor.total_sessions} sessions</span>
        <Link
          to={`/mentors/${mentor.id}`}
          className="text-sm px-4 py-1.5 rounded-full bg-stone-900 text-amber-50 hover:bg-stone-700 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

function FetchErrorBanner({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 text-red-900 px-4 py-3 text-sm mb-8">
      <p className="font-semibold">Couldn&apos;t load mentors</p>
      <p className="mt-1 text-red-800/90">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm font-medium px-4 py-2 rounded-full bg-red-900 text-white hover:bg-red-800 transition-colors"
        >
          Try again
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
  const [, setRecentBump] = useState(0);

  const recent = getRecentlyViewedMentors();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, activeIndustry, sortBy]);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    void getMyFavorites().then(({ data, error: favErr }) => {
      if (favErr) {
        const msg = favErr.message || String(favErr);
        if (msg.includes('favorites') || msg.includes('schema cache') || msg.includes('does not exist')) {
          setFavoriteMessage(
            'Favorites need the favorites table in Supabase. Run the latest bridge_schema.sql (or ask your admin).',
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

  const norm = (id) => (id == null ? '' : String(id).toLowerCase());

  const onToggleFavorite = useCallback(async (mentorId) => {
    const key = norm(mentorId);
    setFavoriteBusyId(key);
    setFavoriteMessage(null);

    const { error: err } = await toggleFavorite(mentorId);

    if (err) {
      const msg = err.message || String(err);
      setFavoriteMessage(
        msg.includes('favorites') || msg.includes('does not exist') || msg.includes('schema cache')
          ? 'Could not save favorite — add the favorites table in Supabase (see bridge_schema.sql).'
          : msg,
      );
    }

    const { data, error: reloadErr } = await getMyFavorites();
    if (!reloadErr && data) {
      setFavoriteIds(new Set(data));
    }

    setFavoriteBusyId(null);
  }, []);

  const startIdx = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
  const endIdx = Math.min((page + 1) * PAGE_SIZE, totalCount);
  const canPrev = page > 0;
  const canNext = endIdx < totalCount;

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Browse Mentors</h1>
        <p className="text-stone-500 mt-1">Find the right mentor for where you want to go.</p>
      </div>

      {recent.length > 0 ? (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">Recently viewed</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {recent.map((m) => (
              <Link
                key={m.id}
                to={`/mentors/${m.id}`}
                onClick={() => setRecentBump((b) => b + 1)}
                className="snap-start shrink-0 w-44 rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-amber-300 transition-colors"
              >
                <p className="font-medium text-stone-900 text-sm truncate">{m.name}</p>
                <p className="text-xs text-stone-500 truncate mt-1">{m.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {favoriteMessage ? (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 text-amber-950 px-4 py-3 text-sm mb-6"
          role="status"
        >
          {favoriteMessage}
        </div>
      ) : null}

      {error ? <FetchErrorBanner message={error} onRetry={loadMentors} /> : null}

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
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
            placeholder="Search by name, title, company, bio…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent text-sm shadow-sm"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          ) : null}
        </div>
        <div className="shrink-0">
          <label htmlFor="sort-mentors" className="sr-only">
            Sort mentors
          </label>
          <select
            id="sort-mentors"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full lg:w-56 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {INDUSTRIES.map(({ label, value }) => (
          <button
            key={value || 'all'}
            type="button"
            onClick={() => setActiveIndustry(value)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              activeIndustry === value
                ? 'bg-stone-900 text-amber-50 border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!loading && !error ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <p className="text-sm text-stone-500">
            Showing{' '}
            <span className="font-semibold text-stone-700">
              {totalCount === 0 ? 0 : `${startIdx}-${endIdx}`}
            </span>{' '}
            of <span className="font-semibold text-stone-700">{totalCount}</span> mentors
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="text-sm px-4 py-2 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:pointer-events-none"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm px-4 py-2 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <MentorGridSkeleton />
      ) : mentors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              isFavorite={favoriteIds.has(norm(mentor.id))}
              onToggleFavorite={onToggleFavorite}
              user={user}
              navigate={navigate}
              favoriteBusy={favoriteBusyId === norm(mentor.id)}
            />
          ))}
        </div>
      ) : !error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-stone-700 font-medium">No mentors found.</p>
          <p className="text-stone-400 text-sm mt-1">Try adjusting your search or filters.</p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setActiveIndustry('');
              setPage(0);
            }}
            className="mt-5 text-sm px-4 py-2 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </main>
  );
}
