import { useState, useEffect, useMemo, useId, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMentorById } from '../api/mentors';
import { getReviewsForMentor } from '../api/reviews';
import { createSession } from '../api/sessions';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import { SESSION_TYPES } from '../constants/sessionTypes';
import { addRecentlyViewedMentor } from '../utils/recentlyViewed';
import {
  buildAvailabilityCalendar,
  getSlotsForDate,
  normalizeAvailabilitySchedule,
} from '../utils/mentorAvailability';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import Reveal from '../components/Reveal';
import { focusRing } from '../ui';
const focusRingDark = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900';
const focusRingWhite = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900';

function tierBadgeClasses(tier) {
    switch (tier) {
        case 'rising':      return 'bg-emerald-50 text-emerald-800 border border-emerald-200/80';
        case 'established': return 'bg-sky-50 text-sky-800 border border-sky-200/80';
        case 'expert':      return 'bg-violet-50 text-violet-800 border border-violet-200/80';
        case 'elite':       return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm';
        default:            return 'bg-stone-100 text-stone-600';
    }
}

function SessionTypeIcon({ typeKey, className = 'h-5 w-5' }) {
    const common = { className, fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, viewBox: '0 0 24 24', 'aria-hidden': true };
    switch (typeKey) {
        case 'career_advice':
            return <svg {...common}><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="m14.5 9.5-3 5-5 3 3-5 5-3Z" /></svg>;
        case 'interview_prep':
            return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>;
        case 'resume_review':
            return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14 3v6h6M8 13h8M8 17h5" /></svg>;
        case 'networking':
            return <svg {...common}><circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M2 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M14 20v-1a5 5 0 0 1 5-5h0a3 3 0 0 1 3 3v3" /></svg>;
        default:
            return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
    }
}

function avatarColor(name = '') {
    const palette = ['from-amber-400 to-orange-500', 'from-rose-400 to-pink-500', 'from-violet-400 to-purple-600', 'from-teal-400 to-emerald-600', 'from-sky-400 to-indigo-500', 'from-fuchsia-400 to-rose-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
}

function initials(name = '') {
    return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

function formatIndustry(industry) {
    if (!industry?.trim()) return null;
    return industry.trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
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
                  <polygon points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7" fill={`url(#${gid})`} />
              </svg>
          );
      })}
    </span>
    );
}

function BookingFlow({ mentor, sessionType, onReset, onRequestConfirm, user, navigate, mentorId }) {
    const [pickedDate, setPickedDate] = useState(null);
    const [pickedTime, setPickedTime] = useState(null);
    const scheduleNorm = useMemo(() => normalizeAvailabilitySchedule(mentor.availability_schedule), [mentor.availability_schedule]);
    const acceptingBookings = mentor.available !== false;
    const availability = useMemo(
        () => buildAvailabilityCalendar(scheduleNorm, acceptingBookings, 14),
        [scheduleNorm, acceptingBookings],
    );
    const slots = useMemo(
        () => getSlotsForDate(scheduleNorm, pickedDate, acceptingBookings),
        [scheduleNorm, pickedDate, acceptingBookings],
    );

    const hasAnyWeeklySlots = useMemo(
        () => Object.values(scheduleNorm.weekly).some((a) => Array.isArray(a) && a.length > 0),
        [scheduleNorm],
    );

    useEffect(() => { setPickedTime(null); }, [pickedDate]);

    const canBook = Boolean(sessionType && pickedDate && pickedTime);

    function handleBookClick() {
        if (!canBook) return;
        if (!user) {
            navigate('/login', { state: { from: `/mentors/${mentorId}` } });
            return;
        }
        const iso = `${pickedDate.toISOString().slice(0, 10)}T${pickedTime}`;
        onRequestConfirm({ sessionType, isoDate: iso, prettyDate: pickedDate, prettyTime: pickedTime });
    }

    return (
        <Reveal>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-glow">
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

                <div className="grid gap-0 lg:grid-cols-12">
                    <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 p-7 text-amber-50 lg:col-span-4 lg:p-8">
                        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />

                        <p className="relative text-[11px] font-bold uppercase tracking-[0.22em] text-orange-300">Your session</p>

                        <div className="relative mt-4 flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-stone-900">
                <SessionTypeIcon typeKey={sessionType.key} />
              </span>
                            <div>
                                <p className="font-display text-xl font-semibold text-white">{sessionType.name}</p>
                                <p className="text-sm text-orange-200/80">{sessionType.duration} · with {mentor.name.split(' ')[0]}</p>
                            </div>
                        </div>

                        {mentor.session_rate ? (
                            <div className="relative mt-5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3.5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">Total</p>
                                <p className="mt-1 font-display text-3xl font-semibold text-white tabular-nums">${mentor.session_rate}</p>
                                <p className="text-xs text-amber-100/80">Charged after confirmation</p>
                            </div>
                        ) : null}

                        <div className="relative mt-5 border-t border-white/10 pt-4 text-sm">
                            <dl className="space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-stone-400">Date</dt>
                                    <dd className={`text-right font-medium ${pickedDate ? 'text-white' : 'text-stone-500'}`}>
                                        {pickedDate ? pickedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Pick a day →'}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-stone-400">Time</dt>
                                    <dd className={`text-right font-medium ${pickedTime ? 'text-white' : 'text-stone-500'}`}>{pickedTime ?? 'Pick a time →'}</dd>
                                </div>
                            </dl>
                        </div>

                        <button
                            type="button"
                            onClick={handleBookClick}
                            disabled={!canBook}
                            className={`relative mt-6 w-full rounded-xl py-3.5 text-sm font-semibold transition ${canBook ? `bg-gradient-to-r from-amber-400 to-orange-400 text-stone-900 shadow-lg hover:from-amber-300 hover:to-orange-300 ${focusRing}` : 'cursor-not-allowed bg-white/10 text-stone-500'}`}
                        >
                            {canBook ? (mentor.session_rate ? `Continue to payment →` : 'Book session →') : 'Pick a date & time'}
                        </button>

                        <button type="button" onClick={onReset} className={`relative mt-3 w-full rounded-lg py-2 text-center text-xs font-medium text-stone-400 transition hover:text-stone-200 ${focusRingWhite}`}>
                            Change format
                        </button>
                    </div>

                    <div className="p-7 lg:col-span-8 lg:p-8">
                        <div className="mb-5 flex items-baseline justify-between">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-800/80">Step 2 of 2</p>
                                <h3 className="mt-1 font-display text-xl font-semibold text-stone-900">When works for you?</h3>
                            </div>
                            <p className="text-xs text-stone-500">Next 14 days</p>
                        </div>

                        {!acceptingBookings ? (
                            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                This mentor is not accepting new session requests right now.
                            </div>
                        ) : !hasAnyWeeklySlots ? (
                            <div className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                                This mentor has not published open hours yet. Check back later.
                            </div>
                        ) : null}

                        <div className="mb-3 flex items-center gap-3 text-[11px] text-stone-500">
                            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Open</span>
                            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Limited</span>
                            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-stone-300" /> Booked</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1.5">
                            {availability.map(({ date, status }) => {
                                const iso = date.toISOString().slice(0, 10);
                                const isSelected = pickedDate?.toISOString().slice(0, 10) === iso;
                                const isClickable = status !== 'booked';
                                const base = 'flex aspect-square flex-col items-center justify-center rounded-lg border p-1 text-xs font-semibold transition';
                                let tone;
                                if (isSelected) tone = 'border-orange-500 bg-gradient-to-br from-orange-100 to-amber-100 text-orange-950 shadow-md ring-2 ring-orange-400';
                                else if (status === 'free') tone = 'border-emerald-300/70 bg-emerald-50/80 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100/70';
                                else if (status === 'limited') tone = 'border-amber-300/70 bg-amber-50/80 text-amber-900 hover:border-amber-400 hover:bg-amber-100/70';
                                else tone = 'border-stone-200 bg-stone-100/60 text-stone-400 cursor-not-allowed';
                                return (
                                    <button
                                        key={iso}
                                        type="button"
                                        disabled={!isClickable}
                                        onClick={() => setPickedDate(new Date(date))}
                                        aria-label={`${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} — ${status}`}
                                        aria-pressed={isSelected}
                                        className={`${base} ${tone} ${focusRing}`}
                                    >
                                        <span className="text-[9px] font-medium opacity-70">{date.toLocaleDateString(undefined, { weekday: 'short' })[0]}</span>
                                        <span className="text-sm font-bold">{date.getDate()}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className={`mt-6 overflow-hidden transition-all duration-300 ${pickedDate ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-4">
                                <div className="mb-3 flex items-baseline justify-between">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Available times</p>
                                    {pickedDate ? <p className="text-xs font-medium text-stone-700">{pickedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p> : null}
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {slots.map(({ time, available }) => {
                                        const isSelected = pickedTime === time;
                                        return (
                                            <button
                                                key={time}
                                                type="button"
                                                disabled={!available}
                                                onClick={() => setPickedTime(time)}
                                                aria-pressed={isSelected}
                                                className={`rounded-lg border px-2 py-2.5 text-sm font-semibold transition ${
                                                    isSelected
                                                        ? `border-orange-500 bg-gradient-to-br from-orange-100 to-amber-100 text-orange-950 shadow-sm ring-2 ring-orange-400 ${focusRing}`
                                                        : available
                                                            ? `border-stone-200 bg-white text-stone-800 hover:border-orange-300 hover:bg-orange-50/50 ${focusRing}`
                                                            : 'cursor-not-allowed border-stone-100 bg-stone-100/40 text-stone-300 line-through'
                                                }`}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </div>
                                {slots.every((s) => !s.available) ? <p className="mt-3 text-xs text-stone-500">No open slots this day — try another date.</p> : null}
                            </div>
                        </div>

                        {!pickedDate ? <p className="mt-4 text-xs text-stone-500">Pick a day above to see available times.</p> : null}
                    </div>
                </div>
            </div>
        </Reveal>
    );
}

function ConfirmModal({ mentor, confirmation, onClose, onConfirmed }) {
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [message, setMessage] = useState('');

    const handleClose = useCallback(() => onClose(), [onClose]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [handleClose]);

    async function handleConfirm() {
        setSubmitting(true);
        setResult(null);
        const { error } = await createSession({
            mentorId: mentor.id,
            sessionType: confirmation.sessionType.key,
            scheduledDate: confirmation.isoDate,
            message: message || null,
        });
        setSubmitting(false);
        if (error) setResult({ ok: false, message: error.message ?? 'Something went wrong. Please try again.' });
        else { setResult({ ok: true }); onConfirmed?.(); }
    }

    const mentorFirst = mentor.name?.split(/\s+/)[0] ?? 'your mentor';
    const prettyDate = confirmation.prettyDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
            <button type="button" className="absolute inset-0 bg-stone-950/70 backdrop-blur-[2px]" aria-label="Close" onClick={handleClose} />
            <div className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-[var(--bridge-surface)] shadow-2xl ring-1 ring-[var(--bridge-border)] sm:rounded-3xl">
                {result?.ok ? (
                    <div className="flex flex-col items-center px-8 py-14 text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-4xl text-white shadow-lg">✓</div>
                        <h2 id="confirm-modal-title" className="font-display text-2xl font-semibold text-stone-900">Request sent</h2>
                        <p className="mt-3 max-w-sm leading-relaxed text-stone-600">{mentorFirst} will confirm or suggest another time. We'll email you as soon as they do.</p>
                        <button type="button" onClick={handleClose} className={`mt-8 rounded-2xl bg-stone-900 px-10 py-3 text-sm font-semibold text-amber-50 shadow-lg transition hover:bg-stone-800 ${focusRingDark}`}>Done</button>
                    </div>
                ) : (
                    <>
                        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-6 pb-6 pt-6 sm:px-7">
                            <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl" />
                            <div className="relative flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/90">Confirm & pay</p>
                                    <h2 id="confirm-modal-title" className="mt-1.5 font-display text-lg font-semibold text-white">Ready to book?</h2>
                                </div>
                                <button type="button" onClick={handleClose} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20 ${focusRingWhite}`} aria-label="Close">×</button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto">
                            <div className="space-y-5 px-6 py-5 sm:px-7">
                                <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-4">
                                    <dl className="space-y-3 text-sm">
                                        <div className="flex items-start justify-between gap-3"><dt className="text-stone-500">Mentor</dt><dd className="text-right font-semibold text-stone-900">{mentor.name}</dd></div>
                                        <div className="flex items-start justify-between gap-3 border-t border-stone-200 pt-3"><dt className="text-stone-500">Format</dt><dd className="text-right font-semibold text-stone-900">{confirmation.sessionType.name}<span className="ml-1.5 font-normal text-stone-500">· {confirmation.sessionType.duration}</span></dd></div>
                                        <div className="flex items-start justify-between gap-3 border-t border-stone-200 pt-3"><dt className="text-stone-500">Date</dt><dd className="text-right font-semibold text-stone-900">{prettyDate}</dd></div>
                                        <div className="flex items-start justify-between gap-3 border-t border-stone-200 pt-3"><dt className="text-stone-500">Time</dt><dd className="text-right font-semibold text-stone-900">{confirmation.prettyTime}</dd></div>
                                        {mentor.session_rate ? (
                                            <div className="flex items-start justify-between gap-3 border-t border-stone-300 pt-3"><dt className="font-bold text-stone-900">Total</dt><dd className="text-right font-display text-xl font-semibold text-stone-900 tabular-nums">${mentor.session_rate}</dd></div>
                                        ) : null}
                                    </dl>
                                </div>

                                <div>
                                    <label htmlFor="booking-note" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">Add context <span className="font-normal normal-case text-stone-400">(optional)</span></label>
                                    <textarea id="booking-note" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="What do you want to get out of this hour?" className="w-full resize-none rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                                </div>

                                {result && !result.ok ? <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800">{result.message}</p> : null}
                            </div>
                        </div>

                        <footer className="shrink-0 border-t border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-6 py-4 sm:px-7">
                            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                                <button type="button" onClick={handleClose} disabled={submitting} className={`rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60 ${focusRing}`}>Cancel</button>
                                <button type="button" onClick={handleConfirm} disabled={submitting} className={`rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[180px] ${focusRing}`}>
                                    {submitting ? 'Sending…' : mentor.session_rate ? `Pay $${mentor.session_rate} & book` : 'Confirm booking'}
                                </button>
                            </div>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <main className="relative mx-auto min-h-screen max-w-bridge overflow-x-hidden px-4 py-8 sm:px-6 sm:py-12">
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
            </div>
        </main>
    );
}

function formatReviewDate(iso) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return ''; }
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
    const [pendingConfirm, setPendingConfirm] = useState(null);
    const bookingRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setLoadError(null);

        Promise.all([getMentorById(id), getReviewsForMentor(id)]).then(([mentorRes, reviewsRes]) => {
            if (cancelled) return;
            if (mentorRes.error) {
                setProfile(null); setMentorReviews([]); setLoadError(mentorRes.error.message ?? 'Could not load mentor.');
            } else if (!mentorRes.data?.mentor) {
                setProfile(null); setMentorReviews([]); setLoadError(null);
            } else {
                setProfile(mentorRes.data);
                setMentorReviews(reviewsRes.error ? [] : (reviewsRes.data ?? []));
                setLoadError(null);
                addRecentlyViewedMentor(mentorRes.data.mentor);
            }
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, [id]);

    useEffect(() => {
        setSelectedType(null);
        setPendingConfirm(null);
    }, [id]);

    const displayRating = useMemo(() => {
        if (!profile?.mentor) return 0;
        const fromReviews = profile.reviews?.average;
        if (fromReviews != null && profile.reviews.count > 0) return Number(fromReviews);
        const r = profile.mentor.rating;
        return r != null ? Number(r) : 0;
    }, [profile]);

    function handlePickType(type) {
        setSelectedType(type);
    }

    if (loading) return <ProfileSkeleton />;

    if (loadError) {
        return (
            <main className="relative min-h-screen overflow-x-hidden px-4 py-16 sm:px-6">
                <PageGutterAtmosphere />
                <div className="relative mx-auto max-w-lg rounded-[2rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-8 py-12 text-center shadow-bridge-card">
                    <p className="font-display text-lg font-semibold text-stone-900">Couldn't load this profile</p>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">{loadError}</p>
                    <Link to="/mentors" className={`mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:from-orange-500 hover:to-amber-400 ${focusRing}`}>Back to mentors</Link>
                </div>
            </main>
        );
    }

    if (!profile?.mentor) {
        return (
            <main className="relative min-h-screen overflow-x-hidden px-4 py-16 sm:px-6">
                <PageGutterAtmosphere />
                <div className="relative mx-auto max-w-lg rounded-[2rem] border border-dashed border-stone-200/90 bg-gradient-to-b from-stone-50/90 to-orange-50/40 px-8 py-12 text-center shadow-sm">
                    <p className="font-display text-lg font-semibold text-stone-900">This mentor isn't here</p>
                    <p className="mt-3 text-sm text-stone-600">The link may be outdated or the profile was removed.</p>
                    <Link to="/mentors" className={`mt-8 inline-flex items-center justify-center rounded-full border-2 border-stone-900/10 bg-white px-7 py-3 text-sm font-semibold text-stone-900 shadow-md transition hover:border-orange-300/70 ${focusRing}`}>Browse all mentors</Link>
                </div>
            </main>
        );
    }

    const mentor = profile.mentor;
    const reviewMeta = profile.reviews;
    const viewerIsMentor = user ? isMentorAccount(user) : false;
    const isOwnMentorProfile = Boolean(
        user && mentor.user_id && mentor.user_id === user.id,
    );
    const bookingDisabledForMentor = viewerIsMentor && !isOwnMentorProfile;
    const industryLabel = formatIndustry(mentor.industry);
    const grad = avatarColor(mentor.name);
    const mentorInitials = initials(mentor.name);

    return (
        <>
            <main id="mentor-profile" className="relative min-h-screen overflow-x-hidden bg-[var(--bridge-canvas)]" aria-labelledby="profile-heading">
                <PageGutterAtmosphere />

                <section className="bridge-hero-strip relative px-4 pt-6 sm:px-6 lg:px-8">
                    <div aria-hidden className="bridge-ambient-orb absolute -right-14 -top-10 h-52 w-52" />
                    <div className="relative mx-auto max-w-bridge pb-5">
                        <nav aria-label="Breadcrumb">
                            <ol className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
                                <li><Link to="/" className={`rounded-md font-medium text-stone-600 transition hover:text-orange-800 ${focusRing}`}>Home</Link></li>
                                <li aria-hidden className="text-stone-300"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" /></svg></li>
                                <li><Link to="/mentors" className={`rounded-md font-medium text-stone-600 transition hover:text-orange-800 ${focusRing}`}>Mentors</Link></li>
                                <li aria-hidden className="text-stone-300"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" /></svg></li>
                                <li className="max-w-[min(100%,14rem)] truncate font-medium text-stone-800">{mentor.name}</li>
                            </ol>
                        </nav>
                    </div>
                </section>

                <div className="relative mx-auto max-w-bridge px-4 pb-24 pt-6 sm:px-6 sm:pt-8 lg:px-8">
                    <section aria-labelledby="profile-heading" className="relative mb-8 overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-card backdrop-blur-md">
                        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
                        <div className="relative grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-12 lg:items-center lg:gap-8">
                            <div className="flex flex-col gap-5 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left lg:col-span-7">
                                <div className="flex justify-center sm:block">
                                    {mentor.image_url ? (
                                        <img src={mentor.image_url} alt={`${mentor.name} — profile photo`} className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-md ring-4 ring-[var(--bridge-canvas)] sm:h-28 sm:w-28" />
                                    ) : (
                                        <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-2xl font-bold text-white shadow-md ring-4 ring-[var(--bridge-canvas)] sm:h-28 sm:w-28 sm:text-3xl`} aria-hidden>{mentorInitials}</div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                        {industryLabel ? <span className="rounded-full border border-orange-100 bg-orange-50/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-orange-900">{industryLabel}</span> : null}
                                        {mentor.tier ? <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tierBadgeClasses(mentor.tier)}`}>{mentor.tier.charAt(0).toUpperCase() + mentor.tier.slice(1)}</span> : null}
                                        {mentor.available ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" /></span>
                        Accepting sessions
                      </span>
                                        ) : null}
                                    </div>

                                    <h1 id="profile-heading" className="font-display text-balance text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl lg:text-[2.1rem]">{mentor.name}</h1>

                                    {mentor.title ? (
                                        <p className="mt-1 text-sm text-stone-600 sm:text-base">
                                            <span className="font-medium text-stone-800">{mentor.title}</span>
                                            {mentor.company ? <><span className="text-stone-400"> · </span><span>{mentor.company}</span></> : null}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <dl className="grid grid-cols-4 gap-2 border-t border-stone-100 pt-5 sm:gap-3 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                                    <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Rating</dt>
                                    <dd className="mt-1 flex items-baseline gap-1">
                                        <span className="font-display text-xl font-semibold tabular-nums text-stone-900 sm:text-2xl">{displayRating > 0 ? displayRating.toFixed(1) : '—'}</span>
                                        {reviewMeta?.count > 0 ? <span className="text-[11px] font-medium text-stone-500">({reviewMeta.count})</span> : null}
                                    </dd>
                                </div>
                                <div className="flex flex-col items-center border-x border-stone-100 text-center lg:items-start lg:border-r lg:border-l-0 lg:text-left">
                                    <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Experience</dt>
                                    <dd className="mt-1 flex items-baseline gap-1">
                                        <span className="font-display text-xl font-semibold tabular-nums text-stone-900 sm:text-2xl">{mentor.years_experience != null ? mentor.years_experience : '—'}</span>
                                        {mentor.years_experience != null ? <span className="text-[11px] font-medium text-stone-500">yrs</span> : null}
                                    </dd>
                                </div>
                                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                                    <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Sessions</dt>
                                    <dd className="mt-1"><span className="font-display text-xl font-semibold tabular-nums text-stone-900 sm:text-2xl">{mentor.total_sessions != null ? mentor.total_sessions : '—'}</span></dd>
                                </div>
                                <div className="flex flex-col items-center border-l border-stone-100 text-center lg:items-start lg:text-left">
                                    <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-700">Rate</dt>
                                    <dd className="mt-1">
                    <span className="font-display text-xl font-semibold tabular-nums text-gradient-bridge sm:text-2xl">
                      {mentor.session_rate ? `$${mentor.session_rate}` : '—'}
                    </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </section>

                    <div ref={bookingRef} className="mb-10 scroll-mt-24">
                        {isOwnMentorProfile ? (
                            <section className="relative overflow-hidden rounded-[1.75rem] border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/40 p-7 shadow-bridge-card sm:p-8">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">Your public profile</p>
                                <h2 className="mt-2 font-display text-2xl font-semibold text-stone-900 sm:text-3xl">
                                    This is what mentees see before they book
                                </h2>
                                <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
                                    Session requests and your availability are managed from your dashboard. You don&apos;t book yourself here—that keeps your calendar and payouts accurate.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        to="/dashboard"
                                        className={`inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-stone-800 ${focusRing}`}
                                    >
                                        Open mentor dashboard
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className={`inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-orange-200 ${focusRing}`}
                                    >
                                        Account settings
                                    </Link>
                                </div>
                            </section>
                        ) : bookingDisabledForMentor ? (
                            <section className="relative overflow-hidden rounded-[1.75rem] border border-amber-200/90 bg-gradient-to-br from-amber-50 via-white to-orange-50/50 p-7 shadow-bridge-card sm:p-8">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-800">Mentor account</p>
                                <h2 className="mt-2 font-display text-2xl font-semibold text-stone-900 sm:text-3xl">
                                    Booking is for mentee accounts
                                </h2>
                                <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
                                    You signed up as a mentor on Bridge, so you can accept requests and run sessions—not book other mentors from this account. If you also want to learn from someone, use a separate email for a member (mentee) account.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        to="/dashboard"
                                        className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-orange-500 hover:to-amber-400 ${focusRing}`}
                                    >
                                        Back to your dashboard
                                    </Link>
                                </div>
                            </section>
                        ) : !selectedType ? (
                            <section className="relative overflow-hidden rounded-[1.75rem] border border-stone-900/90 bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 p-7 text-amber-50 shadow-2xl ring-1 ring-white/10 sm:p-8">
                                <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
                                <div className="relative flex items-baseline justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">Book a session</p>
                                        <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">What kind of hour do you want?</h2>
                                        <p className="mt-2 text-sm text-stone-300">Pick a format. {mentor.session_rate ? `All sessions $${mentor.session_rate}.` : 'Pricing varies by format.'}</p>
                                    </div>
                                    <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-200 sm:inline-block">Step 1 of 2</span>
                                </div>

                                <div className="relative mt-6 grid gap-2.5 sm:grid-cols-2">
                                    {SESSION_TYPES.map((type) => (
                                        <button key={type.key} type="button" onClick={() => handlePickType(type)} className={`group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left transition hover:border-amber-400/60 hover:bg-white/[0.08] ${focusRingWhite}`}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-amber-200 transition group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-orange-500 group-hover:text-stone-900">
                        <SessionTypeIcon typeKey={type.key} />
                      </span>
                                            <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-white">{type.name}</span>
                        <span className="block text-xs text-stone-400">{type.duration}</span>
                      </span>
                                            <svg className="h-4 w-4 text-stone-500 transition group-hover:translate-x-0.5 group-hover:text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" /></svg>
                                        </button>
                                    ))}
                                </div>

                                {!user ? (
                                    <p className="relative mt-5 text-xs text-stone-400">
                                        <Link to="/login" state={{ from: `/mentors/${id}` }} className="font-semibold text-amber-300 underline underline-offset-2 hover:text-amber-200">Log in</Link> to book — you can still browse without an account.
                                    </p>
                                ) : null}
                            </section>
                        ) : (
                            <BookingFlow mentor={mentor} sessionType={selectedType} onReset={() => setSelectedType(null)} onRequestConfirm={(payload) => setPendingConfirm(payload)} user={user} navigate={navigate} mentorId={id} />
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <Reveal>
                            <section className="relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-card sm:p-8">
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">About</p>
                                <h2 className="mt-1.5 font-display text-xl font-semibold text-stone-900 sm:text-2xl">Their story</h2>
                                <div className="mt-4 border-l-[3px] border-orange-200/90 pl-5">
                                    <p className="whitespace-pre-line text-base leading-relaxed text-stone-700 sm:text-lg">
                                        {mentor.bio?.trim() || 'No bio yet — book a session and ask what you would normally read here.'}
                                    </p>
                                </div>
                            </section>
                        </Reveal>

                        <Reveal delay={60}>
                            <section className="relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-card sm:p-8">
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Focus areas</p>
                                <h2 className="mt-1.5 font-display text-xl font-semibold text-stone-900 sm:text-2xl">Expertise</h2>
                                {mentor.expertise?.length > 0 ? (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {mentor.expertise.map((tag) => (
                                            <span key={tag} className="rounded-full border border-orange-100 bg-orange-50/80 px-3 py-1.5 text-sm font-medium text-orange-900">{tag}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-3 text-stone-500">No focus areas listed yet.</p>
                                )}
                            </section>
                        </Reveal>

                        <Reveal delay={120}>
                            <section className="relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-card sm:p-8">
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Reviews</p>
                                <h2 className="mt-1.5 font-display text-xl font-semibold text-stone-900 sm:text-2xl">After sessions</h2>

                                {mentorReviews.length > 0 ? (
                                    <ul className="mt-5 space-y-3">
                                        {mentorReviews.map((rev) => (
                                            <li key={rev.id} className="rounded-2xl border border-stone-100/90 bg-stone-50/60 p-4 transition hover:border-orange-100/80 hover:bg-orange-50/25">
                                                <figure>
                                                    <figcaption className="mb-1.5 flex flex-wrap items-center gap-2">
                                                        <StarRow rating={rev.rating} />
                                                        <span className="text-xs text-stone-400">{formatReviewDate(rev.created_at)}</span>
                                                    </figcaption>
                                                    {rev.comment?.trim() ? (
                                                        <blockquote><p className="text-pretty leading-relaxed text-stone-700">{rev.comment.trim()}</p></blockquote>
                                                    ) : (
                                                        <p className="text-sm italic text-stone-400">Rated the session but didn't leave a note.</p>
                                                    )}
                                                </figure>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="mt-5 rounded-2xl border border-dashed border-stone-200/90 bg-stone-50/50 px-6 py-10 text-center">
                                        <p className="font-medium text-stone-800">No reviews yet</p>
                                        <p className="mt-1.5 text-sm text-stone-600">After you meet, they can leave feedback — it'll show up here.</p>
                                    </div>
                                )}
                            </section>
                        </Reveal>
                    </div>
                </div>
            </main>

            {pendingConfirm ? (
                <ConfirmModal mentor={mentor} confirmation={pendingConfirm} onClose={() => setPendingConfirm(null)} onConfirmed={() => setSelectedType(null)} />
            ) : null}
        </>
    );
}