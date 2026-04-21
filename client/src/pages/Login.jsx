import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import LoadingSpinner from '../components/LoadingSpinner';
import Reveal from '../components/Reveal';

const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

const inputClass =
    'w-full rounded-2xl border border-stone-200/90 bg-stone-50/50 px-4 py-4 text-base text-stone-900 shadow-inner placeholder:text-stone-400 transition focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30 sm:px-5';

function LoginAside() {
  return (
      <div className="space-y-4 sm:space-y-5">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-stone-800/80 bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 p-7 text-white shadow-bridge-card sm:p-8">
          <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                    'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              }}
          />
          <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-orange-500/25 blur-3xl"
          />
          <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl"
          />
          <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/90">Welcome back</p>
          <p className="relative mt-3 font-display text-xl font-medium leading-snug text-white sm:text-2xl">
            Same Bridge—bios you can skim, hearts for later, and session types so nobody&apos;s guessing what the hour is
            for.
          </p>
          <ul className="relative mt-5 space-y-3 text-sm leading-relaxed text-stone-300">
            {[
              'Your shortlist and favorites stay on this account',
              'Book from the directory or open a profile you&apos;ve saved',
              'Mentors and mentees share one login—no separate “mentor app”',
            ].map((item) => (
                <li key={item} className="flex gap-3">
              <span
                  className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-amber-300"
                  aria-hidden
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </span>
                  {item}
                </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-stone-200/85 bg-white/95 px-5 py-4 text-sm leading-relaxed text-stone-600 shadow-sm backdrop-blur-sm">
          <p>
            Need an account?{' '}
            <Link to="/register" className={`font-semibold text-orange-900 hover:text-orange-950 ${focusRing} rounded-sm`}>
              Sign up—it’s free
            </Link>
          </p>
        </div>
      </div>
  );
}

function LoginAlreadySignedIn({ user }) {
  const display = user.user_metadata?.full_name?.trim() || user.email || 'your account';

  return (
      <main className="relative min-h-screen overflow-x-hidden" aria-labelledby="login-heading">
        <PageGutterAtmosphere />
        <section className="relative scroll-mt-20 overflow-hidden bg-bridge-hero-mesh px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="relative z-[1] mx-auto max-w-lg">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-white/95 p-8 shadow-[0_24px_60px_-12px_rgba(28,25,23,0.12)] ring-1 ring-white/80 backdrop-blur-md sm:p-10">
              <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">Signed in</p>
              <h1 id="login-heading" className="mt-3 font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
                You&apos;re already in
              </h1>
              <p className="mt-4 text-base leading-relaxed text-stone-600">
                Logged in as <span className="font-medium text-stone-900">{display}</span>. Head to the directory or your
                dashboard—no need to sign in again.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                    to="/mentors"
                    className={`inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 sm:flex-none ${focusRing}`}
                >
                  Browse mentors
                </Link>
                <Link
                    to="/dashboard"
                    className={`inline-flex flex-1 items-center justify-center rounded-full border-2 border-stone-900/10 bg-white px-6 py-3.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:border-orange-300/60 hover:shadow-md sm:flex-none ${focusRing}`}
                >
                  Dashboard
                </Link>
              </div>
              <p className="mt-8 text-center text-sm text-stone-500">
                Wrong account? Sign out from the header, then sign in here.
              </p>
            </div>
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
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fromRaw = location.state?.from;
  const redirectPath =
      typeof fromRaw === 'string' &&
      fromRaw.startsWith('/') &&
      !fromRaw.startsWith('//') &&
      !fromRaw.includes('://')
          ? fromRaw
          : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(redirectPath ?? '/mentors', { replace: true });
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
        <main className="relative min-h-screen overflow-x-hidden">
          <PageGutterAtmosphere />
          <LoadingSpinner label="Checking your session…" className="min-h-[calc(100vh-4rem)]" />
        </main>
    );
  }

  if (user) {
    return <LoginAlreadySignedIn user={user} />;
  }

  return (
      <main className="relative min-h-screen overflow-x-hidden" aria-labelledby="login-heading">
        <PageGutterAtmosphere />

        <section className="relative scroll-mt-20 overflow-hidden bg-bridge-hero-mesh px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8 lg:pb-20">
          <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                    'url("data:image/svg+xml,%3Csvg width=\'72\' height=\'72\' viewBox=\'0 0 72 72\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%23d6d3d1\' stroke-opacity=\'0.35\'%3E%3Cpath d=\'M36 0v72M0 36h72\'/%3E%3C/g%3E%3C/svg%3E")',
                backgroundSize: '72px 72px',
              }}
          />
          <div
              aria-hidden
              className="pointer-events-none absolute -right-28 top-10 h-[min(420px,72vw)] w-[min(420px,72vw)] rounded-full bg-gradient-to-br from-amber-300/45 via-orange-200/28 to-transparent blur-3xl"
          />
          <div
              aria-hidden
              className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-orange-200/35 blur-3xl"
          />

          <div className="relative z-[1] mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-x-8 xl:gap-x-10 lg:items-start">
            <div className="flex flex-col gap-3 sm:gap-4 lg:col-span-5">
              <nav aria-label="Breadcrumb" className="mb-4 lg:mb-5">
                <ol className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
                  <li>
                    <Link
                        to="/"
                        className={`rounded-md font-medium text-stone-600 transition hover:text-orange-800 ${focusRing}`}
                    >
                      Home
                    </Link>
                  </li>
                  <li aria-hidden className="text-stone-300">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                    </svg>
                  </li>
                  <li className="font-medium text-stone-800">Log in</li>
                </ol>
              </nav>

              <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-orange-200/90 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-900 shadow-sm backdrop-blur-sm">
                Bridge
              </span>
                <span className="text-xs font-medium text-stone-500">Secure session</span>
              </div>

              <h1
                  id="login-heading"
                  className="mt-3 max-w-xl font-display text-balance text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-stone-900 sm:mt-4 sm:text-4xl sm:leading-[1.06] lg:max-w-[20rem] lg:text-[2.35rem] xl:max-w-sm"
              >
                Hey again—<span className="text-gradient-bridge">pick up where you left off</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600 sm:text-[0.98rem] lg:max-w-[22rem]">
                One email and password. After this, we&apos;ll drop you on the mentor list—or right back where you were
                trying to go.
              </p>

              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600 lg:mt-5">
                {['Encrypted sign-in', 'No new apps to learn', 'Works for mentors & mentees'].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </span>
                      {t}
                    </li>
                ))}
              </ul>

              <Reveal delay={100} className="hidden lg:block">
                <LoginAside />
              </Reveal>
            </div>

            <Reveal className="lg:col-span-7 lg:col-start-6 lg:self-start lg:sticky lg:top-24 lg:z-10" delay={40}>
              <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-[0_36px_90px_-20px_rgba(28,25,23,0.22)] ring-1 ring-orange-100/40 backdrop-blur-md">
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
                <div className="p-7 sm:p-9 lg:p-11 xl:p-12">
                  <div className="flex flex-col gap-2 border-b border-stone-100 pb-7 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-orange-700 sm:text-xs">Log in</p>
                      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl lg:text-[1.85rem] xl:text-[2rem]">
                        Sign in to Bridge
                      </h2>
                    </div>
                    <p className="max-w-[14rem] text-sm leading-snug text-stone-500 sm:text-right">
                      Use the email you registered with.
                    </p>
                  </div>

                  {redirectPath ? (
                      <p className="mt-6 rounded-2xl border border-orange-100/90 bg-orange-50/80 px-4 py-3 text-sm text-orange-950">
                        After you sign in we&apos;ll send you back to{' '}
                        <span className="font-semibold">{redirectPath}</span>.
                      </p>
                  ) : null}

                  <form onSubmit={handleSubmit} className={`flex flex-col gap-7 ${redirectPath ? 'mt-6' : 'mt-9'} lg:gap-8`}>
                    {error ? (
                        <div
                            className="rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-900"
                            role="alert"
                        >
                          {error}
                        </div>
                    ) : null}

                    <div className="space-y-6">
                      <div>
                        <label htmlFor="login-email" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                          Email
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={inputClass}
                            placeholder="you@example.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="login-password" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                          Password
                        </label>
                        <input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={inputClass}
                            placeholder="Your password"
                        />
                      </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500 py-5 text-base font-semibold text-white shadow-xl shadow-orange-500/35 transition hover:from-orange-500 hover:to-amber-400 hover:shadow-orange-500/45 disabled:pointer-events-none disabled:opacity-55 ${focusRing}`}
                    >
                      {submitting ? 'Signing in…' : 'Log in'}
                    </button>
                  </form>

                  <div className="mt-9 flex flex-col items-center gap-4 border-t border-stone-100 pt-9 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6">
                    <p className="text-center text-sm text-stone-600 sm:text-[0.9375rem]">
                      New here?{' '}
                      <Link
                          to="/register"
                          className={`font-semibold text-orange-800 underline decoration-orange-300/60 underline-offset-2 hover:text-orange-950 ${focusRing} rounded-sm`}
                      >
                        Create an account
                      </Link>
                    </p>
                    <span className="hidden text-stone-300 sm:inline" aria-hidden>
                    ·
                  </span>
                    <Link to="/mentors" className={`text-sm font-medium text-stone-700 hover:text-orange-900 ${focusRing} rounded-sm`}>
                      Browse mentors
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120} className="lg:hidden">
              <LoginAside />
            </Reveal>
          </div>
        </section>
      </main>
  );
}