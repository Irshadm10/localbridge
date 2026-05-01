import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Save, Loader2 } from 'lucide-react';
import supabase from '../../api/supabase';
import {
  BOOKING_TIME_SLOTS,
  normalizeAvailabilitySchedule,
  WEEKDAY_LABELS,
} from '../../utils/mentorAvailability';

export default function MentorAvailabilityModal({ open, onClose, mentorProfileId, userId, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accepting, setAccepting] = useState(true);
  const [schedule, setSchedule] = useState(() => normalizeAvailabilitySchedule(null));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !mentorProfileId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      const { data, error: qErr } = await supabase
        .from('mentor_profiles')
        .select('availability_schedule, available')
        .eq('id', mentorProfileId)
        .single();
      if (cancelled) return;
      if (qErr) {
        setError(qErr.message ?? 'Could not load availability.');
        setLoading(false);
        return;
      }
      setSchedule(normalizeAvailabilitySchedule(data?.availability_schedule));
      setAccepting(data?.available !== false);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, mentorProfileId]);

  const toggleSlot = (dayKey, time) => {
    setSchedule((prev) => {
      const next = { ...prev, weekly: { ...prev.weekly } };
      const list = [...(next.weekly[dayKey] ?? [])];
      const i = list.indexOf(time);
      if (i >= 0) list.splice(i, 1);
      else list.push(time);
      list.sort((a, b) => BOOKING_TIME_SLOTS.indexOf(a) - BOOKING_TIME_SLOTS.indexOf(b));
      next.weekly[dayKey] = list;
      return next;
    });
  };

  const clearDay = (dayKey) => {
    setSchedule((prev) => ({ ...prev, weekly: { ...prev.weekly, [dayKey]: [] } }));
  };

  const fillDay = (dayKey) => {
    setSchedule((prev) => ({ ...prev, weekly: { ...prev.weekly, [dayKey]: [...BOOKING_TIME_SLOTS] } }));
  };

  const handleSave = async () => {
    if (!mentorProfileId) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        availability_schedule: { weekly: schedule.weekly, timezone: schedule.timezone },
        available: accepting,
      };
      const { data, error: uErr } = await supabase
        .from('mentor_profiles')
        .update(payload)
        .eq('id', mentorProfileId)
        .select('id');
      if (uErr) throw uErr;
      if (!data || data.length === 0) throw new Error('Could not save — permission denied. Your session may have expired.');
      onSaved?.();
      onClose?.();
    } catch (e) {
      setError(e.message ?? 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avail-modal-title"
      onClick={onClose}
    >
      <div
        className="relative z-10 flex max-h-[min(46rem,92dvh)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--bridge-border)] px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 shrink-0 text-orange-500" />
            <h2 id="avail-modal-title" className="font-display text-base font-bold text-[var(--bridge-text)] sm:text-lg">
              Update availability
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--bridge-text-muted)] transition hover:bg-[color-mix(in_srgb,var(--bridge-surface-muted)_90%,var(--bridge-text)_4%)] hover:text-[var(--bridge-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <>
              {error && (
                <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                  {error}
                </p>
              )}

              <label className="mb-4 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[var(--bridge-border)] bg-[color-mix(in_srgb,var(--bridge-surface-muted)_88%,transparent)] px-4 py-3 sm:mb-5">
                <div>
                  <p className="text-sm font-semibold text-[var(--bridge-text)]">Accept new session requests</p>
                  <p className="text-xs text-[var(--bridge-text-muted)]">When off, your profile stays visible but mentees cannot book.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={accepting}
                  onClick={() => setAccepting((v) => !v)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${accepting ? 'bg-orange-500' : 'bg-stone-400/50 dark:bg-stone-600'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${accepting ? 'translate-x-5' : ''}`}
                  />
                </button>
              </label>

              <p className="mb-3 text-xs text-[var(--bridge-text-muted)]">
                Tap times for each day (timezone: <span className="font-medium text-[var(--bridge-text-secondary)]">{schedule.timezone}</span>). Same grid appears on your public profile.
              </p>

              <div className="grid gap-3 pb-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-1">
                {['0', '1', '2', '3', '4', '5', '6'].map((dayKey) => {
                  const label = WEEKDAY_LABELS[Number(dayKey)];
                  const count = schedule.weekly[dayKey]?.length ?? 0;
                  return (
                    <div key={dayKey} className="rounded-2xl border border-[var(--bridge-border)] bg-[color-mix(in_srgb,var(--bridge-surface)_96%,transparent)] p-3 sm:p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[var(--bridge-text)]">
                          {label}
                          <span className="ml-2 font-normal text-[var(--bridge-text-muted)]">({count})</span>
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => fillDay(dayKey)}
                            className="text-xs font-semibold text-orange-600 hover:underline dark:text-orange-400"
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={() => clearDay(dayKey)}
                            className="text-xs font-semibold text-[var(--bridge-text-muted)] hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="flex max-h-[9.5rem] flex-wrap gap-1.5 overflow-y-auto pr-0.5 sm:max-h-none sm:overflow-visible">
                        {BOOKING_TIME_SLOTS.map((time) => {
                          const on = schedule.weekly[dayKey]?.includes(time);
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => toggleSlot(dayKey, time)}
                              className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition sm:px-2.5 sm:py-1.5 sm:text-xs ${
                                on
                                  ? 'border-orange-500 bg-orange-500/15 text-orange-900 dark:text-orange-100'
                                  : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)] hover:border-orange-300/60'
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex shrink-0 gap-2 border-t border-[var(--bridge-border)] bg-[color-mix(in_srgb,var(--bridge-surface)_92%,var(--bridge-canvas)_8%)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-3 sm:px-5 sm:py-4 sm:pb-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--bridge-border)] py-2.5 text-sm font-semibold text-[var(--bridge-text-secondary)] transition hover:bg-[color-mix(in_srgb,var(--bridge-surface-muted)_70%,transparent)] sm:py-3"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || loading || !mentorProfileId}
            onClick={handleSave}
            className="flex flex-[1.15] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-50 sm:py-3"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
