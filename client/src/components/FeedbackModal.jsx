import { useState, useEffect, useCallback } from 'react';
import { X, Check, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { focusRing } from '../ui';

const focusRingWhite =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900';

const CATEGORIES = [
  { key: 'bug', label: 'Bug report', icon: '🐛', desc: "Something broken or not working" },
  { key: 'ux', label: 'User experience', icon: '✨', desc: 'Confusing, slow, or could be smoother' },
  { key: 'feature', label: 'Feature request', icon: '💡', desc: 'Something you wish existed' },
  { key: 'mentor', label: 'Mentor feedback', icon: '👤', desc: 'About a mentor or session' },
  { key: 'billing', label: 'Billing / subscription', icon: '💳', desc: 'Payment, plans, or invoices' },
  { key: 'content', label: 'Content / copy', icon: '📝', desc: 'Typos, unclear wording, or docs' },
  { key: 'other', label: 'Other', icon: '💬', desc: "Doesn't fit anywhere else" },
];

const SENTIMENTS = [
  { key: 'love', emoji: '😍', label: 'Love it', tint: 'from-emerald-400 to-teal-400' },
  { key: 'good', emoji: '🙂', label: 'Good', tint: 'from-sky-400 to-cyan-400' },
  { key: 'meh', emoji: '😐', label: 'Meh', tint: 'from-amber-400 to-orange-400' },
  { key: 'bad', emoji: '😞', label: 'Frustrated', tint: 'from-rose-400 to-red-400' },
];

export default function FeedbackModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setCategory(null);
      setSentiment(null);
      setMessage('');
      setEmail('');
      setSent(false);
    }, 220);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
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
  }, [open, handleClose]);

  if (!open) return null;

  function submit() {
    const payload = {
      category: category?.key,
      sentiment: sentiment?.key,
      message,
      email: email || null,
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
    console.log('[Feedback]', payload);
    setSent(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xl"
        aria-label="Close"
        onClick={handleClose}
      />
      {/* Aurora behind modal */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2 opacity-50 dark:opacity-70"
        style={{
          background:
            'conic-gradient(from 200deg at 50% 50%, rgba(251,146,60,0.2), rgba(234,88,12,0.12), rgba(253,230,138,0.14), rgba(251,146,60,0.2))',
          filter: 'blur(110px)',
        }}
      />

      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-float sm:rounded-[2rem]">
        {sent ? (
          <div className="relative flex flex-col items-center px-8 py-16 text-center">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.05] dark:opacity-[0.12]" />
            <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-300/30 to-transparent blur-3xl" />
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_18px_48px_-8px_rgba(16,185,129,0.55)]">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="font-display text-3xl font-bold text-[var(--bridge-text)]">Thanks for the feedback</h2>
            <p className="mt-3 max-w-sm leading-relaxed text-[var(--bridge-text-secondary)]">
              Every piece of feedback gets read. If you left your email, we&apos;ll follow up when relevant.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className={`btn-sheen mt-9 inline-flex items-center gap-2 rounded-full bg-stone-900 px-8 py-3 text-sm font-semibold text-amber-50 shadow-[0_12px_30px_-8px_rgba(28,25,23,0.45)] transition hover:-translate-y-0.5 hover:bg-stone-800 dark:bg-gradient-to-r dark:from-orange-500 dark:to-amber-500 dark:text-stone-950 ${focusRing}`}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 px-6 pb-6 pt-7 sm:px-7">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.13] mix-blend-overlay" />
              <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-amber-500/20 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-orange-500/15 blur-3xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/90">
                    Share feedback · Step {step} of 3
                  </p>
                  <h2 id="feedback-title" className="mt-1.5 font-display text-2xl font-semibold text-white">
                    {step === 1 && 'What kind of feedback?'}
                    {step === 2 && "How's it going overall?"}
                    {step === 3 && 'Tell us more'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-sm transition hover:border-white/25 hover:bg-white/20 ${focusRingWhite}`}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="relative mt-5 flex gap-1.5">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      n <= step ? 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.6)]' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-7">
              {step === 1 && (
                <div className="space-y-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setCategory(c);
                        setStep(2);
                      }}
                      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
                        category?.key === c.key
                          ? 'border-orange-300/70 bg-gradient-to-r from-orange-50/95 to-amber-50/60 shadow-[0_10px_30px_-8px_rgba(234,88,12,0.35)] dark:from-orange-500/10 dark:to-amber-500/5'
                          : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] hover:-translate-y-0.5 hover:border-orange-300/70 hover:bg-orange-50/40 hover:shadow-bridge-tile dark:hover:bg-white/[0.04]'
                      } ${focusRing}`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bridge-surface-muted)] text-xl ring-1 ring-[var(--bridge-border)]">
                        {c.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[var(--bridge-text)]">{c.label}</p>
                        <p className="text-xs text-[var(--bridge-text-muted)]">{c.desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--bridge-text-faint)] transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {SENTIMENTS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => {
                        setSentiment(s);
                        setStep(3);
                      }}
                      className={`group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border py-6 transition-all duration-300 ${
                        sentiment?.key === s.key
                          ? 'border-orange-300/70 bg-gradient-to-b from-orange-50/80 to-white shadow-[0_10px_30px_-8px_rgba(234,88,12,0.35)] dark:from-orange-500/10 dark:to-[var(--bridge-surface)]'
                          : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] hover:-translate-y-1 hover:border-orange-300/70 hover:shadow-bridge-tile'
                      } ${focusRing}`}
                    >
                      <span
                        aria-hidden
                        className={`pointer-events-none absolute -top-6 left-1/2 h-16 w-24 -translate-x-1/2 rounded-full bg-gradient-to-b ${s.tint} opacity-0 blur-2xl transition group-hover:opacity-30`}
                      />
                      <span className="relative text-4xl transition-transform duration-500 group-hover:scale-110">
                        {s.emoji}
                      </span>
                      <span className="relative text-xs font-bold uppercase tracking-wide text-[var(--bridge-text-secondary)]">
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="relative overflow-hidden rounded-2xl border border-orange-200/70 bg-gradient-to-br from-orange-50/80 via-amber-50/50 to-orange-50/20 p-4 dark:border-orange-400/25 dark:from-orange-500/12 dark:via-amber-500/8 dark:to-transparent">
                    <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-orange-400/15 blur-2xl" />
                    <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-muted)]">You&apos;re reporting</p>
                    <p className="relative mt-1.5 text-sm font-semibold text-[var(--bridge-text)]">
                      {category?.icon} {category?.label} · {sentiment?.emoji} {sentiment?.label}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">
                      Your feedback
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      placeholder="What happened? What did you expect? The more specific, the better."
                      className="w-full resize-none rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] px-4 py-3.5 text-sm text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:bg-[var(--bridge-surface)] focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                    />
                    <p className="mt-1.5 text-right text-[10px] font-medium text-[var(--bridge-text-faint)]">
                      {message.length} characters
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">
                      Email{' '}
                      <span className="text-[10px] font-medium normal-case text-[var(--bridge-text-faint)]">
                        (optional — only if you want a reply)
                      </span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] px-4 py-3.5 text-sm text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:bg-[var(--bridge-surface)] focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                    />
                  </div>
                </div>
              )}
            </div>

            <footer className="shrink-0 border-t border-[var(--bridge-border)] bg-[var(--bridge-surface)]/95 px-6 py-4 sm:px-7">
              <div className="flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] ${focusRing}`}
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                ) : (
                  <span />
                )}
                {step === 3 ? (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!message.trim()}
                    className={`btn-sheen group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_-6px_rgba(234,88,12,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-8px_rgba(234,88,12,0.7)] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                  >
                    <Check className="h-4 w-4" /> Send feedback
                  </button>
                ) : (
                  <span />
                )}
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
