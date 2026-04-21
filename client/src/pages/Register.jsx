import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import LoadingSpinner from '../components/LoadingSpinner';
import Reveal from '../components/Reveal';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

const inputClass =
    'w-full rounded-2xl border border-stone-200/90 bg-stone-50/50 px-4 py-4 text-base text-stone-900 shadow-inner placeholder:text-stone-400 transition focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30 sm:px-5';

function RoleCard({ value, role, onRoleChange, title, description, icon }) {
  const selected = role === value;
  return (
      <label
          className={`group relative flex h-full cursor-pointer flex-col gap-3 rounded-2xl border p-5 transition-all duration-200 sm:flex-row sm:items-start sm:gap-4 sm:p-6 ${
              selected
                  ? 'border-orange-400/70 bg-gradient-to-br from-orange-50/98 to-amber-50/45 shadow-[0_12px_40px_-12px_rgba(234,88,12,0.35)] ring-2 ring-orange-400/30'
                  : 'border-stone-200/85 bg-white/95 hover:border-orange-200/80 hover:bg-orange-50/20 hover:shadow-sm'
          } ${focusRing}`}
      >
        <input
            type="radio"
            name="role"
            value={value}
            className="sr-only"
            checked={selected}
            onChange={() => onRoleChange(value)}
        />
        {selected ? (
            <span
                className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow-md sm:right-4 sm:top-4"
                aria-hidden
            >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </span>
        ) : null}
        <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-200 ${
                selected
                    ? 'border-orange-200/90 bg-white text-orange-700 shadow-sm'
                    : 'border-stone-200/80 bg-stone-50/90 text-stone-500 group-hover:border-orange-100 group-hover:text-orange-700'
            }`}
            aria-hidden
        >
        {icon}
      </span>
        <span className="min-w-0 pr-7 sm:pr-8">
        <span className="block text-base font-semibold text-stone-900">{title}</span>
        <span className="mt-1.5 block text-sm leading-relaxed text-stone-600 sm:text-[0.9375rem]">{description}</span>
      </span>
      </label>
  );
}

function FormSectionTitle({ step, children }) {
  return (
      <div className="flex items-center gap-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-stone-800 to-stone-900 text-sm font-bold text-amber-100 shadow-md">
        {step}
      </span>
        <h3 className="font-display text-lg font-semibold text-stone-900 sm:text-xl">{children}</h3>
      </div>
  );
}

function RegisterSignupAside({ mentorIntent }) {
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
          <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/90">
            {mentorIntent ? 'For mentors' : 'Why people stay'}
          </p>
          <p className="relative mt-3 font-display text-xl font-medium leading-snug text-white sm:text-2xl">
            {mentorIntent
                ? 'They read your bio and pick a session type before they message you—so you get fewer vague “quick coffee?” asks and more real requests.'
                : 'Read real bios, save people you like, and book a format that spells out what the hour is for—less scheduling ping-pong.'}
          </p>
          <ul className="relative mt-5 space-y-3 text-sm leading-relaxed text-stone-300">
            {(mentorIntent
                    ? [
                      'Your profile is the pitch: story, focus areas, what you’re actually good at',
                      'Session types spell out length and format so nobody’s guessing',
                      'Same app as mentees—you’re not siloed in some “mentor portal” nobody visits',
                    ]
                    : [
                      'Browse for free; hearts keep a shortlist without a spreadsheet',
                      'Reviews when people leave them—not a leaderboard for show',
                      'Requests show up with context so you’re not starting from zero every time',
                    ]
            ).map((item) => (
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

          {mentorIntent ? (
              <figure className="relative mt-6 border-t border-white/10 pt-5">
                <blockquote className="text-sm leading-relaxed text-stone-400">
                  If your bio reads like a generic LinkedIn headline, people keep scrolling.{' '}
                  <span className="italic text-stone-300">Specific beats polished.</span>
                </blockquote>
              </figure>
          ) : null}
        </div>

        <div className="rounded-2xl border border-stone-200/85 bg-white/95 px-5 py-4 text-sm leading-relaxed text-stone-600 shadow-sm backdrop-blur-sm">
          <p>
            {mentorIntent ? (
                <>
                  Want to see who&apos;s on Bridge first?{' '}
                  <Link to="/mentors" className={`font-semibold text-orange-900 hover:text-orange-950 ${focusRing} rounded-sm`}>
                    Browse the directory
                  </Link>
                </>
            ) : (
                <>
                  Not ready to sign up?{' '}
                  <Link to="/mentors" className={`font-semibold text-orange-900 hover:text-orange-950 ${focusRing} rounded-sm`}>
                    Browse mentors first
                  </Link>
                </>
            )}
          </p>
        </div>
      </div>
  );
}

function RegisterAlreadySignedIn({ user, mentorIntent }) {
  const display = user.user_metadata?.full_name?.trim() || user.email || 'your account';

  return (
      <main className="relative min-h-screen overflow-x-hidden" aria-labelledby="register-heading">
        <PageGutterAtmosphere />
        <section className="relative scroll-mt-20 overflow-hidden bg-bridge-hero-mesh px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="relative z-[1] mx-auto max-w-lg">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-white/95 p-8 shadow-[0_24px_60px_-12px_rgba(28,25,23,0.12)] ring-1 ring-white/80 backdrop-blur-md sm:p-10">
              <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">Already signed in</p>
              <h1 id="register-heading" className="mt-3 font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
                {mentorIntent ? 'You don’t need to sign up again' : 'You’re already on Bridge'}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-stone-600">
                This page is for new accounts. You’re logged in as{' '}
                <span className="font-medium text-stone-900">{display}</span>.
                {mentorIntent
                    ? ' Nothing here will create a second login—use the directory or your dashboard instead.'
                    : ' Use the links below to keep going.'}
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
                Wrong account? Sign out from the menu in the header, then come back.
              </p>
            </div>
          </div>
        </section>
      </main>
  );
}

export default function Register() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const intent = searchParams.get('intent');
    if (intent === 'mentor') setRole('mentor');
    else if (intent === 'mentee') setRole('mentee');
  }, [searchParams]);

  const mentorIntent = searchParams.get('intent') === 'mentor';

  function validate() {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!email.trim()) return 'Please enter your email.';
    if (!EMAIL_RE.test(email.trim())) return 'Please enter a valid email address.';
    if (!password) return 'Please enter a password.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!role) return 'Please choose whether you are looking for a mentor or want to be one.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await register(email.trim(), password, {
        full_name: fullName.trim(),
        role,
      });
      navigate('/mentors', { replace: true });
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
    return <RegisterAlreadySignedIn user={user} mentorIntent={mentorIntent} />;
  }

  return (
      <main className="relative min-h-screen overflow-x-hidden" aria-labelledby="register-heading">
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
                  <li className="font-medium text-stone-800">{mentorIntent ? 'Mentor signup' : 'Sign up'}</li>
                </ol>
              </nav>

              <div className="flex flex-wrap items-center gap-2">
                {mentorIntent ? (
                    <span className="rounded-full border border-orange-200/90 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-900 shadow-sm backdrop-blur-sm">
                  Mentors
                </span>
                ) : (
                    <span className="rounded-full border border-orange-200/90 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-900 shadow-sm backdrop-blur-sm">
                  Join Bridge
                </span>
                )}
                <span className="text-xs font-medium text-stone-500">Free · No card</span>
              </div>

              <h1
                  id="register-heading"
                  className="mt-3 max-w-xl font-display text-balance text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-stone-900 sm:mt-4 sm:max-w-2xl sm:text-4xl sm:leading-[1.06] lg:max-w-[20rem] lg:text-[2.35rem] lg:leading-[1.07] xl:max-w-sm"
              >
                {mentorIntent ? (
                    <>
                      You&apos;re already the person people tap for advice.{' '}
                      <span className="text-gradient-bridge">On Bridge, they can book you for it.</span>
                    </>
                ) : (
                    <>
                      Get an account and{' '}
                      <span className="text-gradient-bridge">talk to someone who’s been there</span>
                    </>
                )}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600 sm:text-[0.98rem] lg:max-w-[22rem]">
                {mentorIntent
                    ? 'Same signup as everyone else. Tell us you’re a mentor in the form—we’ll drop you in on the right side after you’re in.'
                    : 'Mentor or mentee, it’s the same form. Browse the directory first if you want; this will still be here.'}
              </p>

              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600 lg:mt-5">
                {['No credit card', 'Under a minute', 'Secure sign-in'].map((t) => (
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
                <RegisterSignupAside mentorIntent={mentorIntent} />
              </Reveal>
            </div>

            <Reveal
                className="lg:col-span-7 lg:col-start-6 lg:self-start lg:sticky lg:top-24 lg:z-10"
                delay={40}
            >
              <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-[0_36px_90px_-20px_rgba(28,25,23,0.22)] ring-1 ring-orange-100/40 backdrop-blur-md">
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
                <div className="p-7 sm:p-9 lg:p-11 xl:p-12">
                  <div className="flex flex-col gap-2 border-b border-stone-100 pb-7 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-orange-700 sm:text-xs">Sign up</p>
                      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl lg:text-[1.85rem] xl:text-[2rem]">
                        Create your account
                      </h2>
                    </div>
                    <p className="max-w-[14rem] text-sm leading-snug text-stone-500 sm:text-right">We’ll never sell your email.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-9 flex flex-col gap-9 lg:mt-10 lg:gap-10">
                    {error ? (
                        <div
                            className="rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-900"
                            role="alert"
                        >
                          {error}
                        </div>
                    ) : null}

                    <div className="space-y-6">
                      <FormSectionTitle step="1">Who you are</FormSectionTitle>
                      <div>
                        <label htmlFor="register-name" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                          Full name
                        </label>
                        <input
                            id="register-name"
                            type="text"
                            autoComplete="name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={inputClass}
                            placeholder="Alex Rivera"
                        />
                      </div>

                      <div>
                        <label htmlFor="register-email" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                          Email
                        </label>
                        <input
                            id="register-email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                            placeholder="you@example.com"
                        />
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="register-password" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                            Password
                          </label>
                          <input
                              id="register-password"
                              type="password"
                              autoComplete="new-password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className={inputClass}
                              placeholder="At least 6 characters"
                          />
                        </div>
                        <div>
                          <label htmlFor="register-confirm" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                            Confirm
                          </label>
                          <input
                              id="register-confirm"
                              type="password"
                              autoComplete="new-password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className={inputClass}
                              placeholder="Repeat password"
                          />
                        </div>
                      </div>
                    </div>

                    <fieldset className="space-y-5 border-0 border-t border-stone-100 p-0 pt-9">
                      <FormSectionTitle step="2">How you&apos;ll use Bridge</FormSectionTitle>
                      <p className="-mt-0.5 text-base text-stone-500">Tap one—switch later if your situation changes.</p>
                      <div className="grid grid-cols-1 gap-4 sm:gap-5">
                        <RoleCard
                            value="mentee"
                            role={role}
                            onRoleChange={setRole}
                            title="Find a mentor"
                            description="I want to book someone who’s already walked my kind of path."
                            icon={
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A18 18 0 0 1 12 21.75a18 18 0 0 1-7.5-1.632Z"
                                />
                              </svg>
                            }
                        />
                        <RoleCard
                            value="mentor"
                            role={role}
                            onRoleChange={setRole}
                            title="Be a mentor"
                            description="I’m ready to offer sessions and build a profile people can trust."
                            icon={
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm6 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm6 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                />
                              </svg>
                            }
                        />
                      </div>
                    </fieldset>

                    <div className="border-t border-stone-100 pt-3">
                      <button
                          type="submit"
                          disabled={submitting}
                          className={`w-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500 py-5 text-base font-semibold text-white shadow-xl shadow-orange-500/35 transition hover:from-orange-500 hover:to-amber-400 hover:shadow-orange-500/45 disabled:pointer-events-none disabled:opacity-55 ${focusRing}`}
                      >
                        {submitting
                            ? 'Creating account…'
                            : mentorIntent
                                ? 'Create my mentor account'
                                : 'Create account'}
                      </button>
                    </div>
                  </form>

                  <div className="mt-9 flex flex-col items-center gap-3 border-t border-stone-100 pt-9 sm:flex-row sm:justify-center sm:gap-6">
                    <p className="text-center text-sm text-stone-600 sm:text-[0.9375rem]">
                      Already in?{' '}
                      <Link
                          to="/login"
                          className={`font-semibold text-orange-800 underline decoration-orange-300/60 underline-offset-2 hover:text-orange-950 ${focusRing} rounded-sm`}
                      >
                        Log in
                      </Link>
                    </p>
                    <span className="hidden text-stone-300 sm:inline" aria-hidden>
                    ·
                  </span>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
                      <Link to="/mentors" className={`font-medium text-stone-700 hover:text-orange-900 ${focusRing} rounded-sm`}>
                        Browse mentors
                      </Link>
                      <Link to="/pricing" className={`font-medium text-stone-700 hover:text-orange-900 ${focusRing} rounded-sm`}>
                        Pricing
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120} className="lg:hidden">
              <RegisterSignupAside mentorIntent={mentorIntent} />
            </Reveal>
          </div>
        </section>
      </main>
  );
}