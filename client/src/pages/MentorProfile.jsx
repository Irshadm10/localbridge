import { useState, useEffect, useMemo, useId, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMentorById } from '../api/mentors';
import { getReviewsForMentor } from '../api/reviews';
import { createSession } from '../api/sessions';
import { useAuth } from '../context/useAuth';
import { SESSION_TYPES } from '../constants/sessionTypes';
import { addRecentlyViewedMentor } from '../utils/recentlyViewed';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import Reveal from '../components/Reveal';

const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

function tierBadgeClasses(tier) {
    switch (tier) {
        case 'rising':      return 'bg-emerald-50 text-emerald-800 border border-emerald-200/80';
        case 'established': return 'bg-sky-50 text-sky-800 border border-sky-200/80';
        case 'expert':      return 'bg-violet-50 text-violet-800 border border-violet-200/80';
        case 'elite':       return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
        default:            return 'bg-stone-100 text-stone-600';
    }
}
const focusRingDark =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900';
const focusRingWhite =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900';

// Clean stroked SVG icons for each session type key — replaces low-quality emoji rendering.
function SessionTypeIcon({ typeKey, className = 'h-5 w-5' }) {
    switch (typeKey) {
        case 'career_advice':
            return (
                <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                    <circle cx="12" cy="12" r="9" strokeLinecap="round" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.5 9.5-3 5-5 3 3-5 5-3Z" />
                </svg>
            );
        case 'interview_prep':
            return (
                <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
            );
        case 'resume_review':
            return (
                <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v6h6M8 13h8M8 17h5" />
                </svg>
            );
        case 'networking':
            return (
                <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                    <circle cx="8" cy="8" r="3" />
                    <circle cx="16" cy="8" r="3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M14 20v-1a5 5 0 0 1 5-5h0a3 3 0 0 1 3 3v3" />
                </svg>
            );
        default:
            return (
                <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            );
    }
}

/* --- Lean booking modal: format is already chosen on the page. Modal handles date + note only. --- */
function BookingModal({ mentor, sessionType, preselectedDate, onClose }) {
    const [scheduledDate, setScheduledDate] = useState(preselectedDate ?? '');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const handleClose = useCallback(() => onClose(), [onClose]);

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
        setSubmitting(true);
        setResult(null);

        const { error } = await createSession({
            mentorId: mentor.id,
            sessionType: sessionType.key,
            scheduledDate: scheduledDate || null,
            message: message || null,
        });

        setSubmitting(false);

        if (error) {
            setResult({ ok: false, message: error.message ?? 'Something went wrong. Please try again.' });
        } else {
            setResult({ ok: true, message: "Request sent \u2014 they'll confirm or suggest another time." });
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
                className="absolute inset-0 bg-stone-950/70 backdrop-blur-[2px] transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400/90"
                aria-label="Close booking"
                onClick={handleClose}
            />
            <div className="relative flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-stone-950/25 ring-1 ring-stone-200/90 sm:rounded-3xl sm:ring-stone-200/60">
                {result?.ok ? (
                    <div className="flex flex-col items-center px-8 py-14 text-center sm:py-16">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-4xl text-white shadow-lg shadow-amber-900/20">
                            ✓
                        </div>
                        <h2 className="font-display text-2xl font-semibold text-stone-900 sm:text-3xl">You&apos;re on the list</h2>
                        <p className="mt-3 max-w-sm leading-relaxed text-stone-600">{result.message}</p>
                        <p className="mt-2 text-sm text-stone-500">We&apos;ll email you when {mentorFirst} gets back to you.</p>
                        <button
                            type="button"
                            onClick={handleClose}
                            className={`mt-10 rounded-2xl bg-stone-900 px-10 py-3.5 text-sm font-semibold text-amber-50 shadow-lg shadow-stone-900/25 transition hover:bg-stone-800 ${focusRingDark}`}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-6 pb-6 pt-6 sm:px-8">
                            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
                            <div className="relative flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/90">Confirm request</p>
                                    <h2 id="booking-modal-title" className="mt-2 font-display text-xl font-semibold text-white sm:text-2xl">
                                        Book {sessionType.name.toLowerCase()} with {mentor.name}
                                    </h2>
                                    <p className="mt-1.5 text-sm text-stone-300">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-amber-100">
                      <SessionTypeIcon typeKey={sessionType.key} className="h-3.5 w-3.5" />
                        {sessionType.duration}
                    </span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20 ${focusRingWhite}`}
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>
                        </header>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                            <div className="space-y-5 px-5 py-6 sm:px-8">
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
                                    <p className="mt-1.5 text-xs text-stone-500">They&apos;ll confirm or counter with a time that works.</p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500" htmlFor="booking-message">
                                        What do you want out of this hour?
                                    </label>
                                    <textarea
                                        id="booking-message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={4}
                                        placeholder={`e.g. PM loops at ~200-person startups, nervous about system design\u2026`}
                                        className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                                    />
                                    <p className="mt-1.5 text-xs text-stone-500">Optional, but helps them show up prepared.</p>
                                </div>

                                {result && !result.ok && (
                                    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{result.message}</p>
                                )}
                            </div>
                        </div>

                        <footer className="shrink-0 border-t border-stone-200/80 bg-white/95 px-5 py-4 sm:px-8">
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className={`rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 sm:px-6 ${focusRing}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/25 transition hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none sm:min-w-[180px] ${focusRing}`}
                                >
                                    {submitting ? 'Sending…' : 'Send request'}
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
    const dim = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
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

/**
 * AvailabilityCalendar — shows next 14 days with a simple busy/free visual.
 * Uses a deterministic pseudo-random per-mentor so each mentor appears to have
 * a consistent availability pattern (real backend data can replace this later).
 */
function AvailabilityCalendar({ mentorId, onPickDate }) {
    const days = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const out = [];
        // Deterministic seed from mentor id
        let seed = 0;
        const idStr = String(mentorId ?? '');
        for (let i = 0; i < idStr.length; i++) seed = idStr.charCodeAt(i) + ((seed << 5) - seed);

        for (let i = 0; i < 14; i++) {
            const d = new Date(now);
            d.setDate(now.getDate() + i);
            const dow = d.getDay();
            // Weekend → less likely available. Weekday → more likely.
            const pseudo = ((seed + i * 31) * 9301 + 49297) % 233280;
            const rand = pseudo / 233280;
            let status = 'free';
            if (dow === 0 || dow === 6) {
                status = rand > 0.6 ? 'limited' : rand > 0.3 ? 'booked' : 'free';
            } else {
                status = rand > 0.7 ? 'booked' : rand > 0.35 ? 'limited' : 'free';
            }
            out.push({ date: d, status });
        }
        return out;
    }, [mentorId]);

    return (
        <div>
            <div className="grid grid-cols-7 gap-1.5">
                {days.map(({ date, status }) => {
                    const dayLabel = date.toLocaleDateString(undefined, { weekday: 'short' })[0];
                    const dayNum = date.getDate();
                    const iso = date.toISOString().slice(0, 10);
                    const isClickable = status !== 'booked';
                    const tone =
                        status === 'free'
                            ? 'border-emerald-300/60 bg-emerald-50/80 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100/70'
                            : status === 'limited'
                                ? 'border-amber-300/60 bg-amber-50/70 text-amber-900 hover:border-amber-400 hover:bg-amber-100/70'
                                : 'border-stone-200 bg-stone-100/60 text-stone-400 cursor-not-allowed';
                    return (
                        <button
                            key={iso}
                            type="button"
                            disabled={!isClickable}
                            onClick={() => isClickable && onPickDate(`${iso}T14:00`)}
                            aria-label={`${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} — ${status}`}
                            className={`flex aspect-square flex-col items-center justify-center rounded-lg border p-0.5 text-[10px] font-semibold transition ${tone} ${focusRing}`}
                        >
                            <span className="text-[9px] font-medium opacity-70">{dayLabel}</span>
                            <span className="text-sm font-bold">{dayNum}</span>
                        </button>
                    );
                })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-stone-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden /> Open
        </span>
                <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden /> Limited
        </span>
                <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-stone-300" aria-hidden /> Booked
        </span>
            </div>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <main className="relative mx-auto min-h-screen max-w-6xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-12">
            <PageGutterAtmosphere />
            <div className="animate-pulse space-y-8">
                <div className="h-4 w-56 rounded-full bg-stone-200/90" />
                <div className="rounded-[1.75rem] border border-stone-200/80 bg-white/85 p-6 shadow-bridge-card sm:p-8">
                    <div className="flex gap-6">
                        <div className="h-24 w-24 shrink-0 rounded-2xl bg-stone-200/90 sm:h-28 sm:w-28" />
                        <div className="flex-1 space-y-3">
                            <div className="h-8 w-2/3 rounded-lg bg-stone-200/90" />
                            <div className="h-4 w-1/2 rounded bg-stone-100" />
                            <div className="h-4 w-1/3 rounded bg-stone-100" />
                        </div>
                    </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="h-96 rounded-[1.75rem] bg-stone-100/90 lg:col-span-8" />
                    <div className="h-96 rounded-[1.75rem] bg-stone-100/90 lg:col-span-4" />
                </div>
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
    const [selectedType, setSelectedType] = useState(null);
    const [preselectedDate, setPreselectedDate] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        let cancelled = false;
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
        if (!selectedType) return;
        if (!user) {
            navigate('/login', { state: { from: `/mentors/${id}` } });
            return;
        }
        setShowModal(true);
    }

    function handleCalendarPick(isoDate) {
        setPreselectedDate(isoDate);
        if (!selectedType) return;
        if (!user) {
            navigate('/login', { state: { from: `/mentors/${id}` } });
            return;
        }
        setShowModal(true);
    }

    if (loading) return <ProfileSkeleton />;

    if (loadError) {
        return (
            <main className="relative min-h-screen overflow-x-hidden px-4 py-16 sm:px-6">
                <PageGutterAtmosphere />
                <div className="relative mx-auto max-w-lg rounded-[2rem] border border-stone-200/90 bg-white/95 px-8 py-12 text-center shadow-bridge-card">
                    <p className="font-display text-lg font-semibold text-stone-900">Couldn&apos;t load this profile</p>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">{loadError}</p>
                    <Link
                        to="/mentors"
                        className={`mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 ${focusRing}`}
                    >
                        Back to mentors
                    </Link>
                </div>
            </main>
        );
    }

    if (!profile?.mentor) {
        return (
            <main className="relative min-h-screen overflow-x-hidden px-4 py-16 sm:px-6">
                <PageGutterAtmosphere />
                <div className="relative mx-auto max-w-lg rounded-[2rem] border border-dashed border-stone-200/90 bg-gradient-to-b from-stone-50/90 to-orange-50/40 px-8 py-12 text-center shadow-sm">
                    <p className="font-display text-lg font-semibold text-stone-900">This mentor isn&apos;t here</p>
                    <p className="mt-3 text-sm text-stone-600">The link may be outdated or the profile was removed.</p>
                    <Link
                        to="/mentors"
                        className={`mt-8 inline-flex items-center justify-center rounded-full border-2 border-stone-900/10 bg-white px-7 py-3 text-sm font-semibold text-stone-900 shadow-md transition hover:border-orange-300/70 ${focusRing}`}
                    >
                        Browse all mentors
                    </Link>
                </div>
            </main>
        );
    }

    const mentor = profile.mentor;
    const reviewMeta = profile.reviews;
    const industryLabel = formatIndustry(mentor.industry);
    const grad = avatarColor(mentor.name);
    const mentorInitials = initials(mentor.name);
    const firstName = mentor.name?.split(/\s+/)[0] ?? 'them';

    return (
        <>
            <main id="mentor-profile" className="relative min-h-screen overflow-x-hidden" aria-labelledby="profile-heading">
                <PageGutterAtmosphere />

                {/* Compact header — breadcrumb + label only. No more big scroll-mt-20 hero. */}
                <section className="relative border-b border-stone-200/50 bg-gradient-to-b from-white/60 via-orange-50/25 to-transparent px-4 pt-6 sm:px-6 lg:px-8">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-20 -top-8 h-56 w-56 rounded-full bg-amber-200/25 blur-3xl"
                    />
                    <div className="relative mx-auto max-w-6xl pb-5">
                        <nav aria-label="Breadcrumb" className="mb-3">
                            <ol className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
                                <li>
                                    <Link to="/" className={`rounded-md font-medium text-stone-600 transition hover:text-orange-800 ${focusRing}`}>
                                        Home
                                    </Link>
                                </li>
                                <li aria-hidden className="text-stone-300">
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                                    </svg>
                                </li>
                                <li>
                                    <Link
                                        to="/mentors"
                                        className={`rounded-md font-medium text-stone-600 transition hover:text-orange-800 ${focusRing}`}
                                    >
                                        Mentors
                                    </Link>
                                </li>
                                <li aria-hidden className="text-stone-300">
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                                    </svg>
                                </li>
                                <li className="max-w-[min(100%,14rem)] truncate font-medium text-stone-800">{mentor.name}</li>
                            </ol>
                        </nav>
                    </div>
                </section>

                <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8 lg:px-8">
                    {/* Compact hero card — avatar + name/title on left, quick stats on right. */}
                    <section
                        aria-labelledby="profile-heading"
                        className="relative mb-8 overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-white/95 shadow-bridge-card backdrop-blur-md"
                    >
                        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
                        <div className="relative grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-12 lg:items-center lg:gap-8">
                            {/* LEFT: avatar + identity */}
                            <div className="flex flex-col gap-5 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left lg:col-span-8">
                                <div className="flex justify-center sm:block">
                                    {mentor.image_url ? (
                                        <img
                                            src={mentor.image_url}
                                            alt={`${mentor.name} — profile photo`}
                                            className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-md ring-4 ring-white sm:h-28 sm:w-28"
                                        />
                                    ) : (
                                        <div
                                            className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-2xl font-bold text-white shadow-md ring-4 ring-white sm:h-28 sm:w-28 sm:text-3xl`}
                                            aria-hidden
                                        >
                                            {mentorInitials}
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                        {industryLabel ? (
                                            <span className="rounded-full border border-orange-100 bg-orange-50/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-orange-900">
                        {industryLabel}
                      </span>
                                        ) : null}
                                        {mentor.tier ? (
                                            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tierBadgeClasses(mentor.tier)}`}>
                        {mentor.tier.charAt(0).toUpperCase() + mentor.tier.slice(1)}
                      </span>
                                        ) : null}
                                        {mentor.available ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>
                        Accepting sessions
                      </span>
                                        ) : null}
                                    </div>

                                    <h1
                                        id="profile-heading"
                                        className="font-display text-balance text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl lg:text-[2.1rem]"
                                    >
                                        {mentor.name}
                                    </h1>

                                    {mentor.title ? (
                                        <p className="mt-1 text-sm text-stone-600 sm:text-base">
                                            <span className="font-medium text-stone-800">{mentor.title}</span>
                                            {mentor.company ? (
                                                <>
                                                    <span className="text-stone-400"> · </span>
                                                    <span>{mentor.company}</span>
                                                </>
                                            ) : null}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            {/* RIGHT: quick stats inline with the hero */}
                            <dl className="grid grid-cols-3 gap-2 border-t border-stone-100 pt-5 sm:gap-3 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                                    <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Rating</dt>
                                    <dd className="mt-1 flex items-baseline gap-1">
                    <span className="font-display text-xl font-semibold tabular-nums text-stone-900 sm:text-2xl">
                      {displayRating > 0 ? displayRating.toFixed(1) : '—'}
                    </span>
                                        {reviewMeta?.count > 0 ? (
                                            <span className="text-[11px] font-medium text-stone-500">({reviewMeta.count})</span>
                                        ) : null}
                                    </dd>
                                </div>
                                <div className="flex flex-col items-center border-x border-stone-100 text-center lg:items-start lg:border-0 lg:text-left">
                                    <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Experience</dt>
                                    <dd className="mt-1 flex items-baseline gap-1">
                    <span className="font-display text-xl font-semibold tabular-nums text-stone-900 sm:text-2xl">
                      {mentor.years_experience != null ? mentor.years_experience : '—'}
                    </span>
                                        {mentor.years_experience != null ? (
                                            <span className="text-[11px] font-medium text-stone-500">yrs</span>
                                        ) : null}
                                    </dd>
                                </div>
                                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                                    <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Sessions</dt>
                                    <dd className="mt-1">
                    <span className="font-display text-xl font-semibold tabular-nums text-stone-900 sm:text-2xl">
                      {mentor.total_sessions != null ? mentor.total_sessions : '—'}
                    </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </section>

                    {/* Main grid: 8-col content, 4-col sticky booking sidebar */}
                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                        {/* LEFT: bio, expertise, reviews */}
                        <div className="flex flex-col gap-6 lg:col-span-8">
                            <Reveal>
                                <section className="relative overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-white/95 p-7 shadow-bridge-card sm:p-8">
                                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">About</p>
                                    <h2 className="mt-1.5 font-display text-xl font-semibold text-stone-900 sm:text-2xl">Their story</h2>
                                    <div className="mt-4 border-l-[3px] border-orange-200/90 pl-5">
                                        <p className="whitespace-pre-line text-base leading-relaxed text-stone-700 sm:text-lg">
                                            {mentor.bio?.trim() || 'No bio yet—book a session and ask what you would normally read here.'}
                                        </p>
                                    </div>
                                </section>
                            </Reveal>

                            <Reveal delay={60}>
                                <section className="relative overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-white/95 p-7 shadow-bridge-card sm:p-8">
                                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Focus areas</p>
                                    <h2 className="mt-1.5 font-display text-xl font-semibold text-stone-900 sm:text-2xl">Expertise</h2>
                                    {mentor.expertise?.length > 0 ? (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {mentor.expertise.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full border border-orange-100 bg-orange-50/80 px-3 py-1.5 text-sm font-medium text-orange-900"
                                                >
                          {tag}
                        </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-stone-500">No focus areas listed yet.</p>
                                    )}
                                </section>
                            </Reveal>

                            <Reveal delay={120}>
                                <section className="relative overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-white/95 p-7 shadow-bridge-card sm:p-8">
                                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Reviews</p>
                                    <h2 className="mt-1.5 font-display text-xl font-semibold text-stone-900 sm:text-2xl">After sessions</h2>

                                    {mentorReviews.length > 0 ? (
                                        <ul className="mt-5 space-y-3">
                                            {mentorReviews.map((rev) => (
                                                <li
                                                    key={rev.id}
                                                    className="rounded-2xl border border-stone-100/90 bg-stone-50/60 p-4 transition hover:border-orange-100/80 hover:bg-orange-50/25"
                                                >
                                                    <figure>
                                                        <figcaption className="mb-1.5 flex flex-wrap items-center gap-2">
                                                            <StarRow rating={rev.rating} />
                                                            <span className="text-xs text-stone-400">{formatReviewDate(rev.created_at)}</span>
                                                        </figcaption>
                                                        {rev.comment?.trim() ? (
                                                            <blockquote>
                                                                <p className="text-pretty leading-relaxed text-stone-700">{rev.comment.trim()}</p>
                                                            </blockquote>
                                                        ) : (
                                                            <p className="text-sm italic text-stone-400">Rated the session but didn&apos;t leave a note.</p>
                                                        )}
                                                    </figure>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="mt-5 rounded-2xl border border-dashed border-stone-200/90 bg-stone-50/50 px-6 py-10 text-center">
                                            <p className="font-medium text-stone-800">No reviews yet</p>
                                            <p className="mt-1.5 text-sm text-stone-600">
                                                After you meet, they can leave feedback—it&apos;ll show up here.
                                            </p>
                                        </div>
                                    )}
                                </section>
                            </Reveal>
                        </div>

                        {/* RIGHT: booking widget + quick stats */}
                        <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-4">
                            {/* The main event: booking widget */}
                            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 p-6 text-amber-50 shadow-2xl shadow-stone-950/25 ring-1 ring-white/10">
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange-500/20 blur-2xl"
                                />
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 opacity-[0.06]"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                                    }}
                                />

                                <div className="relative">
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">Book a session</p>
                                    <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-white">
                                        Time with {firstName}
                                    </h3>
                                    <p className="mt-1.5 text-sm text-stone-400">Pick a format to begin.</p>

                                    {/* Session type picker */}
                                    <div className="mt-5 space-y-2">
                                        {SESSION_TYPES.map((type) => {
                                            const isSelected = selectedType?.key === type.key;
                                            return (
                                                <button
                                                    key={type.key}
                                                    type="button"
                                                    onClick={() => setSelectedType(type)}
                                                    className={`group w-full rounded-xl border px-3.5 py-3 text-left transition ${
                                                        isSelected
                                                            ? 'border-amber-400/60 bg-amber-400/10 shadow-[0_0_0_1px_rgba(251,191,36,0.35)_inset]'
                                                            : 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.08]'
                                                    } ${focusRingWhite}`}
                                                    aria-pressed={isSelected}
                                                >
                                                    <div className="flex items-center gap-3">
                            <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                                    isSelected
                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-stone-900'
                                        : 'bg-white/10 text-amber-200 group-hover:bg-white/15'
                                }`}
                            >
                              <SessionTypeIcon typeKey={type.key} />
                            </span>
                                                        <span className="min-w-0 flex-1">
                              <span className={`block text-sm font-semibold ${isSelected ? 'text-white' : 'text-amber-50'}`}>
                                {type.name}
                              </span>
                              <span className="block text-xs text-stone-400">{type.duration}</span>
                            </span>
                                                        {isSelected ? (
                                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[11px] font-bold text-stone-900">
                                ✓
                              </span>
                                                        ) : null}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Availability calendar — appears only after a type is picked, so it feels like the next step */}
                                    {selectedType ? (
                                        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">Availability</p>
                                                <p className="text-[11px] text-stone-400">Next 14 days</p>
                                            </div>
                                            <div className="[&_button]:border-white/10 [&_button]:bg-white/[0.03] [&_button]:text-amber-50/90">
                                                <AvailabilityCalendar mentorId={mentor.id} onPickDate={handleCalendarPick} />
                                            </div>
                                            <p className="mt-3 text-[11px] leading-relaxed text-stone-500">
                                                Tap any open day to prefill it. Or just hit the button — you can pick a time next.
                                            </p>
                                        </div>
                                    ) : null}

                                    {mentor.session_rate ? (
                                        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">Session rate</p>
                                            <p className="mt-1 font-display text-2xl font-semibold text-white">
                                                ${mentor.session_rate}
                                                <span className="ml-1.5 text-sm font-normal text-stone-400">per session</span>
                                            </p>
                                        </div>
                                    ) : null}

                                    <button
                                        type="button"
                                        onClick={handleBookClick}
                                        disabled={!selectedType}
                                        className={`mt-5 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 py-3.5 text-sm font-semibold text-stone-900 shadow-lg transition hover:from-amber-300 hover:to-orange-300 disabled:cursor-not-allowed disabled:from-stone-700 disabled:to-stone-700 disabled:text-stone-400 disabled:shadow-none ${focusRing}`}
                                    >
                                        {selectedType ? `Book ${selectedType.name.toLowerCase()}` : 'Pick a format above'}
                                    </button>

                                    {!user ? (
                                        <p className="mt-3 text-center text-[11px] text-stone-400">
                                            <Link to="/login" state={{ from: `/mentors/${id}` }} className="font-semibold text-amber-300 underline underline-offset-2 hover:text-amber-200">
                                                Log in
                                            </Link>{' '}
                                            to send the request
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {showModal && selectedType ? (
                <BookingModal
                    mentor={mentor}
                    sessionType={selectedType}
                    preselectedDate={preselectedDate}
                    onClose={() => setShowModal(false)}
                />
            ) : null}
        </>
    );
}
