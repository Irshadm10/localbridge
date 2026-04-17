import { useState, useEffect, useMemo, useId, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMentorById } from '../api/mentors';
import { getReviewsForMentor } from '../api/reviews';
import { createSession } from '../api/sessions';
import { useAuth } from '../context/AuthContext';
import SessionTypeCard, { SESSION_TYPES } from '../components/SessionTypeCard';
import { addRecentlyViewedMentor } from '../utils/recentlyViewed';

function BookingModal({ mentor, onClose }) {
    const [selectedType, setSelectedType] = useState(null);
    const [scheduledDate, setScheduledDate] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [handleClose]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!selectedType) return;

        setSubmitting(true);
        setResult(null);

        const { error } = await createSession({
            mentorId: mentor.id,
            sessionType: selectedType.key,
            scheduledDate: scheduledDate || null,
            message: message || null,
        });

        setSubmitting(false);

        if (error) {
            setResult({ ok: false, message: error.message ?? 'Something went wrong. Please try again.' });
        } else {
            setResult({ ok: true, message: 'Session booked! Your mentor will confirm shortly.' });
        }
    }

    const mentorFirst = mentor.name?.split(/\s+/)[0] ?? 'your mentor';

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
        >
            <button
                type="button"
                className="absolute inset-0 bg-stone-950/70 backdrop-blur-[2px] transition-opacity"
                aria-label="Close booking"
                onClick={handleClose}
            />
            <div className="relative flex max-h-[min(92vh,880px)] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-stone-950/25 ring-1 ring-stone-200/90 sm:rounded-3xl sm:ring-stone-200/60">
                {result?.ok ? (
                    <div className="flex flex-col items-center px-8 py-14 sm:py-16 text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-4xl shadow-lg shadow-amber-900/20">
                            ✓
                        </div>
                        <h2 className="font-serif text-2xl font-semibold text-stone-900 sm:text-3xl">You&apos;re booked</h2>
                        <p className="mt-3 max-w-sm text-stone-600 leading-relaxed">{result.message}</p>
                        <p className="mt-2 text-sm text-stone-500">We&apos;ll email you when {mentorFirst} responds.</p>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="mt-10 rounded-2xl bg-stone-900 px-10 py-3.5 text-sm font-semibold text-amber-50 shadow-lg shadow-stone-900/25 transition hover:bg-stone-800"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-6 pb-8 pt-7 sm:px-8 sm:pb-10 sm:pt-8">
                            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-orange-400/10 blur-3xl" />
                            <div className="relative flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/90">Book a session</p>
                                    <h2
                                        id="booking-modal-title"
                                        className="mt-2 font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl"
                                    >
                                        Meet with {mentor.name}
                                    </h2>
                                    <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-300">
                                        Pick a format, add an optional time and note — your mentor confirms the details.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20"
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>
                            <ol className="relative mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium sm:text-sm">
                                <li className={`flex items-center gap-2 ${selectedType ? 'text-stone-400' : 'text-white'}`}>
                                    <span
                                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${selectedType ? 'bg-emerald-500 text-white' : 'bg-white/15 text-white'}`}
                                    >
                                        {selectedType ? '✓' : '1'}
                                    </span>
                                    Format
                                </li>
                                <li className="hidden text-stone-500 sm:inline" aria-hidden="true">
                                    —
                                </li>
                                <li className={`flex items-center gap-2 ${selectedType ? 'text-amber-200' : 'text-stone-500'}`}>
                                    <span
                                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${selectedType ? 'bg-white/20 text-white' : 'bg-white/10 text-stone-400'}`}
                                    >
                                        2
                                    </span>
                                    Details
                                </li>
                            </ol>
                        </header>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                            <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
                                <section>
                                    <div className="mb-4">
                                        <h3 className="text-base font-semibold text-stone-900">Session format</h3>
                                        <p className="mt-1 text-sm text-stone-500">
                                            Tap a card to select. Hover to preview — selection shows a ring and checkmark.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                        {SESSION_TYPES.map((type) => (
                                            <SessionTypeCard
                                                key={type.key}
                                                type={type}
                                                variant="picker"
                                                selected={selectedType?.key === type.key}
                                                onClick={() => setSelectedType(type)}
                                            />
                                        ))}
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-stone-200/80 bg-gradient-to-b from-stone-50/90 to-white p-5 sm:p-6">
                                    <h3 className="text-base font-semibold text-stone-900">When &amp; focus</h3>
                                    <p className="mt-1 text-sm text-stone-500">Optional — helps your mentor prepare.</p>
                                    <div className="mt-5 space-y-5">
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500" htmlFor="scheduled-date">
                                                Preferred start time
                                            </label>
                                            <input
                                                id="scheduled-date"
                                                type="datetime-local"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500" htmlFor="booking-message">
                                                Note to mentor
                                            </label>
                                            <textarea
                                                id="booking-message"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                rows={3}
                                                placeholder="e.g. Preparing for PM interviews at mid-size startups…"
                                                className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {result && !result.ok && (
                                    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{result.message}</p>
                                )}
                            </div>
                        </div>

                        <footer className="shrink-0 border-t border-stone-200/80 bg-white/95 px-5 py-4 backdrop-blur-sm sm:px-8 sm:py-5">
                            {selectedType && (
                                <p className="mb-3 text-center text-xs text-stone-500 sm:text-left">
                                    <span className="font-medium text-stone-700">{selectedType.name}</span>
                                    <span className="text-stone-400"> · </span>
                                    {selectedType.duration}
                                </p>
                            )}
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="rounded-2xl border border-stone-200 bg-white px-5 py-3.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 sm:px-6"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!selectedType || submitting}
                                    className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-900/25 transition hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none sm:min-w-[200px]"
                                >
                                    {submitting ? 'Sending request…' : 'Request session'}
                                </button>
                            </div>
                        </footer>
                    </form>
                )}
            </div>
        </div>
    );
}

function avatarColor(name = '') {
    const palette = [
        'from-amber-400 to-orange-500',
        'from-rose-400 to-pink-500',
        'from-violet-400 to-purple-600',
        'from-teal-400 to-emerald-600',
        'from-sky-400 to-indigo-500',
        'from-fuchsia-400 to-rose-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
}

function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');
}

function formatIndustry(industry) {
    if (!industry?.trim()) return null;
    return industry
        .trim()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

function StarRow({ rating, size = 'md' }) {
    const uid = useId().replace(/:/g, '');
    const r = Math.min(5, Math.max(0, Number(rating) || 0));
    const full = Math.floor(r);
    const partial = r - full;
    const dim = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
        <span className="flex items-center gap-0.5" aria-label={`${r.toFixed(1)} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => {
                let fill = 0;
                if (i < full) fill = 100;
                else if (i === full) fill = Math.round(partial * 100);
                const gid = `star-${uid}-${i}-${size}`;
                return (
                    <svg key={i} className={dim} viewBox="0 0 20 20">
                        <defs>
                            <linearGradient id={gid}>
                                <stop offset={`${fill}%`} stopColor="#d97706" />
                                <stop offset={`${fill}%`} stopColor="#e7e5e4" />
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
    );
}

function ProfileSkeleton() {
    return (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
            <div className="h-4 w-32 bg-stone-200 rounded mb-8" />
            <div className="rounded-3xl bg-white/80 border border-stone-200 p-8 sm:p-10 mb-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-36 h-36 rounded-3xl bg-stone-200 shrink-0 mx-auto lg:mx-0" />
                    <div className="flex-1 space-y-4">
                        <div className="h-10 bg-stone-200 rounded-lg w-2/3 max-w-md mx-auto lg:mx-0" />
                        <div className="h-5 bg-stone-100 rounded w-1/2 max-w-sm mx-auto lg:mx-0" />
                        <div className="grid grid-cols-3 gap-3 pt-4">
                            <div className="h-20 bg-stone-100 rounded-2xl" />
                            <div className="h-20 bg-stone-100 rounded-2xl" />
                            <div className="h-20 bg-stone-100 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-64 bg-stone-100 rounded-3xl" />
                <div className="h-72 bg-stone-100 rounded-3xl" />
            </div>
        </main>
    );
}

function formatReviewDate(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return '';
    }
}

export default function MentorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [mentorReviews, setMentorReviews] = useState([]);
    const [loadError, setLoadError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        let cancelled = false;
        /* Reset UI when mentor id changes (standard fetch pattern) */
        /* eslint-disable react-hooks/set-state-in-effect */
        setLoading(true);
        setLoadError(null);
        /* eslint-enable react-hooks/set-state-in-effect */

        Promise.all([getMentorById(id), getReviewsForMentor(id)]).then(([mentorRes, reviewsRes]) => {
            if (cancelled) return;

            if (mentorRes.error) {
                setProfile(null);
                setMentorReviews([]);
                setLoadError(mentorRes.error.message ?? 'Could not load mentor.');
            } else if (!mentorRes.data?.mentor) {
                setProfile(null);
                setMentorReviews([]);
                setLoadError(null);
            } else {
                setProfile(mentorRes.data);
                setMentorReviews(reviewsRes.error ? [] : (reviewsRes.data ?? []));
                setLoadError(null);
                addRecentlyViewedMentor(mentorRes.data.mentor);
            }
            setLoading(false);
        });

        return () => {
            cancelled = true;
        };
    }, [id]);

    const displayRating = useMemo(() => {
        if (!profile?.mentor) return 0;
        const fromReviews = profile.reviews?.average;
        if (fromReviews != null && profile.reviews.count > 0) return Number(fromReviews);
        const r = profile.mentor.rating;
        return r != null ? Number(r) : 0;
    }, [profile]);

    function handleBookClick() {
        if (!user) {
            navigate('/login');
        } else {
            setShowModal(true);
        }
    }

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (loadError) {
        return (
            <main className="max-w-2xl mx-auto px-6 py-16 text-center">
                <p className="text-stone-600 mb-6">{loadError}</p>
                <Link to="/mentors" className="text-amber-800 font-medium hover:underline">
                    ← Back to mentors
                </Link>
            </main>
        );
    }

    if (!profile?.mentor) {
        return (
            <main className="max-w-2xl mx-auto px-6 py-16 text-center">
                <p className="text-stone-500 text-lg mb-6">We couldn&apos;t find that mentor.</p>
                <Link to="/mentors" className="inline-flex items-center gap-2 text-amber-800 font-medium hover:underline">
                    ← Browse all mentors
                </Link>
            </main>
        );
    }

    const mentor = profile.mentor;
    const reviewMeta = profile.reviews;
    const industryLabel = formatIndustry(mentor.industry);
    const grad = avatarColor(mentor.name);
    const mentorInitials = initials(mentor.name);

    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-stone-100 relative overflow-hidden">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.35]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
                <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
                <div className="pointer-events-none absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-orange-200/25 blur-3xl" />

                <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <Link
                        to="/mentors"
                        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors mb-8 group"
                    >
                        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                        Back to mentors
                    </Link>

                    {/* Hero */}
                    <section className="relative rounded-3xl bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-xl shadow-stone-900/5 overflow-hidden mb-8">
                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-amber-100/90 via-orange-50/80 to-amber-50/50" />
                        <div className="relative p-8 sm:p-10 lg:p-12">
                            <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-12">
                                {/* Photo / avatar */}
                                <div className="flex justify-center lg:justify-start shrink-0">
                                    {mentor.image_url ? (
                                        <div className="relative">
                                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${grad} opacity-20 blur-xl scale-110`} />
                                            <img
                                                src={mentor.image_url}
                                                alt={`${mentor.name} — profile`}
                                                className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl object-cover ring-4 ring-white shadow-2xl shadow-stone-900/15"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl shadow-stone-900/20 ring-4 ring-white`}
                                            aria-hidden="true"
                                        >
                                            {mentorInitials}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 text-center lg:text-left pb-2">
                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-3">
                                        {industryLabel && (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-amber-100/90 text-amber-900 border border-amber-200/80">
                                                {industryLabel}
                                            </span>
                                        )}
                                        {mentor.available && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                                </span>
                                                Accepting sessions
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-stone-900 tracking-tight leading-[1.1] mb-3">
                                        {mentor.name}
                                    </h1>

                                    {mentor.title && (
                                        <p className="text-lg sm:text-xl text-stone-700 font-medium max-w-2xl mx-auto lg:mx-0">
                                            {mentor.title}
                                            {mentor.company ? (
                                                <span className="text-stone-500 font-normal">
                                                    {' '}
                                                    <span className="text-stone-400">·</span> {mentor.company}
                                                </span>
                                            ) : null}
                                        </p>
                                    )}

                                    <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-900 text-amber-50 shadow-lg shadow-stone-900/20">
                                            <StarRow rating={displayRating} size="lg" />
                                            <span className="font-semibold tabular-nums">
                                                {displayRating > 0 ? displayRating.toFixed(1) : '—'}
                                            </span>
                                            {reviewMeta?.count > 0 && (
                                                <span className="text-amber-200/90 text-sm font-normal">
                                                    ({reviewMeta.count} review{reviewMeta.count === 1 ? '' : 's'})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stat strip */}
                            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100/80 p-5 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/80 border border-amber-100 flex items-center justify-center text-xl shadow-sm">
                                        ⭐
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Rating</p>
                                        <p className="text-2xl font-bold text-stone-900 tabular-nums">
                                            {displayRating > 0 ? displayRating.toFixed(1) : '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-gradient-to-br from-stone-50 to-amber-50/30 border border-stone-200/80 p-5 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/80 border border-stone-200 flex items-center justify-center text-xl shadow-sm">
                                        📈
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Experience</p>
                                        <p className="text-2xl font-bold text-stone-900 tabular-nums">
                                            {mentor.years_experience != null ? `${mentor.years_experience} yrs` : '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-gradient-to-br from-orange-50/50 to-amber-50 border border-orange-100/60 p-5 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/80 border border-orange-100 flex items-center justify-center text-xl shadow-sm">
                                        ✓
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Sessions</p>
                                        <p className="text-2xl font-bold text-stone-900 tabular-nums">
                                            {mentor.total_sessions != null ? mentor.total_sessions : '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Main column */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            <section className="rounded-3xl bg-white/90 backdrop-blur border border-stone-200/80 shadow-lg shadow-stone-900/5 p-8 sm:p-10">
                                <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-6 flex items-center gap-3">
                                    <span className="w-1 h-8 rounded-full bg-gradient-to-b from-amber-500 to-orange-400" />
                                    About
                                </h2>
                                <div className="relative pl-4 border-l-2 border-amber-200/80">
                                    <p className="text-stone-700 text-lg leading-relaxed whitespace-pre-line">
                                        {mentor.bio?.trim() || 'This mentor hasn’t added a bio yet — book a session to connect and learn more about their background.'}
                                    </p>
                                </div>
                            </section>

                            <section className="rounded-3xl bg-white/90 backdrop-blur border border-stone-200/80 shadow-lg shadow-stone-900/5 p-8 sm:p-10">
                                <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-6">Expertise</h2>
                                {mentor.expertise?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2.5">
                                        {mentor.expertise.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 text-amber-950 text-sm font-medium shadow-sm hover:border-amber-300/80 hover:shadow transition-all"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-stone-500">No focus areas listed yet.</p>
                                )}
                            </section>

                            <section className="rounded-3xl bg-white/90 backdrop-blur border border-stone-200/80 shadow-lg shadow-stone-900/5 p-8 sm:p-10">
                                <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-2">What mentees say</h2>
                                <p className="text-stone-500 text-sm mb-8">Honest feedback from completed sessions.</p>

                                {mentorReviews.length > 0 ? (
                                    <ul className="space-y-5">
                                        {mentorReviews.map((rev) => (
                                            <li
                                                key={rev.id}
                                                className="rounded-2xl border border-stone-100 bg-stone-50/50 p-5 hover:bg-amber-50/20 hover:border-amber-100/60 transition-colors"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-sm font-bold shrink-0 opacity-90`}
                                                    >
                                                        M
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <span className="font-medium text-stone-900">Mentee</span>
                                                            <StarRow rating={rev.rating} />
                                                            <span className="text-xs text-stone-400">{formatReviewDate(rev.created_at)}</span>
                                                        </div>
                                                        {rev.comment?.trim() ? (
                                                            <p className="text-stone-700 leading-relaxed">{rev.comment.trim()}</p>
                                                        ) : (
                                                            <p className="text-stone-400 text-sm italic">Left a rating without a written review.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/30 px-8 py-14 text-center">
                                        <p className="text-4xl mb-3">💬</p>
                                        <p className="font-medium text-stone-700">No reviews yet</p>
                                        <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
                                            Be the first to book a session — reviews show up here after you meet.
                                        </p>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Sticky sidebar */}
                        <aside className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
                            <div className="rounded-3xl bg-stone-900 text-amber-50 p-8 shadow-2xl shadow-stone-900/30 ring-1 ring-stone-700/50">
                                <p className="text-amber-200/90 text-xs font-semibold uppercase tracking-widest mb-2">1:1 mentorship</p>
                                <h3 className="font-serif text-2xl font-semibold mb-4 leading-snug">Book time with {mentor.name.split(' ')[0]}</h3>
                                <p className="text-amber-100/80 text-sm leading-relaxed mb-6">
                                    Pick a session type, suggest a time, and send a short note. Your mentor will confirm or propose another slot.
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {SESSION_TYPES.map((type) => (
                                        <li key={type.key} className="flex items-start gap-3 text-sm text-amber-50/95">
                                            <span className="text-lg shrink-0">{type.icon}</span>
                                            <span>
                                                <span className="font-medium">{type.name}</span>
                                                <span className="text-amber-200/70"> · {type.duration}</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={handleBookClick}
                                    className="w-full py-4 rounded-2xl bg-amber-400 text-stone-900 font-semibold hover:bg-amber-300 transition-colors shadow-lg shadow-amber-900/20"
                                >
                                    Book a session
                                </button>
                                <p className="text-xs text-amber-200/60 text-center mt-4 leading-relaxed">
                                    Pro plan may apply for unlimited sessions.
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white/90 border border-stone-200/80 p-6 text-sm text-stone-600">
                                <p className="font-semibold text-stone-900 mb-2">Why Bridge?</p>
                                <ul className="space-y-2 list-none">
                                    <li className="flex gap-2 py-1">
                                        <span className="text-amber-600">✓</span>
                                        Vetted mentor profiles
                                    </li>
                                    <li className="flex gap-2 py-1">
                                        <span className="text-amber-600">✓</span>
                                        Structured session types
                                    </li>
                                    <li className="flex gap-2 py-1">
                                        <span className="text-amber-600">✓</span>
                                        Secure booking flow
                                    </li>
                                </ul>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>

            {showModal && <BookingModal mentor={mentor} onClose={() => setShowModal(false)} />}
        </>
    );
}
