import { useEffect, useState } from 'react';
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
      const { error: uErr } = await supabase.from('mentor_profiles').update(payload).eq('id', mentorProfileId);
      if (uErr) throw uErr;
      onSaved?.();
      onClose?.();
    } catch (e) {
      setError(e.message ?? 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="avail-modal-title">
      <button type="button" className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-stone-200 bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            <h2 id="avail-modal-title" className="font-display text-lg font-bold text-stone-900">
              Update availability
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-stone-500 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <>
              {error && <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

              <label className="mb-6 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">Accept new session requests</p>
                  <p className="text-xs text-stone-500">When off, your profile stays visible but mentees cannot book.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={accepting}
                  onClick={() => setAccepting((v) => !v)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${accepting ? 'bg-orange-500' : 'bg-stone-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${accepting ? 'translate-x-5' : ''}`} />
                </button>
              </label>

              <p className="mb-3 text-xs text-stone-500">
                Tap times for each day (your timezone: <span className="font-medium text-stone-700">{schedule.timezone}</span>). Same grid is used on your public profile.
              </p>

              <div className="space-y-4">
                {['0', '1', '2', '3', '4', '5', '6'].map((dayKey) => {
                  const label = WEEKDAY_LABELS[Number(dayKey)];
                  const count = schedule.weekly[dayKey]?.length ?? 0;
                  return (
                    <div key={dayKey} className="rounded-2xl border border-stone-200 p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold text-stone-900">
                          {label}
                          <span className="ml-2 font-normal text-stone-500">({count} slots)</span>
                        </span>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => fillDay(dayKey)} className="text-xs font-semibold text-orange-600 hover:underline">
                            All
                          </button>
                          <button type="button" onClick={() => clearDay(dayKey)} className="text-xs font-semibold text-stone-500 hover:underline">
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {BOOKING_TIME_SLOTS.map((time) => {
                          const on = schedule.weekly[dayKey]?.includes(time);
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => toggleSlot(dayKey, time)}
                              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                                on
                                  ? 'border-orange-500 bg-orange-50 text-orange-900'
                                  : 'border-stone-200 bg-white text-stone-600 hover:border-orange-200'
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

        <div className="flex shrink-0 gap-3 border-t border-stone-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || loading || !mentorProfileId}
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 py-3 text-sm font-bold text-white shadow-md disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
