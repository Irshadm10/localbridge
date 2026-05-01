/**
 * SessionCalendar — full-month calendar view for mentor & mentee dashboards.
 * Shows sessions as colour-coded dots on their booked date.
 * Clicking a day opens an inline detail panel with full SessionCard(s).
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { SessionCard } from './dashboardShared';

function reviewWindow(session) {
  if (session.status !== 'completed') return false;
  const ref = new Date(session.scheduled_date ?? session.created_at);
  return Date.now() - ref.getTime() <= 5 * 24 * 60 * 60 * 1000;
}

// ── Type colour maps ───────────────────────────────────────────────────────────
const TYPE_DOT = {
  career_advice:  { bg: 'bg-amber-500',  ring: 'ring-amber-400/50',  hex: '#f59e0b' },
  interview_prep: { bg: 'bg-emerald-500', ring: 'ring-emerald-400/50', hex: '#10b981' },
  resume_review:  { bg: 'bg-sky-500',     ring: 'ring-sky-400/50',     hex: '#0ea5e9' },
  networking:     { bg: 'bg-violet-500',  ring: 'ring-violet-400/50',  hex: '#8b5cf6' },
};

const TYPE_LABEL = {
  career_advice:  'Career',
  interview_prep: 'Interview',
  resume_review:  'Resume',
  networking:     'Networking',
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
}) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const panelRef = useRef(null);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Group sessions by ISO date string "YYYY-MM-DD"
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

  const grid = buildGrid(year, month);

  const selectedSessions = sessionsForDate(selectedDate);

  // Scroll panel into view when a day with sessions is selected
  useEffect(() => {
    if (selectedSessions.length > 0 && panelRef.current) {
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
    }
  }, [selectedDate.toDateString()]);

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }
  function goToday() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  }

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Count upcoming sessions in view month for the header badge
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
          <p className="text-[9px] font-black uppercase tracking-[0.26em] text-orange-500">Session calendar</p>
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
          const cellDate = new Date(year, month + (cell.current ? 0 : (idx < 7 ? -1 : 1)), cell.day);
          const isToday = sameDay(cellDate, today);
          const isSelected = sameDay(cellDate, selectedDate);
          const daySessions = cell.current ? sessionsForDate(cellDate) : [];
          const hasUpcoming = daySessions.some(s => s.status === 'pending' || s.status === 'accepted');
          const isPast = cellDate < today && !isToday;

          return (
            <button
              key={idx}
              type="button"
              disabled={!cell.current}
              onClick={() => { if (cell.current) setSelectedDate(cellDate); }}
              className={[
                'relative flex min-h-[4rem] sm:min-h-[5rem] flex-col items-center gap-1 pt-2.5 pb-1.5 px-1 transition-all duration-150',
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

              {/* Session dots */}
              {daySessions.length > 0 && (
                <div className="flex flex-wrap justify-center gap-0.5 px-0.5">
                  {daySessions.slice(0, 3).map((s, i) => {
                    const dot = TYPE_DOT[s.session_type] || { bg: 'bg-stone-400', ring: '' };
                    const isUpcoming = s.status === 'pending' || s.status === 'accepted';
                    return (
                      <span key={i}
                        className={[
                          'h-1.5 w-1.5 rounded-full ring-1',
                          dot.bg, dot.ring,
                          isUpcoming ? 'animate-pulse-soft' : 'opacity-50',
                        ].join(' ')}
                      />
                    );
                  })}
                  {daySessions.length > 3 && (
                    <span className="text-[8px] font-black text-[var(--bridge-text-muted)]">+{daySessions.length - 3}</span>
                  )}
                </div>
              )}

              {/* Upcoming indicator ring */}
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
              {TYPE_LABEL[key]}
            </span>
          </span>
        ))}
        <span className="ml-auto text-[9px] font-bold text-[var(--bridge-text-faint)]">
          Click a day to see sessions
        </span>
      </div>

      {/* ── Selected day panel ── */}
      {selectedSessions.length > 0 && (
        <div ref={panelRef}
          className="border-t border-orange-500/20 bg-orange-500/4 px-6 py-5 space-y-3"
          style={{ animation: 'calDayIn 0.22s cubic-bezier(0.2,0.8,0.2,1) both' }}>
          <style>{`@keyframes calDayIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-black text-orange-600 dark:text-orange-400">
              {selectedSessions.length} {selectedSessions.length === 1 ? 'session' : 'sessions'}
            </span>
          </div>

          {selectedSessions.map(s => (
            <SessionCard
              key={s.id}
              session={s}
              isMentor={isMentor}
              mentorProfile={!isMentor ? mentorMap[s.mentor_id] : undefined}
              onAccept={isMentor ? (id) => handleStatusUpdate(id, 'accepted') : undefined}
              onDecline={isMentor ? (id) => handleStatusUpdate(id, 'declined') : undefined}
              onCancel={!isMentor ? (id) => handleStatusUpdate(id, 'cancelled') : undefined}
              actionLoading={actionLoading}
              intakeSummary={isMentor ? s.intake_summary : undefined}
              onViewIntake={isMentor && s.intake_summary ? (_, text) => onViewIntake?.(s, text) : undefined}
              onReview={
                !isMentor && reviewWindow(s) && !reviewedSessionIds.has(s.id)
                  ? () => onReview?.(s)
                  : undefined
              }
              reviewed={!isMentor && reviewedSessionIds.has(s.id)}
            />
          ))}
        </div>
      )}

      {selectedSessions.length === 0 && (
        <div className="border-t border-[var(--bridge-border)] px-6 py-5 text-center">
          <p className="text-xs italic text-[var(--bridge-text-faint)]">
            No sessions on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.
          </p>
        </div>
      )}
    </div>
  );
}
