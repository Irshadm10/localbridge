import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, GraduationCap, Sparkles, AlertCircle, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import Reveal from '../components/Reveal';
import { focusRing } from '../ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordStrength(pw) {
  if (!pw) return { label: '—', score: 0, hue: 'bg-stone-200 dark:bg-white/10' };
  let s = 0;
  if (pw.length >= 6) s += 1;
  if (pw.length >= 10) s += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  const map = [
    { label: 'Too short', hue: 'bg-red-400' },
    { label: 'Weak', hue: 'bg-red-400' },
    { label: 'Fair', hue: 'bg-amber-400' },
    { label: 'Good', hue: 'bg-emerald-400' },
    { label: 'Strong', hue: 'bg-emerald-500' },
    { label: 'Excellent', hue: 'bg-emerald-500' },
  ];
  return { ...map[s], score: s };
}

function RoleCard({ value, role, onRoleChange, title, description, Icon, accent }) {
  const selected = role === value;
  return (
    <label
      className={`group relative flex h-full cursor-pointer items-start gap-4 overflow-hidden rounded-[1.25rem] border p-5 transition-all duration-300 sm:p-6 ${
        selected
          ? 'border-transparent border-gradient-bridge animate-border-bridge bg-gradient-to-br from-orange-50/95 via-amber-50/70 to-white shadow-[0_18px_46px_-14px_rgba(234,88,12,0.45)] dark:from-orange-500/15 dark:via-amber-500/8 dark:to-[var(--bridge-surface-raised)] dark:shadow-[0_22px_52px_-14px_rgba(251,146,60,0.55)]'
          : 'border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] hover:-translate-y-0.5 hover:border-orange-300/70 hover:bg-orange-50/30 hover:shadow-bridge-tile dark:hover:border-orange-400/40 dark:hover:bg-white/[0.04]'
      } ${focusRing}`}
    >
      <input type="radio" name="role" value={value} className="sr-only" checked={selected} onChange={() => onRoleChange(value)} />
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all ${
          selected
            ? `bg-gradient-to-br ${accent} text-white shadow-[0_10px_26px_-6px_rgba(234,88,12,0.55)]`
            : 'bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-secondary)] group-hover:bg-orange-100 group-hover:text-orange-700 dark:group-hover:bg-orange-500/15 dark:group-hover:text-orange-200'
        }`}
        aria-hidden
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1 pr-7">
        <span className="flex items-center gap-2">
          <span className="block text-base font-semibold text-[var(--bridge-text)]">{title}</span>
          {selected ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white shadow">
              <span aria-hidden>✓</span> Selected
            </span>
          ) : null}
        </span>
        <span className="mt-1.5 block text-sm leading-relaxed text-[var(--bridge-text-secondary)]">{description}</span>
      </span>
      {selected ? (
        <span aria-hidden className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow-md">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </span>
      ) : null}
    </label>
  );
}

function FormSectionTitle({ step, total = 2, children, hint }) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-sm font-bold text-amber-100 shadow-md">
        <span className="relative">{step}</span>
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
      </span>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="font-display text-lg font-semibold text-[var(--bridge-text)] sm:text-xl">{children}</h3>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">
            Step {step} / {total}
          </span>
        </div>
        {hint ? <p className="mt-0.5 text-sm text-[var(--bridge-text-muted)]">{hint}</p> : null}
      </div>
    </div>
  );
}

function RegisterSignupAside({ mentorIntent }) {
  const items = mentorIntent
    ? [
        'Your profile is the pitch: story, focus areas, what you\u2019re actually good at',
        'Session types spell out length and format so nobody\u2019s guessing',
        'Same app as mentees — no second portal to check',
      ]
    : [
        'Browse for free; hearts keep a shortlist without a spreadsheet',
        'Reviews when people leave them — not a leaderboard for show',
        'Requests show up with context so you\u2019re not starting from zero',
      ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-orange-400/20 bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 p-7 text-white shadow-bridge-float sm:p-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.14] mix-blend-overlay" />
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-orange-500/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" />

        <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-amber-200/90">
          {mentorIntent ? 'For mentors' : 'Why people stay'}
        </p>
        <p className="relative mt-3 font-display text-xl font-medium leading-snug text-white sm:text-2xl">
          {mentorIntent
            ? 'They read your bio and pick a session type before they message you — so you get fewer vague "quick coffee?" asks and more real requests.'
            : 'Read real bios, save people you like, and book a format that spells out what the hour is for — less scheduling ping-pong.'}
        </p>
        <ul className="relative mt-6 space-y-3 text-sm leading-relaxed text-stone-300">
          {items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-amber-300 ring-1 ring-amber-300/25" aria-hidden>
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

      <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-4 text-sm leading-relaxed text-[var(--bridge-text-secondary)] shadow-bridge-tile backdrop-blur-sm">
        <p>
          {mentorIntent ? (
            <>
              Want to see who&apos;s on Bridge first?{' '}
              <Link to="/mentors" className={`font-semibold text-orange-700 transition hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200 ${focusRing} rounded-sm`}>
                Browse the directory →
              </Link>
            </>
          ) : (
            <>
              Not ready to sign up?{' '}
              <Link to="/mentors" className={`font-semibold text-orange-700 transition hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200 ${focusRing} rounded-sm`}>
                Browse mentors first →
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
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative z-[1] mx-auto max-w-lg">
          <Reveal>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-8 shadow-bridge-float sm:p-10">
              <div aria-hidden className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-300">Already signed in</p>
              <h1 id="register-heading" className="mt-3 font-display text-3xl font-bold tracking-tight text-[var(--bridge-text)] sm:text-4xl">
                {mentorIntent ? "You don't need to sign up again" : "You're already on Bridge"}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-[var(--bridge-text-secondary)]">
                This page is for new accounts. You&apos;re logged in as <span className="font-semibold text-[var(--bridge-text)]">{display}</span>.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/mentors"
                  className={`btn-sheen inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_rgba(234,88,12,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-10px_rgba(234,88,12,0.65)] ${focusRing}`}
                >
                  Browse mentors <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/dashboard"
                  className={`inline-flex flex-1 items-center justify-center rounded-full border-2 border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-6 py-3.5 text-sm font-semibold text-[var(--bridge-text)] transition hover:-translate-y-0.5 hover:border-orange-400/70 hover:shadow-md ${focusRing}`}
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </Reveal>
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
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const intent = searchParams.get('intent');
    if (intent === 'mentor') setRole('mentor');
    else if (intent === 'mentee') setRole('mentee');
  }, [searchParams]);

  const mentorIntent = searchParams.get('intent') === 'mentor';
  const pwMeta = passwordStrength(password);

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
      await register(email.trim(), password, { full_name: fullName.trim(), role });
      navigate(role === 'mentor' ? '/dashboard' : '/mentors', { replace: true });
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

  if (user) return <RegisterAlreadySignedIn user={user} mentorIntent={mentorIntent} />;

  return (
    <main className="relative min-h-screen overflow-x-hidden" aria-labelledby="register-heading">
      <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 sm:pb-24 lg:px-8 lg:pt-12">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-30%] -z-10 h-[80vmax] w-[80vmax] -translate-x-1/2 opacity-55 dark:opacity-80"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 50%, rgba(251,146,60,0.14), rgba(253,230,138,0.1), rgba(234,88,12,0.18), rgba(251,146,60,0.14))',
            filter: 'blur(100px)',
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.05] mix-blend-overlay dark:opacity-[0.1]" />

        <div className="relative z-[1] mx-auto grid max-w-bridge grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-x-10">
          {/* Left column */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Reveal>
              <nav aria-label="Breadcrumb" className="mb-2">
                <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--bridge-text-muted)]">
                  <li>
                    <Link to="/" className={`rounded-md font-medium transition hover:text-orange-700 dark:hover:text-orange-300 ${focusRing}`}>Home</Link>
                  </li>
                  <li aria-hidden>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                    </svg>
                  </li>
                  <li className="font-semibold text-[var(--bridge-text-secondary)]">{mentorIntent ? 'Mentor signup' : 'Sign up'}</li>
                </ol>
              </nav>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 shadow-sm backdrop-blur-md dark:text-orange-300">
                  <Sparkles className="h-3 w-3" />
                  {mentorIntent ? 'Mentors' : 'Join Bridge'}
                </span>
                <span className="text-xs font-medium text-[var(--bridge-text-muted)]">Free · No card</span>
              </div>

              <h1
                id="register-heading"
                className="mt-5 font-display text-[2.25rem] font-bold leading-[1.08] tracking-[-0.012em] text-[var(--bridge-text)] sm:text-[2.85rem] sm:leading-[1.08] lg:text-[3.2rem]"
              >
                {mentorIntent ? (
                  <>
                    You&apos;re already the person people tap for advice.{' '}
                    <span className="italic text-gradient-bridge">On Bridge, they can book you.</span>
                  </>
                ) : (
                  <>
                    Get an account and{' '}
                    <span className="italic text-gradient-bridge">talk to someone who&apos;s been there</span>.
                  </>
                )}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--bridge-text-secondary)] sm:text-lg">
                {mentorIntent
                  ? 'Same signup as everyone else. Tell us you\u2019re a mentor in the form — we\u2019ll drop you in on the right side after.'
                  : 'Mentor or mentee, it\u2019s the same form. Browse the directory first if you want; this will still be here.'}
              </p>

              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--bridge-text-secondary)]">
                {[
                  { icon: ShieldCheck, label: 'No credit card' },
                  { icon: Zap, label: 'Under a minute' },
                  { icon: Sparkles, label: 'Secure sign-in' },
                ].map((t) => (
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
              <RegisterSignupAside mentorIntent={mentorIntent} />
            </Reveal>
          </div>

          {/* Right column — form card */}
          <Reveal className="lg:col-span-7 lg:self-start" delay={60}>
            <div className="relative overflow-hidden rounded-[2rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/95 shadow-bridge-float backdrop-blur-xl">
              <div aria-hidden className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
              <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/20" />
              <div aria-hidden className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-amber-300/15 blur-3xl dark:bg-amber-500/10" />

              <div className="relative p-7 sm:p-10 lg:p-12">
                <div className="flex flex-col gap-2 border-b border-[var(--bridge-border)] pb-7 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-700 dark:text-orange-300">Sign up</p>
                    <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--bridge-text)] sm:text-[2rem] lg:text-[2.15rem]">
                      Create your account
                    </h2>
                  </div>
                  <p className="max-w-[16rem] text-sm leading-snug text-[var(--bridge-text-muted)] sm:text-right">
                    We&apos;ll never sell your email. Ever.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-9">
                  {error ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-900 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200" role="alert">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  ) : null}

                  {/* Step 1 */}
                  <div className="space-y-6">
                    <FormSectionTitle step="1" hint="Just the basics — no bio yet, that comes after.">
                      Who you are
                    </FormSectionTitle>

                    {/* Name */}
                    <div className="group relative">
                      <label htmlFor="register-name" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">Full name</label>
                      <div className="relative">
                        <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bridge-text-faint)] transition group-focus-within:text-orange-500" aria-hidden />
                        <input
                          id="register-name"
                          type="text"
                          autoComplete="name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Alex Rivera"
                          className="w-full rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] px-11 py-4 text-base text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:bg-[var(--bridge-surface)] focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="group relative">
                      <label htmlFor="register-email" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">Email</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bridge-text-faint)] transition group-focus-within:text-orange-500" aria-hidden />
                        <input
                          id="register-email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] px-11 py-4 text-base text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:bg-[var(--bridge-surface)] focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                        />
                      </div>
                    </div>

                    {/* Passwords */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="group">
                        <label htmlFor="register-password" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">Password</label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bridge-text-faint)] transition group-focus-within:text-orange-500" aria-hidden />
                          <input
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
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
                        {/* Strength meter */}
                        <div className="mt-2.5 flex items-center gap-2.5">
                          <div className="flex flex-1 gap-1">
                            {[0, 1, 2, 3, 4].map((i) => (
                              <span
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                  i < pwMeta.score ? pwMeta.hue : 'bg-stone-200 dark:bg-white/[0.08]'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="min-w-[4rem] text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--bridge-text-muted)]">
                            {pwMeta.label}
                          </span>
                        </div>
                      </div>
                      <div className="group">
                        <label htmlFor="register-confirm" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">Confirm</label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bridge-text-faint)] transition group-focus-within:text-orange-500" aria-hidden />
                          <input
                            id="register-confirm"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat password"
                            className="w-full rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] px-11 py-4 text-base text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:bg-[var(--bridge-surface)] focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                          />
                        </div>
                        {confirmPassword && password && confirmPassword === password ? (
                          <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Passwords match
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <fieldset className="space-y-5 border-0 border-t border-[var(--bridge-border)] p-0 pt-9">
                    <FormSectionTitle step="2" hint="Tap one — you can switch later from settings.">
                      How you&apos;ll use Bridge
                    </FormSectionTitle>
                    <div className="grid grid-cols-1 gap-4 sm:gap-5">
                      <RoleCard
                        value="mentee"
                        role={role}
                        onRoleChange={setRole}
                        title="Find a mentor"
                        description="I want to book someone who's already walked my kind of path."
                        Icon={UserIcon}
                        accent="from-orange-500 via-amber-500 to-orange-600"
                      />
                      <RoleCard
                        value="mentor"
                        role={role}
                        onRoleChange={setRole}
                        title="Be a mentor"
                        description="I'm ready to offer sessions and build a profile people can trust."
                        Icon={GraduationCap}
                        accent="from-amber-500 via-rose-400 to-orange-500"
                      />
                    </div>
                  </fieldset>

                  <div className="border-t border-[var(--bridge-border)] pt-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`btn-sheen group relative inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 py-5 text-base font-semibold text-white shadow-[0_16px_40px_-10px_rgba(234,88,12,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-10px_rgba(234,88,12,0.7)] disabled:pointer-events-none disabled:opacity-55 ${focusRing}`}
                    >
                      {submitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Creating account…
                        </>
                      ) : (
                        <>
                          {mentorIntent ? 'Create my mentor account' : 'Create account'}
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                    <p className="mt-4 text-center text-xs text-[var(--bridge-text-muted)]">
                      By signing up you agree to our{' '}
                      <Link to="/terms" className="font-medium text-[var(--bridge-text-secondary)] underline decoration-orange-300/50 underline-offset-2 hover:text-orange-700 dark:hover:text-orange-300">Terms</Link>{' '}
                      &{' '}
                      <Link to="/privacy" className="font-medium text-[var(--bridge-text-secondary)] underline decoration-orange-300/50 underline-offset-2 hover:text-orange-700 dark:hover:text-orange-300">Privacy</Link>.
                    </p>
                  </div>
                </form>

                <div className="mt-8 flex flex-col items-center gap-3 border-t border-[var(--bridge-border)] pt-7 sm:flex-row sm:justify-between">
                  <p className="text-sm text-[var(--bridge-text-secondary)]">
                    Already in?{' '}
                    <Link
                      to="/login"
                      className={`font-semibold text-orange-700 underline decoration-orange-300/60 underline-offset-4 transition hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200 ${focusRing} rounded-sm`}
                    >
                      Log in
                    </Link>
                  </p>
                  <div className="flex flex-wrap justify-center gap-x-5 text-sm">
                    <Link to="/mentors" className={`font-medium text-[var(--bridge-text-secondary)] transition hover:text-orange-700 dark:hover:text-orange-300 ${focusRing} rounded-sm`}>
                      Browse mentors →
                    </Link>
                    <Link to="/pricing" className={`font-medium text-[var(--bridge-text-secondary)] transition hover:text-orange-700 dark:hover:text-orange-300 ${focusRing} rounded-sm`}>
                      Pricing
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={140} className="lg:hidden">
            <RegisterSignupAside mentorIntent={mentorIntent} />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
