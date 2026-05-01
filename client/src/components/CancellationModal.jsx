import { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Clock, CheckCircle, ChevronDown } from 'lucide-react';
import { requestCancellation, getMonthlyUsedCount } from '../api/cancellations.js';

const MONTHLY_LIMIT = 3;

const REASONS = [
  { value: 'scheduling_conflict',   label: 'Scheduling conflict' },
  { value: 'personal_emergency',    label: 'Personal emergency' },
  { value: 'no_longer_needed',      label: 'Session no longer needed' },
  { value: 'found_alternative',     label: 'Found another mentor / mentee' },
  { value: 'technical_issues',      label: 'Technical issues' },
  { value: 'other',                 label: 'Other' },
];

export default function CancellationModal({ session, isMentor, onClose, onSuccess }) {
  const [reason, setReason]     = useState('');
  const [details, setDetails]   = useState('');
  const [used, setUsed]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState('');
  const overlayRef = useRef(null);

  useEffect(() => {
    getMonthlyUsedCount().then(n => setUsed(n));
  }, []);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const remaining = used === null ? null : Math.max(0, MONTHLY_LIMIT - used);
  const atLimit   = remaining === 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason || atLimit) return;

    setLoading(true);
    setError('');
    const { data, error: err } = await requestCancellation(session.id, reason, details);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }
    setSubmitted(true);
    setTimeout(() => { onSuccess?.(); }, 1800);
  }

  const sessionDate = session.scheduled_date
    ? new Date(session.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
    : 'Unscheduled';

  const personName = isMentor
    ? (session.mentee_name || 'mentee')
    : (session.mentor_name || 'mentor');

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[var(--bridge-surface)] shadow-[0_32px_80px_rgba(0,0,0,0.4)] ring-1 ring-[var(--bridge-border)]"
        style={{ animation: 'modalIn 0.22s cubic-bezier(0.2,0.8,0.2,1) both' }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.94) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bridge-border)] text-[var(--bridge-text-muted)] transition hover:bg-red-500/15 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Submitted state */}
        {submitted ? (
          <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/12 ring-1 ring-emerald-500/25">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <p className="font-display text-xl font-black text-[var(--bridge-text)]">Request sent</p>
              <p className="mt-1 text-sm text-[var(--bridge-text-muted)]">A developer will review and process your request. You'll be notified of the outcome.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="px-6 pb-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-red-500">Request cancellation</p>
                  <h2 className="font-display text-lg font-black tracking-tight text-[var(--bridge-text)]">
                    Cancel with {personName}
                  </h2>
                </div>
              </div>

              {/* Session info pill */}
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--bridge-canvas)] px-3 py-2.5 ring-1 ring-[var(--bridge-border)]">
                <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--bridge-text-muted)]" />
                <span className="text-xs font-semibold text-[var(--bridge-text-secondary)]">{sessionDate}</span>
              </div>

              {/* Monthly limit indicator */}
              {used !== null && (
                <div className={`mt-3 flex items-center justify-between rounded-xl px-3 py-2.5 ring-1 ${
                  atLimit
                    ? 'bg-red-500/8 ring-red-500/20'
                    : remaining <= 1
                      ? 'bg-amber-500/8 ring-amber-500/20'
                      : 'bg-[var(--bridge-canvas)] ring-[var(--bridge-border)]'
                }`}>
                  <span className={`text-xs font-semibold ${atLimit ? 'text-red-500' : remaining <= 1 ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--bridge-text-secondary)]'}`}>
                    Monthly cancellations
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: MONTHLY_LIMIT }).map((_, i) => (
                        <span key={i} className={`h-2 w-2 rounded-full ${i < used ? 'bg-red-500' : 'bg-[var(--bridge-border)]'}`} />
                      ))}
                    </div>
                    <span className={`text-[11px] font-black ${atLimit ? 'text-red-500' : 'text-[var(--bridge-text-muted)]'}`}>
                      {used}/{MONTHLY_LIMIT} used
                    </span>
                  </div>
                </div>
              )}

              {atLimit && (
                <p className="mt-2 text-xs text-red-500 font-semibold">
                  You've used all {MONTHLY_LIMIT} cancellation requests this month. Unused requests reset next month.
                </p>
              )}
            </div>

            <div className="space-y-4 px-6 pb-6">
              {/* Reason select */}
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[var(--bridge-text-secondary)]">
                  Reason for cancellation <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    disabled={atLimit}
                    className="w-full appearance-none rounded-xl bg-[var(--bridge-canvas)] px-4 py-3 pr-9 text-sm font-semibold text-[var(--bridge-text)] ring-1 ring-[var(--bridge-border)] transition focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50"
                  >
                    <option value="">Select a reason…</option>
                    {REASONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bridge-text-muted)]" />
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[var(--bridge-text-secondary)]">
                  Additional details <span className="text-[var(--bridge-text-faint)]">(optional)</span>
                </label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  disabled={atLimit}
                  rows={3}
                  maxLength={400}
                  placeholder="Anything else the reviewer should know…"
                  className="w-full resize-none rounded-xl bg-[var(--bridge-canvas)] px-4 py-3 text-sm text-[var(--bridge-text)] placeholder:text-[var(--bridge-text-faint)] ring-1 ring-[var(--bridge-border)] transition focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50"
                />
                <p className="mt-1 text-right text-[9px] text-[var(--bridge-text-faint)]">{details.length}/400</p>
              </div>

              {/* Mentor-cancel notice */}
              {isMentor && (
                <div className="rounded-xl bg-sky-500/8 px-4 py-3 ring-1 ring-sky-500/20">
                  <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                    If this cancellation is approved, your mentee will automatically receive a 2-week complimentary Pro plan as compensation.
                  </p>
                </div>
              )}

              {/* Note about review */}
              <div className="rounded-xl bg-amber-500/8 px-4 py-3 ring-1 ring-amber-500/20">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Cancellation requests are reviewed by our team. The session remains active until a decision is made. You'll be notified of the outcome in your dashboard.
                </p>
              </div>

              {error && (
                <p className="rounded-xl bg-red-500/8 px-4 py-3 text-xs font-semibold text-red-500 ring-1 ring-red-500/20">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 rounded-xl border border-[var(--bridge-border)] py-3 text-sm font-bold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-border)]">
                  Go back
                </button>
                <button
                  type="submit"
                  disabled={loading || !reason || atLimit}
                  className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-400 disabled:opacity-50"
                >
                  {loading ? 'Submitting…' : 'Submit request'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
