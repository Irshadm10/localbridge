import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, Sparkles, ArrowRight, Rocket } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { SESSION_TYPES } from '../constants/sessionTypes';
import { isMentorAccount } from '../utils/accountRole';

const MENTEE_GOALS = [
  { key: 'job',       emoji: '💼', label: 'Land my first job',  sub: 'Get guidance on job hunting and applications' },
  { key: 'switch',    emoji: '🔄', label: 'Switch careers',     sub: 'Navigate an industry or role change' },
  { key: 'interview', emoji: '🎯', label: 'Ace my interviews',  sub: 'Practice and prepare with an expert' },
  { key: 'promo',     emoji: '📈', label: 'Get promoted',       sub: 'Diagnose what\u2019s stalling and make the case' },
];

const MENTOR_GOALS = SESSION_TYPES.slice(0, 4);

function getFirstName(user) {
  const full = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  if (full.trim()) return full.trim().split(/\s+/)[0];
  return user?.email?.split('@')[0] ?? 'there';
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]';

export default function OnboardingModal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMentor = isMentorAccount(user);

  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('bridge_onboarded')) {
      setVisible(true);
      requestAnimationFrame(() => setMounted(true));
    }
  }, []);

  function dismiss() {
    localStorage.setItem('bridge_onboarded', '1');
    setMounted(false);
    setTimeout(() => setVisible(false), 220);
  }

  function handleFinish() {
    localStorage.setItem('bridge_onboarded', '1');
    setMounted(false);
    setTimeout(() => {
      setVisible(false);
      navigate(isMentor ? '/dashboard' : '/mentors');
    }, 220);
  }

  if (!visible) return null;

  const firstName = getFirstName(user);
  const goals = isMentor ? MENTOR_GOALS : MENTEE_GOALS;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-300 ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xl dark:bg-black/70"
      />
      {/* Aurora behind modal */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2 opacity-60 dark:opacity-80"
        style={{
          background:
            'conic-gradient(from 140deg at 50% 50%, rgba(251,146,60,0.22), rgba(234,88,12,0.14), rgba(253,230,138,0.16), rgba(251,146,60,0.22))',
          filter: 'blur(110px)',
        }}
      />

      <div
        className={`relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-float transition-all duration-500 ${
          mounted ? 'translate-y-0 scale-100' : 'translate-y-6 scale-[0.96]'
        }`}
      >
        {/* Top gradient hairline */}
        <div aria-hidden className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/20" />
        <div aria-hidden className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-amber-300/15 blur-3xl dark:bg-amber-500/10" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.04] mix-blend-overlay dark:opacity-[0.1]" />

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/80 text-[var(--bridge-text-muted)] backdrop-blur transition hover:border-orange-300/60 hover:text-[var(--bridge-text)] ${focusRing}`}
          aria-label="Skip onboarding"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative px-8 pb-8 pt-10 sm:px-10 sm:pb-10 sm:pt-12">
          {step === 1 && (
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 shadow-[0_20px_50px_-10px_rgba(234,88,12,0.6)]">
                <Sparkles className="h-9 w-9 text-white" />
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-white/25 to-transparent" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-700 dark:text-orange-300">Welcome aboard</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-[var(--bridge-text)] sm:text-4xl">
                Hey {firstName}! <span className="italic text-gradient-bridge">Let&apos;s get you set up.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[var(--bridge-text-secondary)]">
                You&apos;re one step away from connecting with mentors who&apos;ve been exactly where you are.
              </p>
              <button
                onClick={() => setStep(2)}
                className={`btn-sheen group mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_36px_-8px_rgba(234,88,12,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-10px_rgba(234,88,12,0.7)] ${focusRing}`}
              >
                Get started
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-700 dark:text-orange-300">Step 2 of 3</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--bridge-text)] sm:text-3xl">
                {isMentor ? 'What do you want to help with?' : 'What are you looking for?'}
              </h2>
              <p className="mt-2 text-sm text-[var(--bridge-text-muted)]">
                Pick the closest match — you can change this anytime in settings.
              </p>

              <div className="mt-6 space-y-3">
                {goals.map((g) => {
                  const key = g.key;
                  const isSelected = selectedGoal === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedGoal(key)}
                      className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                        isSelected
                          ? 'border-transparent border-gradient-bridge animate-border-bridge bg-gradient-to-br from-orange-50/90 to-amber-50/60 shadow-[0_12px_32px_-10px_rgba(234,88,12,0.45)] dark:from-orange-500/12 dark:to-amber-500/6'
                          : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] hover:-translate-y-0.5 hover:border-orange-300/70 hover:shadow-bridge-tile'
                      } ${focusRing}`}
                    >
                      <span
                        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl transition ${
                          isSelected
                            ? 'bg-white shadow-sm ring-1 ring-orange-200/80 dark:bg-white/10 dark:ring-orange-400/30'
                            : 'bg-[var(--bridge-surface-muted)] ring-1 ring-[var(--bridge-border)] group-hover:scale-105'
                        }`}
                        aria-hidden
                      >
                        {g.emoji ?? g.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[var(--bridge-text)]">{g.label ?? g.name}</p>
                        <p className="mt-0.5 text-xs text-[var(--bridge-text-muted)]">{g.sub ?? g.tagline}</p>
                      </div>
                      {isSelected ? (
                        <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setStep(1)}
                  className={`inline-flex items-center justify-center rounded-full border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-5 py-3 text-sm font-semibold text-[var(--bridge-text-secondary)] transition hover:border-orange-300/70 hover:text-[var(--bridge-text)] sm:w-auto ${focusRing}`}
                >
                  Back
                </button>
                <button
                  onClick={() => selectedGoal && setStep(3)}
                  disabled={!selectedGoal}
                  className={`btn-sheen group relative inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                    selectedGoal
                      ? `bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-[0_14px_36px_-8px_rgba(234,88,12,0.55)] hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-10px_rgba(234,88,12,0.7)] ${focusRing}`
                      : 'cursor-not-allowed bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-faint)]'
                  }`}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_18px_46px_-10px_rgba(16,185,129,0.55)]">
                <CheckCircle2 className="h-10 w-10 text-white" />
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">All set</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-[var(--bridge-text)] sm:text-4xl">You&apos;re in.</h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[var(--bridge-text-secondary)]">
                {isMentor
                  ? "Your mentor profile is ready. Let's get you in front of mentees."
                  : "Your Bridge account is ready. Let's find you the right mentor."}
              </p>
              <button
                onClick={handleFinish}
                className={`btn-sheen group mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_36px_-8px_rgba(234,88,12,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-10px_rgba(234,88,12,0.7)] ${focusRing}`}
              >
                {isMentor ? (
                  <>
                    <Rocket className="h-4 w-4" />
                    Go to dashboard
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Browse mentors
                  </>
                )}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative border-t border-[var(--bridge-border)] px-8 py-5 sm:px-10">
          <div className="mx-auto flex max-w-xs items-center gap-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  s <= step
                    ? 'bg-gradient-to-r from-orange-500 to-amber-400'
                    : 'bg-[var(--bridge-surface-muted)]'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-muted)]">
            Step {step} of 3
          </p>
        </div>
      </div>
    </div>
  );
}
