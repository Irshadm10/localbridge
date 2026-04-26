import { useState, useEffect, useMemo, useId, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import EmbeddedCheckoutPanel from '../components/EmbeddedCheckoutPanel';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getMentorById } from '../api/mentors';
import { getReviewsForMentor } from '../api/reviews';
import { createSession } from '../api/sessions';
import { getMentorAvailability, bookCalendarEvent } from '../api/calendar';
import supabase from '../api/supabase';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import { SESSION_TYPES } from '../constants/sessionTypes';
import { addRecentlyViewedMentor } from '../utils/recentlyViewed';
import {
  buildAvailabilityCalendar,
  getSlotsForDate,
  normalizeAvailabilitySchedule,
  localDateStr,
} from '../utils/mentorAvailability';
import MentorAvatar from '../components/MentorAvatar';
import { focusRing } from '../ui';
import { createBookingCheckout } from '../api/stripe';
import { finalizeCheckout } from '../api/stripe';

const focusRingDark  = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900';
const focusRingWhite = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900';

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
      {/* Backdrop */}
      <button type="button" className="absolute inset-0 bg-stone-950/75 backdrop-blur-[3px]" aria-label="Close" onClick={onClose} />

      {/* Panel */}
      <div className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-[var(--bridge-surface)] shadow-2xl ring-1 ring-[var(--bridge-border)] sm:rounded-3xl">

        {/* Header */}
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
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-stone-300 transition hover:bg-white/20 hover:text-white ${focusRingWhite}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Tiers grid */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {MENTOR_TIERS.map((tier) => (
              <div key={tier.name} className="group relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-5 transition hover:border-[var(--bridge-border-strong)] hover:shadow-bridge-card">
                {/* Subtle glow */}
                <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle, ${tier.glowColor}, transparent 70%)` }} />

                {/* Top accent bar */}
                <div aria-hidden className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${tier.accentFrom} ${tier.accentTo} opacity-70`} />

                <div className="relative">
                  {/* Badge + rate */}
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] border ${tier.badgeBg} ${tier.badgeText} ${tier.badgeBorder}`}>
                      {tier.name}
                    </span>
                    <span className={`font-display text-xl font-black tabular-nums bg-gradient-to-r ${tier.accentFrom} ${tier.accentTo} bg-clip-text text-transparent`}>
                      {tier.rateRange}
                    </span>
                  </div>

                  {/* Experience desc */}
                  <p className="mb-3 text-xs leading-relaxed text-[var(--bridge-text-muted)]">{tier.experienceDesc}</p>

                  {/* Use cases */}
                  <ul className="space-y-1.5">
                    {tier.useCases.map((uc) => (
                      <li key={uc} className="flex items-start gap-2 text-xs text-[var(--bridge-text-secondary)]">
                        <svg className={`mt-0.5 h-3.5 w-3.5 shrink-0 bg-gradient-to-r ${tier.accentFrom} ${tier.accentTo} bg-clip-text`} viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="6" className={`fill-current bg-gradient-to-r ${tier.accentFrom} ${tier.accentTo}`} style={{ fill: `url(#g-${tier.name})` }} />
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tierBadgeClasses(tier) {
  switch (tier) {
    case 'rising':      return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
    case 'established': return 'bg-sky-500/15 text-sky-300 border border-sky-500/30';
    case 'expert':      return 'bg-violet-500/15 text-violet-300 border border-violet-500/30';
    case 'elite':       return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm';
    default:            return 'bg-white/10 text-stone-300 border border-white/15';
  }
}

function formatIndustry(industry) {
  if (!industry?.trim()) return null;
  return industry.trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function formatReviewDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return ''; }
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// ─── Star row ─────────────────────────────────────────────────────────────────

function StarRow({ rating, size = 'md' }) {
  const uid = useId().replace(/:/g, '');
  const r   = Math.min(5, Math.max(0, Number(rating) || 0));
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
                <stop offset={`${fill}%`} stopColor="#f59e0b" />
                <stop offset={`${fill}%`} stopColor="#44403c" />
              </linearGradient>
            </defs>
            <polygon points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7" fill={`url(#${gid})`} />
          </svg>
        );
      })}
    </span>
  );
}

// ─── Session type icon ─────────────────────────────────────────────────────────

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

// ─── Profile skeleton ──────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bridge-canvas)]">
      <div className="relative border-b border-[var(--bridge-border)] pb-8 pt-6">
        <div className="relative mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-3 w-12 animate-pulse rounded-full bg-[var(--bridge-surface-muted)]" />
            <div className="h-3 w-16 animate-pulse rounded-full bg-[var(--bridge-surface-muted)]" />
          </div>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div className="h-28 w-28 animate-pulse rounded-[1.25rem] bg-[var(--bridge-surface-muted)] shadow-bridge-card" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-28 animate-pulse rounded-full bg-[var(--bridge-surface-muted)]" />
              <div className="h-10 w-64 animate-pulse rounded-xl bg-[var(--bridge-surface-muted)]" />
              <div className="h-5 w-48 animate-pulse rounded-lg bg-[var(--bridge-surface-muted)]" />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-[1.75rem] bg-[var(--bridge-surface)]" />
      </div>
    </div>
  );
}

// ─── Booking flow ──────────────────────────────────────────────────────────────

function BookingFlow({ mentor, sessionType, onReset, onRequestConfirm, user, navigate, mentorId }) {
  const [pickedDate, setPickedDate] = useState(null);
  const [pickedTime, setPickedTime] = useState(null);
  const [calBusy, setCalBusy]       = useState(null);
  const [calLoading, setCalLoading] = useState(false);
  const scheduleNorm   = useMemo(() => normalizeAvailabilitySchedule(mentor.availability_schedule), [mentor.availability_schedule]);
  const acceptingBookings = mentor.available !== false;
  const availability   = useMemo(() => buildAvailabilityCalendar(scheduleNorm, acceptingBookings, 14), [scheduleNorm, acceptingBookings]);
  const baseSlots      = useMemo(() => getSlotsForDate(scheduleNorm, pickedDate, acceptingBookings), [scheduleNorm, pickedDate, acceptingBookings]);

  const slots = useMemo(() => {
    if (!calBusy || calBusy.length === 0 || !pickedDate) return baseSlots;
    return baseSlots.map(({ time, available }) => {
      if (!available) return { time, available: false };
      const [h, m] = time.split(':').map(Number);
      const slotStart = new Date(pickedDate); slotStart.setHours(h, m, 0, 0);
      const slotEnd   = new Date(pickedDate); slotEnd.setHours(h + 1, m, 0, 0);
      const blocked = calBusy.some(({ start, end }) => {
        const bs = new Date(start); const be = new Date(end);
        return slotStart < be && slotEnd > bs;
      });
      return { time, available: !blocked, calendarBusy: blocked };
    });
  }, [baseSlots, calBusy, pickedDate]);

  const hasAnyWeeklySlots = useMemo(
    () => Object.values(scheduleNorm.weekly).some((a) => Array.isArray(a) && a.length > 0),
    [scheduleNorm],
  );

  useEffect(() => { setPickedTime(null); }, [pickedDate]);

  useEffect(() => {
    if (!pickedDate || !mentor.calendar_connected) { setCalBusy(null); return; }
    setCalLoading(true); setCalBusy(null);
    const dateStr = localDateStr(pickedDate);
    getMentorAvailability(mentor.id, dateStr)
      .then(({ busy }) => { setCalBusy(busy ?? []); setCalLoading(false); })
      .catch(() => { setCalBusy(null); setCalLoading(false); });
  }, [pickedDate, mentor.calendar_connected, mentor.id]);

  const canBook = Boolean(sessionType && pickedDate && pickedTime);

  function handleBookClick() {
    if (!canBook) return;
    if (!user) { navigate('/login', { state: { from: `/mentors/${mentorId}` } }); return; }
    const iso = `${localDateStr(pickedDate)}T${pickedTime}`;
    onRequestConfirm({ sessionType, isoDate: iso, prettyDate: pickedDate, prettyTime: pickedTime });
  }

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-glow">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

      <div className="grid gap-0 lg:grid-cols-12">
        {/* Left: session summary (always dark) */}
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

          <button type="button" onClick={handleBookClick} disabled={!canBook}
            className={`relative mt-6 w-full rounded-xl py-3.5 text-sm font-semibold transition ${canBook ? `bg-gradient-to-r from-amber-400 to-orange-400 text-stone-900 shadow-lg hover:from-amber-300 hover:to-orange-300 ${focusRing}` : 'cursor-not-allowed bg-white/10 text-stone-500'}`}>
            {canBook ? (mentor.session_rate ? 'Continue to payment →' : 'Book session →') : 'Pick a date & time'}
          </button>

          <button type="button" onClick={onReset} className={`relative mt-3 w-full rounded-lg py-2 text-center text-xs font-medium text-stone-400 transition hover:text-stone-200 ${focusRingWhite}`}>
            Change format
          </button>
        </div>

        {/* Right: date + time picker */}
        <div className="p-7 lg:col-span-8 lg:p-8">
          <div className="mb-5 flex items-baseline justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-400">Step 2 of 2</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-[var(--bridge-text)]">When works for you?</h3>
            </div>
            <p className="text-xs text-[var(--bridge-text-muted)]">Next 14 days</p>
          </div>

          {!acceptingBookings ? (
            <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
              This mentor is not accepting new session requests right now.
            </div>
          ) : !hasAnyWeeklySlots ? (
            <div className="mb-4 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3 text-sm text-[var(--bridge-text-secondary)]">
              This mentor has not published open hours yet. Check back later.
            </div>
          ) : null}

          <div className="mb-3 flex items-center gap-3 text-[11px] text-[var(--bridge-text-muted)]">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Open</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Limited</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--bridge-border-strong)]" /> Booked</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {availability.map(({ date, status }) => {
              const iso        = localDateStr(date);
              const isSelected = pickedDate ? localDateStr(pickedDate) === iso : false;
              const isClickable = status !== 'booked';
              const base = 'flex aspect-square flex-col items-center justify-center rounded-lg border p-1 text-xs font-semibold transition';
              let tone;
              if (isSelected)           tone = 'border-orange-500 bg-gradient-to-br from-orange-100 to-amber-100 text-orange-950 shadow-md ring-2 ring-orange-400 dark:from-orange-900/40 dark:to-amber-900/40 dark:text-orange-200';
              else if (status === 'free')    tone = 'border-emerald-300/70 bg-emerald-50/80 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100/70 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20';
              else if (status === 'limited') tone = 'border-amber-300/70 bg-amber-50/80 text-amber-900 hover:border-amber-400 hover:bg-amber-100/70 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20';
              else                           tone = 'border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-faint)] cursor-not-allowed';
              return (
                <button key={iso} type="button" disabled={!isClickable} onClick={() => setPickedDate(date)}
                  aria-label={`${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} — ${status}`}
                  aria-pressed={isSelected} className={`${base} ${tone} ${focusRing}`}>
                  <span className="text-[9px] font-medium opacity-70">{date.toLocaleDateString(undefined, { weekday: 'short' })[0]}</span>
                  <span className="text-sm font-bold">{date.getDate()}</span>
                </button>
              );
            })}
          </div>

          {mentor.calendar_connected && pickedDate ? (
            <div className="mt-3 text-xs">
              {calLoading
                ? <span className="text-[var(--bridge-text-muted)]">Checking calendar…</span>
                : calBusy !== null
                  ? calBusy.length === 0
                    ? <span className="font-medium text-emerald-600 dark:text-emerald-400">All day available</span>
                    : <span className="text-amber-700 dark:text-amber-300">Busy: {calBusy.map(b => `${fmtTime(b.start)}–${fmtTime(b.end)}`).join(', ')}</span>
                  : null}
            </div>
          ) : null}

          <div className={`mt-6 overflow-hidden transition-all duration-300 ${pickedDate ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--bridge-text-muted)]">Available times</p>
                {pickedDate ? <p className="text-xs font-medium text-[var(--bridge-text-secondary)]">{pickedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p> : null}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {slots.map(({ time, available, calendarBusy }) => {
                  const isSelected = pickedTime === time;
                  return (
                    <button key={time} type="button" disabled={!available} onClick={() => setPickedTime(time)}
                      aria-pressed={isSelected} title={calendarBusy ? 'Blocked by calendar' : undefined}
                      className={`relative rounded-lg border px-2 py-2.5 text-sm font-semibold transition ${
                        isSelected
                          ? `border-orange-500 bg-gradient-to-br from-orange-100 to-amber-100 text-orange-950 shadow-sm ring-2 ring-orange-400 dark:from-orange-900/40 dark:to-amber-900/40 dark:text-orange-200 ${focusRing}`
                          : available
                            ? `border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text)] hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-500/10 ${focusRing}`
                            : calendarBusy
                              ? 'cursor-not-allowed border-amber-200/60 bg-amber-50/60 text-amber-400 dark:border-amber-400/20 dark:bg-amber-500/10'
                              : 'cursor-not-allowed border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-faint)]'
                      }`}>
                      {time}
                      {calendarBusy && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] text-white" aria-hidden>!</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {slots.every((s) => !s.available) ? <p className="mt-3 text-xs text-[var(--bridge-text-muted)]">No open slots this day — try another date.</p> : null}
              {slots.some((s) => s.calendarBusy) ? (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  <span className="font-medium">!</span> Some slots are blocked by the mentor&apos;s calendar.
                </p>
              ) : null}
            </div>
          </div>

          {!pickedDate ? <p className="mt-4 text-xs text-[var(--bridge-text-muted)]">Pick a day above to see available times.</p> : null}
        </div>
      </div>
    </div>
  );
}

// ─── Confirm modal ─────────────────────────────────────────────────────────────

function ConfirmModal({ mentor, user, confirmation, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null);
  const [message, setMessage]       = useState('');
  const [checkoutClientSecret, setCheckoutClientSecret] = useState(null);
  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [handleClose]);

  async function handleConfirm() {
    setSubmitting(true); setResult(null);
    try {
      const res = await createBookingCheckout({
        userId: user?.id, userEmail: user?.email,
        mentorId: mentor.id, mentorName: mentor.name,
        sessionTypeName: confirmation.sessionType.name,
        sessionTypeKey: confirmation.sessionType.key,
        scheduledDate: confirmation.isoDate,
        sessionPrice: mentor.session_rate ?? mentor.session_price ?? 25,
        message,
      });
      if (!res.ok) { setResult({ ok: false, message: res.error || 'Could not start booking checkout.' }); return; }
      setCheckoutClientSecret(res.clientSecret);
    } catch (error) {
      console.error(error);
      setResult({ ok: false, message: 'Could not connect to payment server.' });
    } finally {
      setSubmitting(false);
    }
  }

  const mentorFirst = mentor.name?.split(/\s+/)[0] ?? 'your mentor';
  const prettyDate  = confirmation.prettyDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <EmbeddedCheckoutPanel clientSecret={checkoutClientSecret} onClose={() => setCheckoutClientSecret(null)} />
      <button type="button" className="absolute inset-0 bg-stone-950/70 backdrop-blur-[2px]" aria-label="Close" onClick={handleClose} />
      <div className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-[var(--bridge-surface)] shadow-2xl ring-1 ring-[var(--bridge-border)] sm:rounded-3xl">
        {result?.ok ? (
          <div className="flex flex-col items-center px-8 py-14 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-4xl text-white shadow-lg">✓</div>
            <h2 id="confirm-modal-title" className="font-display text-2xl font-semibold text-[var(--bridge-text)]">Request sent</h2>
            <p className="mt-3 max-w-sm leading-relaxed text-[var(--bridge-text-secondary)]">{mentorFirst} will confirm or suggest another time. We'll email you as soon as they do.</p>
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
                <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-4">
                  <dl className="space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-3"><dt className="text-[var(--bridge-text-muted)]">Mentor</dt><dd className="text-right font-semibold text-[var(--bridge-text)]">{mentor.name}</dd></div>
                    <div className="flex items-start justify-between gap-3 border-t border-[var(--bridge-border)] pt-3"><dt className="text-[var(--bridge-text-muted)]">Format</dt><dd className="text-right font-semibold text-[var(--bridge-text)]">{confirmation.sessionType.name}<span className="ml-1.5 font-normal text-[var(--bridge-text-muted)]">· {confirmation.sessionType.duration}</span></dd></div>
                    <div className="flex items-start justify-between gap-3 border-t border-[var(--bridge-border)] pt-3"><dt className="text-[var(--bridge-text-muted)]">Date</dt><dd className="text-right font-semibold text-[var(--bridge-text)]">{prettyDate}</dd></div>
                    <div className="flex items-start justify-between gap-3 border-t border-[var(--bridge-border)] pt-3"><dt className="text-[var(--bridge-text-muted)]">Time</dt><dd className="text-right font-semibold text-[var(--bridge-text)]">{confirmation.prettyTime}</dd></div>
                    {mentor.session_rate ? (
                      <div className="flex items-start justify-between gap-3 border-t border-[var(--bridge-border-strong)] pt-3">
                        <dt className="font-bold text-[var(--bridge-text)]">Total</dt>
                        <dd className="text-right font-display text-xl font-semibold text-[var(--bridge-text)] tabular-nums">${mentor.session_rate}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
                <div>
                  <label htmlFor="booking-note" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)]">
                    Add context <span className="font-normal normal-case text-[var(--bridge-text-faint)]">(optional)</span>
                  </label>
                  <textarea id="booking-note" value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                    placeholder="What do you want to get out of this hour?"
                    className="w-full resize-none rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-2.5 text-sm text-[var(--bridge-text)] shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                </div>
                {result && !result.ok ? <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">{result.message}</p> : null}
              </div>
            </div>
            <footer className="shrink-0 border-t border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-6 py-4 sm:px-7">
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button type="button" onClick={handleClose} disabled={submitting}
                  className={`rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--bridge-text)] transition hover:bg-[var(--bridge-surface-muted)] disabled:opacity-60 ${focusRing}`}>
                  Cancel
                </button>
                <button type="button" onClick={handleConfirm} disabled={submitting}
                  className={`rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105 disabled:opacity-60 ${focusRing}`}>
                  {submitting ? 'Opening checkout…' : `Pay $${mentor.session_price ?? 25} & request`}
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  , document.body);
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function MentorProfile() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user }        = useAuth();

  const [profile, setProfile]               = useState(null);
  const [mentorReviews, setMentorReviews]   = useState([]);
  const [loadError, setLoadError]           = useState(null);
  const [loading, setLoading]               = useState(true);
  const [selectedType, setSelectedType]     = useState(null);
  const [pendingConfirm, setPendingConfirm] = useState(null);
  const [checkoutNotice, setCheckoutNotice] = useState(null);
  const [checkoutError, setCheckoutError]   = useState(null);
  const [showTiersModal, setShowTiersModal] = useState(false);
  const bookingRef = useRef(null);

  // Load mentor + reviews
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setLoadError(null);
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

  // Realtime availability sync
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`mentor-availability-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mentor_profiles', filter: `id=eq.${id}` }, (payload) => {
        if (!payload.new) return;
        setProfile((prev) => {
          if (!prev?.mentor) return prev;
          return { ...prev, mentor: { ...prev.mentor, availability_schedule: payload.new.availability_schedule, available: payload.new.available } };
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // Window focus re-fetch
  useEffect(() => {
    function handleFocus() {
      if (!id) return;
      supabase.from('mentor_profiles').select('availability_schedule, available').eq('id', id).single()
        .then(({ data, error }) => {
          if (error || !data) return;
          setProfile((prev) => {
            if (!prev?.mentor) return prev;
            return { ...prev, mentor: { ...prev.mentor, availability_schedule: data.availability_schedule, available: data.available } };
          });
        });
    }
    window.addEventListener('focus', handleFocus);
    return () => { window.removeEventListener('focus', handleFocus); };
  }, [id]);

  useEffect(() => { setSelectedType(null); setPendingConfirm(null); }, [id]);

  // Stripe checkout finalization
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return;
    let cancelled = false;
    void (async () => {
      const result = await finalizeCheckout(sessionId);
      if (cancelled) return;
      if (!result.ok) {
        setCheckoutError(result.error || 'Could not verify booking payment.');
      } else {
        setCheckoutNotice('Booking payment successful. Your session request is now in your dashboard.');
        setPendingConfirm(null); setSelectedType(null);
      }
      const next = new URLSearchParams(searchParams);
      next.delete('session_id');
      setSearchParams(next, { replace: true });
    })();
    return () => { cancelled = true; };
  }, [searchParams, setSearchParams]);

  const displayRating = useMemo(() => {
    if (!profile?.mentor) return 0;
    const fromReviews = profile.reviews?.average;
    if (fromReviews != null && profile.reviews.count > 0) return Number(fromReviews);
    const r = profile.mentor.rating;
    return r != null ? Number(r) : 0;
  }, [profile]);

  // ── Loading / error states ──────────────────────────────────────────────────

  if (loading) return <ProfileSkeleton />;

  if (loadError) {
    return (
      <main className="relative min-h-screen overflow-x-hidden px-4 py-16 sm:px-6">
        <div className="relative mx-auto max-w-lg rounded-[2rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-8 py-12 text-center shadow-bridge-card">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
          </div>
          <p className="font-display text-lg font-semibold text-[var(--bridge-text)]">Couldn't load this profile</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--bridge-text-secondary)]">{loadError}</p>
          <Link to="/mentors" className={`mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105 ${focusRing}`}>Back to mentors</Link>
        </div>
      </main>
    );
  }

  if (!profile?.mentor) {
    return (
      <main className="relative min-h-screen overflow-x-hidden px-4 py-16 sm:px-6">
        <div className="relative mx-auto max-w-lg rounded-[2rem] border border-dashed border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-8 py-12 text-center">
          <p className="font-display text-lg font-semibold text-[var(--bridge-text)]">This mentor isn't here</p>
          <p className="mt-3 text-sm text-[var(--bridge-text-secondary)]">The link may be outdated or the profile was removed.</p>
          <Link to="/mentors" className={`mt-8 inline-flex items-center justify-center rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-7 py-3 text-sm font-semibold text-[var(--bridge-text)] shadow-sm transition hover:border-orange-300/70 ${focusRing}`}>Browse all mentors</Link>
        </div>
      </main>
    );
  }

  const mentor              = profile.mentor;
  const reviewMeta          = profile.reviews;
  const viewerIsMentor      = user ? isMentorAccount(user) : false;
  const isOwnMentorProfile  = Boolean(user && mentor.user_id && mentor.user_id === user.id);
  const bookingDisabledForMentor = viewerIsMentor && !isOwnMentorProfile;
  const industryLabel       = formatIndustry(mentor.industry);

  // ── Page ───────────────────────────────────────────────────────────────────

  return (
    <>
      <main id="mentor-profile" className="relative isolate min-h-screen overflow-x-hidden" aria-labelledby="profile-heading">

        {/* ════════════════════════════════════════════════════════
            HERO — theme-aware
        ════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-b border-[var(--bridge-border)] bg-[var(--bridge-canvas)] pb-8 pt-6">

          {/* Ambient orbs */}
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-8 h-80 w-80 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.18) 0%, transparent 70%)' }} />
          <div aria-hidden className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)' }} />

          {/* Checkout notices */}
          {(checkoutError || checkoutNotice) && (
            <div className="relative mx-auto mb-4 max-w-[90rem] px-4 sm:px-6 lg:px-8">
              {checkoutError && (
                <p className="rounded-2xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300">{checkoutError}</p>
              )}
              {checkoutNotice && (
                <p className="rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300">{checkoutNotice}</p>
              )}
            </div>
          )}

          <div className="relative mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--bridge-text-muted)]">
                <li><Link to="/" className="transition hover:text-orange-500">Home</Link></li>
                <li aria-hidden><svg className="h-3 w-3 text-[var(--bridge-border-strong)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" /></svg></li>
                <li><Link to="/mentors" className="transition hover:text-orange-500">Mentors</Link></li>
                <li aria-hidden><svg className="h-3 w-3 text-[var(--bridge-border-strong)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" /></svg></li>
                <li className="max-w-[14rem] truncate font-medium text-[var(--bridge-text-secondary)]">{mentor.name}</li>
              </ol>
            </nav>

            {/* Hero content */}
            <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:text-left">

              {/* Avatar */}
              <div className="relative shrink-0">
                <div aria-hidden className="absolute inset-0 -m-3 rounded-3xl opacity-40 blur-xl"
                  style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.5) 0%, transparent 70%)' }} />
                <div aria-hidden className="absolute -inset-1.5 rounded-[1.4rem] border-gradient-bridge animate-border-bridge opacity-50" />
                <div className="relative rounded-[1.25rem] ring-2 ring-orange-400/20">
                  <MentorAvatar
                    name={mentor.name}
                    size="xl"
                    className="h-24 w-24 rounded-[1.25rem] text-3xl shadow-bridge-float sm:h-32 sm:w-32 sm:text-4xl"
                  />
                </div>
                {mentor.available && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 shadow-lg shadow-emerald-500/30 whitespace-nowrap">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    <span className="text-[10px] font-bold text-white tracking-wide">Accepting sessions</span>
                  </div>
                )}
              </div>

              {/* Name + title + tags */}
              <div className="min-w-0 flex-1">
                {/* Tier + industry badges */}
                <div className="mb-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  {mentor.tier && (
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] ${tierBadgeClasses(mentor.tier)}`}>
                      {mentor.tier.charAt(0).toUpperCase() + mentor.tier.slice(1)}
                    </span>
                  )}
                  {industryLabel && (
                    <span className="rounded-full border border-orange-300/50 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-600 dark:border-orange-400/30 dark:bg-orange-500/10 dark:text-orange-300">
                      {industryLabel}
                    </span>
                  )}
                  {mentor.calendar_connected && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/60 bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-600 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                      Calendar synced
                    </span>
                  )}
                </div>

                <h1 id="profile-heading" className="font-display text-4xl font-black tracking-tight text-[var(--bridge-text)] sm:text-5xl">
                  {mentor.name}
                </h1>

                {mentor.title && (
                  <p className="mt-2 text-lg text-[var(--bridge-text-secondary)] sm:text-xl">
                    <span className="font-semibold text-orange-600 dark:text-amber-400">{mentor.title}</span>
                    {mentor.company && <><span className="text-[var(--bridge-text-faint)]"> · </span><span>{mentor.company}</span></>}
                  </p>
                )}

                {/* Social links */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  {mentor.linkedin_url && (
                    <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--bridge-text-secondary)] shadow-sm transition hover:border-blue-300/70 hover:bg-blue-50 hover:text-blue-600 dark:hover:border-blue-400/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      LinkedIn
                    </a>
                  )}
                  {mentor.github_url && (
                    <a href={mentor.github_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--bridge-text-secondary)] shadow-sm transition hover:border-[var(--bridge-border-strong)] hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)]">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                      GitHub
                    </a>
                  )}
                  {mentor.website_url && (
                    <a href={mentor.website_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--bridge-text-secondary)] shadow-sm transition hover:border-orange-300/60 hover:bg-orange-50 hover:text-orange-600 dark:hover:border-orange-400/30 dark:hover:bg-orange-500/10 dark:hover:text-orange-300">
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                      Website
                    </a>
                  )}
                </div>
              </div>

              {/* Stats + pricing + CTA */}
              <div className="shrink-0 flex flex-col items-center gap-4 lg:items-end">
                {/* Stat chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
                  <div className="flex items-center gap-2 rounded-2xl border border-amber-300/50 bg-amber-50 px-4 py-2.5 shadow-sm dark:border-amber-400/25 dark:bg-amber-400/10">
                    <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" /></svg>
                    <div>
                      <p className="font-display text-lg font-black tabular-nums text-[var(--bridge-text)] leading-none">
                        {displayRating > 0 ? displayRating.toFixed(1) : '—'}
                      </p>
                      {reviewMeta?.count > 0 && <p className="text-[10px] text-amber-600 dark:text-amber-300">{reviewMeta.count} review{reviewMeta.count !== 1 ? 's' : ''}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2.5 shadow-sm">
                    <svg className="h-4 w-4 text-[var(--bridge-text-muted)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                    <div>
                      <p className="font-display text-lg font-black tabular-nums text-[var(--bridge-text)] leading-none">{mentor.total_sessions ?? '—'}</p>
                      <p className="text-[10px] text-[var(--bridge-text-faint)]">sessions</p>
                    </div>
                  </div>
                  {mentor.years_experience != null && (
                    <div className="flex items-center gap-2 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2.5 shadow-sm">
                      <svg className="h-4 w-4 text-[var(--bridge-text-muted)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                      <div>
                        <p className="font-display text-lg font-black tabular-nums text-[var(--bridge-text)] leading-none">{mentor.years_experience}</p>
                        <p className="text-[10px] text-[var(--bridge-text-faint)]">yrs exp</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rate */}
                <div className="text-center lg:text-right">
                  <p className="font-display text-5xl font-black tabular-nums text-gradient-bridge leading-none">
                    {mentor.session_rate ? `$${mentor.session_rate}` : 'Free'}
                  </p>
                  <p className="mt-1 text-sm text-[var(--bridge-text-muted)]">per session</p>
                </div>

                {/* CTA buttons — side by side */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-end">
                  {!isOwnMentorProfile && !bookingDisabledForMentor && (
                    <button type="button"
                      onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className={`btn-sheen flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_24px_-4px_rgba(234,88,12,0.6)] transition hover:brightness-110 hover:shadow-[0_8px_32px_-4px_rgba(234,88,12,0.75)] ${focusRing}`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                      Book a Session
                    </button>
                  )}
                  <button type="button" onClick={() => setShowTiersModal(true)}
                    className={`flex items-center gap-2 rounded-full border-2 border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-5 py-3 text-sm font-semibold text-[var(--bridge-text-secondary)] shadow-sm transition hover:border-orange-400/60 hover:bg-orange-50 hover:text-orange-600 dark:hover:border-orange-400/40 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 ${focusRing}`}>
                    <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>
                    See Mentor Tiers
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            MAIN CONTENT — theme-aware
        ════════════════════════════════════════════════════════ */}
        <div className="mx-auto max-w-[90rem] px-4 pb-28 pt-6 sm:px-6 lg:px-8">

          {/* ── Booking section ─────────────────────────────────── */}
          <div ref={bookingRef} className="mb-10 scroll-mt-24">

            {isOwnMentorProfile ? (
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-card sm:p-8">
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-40" />
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">Your public profile</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--bridge-text)] sm:text-3xl">
                  This is what mentees see before they book
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--bridge-text-secondary)]">
                  Session requests and your availability are managed from your dashboard. You don&apos;t book yourself here—that keeps your calendar and payouts accurate.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/dashboard" className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105 ${focusRing}`}>
                    Open mentor dashboard
                  </Link>
                  <Link to="/settings" className={`inline-flex items-center justify-center rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-6 py-3 text-sm font-semibold text-[var(--bridge-text)] shadow-sm transition hover:border-orange-300/70 ${focusRing}`}>
                    Account settings
                  </Link>
                </div>
              </div>

            ) : bookingDisabledForMentor ? (
              <div className="relative overflow-hidden rounded-[1.75rem] border border-amber-400/30 bg-amber-500/5 p-7 shadow-bridge-card sm:p-8">
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50" />
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">Mentor account</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--bridge-text)] sm:text-3xl">Booking is for mentee accounts</h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--bridge-text-secondary)]">
                  You signed up as a mentor on Bridge, so you can accept requests and run sessions—not book other mentors from this account.
                </p>
                <div className="mt-6">
                  <Link to="/dashboard" className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105 ${focusRing}`}>
                    Back to your dashboard
                  </Link>
                </div>
              </div>

            ) : !selectedType ? (
              /* Session type picker — always dark card */
              <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_8px_48px_-8px_rgba(0,0,0,0.4)] ring-1 ring-white/10"
                style={{ backgroundColor: 'var(--bridge-hero-bg)' }}>

                {/* Grid overlay */}
                <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50"
                  style={{ backgroundImage: 'linear-gradient(rgba(234,88,12,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(234,88,12,0.06) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
                {/* Top glow line */}
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                {/* Orb */}
                <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full opacity-25 blur-3xl"
                  style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.7) 0%, transparent 70%)' }} />

                <div className="relative p-7 sm:p-10">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-300">Book a session</p>
                      <h2 className="mt-2 font-display text-2xl font-black text-white sm:text-3xl">What kind of hour do you want?</h2>
                      <p className="mt-2 text-sm text-stone-400">
                        Pick a format.{mentor.session_rate ? ` All sessions $${mentor.session_rate}.` : ' Pricing varies by format.'}
                      </p>
                    </div>
                    <span className="hidden rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold text-amber-200 sm:inline-block">Step 1 of 2</span>
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {SESSION_TYPES.map((type) => (
                      <button key={type.key} type="button" onClick={() => setSelectedType(type)}
                        className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left transition duration-200 hover:border-orange-400/50 hover:bg-white/[0.08] hover:shadow-[0_4px_24px_-4px_rgba(234,88,12,0.3)] ${focusRingWhite}`}>
                        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          style={{ background: 'linear-gradient(135deg, rgba(234,88,12,0.06) 0%, transparent 60%)' }} />
                        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-amber-200 transition duration-200 group-hover:border-orange-400/50 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-amber-400 group-hover:text-stone-900">
                          <SessionTypeIcon typeKey={type.key} className="h-6 w-6" />
                        </span>
                        <div className="relative min-w-0 flex-1">
                          <p className="font-semibold text-white">{type.name}</p>
                          <p className="text-xs text-stone-400">{type.duration}</p>
                        </div>
                        <svg className="relative h-4 w-4 shrink-0 text-stone-600 transition duration-200 group-hover:translate-x-0.5 group-hover:text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" /></svg>
                      </button>
                    ))}
                  </div>

                  {!user && (
                    <p className="mt-5 text-xs text-stone-500">
                      <Link to="/login" state={{ from: `/mentors/${id}` }} className="font-semibold text-amber-300 underline underline-offset-2 hover:text-amber-200">Log in</Link> to book — you can still browse without an account.
                    </p>
                  )}
                </div>
              </div>

            ) : (
              <BookingFlow
                mentor={mentor} sessionType={selectedType}
                onReset={() => setSelectedType(null)}
                onRequestConfirm={(payload) => setPendingConfirm(payload)}
                user={user} navigate={navigate} mentorId={id} />
            )}
          </div>

          {/* ── Two-column content grid ──────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">

            {/* Main column */}
            <div className="space-y-6 lg:col-span-2">

              {/* Bio */}
              <div className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-card transition hover:border-orange-300/30 sm:p-8">
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">About</p>
                <h2 className="mt-1.5 font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">Their story</h2>
                <div className="mt-5 border-l-[3px] border-orange-400/40 pl-5">
                  <p className="whitespace-pre-line text-base leading-relaxed text-[var(--bridge-text-secondary)] sm:text-lg">
                    {mentor.bio?.trim() || 'No bio yet — book a session and ask what you would normally read here.'}
                  </p>
                </div>
              </div>

              {/* Expertise */}
              <div className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-card transition hover:border-orange-300/30 sm:p-8">
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">Focus areas</p>
                <h2 className="mt-1.5 font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">Expertise</h2>
                {mentor.expertise?.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {mentor.expertise.map((tag) => (
                      <span key={tag}
                        className="rounded-full border border-orange-200/60 bg-orange-50/60 px-3.5 py-1.5 text-sm font-medium text-orange-900 dark:border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[var(--bridge-text-muted)]">No focus areas listed yet.</p>
                )}
              </div>

              {/* Work experience */}
              {mentor.work_experience?.length > 0 && (
                <div className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-card transition hover:border-orange-300/30 sm:p-8">
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">Background</p>
                  <h2 className="mt-1.5 font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">Work Experience</h2>
                  <div className="mt-6 space-y-6">
                    {[...mentor.work_experience].sort((a, b) => b.start_year - a.start_year).map((job, i) => (
                      <div key={i} className="relative border-l-2 border-orange-300/40 pl-5 dark:border-orange-500/30">
                        <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-orange-400 ring-2 ring-[var(--bridge-surface)]" />
                        <p className="font-semibold text-[var(--bridge-text)] sm:text-[1.05rem]">{job.title}</p>
                        <p className="mt-0.5 text-sm font-medium text-[var(--bridge-text-secondary)]">{job.company}</p>
                        <p className="mt-0.5 text-xs text-[var(--bridge-text-muted)]">{job.start_year} – {job.end_year ?? 'Present'}</p>
                        {job.description && <p className="mt-2 text-sm leading-relaxed text-[var(--bridge-text-secondary)]">{job.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {mentor.education?.length > 0 && (
                <div className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-card transition hover:border-orange-300/30 sm:p-8">
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">Credentials</p>
                  <h2 className="mt-1.5 font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">Education</h2>
                  <div className="mt-5 space-y-3">
                    {mentor.education.map((edu, i) => (
                      <div key={i} className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--bridge-text)]">{edu.school}</p>
                          <p className="mt-0.5 text-sm text-[var(--bridge-text-secondary)]">{edu.degree} in {edu.field}</p>
                        </div>
                        {edu.year_graduated && (
                          <span className="shrink-0 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-2.5 py-0.5 text-xs font-semibold text-[var(--bridge-text-secondary)]">{edu.year_graduated}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-card transition hover:border-orange-300/30 sm:p-8">
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">Reviews</p>
                    <h2 className="mt-1.5 font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">After sessions</h2>
                  </div>
                  {displayRating > 0 && (
                    <div className="flex items-center gap-2">
                      <StarRow rating={displayRating} size="lg" />
                      <span className="font-display text-xl font-bold tabular-nums text-[var(--bridge-text)]">{displayRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {mentorReviews.length > 0 ? (
                  <ul className="mt-5 space-y-3">
                    {mentorReviews.map((rev) => (
                      <li key={rev.id}
                        className="group/rev rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-5 transition hover:border-orange-300/40 hover:bg-orange-50/20 dark:hover:bg-orange-500/5">
                        <figure>
                          <figcaption className="mb-2 flex flex-wrap items-center gap-2.5">
                            <StarRow rating={rev.rating} />
                            <span className="text-xs text-[var(--bridge-text-faint)]">{formatReviewDate(rev.created_at)}</span>
                          </figcaption>
                          {rev.comment?.trim() ? (
                            <blockquote>
                              <p className="text-pretty leading-relaxed text-[var(--bridge-text-secondary)]">{rev.comment.trim()}</p>
                            </blockquote>
                          ) : (
                            <p className="text-sm italic text-[var(--bridge-text-faint)]">Rated the session but didn't leave a note.</p>
                          )}
                        </figure>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-6 py-10 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bridge-surface)]">
                      <svg className="h-6 w-6 text-[var(--bridge-text-faint)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
                    </div>
                    <p className="font-semibold text-[var(--bridge-text)]">No reviews yet</p>
                    <p className="mt-1.5 text-sm text-[var(--bridge-text-secondary)]">After you meet, they can leave feedback — it'll show up here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Sticky sidebar ── */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">

                {/* Quick book card */}
                <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card">
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent" />

                  <p className="font-display text-4xl font-black tabular-nums text-gradient-bridge leading-none">
                    {mentor.session_rate ? `$${mentor.session_rate}` : 'Free'}
                  </p>
                  <p className="mt-1 text-sm text-[var(--bridge-text-muted)]">per session</p>

                  {mentor.response_time && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--bridge-text-secondary)]">
                      <svg className="h-3.5 w-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                      {mentor.response_time}
                    </p>
                  )}

                  {!isOwnMentorProfile && !bookingDisabledForMentor && (
                    <button type="button"
                      onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className={`btn-sheen mt-5 w-full rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_-4px_rgba(234,88,12,0.6)] transition hover:brightness-110 ${focusRing}`}>
                      Book a Session
                    </button>
                  )}

                  {mentor.linkedin_url && (
                    <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] py-3 text-sm font-semibold text-[var(--bridge-text-secondary)] transition hover:border-blue-400/50 hover:bg-blue-50/50 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-300 ${focusRing}`}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      View LinkedIn
                    </a>
                  )}
                </div>

                {/* Mini stats card */}
                <div className="rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-faint)]">Quick stats</p>
                  <dl className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-[var(--bridge-text-muted)]">Rating</dt>
                      <dd className="flex items-center gap-1.5">
                        <StarRow rating={displayRating} />
                        <span className="text-sm font-bold tabular-nums text-[var(--bridge-text)]">{displayRating > 0 ? displayRating.toFixed(1) : '—'}</span>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--bridge-border)] pt-3">
                      <dt className="text-sm text-[var(--bridge-text-muted)]">Total sessions</dt>
                      <dd className="text-sm font-bold tabular-nums text-[var(--bridge-text)]">{mentor.total_sessions ?? '—'}</dd>
                    </div>
                    {mentor.years_experience != null && (
                      <div className="flex items-center justify-between border-t border-[var(--bridge-border)] pt-3">
                        <dt className="text-sm text-[var(--bridge-text-muted)]">Experience</dt>
                        <dd className="text-sm font-bold tabular-nums text-[var(--bridge-text)]">{mentor.years_experience} yrs</dd>
                      </div>
                    )}
                    {industryLabel && (
                      <div className="flex items-center justify-between border-t border-[var(--bridge-border)] pt-3">
                        <dt className="text-sm text-[var(--bridge-text-muted)]">Industry</dt>
                        <dd className="text-sm font-bold text-[var(--bridge-text)]">{industryLabel}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-[var(--bridge-border)] pt-3">
                      <dt className="text-sm text-[var(--bridge-text-muted)]">Availability</dt>
                      <dd>
                        {mentor.available ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                            Open
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-[var(--bridge-text-muted)]">Closed</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {pendingConfirm && (
        <ConfirmModal mentor={mentor} user={user} confirmation={pendingConfirm} onClose={() => setPendingConfirm(null)} />
      )}
      {showTiersModal && <MentorTiersModal onClose={() => setShowTiersModal(false)} />}
    </>
  );
}
