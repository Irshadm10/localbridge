import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedMentors } from '../api/mentors';
import LoadingSpinner from '../components/LoadingSpinner';
import useInView from '../utils/useInView';
import SessionTypeCard from '../components/SessionTypeCard';
import { SESSION_TYPES } from '../constants/sessionTypes';

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const AVATAR_COLORS = [
  'bg-violet-200 text-violet-900',
  'bg-amber-200 text-amber-900',
  'bg-emerald-200 text-emerald-900',
  'bg-sky-200 text-sky-900',
  'bg-rose-200 text-rose-900',
  'bg-indigo-200 text-indigo-900',
];

const MARQUEE_ITEMS = [
  'Product',
  'Engineering',
  'Finance',
  'Healthcare',
  'Design',
  'Data',
  'Marketing',
  'Founders',
  'Legal',
  'Sales',
  'Ops',
  'Research',
];

const HERO_STACK = [
  { name: 'Maya Chen', role: 'Director of Product', co: 'Series B SaaS', grad: 'from-rose-400 to-orange-500', ring: false },
  { name: 'Jordan Reeves', role: 'Ex-recruiter', co: 'FAANG + startups', grad: 'from-sky-500 to-indigo-600', ring: true },
  { name: 'Elena Voss', role: 'Career switch · RN → UX', co: 'Health tech', grad: 'from-emerald-500 to-teal-600', ring: false },
];

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';
const focusRingWhite =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-600';

function MarqueeStrip() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="border-y border-stone-200/70 bg-white/50 backdrop-blur-sm">
      <div className="landing-marquee-hover-pause relative mx-auto max-w-6xl overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
        <p className="sr-only">Industries and focus areas on Bridge</p>
        <div className="flex w-max animate-landing-marquee">
          {doubled.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="flex shrink-0 items-center gap-3 px-5 text-sm font-medium text-stone-500"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400/90" aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section
      aria-labelledby="landing-heading"
      className="relative scroll-mt-20 overflow-hidden bg-bridge-hero-mesh px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'72\' height=\'72\' viewBox=\'0 0 72 72\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%23d6d3d1\' stroke-opacity=\'0.35\'%3E%3Cpath d=\'M36 0v72M0 36h72\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '72px 72px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-20 h-[min(520px,80vw)] w-[min(520px,80vw)] rounded-full bg-gradient-to-br from-amber-300/50 via-orange-200/35 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-10 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-12 lg:gap-8 lg:gap-y-16">
        <div className="lg:col-span-6 xl:col-span-6">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-orange-200/90 bg-white/90 pl-2 pr-4 py-1.5 shadow-sm backdrop-blur-md">
            <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Live
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-900/90">Mentors booking</span>
          </div>

          <h1
            id="landing-heading"
            className="font-display text-balance text-[2.65rem] font-semibold leading-[1.05] tracking-tight text-stone-900 sm:text-5xl sm:leading-[1.04] lg:text-[3.35rem] xl:text-[3.65rem]"
          >
            Talk to someone who&apos;s{' '}
            <span className="text-gradient-bridge">already done it</span>
            <span className="font-display italic font-medium text-stone-700"> — </span>
            <span className="text-stone-800">not someone guessing from Twitter.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-stone-600 sm:text-xl sm:leading-relaxed">
            Bridge is for the specific, messy questions. The kind where you want a human who&apos;s lived the version of
            the story you&apos;re trying to write.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to="/mentors"
              className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-9 py-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/35 transition hover:from-orange-500 hover:to-amber-400 hover:shadow-xl ${focusRing}`}
            >
              Browse mentors
            </Link>
            <Link
              to="/register"
              className={`inline-flex items-center justify-center rounded-full border-2 border-stone-900/12 bg-white/95 px-9 py-4 text-sm font-semibold text-stone-900 shadow-sm backdrop-blur-sm transition hover:border-orange-300/70 hover:shadow-md ${focusRing}`}
            >
              I want to mentor
            </Link>
          </div>

          <div className="mt-12 flex flex-col gap-8 border-t border-stone-200/90 pt-10 sm:flex-row sm:items-center sm:justify-between">
            <dl className="grid grid-cols-3 gap-6 sm:max-w-md sm:gap-8">
              {[
                { k: '2.4k+', l: 'Profiles' },
                { k: '85%', l: 'Interview wins' },
                { k: '50+', l: 'Fields' },
              ].map(({ k, l }) => (
                <div key={l}>
                  <dt className="font-display text-2xl font-semibold tabular-nums text-stone-900 sm:text-3xl">{k}</dt>
                  <dd className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">{l}</dd>
                </div>
              ))}
            </dl>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {['SK', 'MR', 'LV'].map((ini, i) => (
                  <div
                    key={ini}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-xs font-bold shadow-md ${
                      i === 0 ? 'bg-amber-200 text-amber-950' : i === 1 ? 'bg-stone-800 text-amber-50' : 'bg-orange-200 text-orange-950'
                    }`}
                  >
                    {ini}
                  </div>
                ))}
              </div>
              <p className="max-w-[10rem] text-xs font-medium leading-snug text-stone-600">
                People book when they&apos;re done doom-scrolling job boards.
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[400px] items-center justify-center lg:col-span-6 xl:col-span-6 lg:min-h-[520px]">
          <div
            aria-hidden
            className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-orange-500/10 via-transparent to-amber-400/10 blur-2xl"
          />

          <div className="relative w-full max-w-lg lg:max-w-none">
            <div
              className="absolute -left-2 top-4 z-20 hidden w-[88%] sm:block sm:w-[92%]"
              style={{ transform: 'rotate(-2.5deg)' }}
            >
              <div className="animate-landing-float rounded-2xl border border-white/90 bg-white/95 p-4 shadow-bridge-glow backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400/85" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/85" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/85" />
                    </div>
                    <span className="text-[11px] font-medium text-stone-400">bridge.app / mentors</span>
                  </div>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                    Saved
                  </span>
                </div>
                {HERO_STACK.map((m) => (
                  <div
                    key={m.name}
                    className={`mb-2 flex items-center gap-3 rounded-xl border p-3 last:mb-0 ${
                      m.ring
                        ? 'border-orange-300/80 bg-gradient-to-r from-orange-50/90 to-amber-50/50 shadow-md ring-2 ring-orange-400/30'
                        : 'border-stone-100 bg-stone-50/50'
                    }`}
                  >
                    <div className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${m.grad} shadow-inner`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-900">{m.name}</p>
                      <p className="truncate text-xs text-stone-500">
                        {m.role} · {m.co}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-bold text-amber-50">
                      Book
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="relative z-10 mx-auto w-[94%] sm:w-[85%]"
              style={{ transform: 'rotate(1.5deg)' }}
            >
              <div className="animate-landing-float-delayed rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-5 shadow-bridge-glow backdrop-blur-md sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-800/80">This week</p>
                <p className="mt-2 font-display text-xl font-semibold text-stone-900">Session formats people actually pick</p>
                <div className="mt-4 space-y-2">
                  {SESSION_TYPES.slice(0, 3).map((t) => (
                    <div
                      key={t.key}
                      className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/60 px-3 py-2.5"
                    >
                      <span className="text-lg">{t.icon}</span>
                      <span className="text-sm font-medium text-stone-800">{t.name}</span>
                      <span className="ml-auto text-xs font-semibold text-stone-500">{t.duration}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/mentors"
                  className={`mt-5 block w-full rounded-xl bg-stone-900 py-3 text-center text-sm font-semibold text-amber-50 transition hover:bg-stone-800 ${focusRing}`}
                >
                  Open directory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: '01',
    title: 'Say what you’re stuck on',
    desc: 'Interview loop, pivot, promo, first job—whatever. You don’t need a perfect pitch, just a real sentence.',
    span: 'md:col-span-7 md:row-span-2',
  },
  {
    n: '02',
    title: 'Stalk profiles until one clicks',
    desc: 'Read bios like you’d pick a teammate. When someone’s story matches yours, that’s the DM you’d actually send.',
    span: 'md:col-span-5',
  },
  {
    n: '03',
    title: 'Book it, do the homework',
    desc: 'Sessions are short on purpose. You leave with a next step—not a fuzzy “let’s circle back.”',
    span: 'md:col-span-5',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-14 max-w-3xl text-center lg:mb-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">How it works</p>
          <h2 className="font-display text-balance text-3xl font-semibold text-stone-900 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            Less spiraling in your notes app.
            <span className="text-gradient-bridge"> More one honest hour.</span>
          </h2>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-12 md:gap-5">
          {STEPS.map(({ n, title, desc, span }, i) => (
            <Reveal key={n} delay={i * 80} className={span}>
              <div
                className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-8 shadow-bridge-card transition duration-300 hover:-translate-y-1 hover:border-orange-200/55 hover:shadow-bridge-glow ${
                  n === '01' ? 'md:min-h-[280px] md:p-10' : ''
                }`}
              >
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-5xl font-semibold leading-none text-orange-100 transition group-hover:text-orange-200/95 sm:text-6xl">
                    {n}
                  </span>
                  {n === '01' ? (
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-800 ring-1 ring-orange-200/80">
                      Start here
                    </span>
                  ) : null}
                </div>
                <h3 className={`mt-6 font-semibold text-stone-900 ${n === '01' ? 'text-xl sm:text-2xl' : 'text-lg'}`}>
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MentorPreviewCard({ mentor, spotlight = false }) {
  const color = avatarColor(mentor.name);
  return (
    <div
      className={`group relative flex h-full flex-col gap-4 overflow-hidden rounded-[1.75rem] border bg-white/95 p-6 shadow-bridge-card transition duration-300 hover:-translate-y-1 hover:shadow-bridge-glow ${
        spotlight
          ? 'border-orange-200/90 ring-1 ring-orange-200/50 hover:border-orange-300/80'
          : 'border-stone-200/80 hover:border-orange-200/50'
      }`}
    >
      {spotlight ? (
        <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
          This week
        </span>
      ) : null}
      <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400/70 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className={`flex items-center gap-3 ${spotlight ? 'pr-24' : ''}`}>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xs font-bold shadow-sm ${color}`}>
          {initials(mentor.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-stone-900">{mentor.name}</p>
          <p className="truncate text-xs text-stone-500">
            {mentor.title} · {mentor.company}
          </p>
        </div>
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed text-stone-600">{mentor.bio}</p>

      <div className="flex flex-wrap gap-1.5">
        {mentor.expertise.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-orange-100 bg-orange-50/80 px-2.5 py-0.5 text-xs font-medium text-orange-900"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
        <span className="flex items-center gap-1 text-xs font-medium text-stone-500">
          <span className="text-amber-500">★</span>
          {mentor.rating.toFixed(1)} · {mentor.years_experience} yrs
        </span>
        <Link
          to={`/mentors/${mentor.id}`}
          className={`rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-4 py-2 text-xs font-semibold text-amber-50 transition hover:from-stone-800 hover:to-stone-700 ${focusRing}`}
        >
          Open profile
        </Link>
      </div>
    </div>
  );
}

function SessionTypes() {
  const popular = SESSION_TYPES.find((t) => t.popular);
  const rest = SESSION_TYPES.filter((t) => !t.popular);

  return (
    <section id="session-types" className="relative scroll-mt-20 overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-50/30 via-orange-50/25 to-transparent"
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col justify-between gap-6 lg:mb-16 lg:flex-row lg:items-end">
          <Reveal className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Session types</p>
            <h2 className="font-display text-balance text-3xl font-semibold text-stone-900 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              Pick how you want to use the hour
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Each format has a point. We&apos;re not here to fill time—we&apos;re here so you walk out knowing what to do
              Monday.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-2xl border border-orange-200/60 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-800">Popular</p>
              <p className="mt-1 text-sm font-medium text-stone-800">
                {popular ? `${popular.icon} ${popular.name} — ${popular.duration}` : 'Interview prep'}
              </p>
            </div>
          </Reveal>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {popular ? (
            <Reveal>
              <div className="h-full rounded-[1.75rem] border-2 border-orange-300/60 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/40 p-2 shadow-bridge-glow ring-1 ring-orange-200/40">
                <SessionTypeCard type={popular} />
              </div>
            </Reveal>
          ) : null}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {rest.map((type, i) => (
              <Reveal key={type.key} delay={80 + i * 60}>
                <SessionTypeCard type={type} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedMentors() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    void (async () => {
      const { data, error: fetchError } = await getFeaturedMentors();
      if (cancelled) return;
      setLoading(false);
      if (fetchError) {
        setFeatured([]);
        setError(fetchError.message || 'Could not load featured mentors.');
        return;
      }
      setFeatured(data ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function loadFeatured() {
    setReloadKey((k) => k + 1);
  }

  return (
    <section id="featured-mentors" className="relative scroll-mt-20 overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-50/35 via-orange-50/20 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-orange-200/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 bottom-10 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-300/80 to-transparent"
      />
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mb-12 flex flex-col justify-between gap-8 lg:mb-16 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Spotlight</p>
              <span className="rounded-full border border-orange-200/80 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-800 shadow-sm">
                Rotates weekly
              </span>
            </div>
            <h2 className="font-display text-balance text-3xl font-semibold text-stone-900 sm:text-4xl lg:text-[2.65rem] lg:leading-tight">
              A few people we&apos;d nudge you toward
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone-600">
              Hand-picked profiles getting traction right now—open any card for the full story, expertise tags, and
              booking.
            </p>
          </div>
          <Link
            to="/mentors"
            className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full border-2 border-stone-900/10 bg-white/95 px-6 py-3 text-sm font-semibold text-stone-900 shadow-md shadow-stone-900/5 transition hover:border-orange-300/70 hover:shadow-lg lg:self-auto ${focusRing}`}
          >
            Full directory
            <span aria-hidden>→</span>
          </Link>
        </Reveal>

        {loading ? (
          <LoadingSpinner label="Pulling featured mentors…" className="py-16" />
        ) : error ? (
          <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900 shadow-sm">
            <p className="font-semibold">That didn&apos;t load</p>
            <p className="mt-1 opacity-90">{error}</p>
            <button
              type="button"
              onClick={loadFeatured}
              className={`mt-4 rounded-full bg-red-900 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 ${focusRing}`}
            >
              Try again
            </button>
          </div>
        ) : featured.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-stone-200/90 bg-stone-50/60 px-8 py-14 text-center shadow-sm">
            <p className="font-display text-lg font-semibold text-stone-900">Spotlight is open—just quiet right now</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
              We rotate featured mentors regularly. The full directory always has people ready to book.
            </p>
            <Link
              to="/mentors"
              className={`mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 ${focusRing}`}
            >
              Browse all mentors
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((m, i) => (
              <Reveal key={m.id} delay={i * 70}>
                <MentorPreviewCard mentor={m} spotlight={i === 0} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    quote:
      'Two calls in I stopped rewriting my resume for no one. He basically called out the story I was dodging and we fixed it in an hour.',
    name: 'Tyler N.',
    role: 'Engineer (new gig)',
    initials: 'TN',
  },
  {
    quote:
      'I went to a no-name school and thought finance was closed to me. She’d done the same jump and told me exactly where I was wasting energy.',
    name: 'Priya S.',
    role: 'Analyst',
    initials: 'PS',
  },
  {
    quote:
      'I’d been “fine” at the same job for four years. One session made quitting feel boring instead of terrifying—sounds dramatic but that’s what happened.',
    name: 'Jordan E.',
    role: 'PM',
    initials: 'JE',
  },
];

function Testimonials() {
  return (
    <section id="stories" className="relative scroll-mt-20 overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-orange-950" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/4 h-[min(480px,70vw)] w-[min(480px,70vw)] rounded-full bg-orange-500/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">Stories</p>
          <h2 className="font-display text-balance text-3xl font-semibold text-white sm:text-4xl lg:text-[2.75rem]">
            What people say after (not before)
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-400 sm:text-lg">
            Real sessions, lightly edited for privacy—same emotional weather, fewer proper nouns.
          </p>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {TESTIMONIALS.map(({ quote, name, role, initials: ini }, i) => (
            <Reveal key={name} delay={i * 90}>
              <figure
                className={`relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-white/[0.07] p-8 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.11] ${
                  i === 1
                    ? 'border-orange-400/35 shadow-lg shadow-orange-950/40 ring-1 ring-orange-400/25 lg:scale-[1.02] lg:z-10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 opacity-80" />
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/20 blur-2xl" aria-hidden />
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-4xl leading-none text-orange-400/90 sm:text-5xl" aria-hidden>
                    “
                  </span>
                  <p className="sr-only">5 out of 5</p>
                  <div className="flex gap-0.5 text-amber-400" aria-hidden>
                    {[0, 1, 2, 3, 4].map((s) => (
                      <span key={s} className="text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <blockquote className="mt-2 flex-1 text-pretty">
                  <p className="text-base leading-relaxed text-stone-100 sm:text-[1.05rem] sm:leading-relaxed">{quote}</p>
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-sm font-bold text-white shadow-lg">
                    {ini}
                  </div>
                  <div>
                    <span className="font-semibold text-white">{name}</span>
                    <p className="text-sm text-orange-100/90">{role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueStrip() {
  const items = [
    {
      n: '01',
      t: 'Humans, not feeds',
      d: 'No algorithm picking your advice. You choose the brain.',
    },
    {
      n: '02',
      t: 'Short sessions',
      d: 'Built to end with a next step, not a calendar full of maybes.',
    },
    {
      n: '03',
      t: 'Honest bios',
      d: 'Profiles meant to be read—less keyword soup, more real paths.',
    },
  ];
  return (
    <section
      id="why-bridge"
      aria-labelledby="why-bridge-heading"
      className="relative scroll-mt-20 overflow-hidden border-y border-stone-200/80 px-4 py-20 backdrop-blur-sm sm:px-6 sm:py-24 lg:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/80 via-orange-50/25 to-amber-50/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(720px,90vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-orange-300/50 to-transparent"
      />
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center sm:mb-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Why Bridge</p>
          <h2
            id="why-bridge-heading"
            className="font-display text-balance text-3xl font-semibold text-stone-900 sm:text-4xl"
          >
            The part of career advice that actually lands
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            Three things we optimize for—so you spend less time debating strangers online.
          </p>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {items.map(({ n, t, d }, i) => (
            <Reveal key={t} delay={i * 70}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-7 shadow-bridge-card transition duration-300 hover:-translate-y-1 hover:border-orange-200/60 hover:shadow-bridge-glow sm:p-8">
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 opacity-90 transition group-hover:opacity-100" />
                <span className="font-display text-4xl font-semibold leading-none text-orange-100 transition group-hover:text-orange-200/90 sm:text-5xl">
                  {n}
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-stone-900">{t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingTeaser() {
  const perks = [
    'Browse mentors and bios at no cost',
    'Upgrade only if you want the extra perks',
    'No lock-in—cancel whenever it stops fitting',
  ];
  return (
    <section id="pricing-teaser" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <Reveal>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-stone-200/80 bg-gradient-to-br from-white via-orange-50/45 to-amber-50/35 p-10 shadow-bridge-glow sm:p-12 lg:p-14">
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-orange-300/35 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-amber-200/25 blur-3xl"
          />
          <div className="relative grid gap-12 lg:grid-cols-12 lg:gap-10 lg:items-center">
            <div className="lg:col-span-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-800">Pricing</p>
              <h3 className="mt-3 font-display text-balance text-2xl font-semibold text-stone-900 sm:text-3xl lg:text-[2.1rem] lg:leading-snug">
                Poke around free. Pay when it&apos;s a habit.
              </h3>
              <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">
                If you&apos;re booking every week, the paid tier pays for itself. If not, stay on free—no guilt trip.
              </p>
              <ul className="mt-8 space-y-3">
                {perks.map((line) => (
                  <li key={line} className="flex gap-3 text-sm font-medium text-stone-800 sm:text-base">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs text-orange-700">
                      ✓
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center gap-4 rounded-2xl border border-stone-200/70 bg-white/70 p-8 shadow-sm backdrop-blur-sm lg:col-span-6">
              <p className="text-sm font-semibold text-stone-900">Ready when you are</p>
              <p className="text-sm leading-relaxed text-stone-600">
                Compare tiers on the pricing page, or wander the mentor directory first—either order works.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to="/pricing"
                  className={`inline-flex flex-1 items-center justify-center rounded-full border-2 border-stone-900 bg-stone-900 px-8 py-3.5 text-sm font-semibold text-amber-50 transition hover:bg-stone-800 sm:flex-initial ${focusRing}`}
                >
                  See pricing
                </Link>
                <Link
                  to="/mentors"
                  className={`inline-flex flex-1 items-center justify-center rounded-full border-2 border-stone-900/12 bg-white px-8 py-3.5 text-sm font-semibold text-stone-900 transition hover:border-orange-300/70 sm:flex-initial ${focusRing}`}
                >
                  Browse first
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="get-started" aria-labelledby="final-cta-heading" className="scroll-mt-20 px-4 pb-28 pt-4 sm:px-6 sm:pb-32 lg:px-8">
      <Reveal>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-600 via-amber-500 to-orange-700 px-8 py-20 text-center shadow-bridge-glow ring-1 ring-white/20 sm:px-14 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-300/20 blur-2xl"
          />
          <h2
            id="final-cta-heading"
            className="relative mx-auto max-w-3xl font-display text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
          >
            Stop collecting takes from strangers on LinkedIn
          </h2>
          <p className="relative mx-auto mt-6 max-w-xl text-lg leading-relaxed text-orange-50/95 sm:text-xl">
            Make an account, find one person whose background rhymes with yours, and book. That&apos;s the whole pitch.
          </p>
          <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/register"
              className={`inline-flex w-full items-center justify-center rounded-full bg-white px-9 py-4 text-sm font-semibold text-orange-700 shadow-lg transition hover:bg-orange-50 sm:w-auto ${focusRingWhite}`}
            >
              Sign up free
            </Link>
            <Link
              to="/mentors"
              className={`inline-flex w-full items-center justify-center rounded-full border-2 border-white/45 bg-white/5 px-9 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 sm:w-auto ${focusRingWhite}`}
            >
              Just show me mentors
            </Link>
          </div>
          <div className="relative mx-auto mt-12 flex max-w-md flex-col items-center gap-4 border-t border-white/20 pt-10 sm:flex-row sm:justify-center sm:gap-6">
            <div className="flex -space-x-3" aria-hidden>
              {['MC', 'JR', 'EV'].map((ini, idx) => (
                <div
                  key={ini}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-orange-600/90 text-xs font-bold shadow-md ${
                    idx === 0
                      ? 'bg-amber-100 text-amber-950'
                      : idx === 1
                        ? 'bg-stone-900 text-amber-50'
                        : 'bg-orange-100 text-orange-950'
                  }`}
                >
                  {ini}
                </div>
              ))}
            </div>
            <p className="text-center text-sm font-medium leading-snug text-orange-50/90 sm:text-left">
              Most people book after reading <span className="text-white">one bio</span> that sounds uncomfortably specific.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function Landing() {
  return (
    <main id="main-content" aria-label="Bridge — home" className="overflow-x-hidden">
      <Hero />
      <MarqueeStrip />
      <HowItWorks />
      <SessionTypes />
      <ValueStrip />
      <FeaturedMentors />
      <Testimonials />
      <PricingTeaser />
      <FinalCTA />
    </main>
  );
}
