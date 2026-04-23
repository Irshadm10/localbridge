import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import LoadingSpinner from '../components/LoadingSpinner';
import Reveal from '../components/Reveal';
import { focusRing } from '../ui';

const PERKS = [
  'Your shortlist and favorites stay on this account',
  "Book from the directory or open a profile you've saved",
  'Mentors and mentees share one login — no separate app',
];

const TRUST = [
  { icon: ShieldCheck, label: 'Encrypted sign-in' },
  { icon: Sparkles, label: 'Works for mentors & mentees' },
];

function LoginAside() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-orange-400/20 bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 p-7 text-white shadow-bridge-float sm:p-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.14] mix-blend-overlay" />
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-orange-500/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" />

        <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-amber-200/90">Welcome back</p>
        <p className="relative mt-3 font-display text-xl font-medium leading-snug text-white sm:text-2xl">
          Same Bridge — bios you can skim, hearts for later, and session types so nobody&apos;s guessing what the hour is for.
        </p>
        <ul className="relative mt-6 space-y-3 text-sm leading-relaxed text-stone-300">
          {PERKS.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-amber-300 ring-1 ring-amber-300/25" aria-hidden>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="relative mt-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="flex -space-x-1.5" aria-hidden>
            {['SK', 'MR', 'LV', 'JE'].map((i, idx) => (
              <div
                key={i}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-stone-900 text-[10px] font-bold shadow ${
                  idx === 0 ? 'bg-amber-200 text-amber-900' : idx === 1 ? 'bg-orange-200 text-orange-900' : idx === 2 ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                }`}
              >
                {i}
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">4,800+ sessions</p>
            <p className="text-xs text-stone-400">booked through Bridge this quarter</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-4 text-sm leading-relaxed text-[var(--bridge-text-secondary)] shadow-bridge-tile backdrop-blur-sm">
        <p>
          Need an account?{' '}
          <Link to="/register" className={`font-semibold text-orange-700 transition hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200 ${focusRing} rounded-sm`}>
            Sign up — it&apos;s free →
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginAlreadySignedIn({ user }) {
  const display = user.user_metadata?.full_name?.trim() || user.email || 'your account';
  const asMentor = isMentorAccount(user);

  return (
    <main className="relative min-h-screen overflow-x-hidden" aria-labelledby="login-heading">
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative z-[1] mx-auto max-w-lg">
          <Reveal>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-8 shadow-bridge-float sm:p-10">
              <div aria-hidden className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                Signed in
              </div>
              <h1 id="login-heading" className="font-display text-3xl font-bold tracking-tight text-[var(--bridge-text)] sm:text-4xl">
                You&apos;re already in
              </h1>
              <p className="mt-4 text-base leading-relaxed text-[var(--bridge-text-secondary)]">
                Logged in as <span className="font-semibold text-[var(--bridge-text)]">{display}</span>. Head to the directory
                or your dashboard — no need to sign in again.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={asMentor ? '/dashboard' : '/mentors'}
                  className={`btn-sheen inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_rgba(234,88,12,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-10px_rgba(234,88,12,0.65)] ${focusRing}`}
                >
                  {asMentor ? 'Mentor dashboard' : 'Browse mentors'}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  to={asMentor ? '/settings' : '/dashboard'}
                  className={`inline-flex flex-1 items-center justify-center rounded-full border-2 border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-6 py-3.5 text-sm font-semibold text-[var(--bridge-text)] shadow-sm transition hover:-translate-y-0.5 hover:border-orange-400/70 hover:shadow-md ${focusRing}`}
                >
                  {asMentor ? 'Account settings' : 'Dashboard'}
                </Link>
              </div>
              <p className="mt-8 text-center text-sm text-[var(--bridge-text-muted)]">
                Wrong account? Sign out from the header, then sign in here.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fromRaw = location.state?.from;
  const redirectPath =
    typeof fromRaw === 'string' && fromRaw.startsWith('/') && !fromRaw.startsWith('//') && !fromRaw.includes('://')
      ? fromRaw
      : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const signedIn = await login(email.trim(), password);
      const home = isMentorAccount(signedIn) ? '/dashboard' : '/mentors';
      navigate(redirectPath ?? home, { replace: true });
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-x-hidden">
        <LoadingSpinner label="Checking your session…" className="min-h-[calc(100vh-4rem)]" size="lg" />
      </main>
    );
  }

  if (user) return <LoginAlreadySignedIn user={user} />;

  return (
    <main className="relative min-h-screen overflow-x-hidden" aria-labelledby="login-heading">
      <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 sm:pb-24 lg:px-8 lg:pt-12">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-30%] -z-10 h-[80vmax] w-[80vmax] -translate-x-1/2 opacity-60 dark:opacity-80"
          style={{
            background:
              'conic-gradient(from 210deg at 50% 50%, rgba(251,146,60,0.14), rgba(253,230,138,0.1), rgba(234,88,12,0.18), rgba(251,146,60,0.14))',
            filter: 'blur(100px)',
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.05] mix-blend-overlay dark:opacity-[0.1]" />

        <div className="relative z-[1] mx-auto grid max-w-bridge grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-x-10">
          {/* Left column — pitch */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Reveal>
              <nav aria-label="Breadcrumb" className="mb-2">
                <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--bridge-text-muted)]">
                  <li>
                    <Link to="/" className={`rounded-md font-medium transition hover:text-orange-700 dark:hover:text-orange-300 ${focusRing}`}>
                      Home
                    </Link>
                  </li>
                  <li aria-hidden>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                    </svg>
                  </li>
                  <li className="font-semibold text-[var(--bridge-text-secondary)]">Log in</li>
                </ol>
              </nav>
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 shadow-sm backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span aria-hidden className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 animate-pulse-soft" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-secondary)]">Secure session</span>
              </div>
              <h1
                id="login-heading"
                className="mt-5 font-display text-[2.25rem] font-bold leading-[1.08] tracking-[-0.012em] text-[var(--bridge-text)] sm:text-[2.85rem] sm:leading-[1.08] lg:text-[3.2rem]"
              >
                Hey again —{' '}
                <span className="font-editorial italic text-gradient-bridge">pick up where you left off</span>.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--bridge-text-secondary)] sm:text-lg">
                One email and password. After this, we&apos;ll drop you on the mentor list — or right back where you were trying to go.
              </p>

              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--bridge-text-secondary)]">
                {TRUST.map((t) => (
                  <li key={t.label} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" aria-hidden>
                      <t.icon className="h-3.5 w-3.5" />
                    </span>
                    {t.label}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120} className="mt-6 hidden lg:block">
              <LoginAside />
            </Reveal>
          </div>

          {/* Right column — form card */}
          <Reveal className="lg:col-span-7 lg:self-start" delay={60}>
            <div className="relative overflow-hidden rounded-[2rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/95 shadow-bridge-float backdrop-blur-xl">
              {/* Top gradient hairline */}
              <div aria-hidden className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
              <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/20" />
              <div aria-hidden className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-amber-300/15 blur-3xl dark:bg-amber-500/10" />

              <div className="relative p-7 sm:p-10 lg:p-12">
                <div className="flex flex-col gap-2 border-b border-[var(--bridge-border)] pb-7 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-700 dark:text-orange-300">Log in</p>
                    <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--bridge-text)] sm:text-[2rem] lg:text-[2.15rem]">
                      Sign in to Bridge
                    </h2>
                  </div>
                  <p className="max-w-[15rem] text-sm leading-snug text-[var(--bridge-text-muted)] sm:text-right">
                    Use the email you registered with.
                  </p>
                </div>

                {redirectPath ? (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-orange-200/90 bg-orange-50/80 px-4 py-3.5 text-sm text-orange-950 dark:border-orange-400/30 dark:bg-orange-500/10 dark:text-orange-100">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                    <p>
                      After you sign in we&apos;ll send you back to{' '}
                      <span className="font-semibold">{redirectPath}</span>.
                    </p>
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className={`flex flex-col gap-6 ${redirectPath ? 'mt-6' : 'mt-8'}`}>
                  {error ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-900 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200" role="alert">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  ) : null}

                  <div className="space-y-5">
                    {/* Email */}
                    <div className="group relative">
                      <label htmlFor="login-email" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bridge-text-faint)] transition group-focus-within:text-orange-500" aria-hidden />
                        <input
                          id="login-email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="you@example.com"
                          className="w-full rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] px-11 py-4 text-base text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:bg-[var(--bridge-surface)] focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="group relative">
                      <div className="mb-2 flex items-center justify-between">
                        <label htmlFor="login-password" className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">
                          Password
                        </label>
                        <Link
                          to="/contact"
                          state={{ topic: 'Billing issue' }}
                          className="text-[11px] font-semibold text-orange-700 transition hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bridge-text-faint)] transition group-focus-within:text-orange-500" aria-hidden />
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Your password"
                          className="w-full rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] px-11 py-4 text-base text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:bg-[var(--bridge-surface)] focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className={`absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--bridge-text-muted)] transition hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-white/[0.06] dark:hover:text-orange-300 ${focusRing}`}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`btn-sheen group relative inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 py-4.5 py-5 text-base font-semibold text-white shadow-[0_16px_40px_-10px_rgba(234,88,12,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-10px_rgba(234,88,12,0.7)] disabled:pointer-events-none disabled:opacity-55 ${focusRing}`}
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Log in
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 flex flex-col items-center gap-4 border-t border-[var(--bridge-border)] pt-7 sm:flex-row sm:justify-between">
                  <p className="text-sm text-[var(--bridge-text-secondary)]">
                    New here?{' '}
                    <Link
                      to="/register"
                      className={`font-semibold text-orange-700 underline decoration-orange-300/60 underline-offset-4 transition hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-200 ${focusRing} rounded-sm`}
                    >
                      Create an account
                    </Link>
                  </p>
                  <Link to="/mentors" className={`text-sm font-medium text-[var(--bridge-text-secondary)] transition hover:text-orange-700 dark:hover:text-orange-300 ${focusRing} rounded-sm`}>
                    Browse mentors →
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={140} className="lg:hidden">
            <LoginAside />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
