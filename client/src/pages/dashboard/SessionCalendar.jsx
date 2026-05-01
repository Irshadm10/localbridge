/**
 * SessionCalendar — full-month calendar view for mentor & mentee dashboards.
 * Days with sessions show colored time pills (sm+) or larger dots (mobile).
 * Clicking a day opens a focused detail panel with time, person, status, and actions.
 * Auto-jumps to the nearest upcoming session on first load.
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Video, Star, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function reviewWindow(session) {
  if (session.status !== 'completed') return false;
  const ref = new Date(session.scheduled_date ?? session.created_at);
  return Date.now() - ref.getTime() <= 5 * 24 * 60 * 60 * 1000;
}

// ── Type colour maps ───────────────────────────────────────────────────────────
const TYPE_DOT = {
  career_advice:  { bg: 'bg-amber-500',   text: 'text-amber-600',   dark: 'dark:text-amber-400',   ring: 'ring-amber-400/30',   pill: 'bg-amber-500',   pillText: 'text-white' },
  interview_prep: { bg: 'bg-emerald-500', text: 'text-emerald-600', dark: 'dark:text-emerald-400', ring: 'ring-emerald-400/30', pill: 'bg-emerald-500', pillText: 'text-white' },
  resume_review:  { bg: 'bg-sky-500',     text: 'text-sky-600',     dark: 'dark:text-sky-400',     ring: 'ring-sky-400/30',     pill: 'bg-sky-500',     pillText: 'text-white' },
  networking:     { bg: 'bg-violet-500',  text: 'text-violet-600',  dark: 'dark:text-violet-400',  ring: 'ring-violet-400/30',  pill: 'bg-violet-500',  pillText: 'text-white' },
};

const TYPE_LABEL = {
  career_advice:  'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review:  'Resume Review',
  networking:     'Networking',
};

const TYPE_LABEL_SHORT = {
  career_advice:  'Career',
  interview_prep: 'Interview',
  resume_review:  'Resume',
  networking:     'Network',
};

const STATUS_STYLE = {
  pending:   { label: 'Pending',   cls: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 ring-1 ring-amber-400/25' },
  accepted:  { label: 'Confirmed', cls: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-400/25' },
  declined:  { label: 'Declined',  cls: 'bg-red-500/12 text-red-500 ring-1 ring-red-400/25' },
  completed: { label: 'Completed', cls: 'bg-blue-500/12 text-blue-500 dark:text-blue-400 ring-1 ring-blue-400/25' },
  cancelled: { label: 'Cancelled', cls: 'bg-stone-500/12 text-stone-400 ring-1 ring-stone-400/25' },
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function buildGrid(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const daysInPrev   = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ day: daysInPrev - firstWeekday + 1 + i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= trailing; i++) {
    cells.push({ day: i, current: false });
  }
  return cells;
}

function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// ── Compact calendar-focused session card ─────────────────────────────────────
function CalendarSessionCard({ session, isMentor, mentorProfile, handleStatusUpdate, actionLoading, onViewIntake, onReview, reviewed, onCancel }) {
  const navigate = useNavigate();
  const dot    = TYPE_DOT[session.session_type] || { bg: 'bg-stone-400', text: 'text-stone-400', dark: '', ring: 'ring-stone-400/25', pill: 'bg-stone-400', pillText: 'text-white' };
  const label  = TYPE_LABEL[session.session_type] || session.session_type;
  const time   = fmtTime(session.scheduled_date);
  const [timePart, ampm] = time ? [time.slice(0, -3), time.slice(-2)] : ['TBD', ''];

  const personName = isMentor
    ? (session.mentee_name || 'Mentee')
    : (mentorProfile?.name || session.mentor_name || 'Mentor');

  const statusInfo = STATUS_STYLE[session.status] || { label: session.status, cls: 'bg-stone-500/12 text-stone-400 ring-1 ring-stone-400/25' };
  const busy       = actionLoading === session.id;
  const canJoin    = session.video_room_url && session.status === 'accepted';

  return (
    <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-canvas)] overflow-hidden">
      {/* Colored top bar */}
      <div className={`h-1 w-full ${dot.bg}`} />

      <div className="p-4 space-y-3">
        {/* Time + info row */}
        <div className="flex items-start gap-3">
          {/* Time block */}
          <div className={`shrink-0 flex flex-col items-center justify-center rounded-xl px-3 py-2 ${dot.bg} shadow-sm`}
            style={{ minWidth: '3.75rem' }}>
            <span className="text-base font-black text-white leading-none">{timePart}</span>
            {ampm && <span className="text-[9px] font-bold text-white/80 mt-0.5">{ampm}</span>}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] ring-1 ${dot.text} ${dot.dark} ${dot.ring} bg-current/5`}
                style={{ backgroundColor: 'color-mix(in srgb, currentColor 8%, transparent)' }}>
                {label}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusInfo.cls}`}>
                {statusInfo.label}
              </span>
            </div>

            <p className="font-bold text-sm text-[var(--bridge-text)] leading-tight">
              {isMentor ? 'Mentee: ' : 'Mentor: '}
              <span className="text-orange-500">{personName}</span>
            </p>

            {session.message && (
              <p className="text-[11px] text-[var(--bridge-text-muted)] italic line-clamp-2 leading-snug">
                &ldquo;{session.message}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Action row */}
        {(canJoin || (isMentor && session.status === 'pending') || (!isMentor && (session.status === 'pending' || session.status === 'accepted')) || onReview || onViewIntake) && (
          <div className="flex flex-wrap gap-2 pt-0.5">
            {canJoin && (
              <button type="button"
                onClick={() => navigate(`/session/${session.id}/video`)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-400 transition shadow-sm">
                <Video className="h-3 w-3" />
                Join Call
              </button>
            )}

            {isMentor && session.status === 'pending' && (
              <>
                <button type="button" disabled={busy}
                  onClick={() => handleStatusUpdate(session.id, 'accepted')}
                  className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-400/30 hover:bg-emerald-500/20 transition disabled:opacity-50">
                  {busy ? 'Accepting…' : 'Accept'}
                </button>
                <button type="button" disabled={busy}
                  onClick={() => handleStatusUpdate(session.id, 'declined')}
                  className="rounded-lg bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-500 ring-1 ring-red-400/30 hover:bg-red-500/20 transition disabled:opacity-50">
                  Decline
                </button>
              </>
            )}

            {(session.status === 'pending' || session.status === 'accepted') && onCancel && (
              <button type="button"
                onClick={() => onCancel(session)}
                className="rounded-lg bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-500 ring-1 ring-red-400/30 hover:bg-red-500/20 transition">
                Cancel
              </button>
            )}

            {onReview && !reviewed && (
              <button type="button" onClick={onReview}
                className="flex items-center gap-1.5 rounded-lg bg-orange-500/10 px-3 py-1.5 text-[11px] font-bold text-orange-600 dark:text-orange-400 ring-1 ring-orange-400/30 hover:bg-orange-500/20 transition">
                <Star className="h-3 w-3" />
                Leave Review
              </button>
            )}

            {onViewIntake && (
              <button type="button" onClick={() => onViewIntake(session, session.intake_summary)}
                className="flex items-center gap-1.5 rounded-lg bg-violet-500/10 px-3 py-1.5 text-[11px] font-bold text-violet-600 dark:text-violet-400 ring-1 ring-violet-400/30 hover:bg-violet-500/20 transition">
                <FileText className="h-3 w-3" />
                Intake
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── SessionCalendar ───────────────────────────────────────────────────────────
export default function SessionCalendar({
  sessions = [],
  handleStatusUpdate,
  actionLoading,
  isMentor,
  mentorMap = {},
  onViewIntake,
  onReview,
  reviewedSessionIds = new Set(),
  onCancel,
}) {
  const today = new Date();
  const [viewDate, setViewDate]     = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const panelRef  = useRef(null);
  const didAutoSelect = useRef(false);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Auto-jump to nearest upcoming session on first load
  useEffect(() => {
    if (didAutoSelect.current || sessions.length === 0) return;
    didAutoSelect.current = true;
    const upcoming = sessions
      .filter(s => s.scheduled_date && (s.status === 'pending' || s.status === 'accepted'))
      .map(s => new Date(s.scheduled_date))
      .filter(d => d >= today)
      .sort((a, b) => a - b);
    if (upcoming.length > 0) {
      const nearest = upcoming[0];
      setSelectedDate(nearest);
      setViewDate(new Date(nearest.getFullYear(), nearest.getMonth(), 1));
    }
  }, [sessions]); // eslint-disable-line

  // Group sessions by date key
  const byDate = {};
  sessions.forEach(s => {
    if (!s.scheduled_date) return;
    const d = new Date(s.scheduled_date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    (byDate[key] ||= []).push(s);
  });

  function sessionsForDate(d) {
    return byDate[`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`] || [];
  }

  const grid             = buildGrid(year, month);
  const selectedSessions = sessionsForDate(selectedDate);

  // Scroll panel into view when sessions exist for selected day
  useEffect(() => {
    if (selectedSessions.length > 0 && panelRef.current) {
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
    }
  }, [selectedDate.toDateString()]); // eslint-disable-line

  function prevMonth() { setViewDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setViewDate(new Date(year, month + 1, 1)); }
  function goToday()   {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  }

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const upcomingInMonth = sessions.filter(s => {
    if (!s.scheduled_date) return false;
    const d = new Date(s.scheduled_date);
    return d.getFullYear() === year && d.getMonth() === month &&
      (s.status === 'pending' || s.status === 'accepted') && d >= today;
  }).length;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)]"
      style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 8px 40px rgba(0,0,0,0.12)' }}>

      {/* Ambient glow blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-orange-500/6 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-violet-500/6 blur-3xl" />

      {/* ── Calendar header ── */}
      <div className="relative flex items-center gap-3 border-b border-[var(--bridge-border)] px-6 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 shadow-md">
          <CalendarDays className="h-4.5 w-4.5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.26em] text-orange-500">Session Calendar</p>
          <h3 className="font-display text-xl font-black tracking-[-0.02em] text-[var(--bridge-text)]">{monthLabel}</h3>
        </div>
        {upcomingInMonth > 0 && (
          <span className="hidden shrink-0 rounded-full bg-orange-500/12 px-3 py-1 text-[11px] font-black text-orange-600 ring-1 ring-orange-400/25 dark:text-orange-400 sm:inline-flex">
            {upcomingInMonth} upcoming
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={goToday}
            className="hidden rounded-lg px-2.5 py-1.5 text-xs font-bold text-[var(--bridge-text-secondary)] ring-1 ring-[var(--bridge-border)] transition hover:bg-[var(--bridge-border)] sm:block">
            Today
          </button>
          <button type="button" onClick={prevMonth} aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-[var(--bridge-border)] transition hover:bg-[var(--bridge-border)] text-[var(--bridge-text-secondary)]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={nextMonth} aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-[var(--bridge-border)] transition hover:bg-[var(--bridge-border)] text-[var(--bridge-text-secondary)]">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Weekday headers ── */}
      <div className="grid grid-cols-7 border-b border-[var(--bridge-border)] bg-[var(--bridge-canvas)]/40">
        {WEEKDAYS.map(d => (
          <div key={d} className="py-2.5 text-center text-[9px] font-black uppercase tracking-[0.2em] text-[var(--bridge-text-faint)]">
            {d}
          </div>
        ))}
      </div>

      {/* ── Day grid ── */}
      <div className="grid grid-cols-7">
        {grid.map((cell, idx) => {
          const cellDate    = new Date(year, month + (cell.current ? 0 : (idx < 7 ? -1 : 1)), cell.day);
          const isToday     = sameDay(cellDate, today);
          const isSelected  = sameDay(cellDate, selectedDate);
          const daySessions = cell.current ? sessionsForDate(cellDate) : [];
          const hasUpcoming = daySessions.some(s => s.status === 'pending' || s.status === 'accepted');
          const isPast      = cellDate < today && !isToday;

          // Sort: pending/accepted first, then by time
          const sorted = [...daySessions].sort((a, b) => {
            const aUp = a.status === 'pending' || a.status === 'accepted' ? 0 : 1;
            const bUp = b.status === 'pending' || b.status === 'accepted' ? 0 : 1;
            if (aUp !== bUp) return aUp - bUp;
            return new Date(a.scheduled_date) - new Date(b.scheduled_date);
          });

          return (
            <button
              key={idx}
              type="button"
              disabled={!cell.current}
              onClick={() => { if (cell.current) setSelectedDate(cellDate); }}
              className={[
                'relative flex min-h-[4.5rem] sm:min-h-[6.5rem] flex-col items-center gap-1 pt-2.5 pb-1.5 px-1 transition-all duration-150',
                'border-b border-r border-[var(--bridge-border)] last:border-r-0',
                '[&:nth-child(7n)]:border-r-0',
                !cell.current ? 'cursor-default' : 'cursor-pointer',
                isSelected && cell.current
                  ? 'bg-orange-500/8 ring-inset ring-2 ring-orange-500/40'
                  : cell.current
                    ? 'hover:bg-[var(--bridge-border)]/50'
                    : '',
              ].join(' ')}
            >
              {/* Day number */}
              <span className={[
                'flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition-all',
                !cell.current ? 'text-[var(--bridge-text-faint)] opacity-30' : '',
                isToday ? 'bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md font-black' : '',
                isSelected && !isToday && cell.current ? 'bg-[var(--bridge-text)]/8 text-[var(--bridge-text)] font-black' : '',
                !isToday && !isSelected && cell.current
                  ? (isPast ? 'text-[var(--bridge-text-muted)]' : 'text-[var(--bridge-text)]')
                  : '',
              ].join(' ')}>
                {cell.day}
              </span>

              {/* Session indicators */}
              {sorted.length > 0 && (
                <div className="w-full flex flex-col gap-0.5 px-0.5">
                  {/* Mobile: dots only */}
                  <div className="flex sm:hidden justify-center gap-0.5 flex-wrap">
                    {sorted.slice(0, 3).map((s, i) => {
                      const dot = TYPE_DOT[s.session_type] || { bg: 'bg-stone-400' };
                      const isUp = s.status === 'pending' || s.status === 'accepted';
                      return (
                        <span key={i}
                          className={`h-2 w-2 rounded-full ${dot.bg} ${isUp ? '' : 'opacity-40'} ${isUp ? 'ring-1 ring-white/20' : ''}`}
                        />
                      );
                    })}
                    {sorted.length > 3 && (
                      <span className="text-[8px] font-black text-[var(--bridge-text-muted)]">+{sorted.length - 3}</span>
                    )}
                  </div>

                  {/* sm+: time pills */}
                  <div className="hidden sm:flex flex-col gap-0.5 w-full">
                    {sorted.slice(0, 2).map((s, i) => {
                      const dot = TYPE_DOT[s.session_type] || { bg: 'bg-stone-400', pillText: 'text-white' };
                      const isUp = s.status === 'pending' || s.status === 'accepted';
                      const t = s.scheduled_date
                        ? new Date(s.scheduled_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                        : TYPE_LABEL_SHORT[s.session_type] || '—';
                      return (
                        <span key={i}
                          className={`block w-full truncate rounded-md px-1.5 py-0.5 text-[9px] font-bold leading-snug ${dot.pill} ${dot.pillText} ${isUp ? 'opacity-100' : 'opacity-40'}`}>
                          {t}
                        </span>
                      );
                    })}
                    {sorted.length > 2 && (
                      <span className="block text-center text-[8px] font-black text-[var(--bridge-text-muted)]">
                        +{sorted.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Upcoming pulse dot (top-right corner) */}
              {hasUpcoming && !isSelected && (
                <span aria-hidden className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.7)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--bridge-border)] px-6 py-3">
        {Object.entries(TYPE_DOT).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${val.bg}`} />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--bridge-text-faint)]">
              {TYPE_LABEL_SHORT[key]}
            </span>
          </span>
        ))}
        <span className="ml-auto text-[9px] font-bold text-[var(--bridge-text-faint)]">
          Tap a date to view sessions
        </span>
      </div>

      {/* ── Selected day detail panel ── */}
      {selectedSessions.length > 0 ? (
        <div ref={panelRef}
          className="border-t border-orange-500/20 bg-orange-500/4 px-5 py-5 space-y-3"
          style={{ animation: 'calDayIn 0.22s cubic-bezier(0.2,0.8,0.2,1) both' }}>
          <style>{`@keyframes calDayIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-[11px] text-[var(--bridge-text-muted)] mt-0.5">
                {selectedSessions.filter(s => s.status === 'accepted' || s.status === 'pending').length > 0
                  ? `${selectedSessions.filter(s => s.status === 'accepted').length} confirmed · ${selectedSessions.filter(s => s.status === 'pending').length} pending`
                  : `${selectedSessions.length} session${selectedSessions.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-black text-orange-600 dark:text-orange-400">
              {selectedSessions.length} {selectedSessions.length === 1 ? 'session' : 'sessions'}
            </span>
          </div>

          {selectedSessions.map(s => (
            <CalendarSessionCard
              key={s.id}
              session={s}
              isMentor={isMentor}
              mentorProfile={!isMentor ? mentorMap[s.mentor_id] : undefined}
              handleStatusUpdate={handleStatusUpdate}
              actionLoading={actionLoading}
              onViewIntake={isMentor && s.intake_summary ? onViewIntake : undefined}
              onReview={!isMentor && reviewWindow(s) && !reviewedSessionIds.has(s.id) ? () => onReview?.(s) : undefined}
              reviewed={!isMentor && reviewedSessionIds.has(s.id)}
              onCancel={onCancel}
            />
          ))}
        </div>
      ) : (
        <div className="border-t border-[var(--bridge-border)] px-6 py-5 text-center">
          <p className="text-xs italic text-[var(--bridge-text-faint)]">
            No sessions on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.
          </p>
        </div>
      )}
    </div>
  );
}
