import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedMentors } from '../api/mentors';
import Reveal from '../components/Reveal';
import { useAuth } from '../context/useAuth';

const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';
const focusRingWhite =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-600';

const AVATAR_COLORS = [
  'bg-violet-200 text-violet-900',
  'bg-amber-200 text-amber-900',
  'bg-emerald-200 text-emerald-900',
  'bg-sky-200 text-sky-900',
  'bg-rose-200 text-rose-900',
  'bg-indigo-200 text-indigo-900',
];

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name) {
  return name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
}

// Persona-driven mentor matches for the hero. Each persona maps to 2 representative
// mentor "preview pills" — this is the identification layer, not a directory.
const PERSONAS = [
  {
    id: 'new_job',
    label: 'Looking for a new job',
    emoji: '🎯',
    blurb: 'Talk to hiring managers and recent switchers.',
    matches: [
      { name: 'Jordan Reeves', role: 'Ex-FAANG Recruiter', tag: 'Interview prep' },
      { name: 'Sasha Kim', role: 'Eng. Manager @ Stripe', tag: 'Tech hiring' },
    ],
  },
  {
    id: 'switch',
    label: 'Switching industries',
    emoji: '🔀',
    blurb: 'Learn from people who already made the pivot.',
    matches: [
      { name: 'Elena Voss', role: 'RN → UX Designer', tag: 'Career switch' },
      { name: 'Marcus Webb', role: 'Banker → Founder', tag: 'Finance to startup' },
    ],
  },
  {
    id: 'interview',
    label: 'Preparing for interviews',
    emoji: '💬',
    blurb: 'Mock interviews with people who run the real ones.',
    matches: [
      { name: 'David Park', role: 'Staff Eng @ Stripe', tag: 'System design' },
      { name: 'Priya Sharma', role: 'PM @ Figma', tag: 'Product sense' },
    ],
  },
  {
    id: 'founding',
    label: 'Starting something',
    emoji: '🚀',
    blurb: 'Founders who\u2019ve shipped, hired, and raised.',
    matches: [
      { name: 'Leah Torres', role: 'Founder @ Seed-stage', tag: 'Early-stage' },
      { name: 'Ahmed Rahim', role: 'Ex-YC, 2 exits', tag: 'Fundraising' },
    ],
  },
];

function Hero() {
  const { user } = useAuth();
  const [activePersona, setActivePersona] = useState(PERSONAS[0].id);
  const persona = PERSONAS.find((p) => p.id === activePersona) ?? PERSONAS[0];

  return (
      <section
          aria-labelledby="landing-heading"
          className="relative isolate overflow-hidden px-4 pb-24 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pt-24"
      >
        {/* Layered atmosphere — editorial, not SaaS-template */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#fffaf3] via-[#fff4e3] to-[#fffaf3]" />
        <div
            aria-hidden
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(120,113,108,0.45) 1px, transparent 0)",
              backgroundSize: '28px 28px',
            }}
        />
        <div aria-hidden className="pointer-events-none absolute -left-32 top-[-10%] h-[38rem] w-[38rem] rounded-full bg-gradient-to-br from-orange-300/35 via-amber-200/20 to-transparent blur-[100px]" />
        <div aria-hidden className="pointer-events-none absolute -right-20 top-[30%] h-[30rem] w-[30rem] rounded-full bg-gradient-to-tl from-rose-200/25 via-orange-200/15 to-transparent blur-[90px]" />
        <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fffaf3] to-transparent"
        />

        <div className="relative mx-auto max-w-6xl">
          {/* Top meta row */}
          <div className="mb-10 flex flex-wrap items-center justify-between gap-3 sm:mb-14">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-stone-900/10 bg-white/80 px-3.5 py-1.5 shadow-sm backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700">
              Live · 2,400 mentors
            </span>
            </div>
            <div className="hidden items-center gap-5 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-500 sm:flex">
              <span>Engineering</span>
              <span className="h-1 w-1 rounded-full bg-stone-300" />
              <span>Product</span>
              <span className="h-1 w-1 rounded-full bg-stone-300" />
              <span>Design</span>
              <span className="h-1 w-1 rounded-full bg-stone-300" />
              <span>Finance</span>
              <span className="h-1 w-1 rounded-full bg-stone-300" />
              <span>+46 more</span>
            </div>
          </div>

          {/* Editorial headline — centered, oversized, asymmetric framing */}
          <div className="relative mx-auto max-w-4xl text-center">
            <h1
                id="landing-heading"
                className="font-display text-balance text-[2.9rem] font-semibold leading-[0.98] tracking-[-0.02em] text-stone-900 sm:text-[4rem] sm:leading-[0.96] lg:text-[5rem] lg:leading-[0.95]"
            >
              The person you need to talk to
              <span className="relative mx-2 inline-block">
              <span className="relative z-10 italic text-gradient-bridge">has already</span>
              <span
                  aria-hidden
                  className="absolute bottom-1 left-0 right-0 -z-0 h-[0.35em] -rotate-1 bg-amber-200/60"
              />
            </span>
              done the job.
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-stone-600 sm:text-xl sm:leading-[1.55]">
              Bridge is a directory of vetted professionals you book by the hour. One session with someone who&apos;s
              lived your exact next step — not a recruiter, not a coach, not a content creator.
            </p>

            {/* CTAs under headline */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                  to="/mentors"
                  className={`group inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-8 py-4 text-sm font-semibold text-amber-50 shadow-[0_10px_40px_-8px_rgba(28,25,23,0.35)] transition hover:bg-stone-800 sm:w-auto ${focusRing}`}
              >
                Browse 2,400+ mentors
                <span className="transition group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
              </Link>
              {!user ? (
                  <Link
                      to="/register?intent=mentor"
                      className={`inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white/80 px-8 py-4 text-sm font-semibold text-stone-800 backdrop-blur-sm transition hover:border-stone-400 hover:bg-white sm:w-auto ${focusRing}`}
                  >
                    Become a mentor
                  </Link>
              ) : null}
            </div>

            {/* Trust row */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 text-sm text-stone-500 sm:flex-row sm:gap-5">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2" aria-hidden>
                  {['SK', 'MR', 'LV', 'JE', 'TN'].map((ini, idx) => (
                      <div
                          key={ini}
                          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#fffaf3] text-[9px] font-bold shadow-sm ${
                              idx === 0
                                  ? 'bg-amber-200 text-amber-900'
                                  : idx === 1
                                      ? 'bg-stone-800 text-amber-50'
                                      : idx === 2
                                          ? 'bg-orange-200 text-orange-900'
                                          : idx === 3
                                              ? 'bg-emerald-200 text-emerald-900'
                                              : 'bg-rose-200 text-rose-900'
                          }`}
                      >
                        {ini}
                      </div>
                  ))}
                </div>
                <span>
                <span className="font-semibold text-stone-900">4,800+</span> sessions booked
              </span>
              </div>
              <span className="hidden h-1 w-1 rounded-full bg-stone-300 sm:block" aria-hidden />
              <div className="flex items-center gap-1.5">
              <span className="flex text-amber-500" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="text-xs">
                    ★
                  </span>
                ))}
              </span>
                <span>
                <span className="font-semibold text-stone-900">4.9</span> avg rating
              </span>
              </div>
              <span className="hidden h-1 w-1 rounded-full bg-stone-300 sm:block" aria-hidden />
              <span>
              <span className="font-semibold text-stone-900">From $25</span> / session
            </span>
            </div>
          </div>

          {/* Persona chooser — full-width, horizontal, below headline */}
          <div className="relative mx-auto mt-20 max-w-5xl sm:mt-24">
            <div className="mb-5 flex items-baseline justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-800/90">
                  Find your match
                </p>
                <p className="mt-1 font-display text-xl font-semibold text-stone-900 sm:text-2xl">
                  Where are you right now?
                </p>
              </div>
              <p className="hidden text-xs text-stone-500 sm:block">
                Tap one → see who to talk to
              </p>
            </div>

            {/* Persona tabs */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PERSONAS.map((p) => {
                const isActive = p.id === persona.id;
                return (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => setActivePersona(p.id)}
                        aria-pressed={isActive}
                        className={`group relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition ${
                            isActive
                                ? 'border-stone-900 bg-stone-900 text-amber-50 shadow-[0_12px_30px_-10px_rgba(28,25,23,0.4)]'
                                : 'border-stone-200 bg-white/70 text-stone-800 backdrop-blur-sm hover:border-stone-400 hover:bg-white'
                        } ${focusRing}`}
                    >
                  <span
                      aria-hidden
                      className={`absolute right-3 top-3 text-xl transition ${isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}
                  >
                    {p.emoji}
                  </span>
                      <span
                          className={`block text-[10px] font-bold uppercase tracking-[0.18em] ${
                              isActive ? 'text-amber-300' : 'text-orange-700'
                          }`}
                      >
                    Path 0{PERSONAS.indexOf(p) + 1}
                  </span>
                      <span className="mt-2 block text-sm font-semibold leading-snug">
                    {p.label}
                  </span>
                    </button>
                );
              })}
            </div>

            {/* Match preview — horizontal card */}
            <div className="relative mt-5 overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 shadow-[0_20px_50px_-20px_rgba(28,25,23,0.25)] backdrop-blur-md">
              <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400/80 to-transparent" />
              <div className="grid gap-0 md:grid-cols-3">
                <div className="border-b border-stone-100 p-5 md:border-b-0 md:border-r">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">If you&apos;re…</p>
                  <p className="mt-2 font-display text-lg font-semibold text-stone-900">{persona.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{persona.blurb}</p>
                  <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-orange-700">
                    <span>{Math.floor(Math.random() * 40) + 180} mentors match</span>
                    <span aria-hidden>→</span>
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="border-b border-stone-100 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                    Talk to
                  </p>
                  {persona.matches.map((m) => {
                    const color = avatarColor(m.name);
                    return (
                        <div
                            key={m.name}
                            className="flex items-center gap-4 border-b border-stone-100 px-5 py-3.5 transition last:border-b-0 hover:bg-orange-50/40"
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold shadow-sm ${color}`}>
                            {initials(m.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-stone-900">{m.name}</p>
                            <p className="truncate text-xs text-stone-500">{m.role}</p>
                          </div>
                          <span className="hidden shrink-0 rounded-full border border-orange-100 bg-orange-50/90 px-2.5 py-0.5 text-[10px] font-medium text-orange-900 sm:inline-block">
                        {m.tag}
                      </span>
                          <Link
                              to="/mentors"
                              className="shrink-0 text-xs font-semibold text-stone-900 underline-offset-4 transition hover:text-orange-700 hover:underline"
                          >
                            View →
                          </Link>
                        </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
/**
 * FeaturedMentor — ONE mentor, full attention.
 * Replaces the 3-card "meet a few" grid. Shows what using Bridge actually looks like.
 */
function FeaturedMentor({ mentor, loading }) {
  const hasMentor = !loading && mentor;
  const display = hasMentor
      ? mentor
      : {
        id: 'fallback',
        name: 'Maya Chen',
        title: 'Director of Product',
        company: 'Linear',
        bio: 'Led product at two Series B startups. I help PMs navigate ambiguity, run better discovery, and get promoted without playing politics. Former consultant — I\u2019m blunt about what\u2019s actually working.',
        expertise: ['Product strategy', 'Promotion prep', 'Roadmapping', 'Stakeholder mgmt'],
        rating: 4.9,
        years_experience: 11,
        total_sessions: 86,
      };
  const color = avatarColor(display.name);

  return (
      <section className="relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">This week&apos;s spotlight</p>
            <h2 className="font-display text-balance text-3xl font-semibold text-stone-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              One mentor, up close
            </h2>
            <p className="mt-3 text-base leading-relaxed text-stone-600 sm:text-lg">
              Every profile on Bridge looks like this — real bio, real numbers, real booking.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/90 bg-white shadow-bridge-glow">
              <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

              <div className="grid gap-0 lg:grid-cols-12">
                {/* LEFT: avatar + identity + quote */}
                <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 p-8 text-amber-50 lg:col-span-5 lg:p-10">
                  <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl" />
                  <div aria-hidden className="pointer-events-none absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />

                  <div className="relative flex items-start gap-5">
                    <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-lg font-bold shadow-lg ring-4 ring-white/10 ${color}`}>
                      {initials(display.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-2xl font-semibold tracking-tight text-white">{display.name}</p>
                      <p className="mt-1 text-sm text-stone-300">
                        {display.title}
                        {display.company ? <span className="text-stone-400"> · {display.company}</span> : null}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                      <span className="flex text-amber-400" aria-hidden>
                        {[0, 1, 2, 3, 4].map((i) => (
                            <span key={i}>★</span>
                        ))}
                      </span>
                        <span className="text-xs font-semibold text-amber-100">
                        {Number(display.rating).toFixed(1)} · {display.total_sessions} sessions
                      </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-8 border-l-2 border-orange-400/40 pl-5">
                    <p className="text-base leading-relaxed text-stone-200 sm:text-lg">
                      &ldquo;I don&apos;t do fluff. You tell me what you&apos;re actually trying to figure out, and we work it
                      in one session. If I can&apos;t help, I&apos;ll say so in the first ten minutes.&rdquo;
                    </p>
                  </div>
                </div>

                {/* RIGHT: bio, tags, stats, CTA */}
                <div className="p-8 lg:col-span-7 lg:p-10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-800/80">About</p>
                  <p className="mt-3 text-base leading-relaxed text-stone-700">{display.bio}</p>

                  <div className="mt-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-800/80">Focus areas</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {display.expertise.slice(0, 5).map((tag) => (
                          <span
                              key={tag}
                              className="rounded-full border border-orange-100 bg-orange-50/80 px-3 py-1 text-xs font-medium text-orange-900"
                          >
                        {tag}
                      </span>
                      ))}
                    </div>
                  </div>

                  <dl className="mt-7 grid grid-cols-3 gap-2 rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                    <div className="text-center">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Rating</dt>
                      <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-stone-900">
                        {Number(display.rating).toFixed(1)}
                      </dd>
                    </div>
                    <div className="border-x border-stone-200 text-center">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Experience</dt>
                      <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-stone-900">
                        {display.years_experience} yrs
                      </dd>
                    </div>
                    <div className="text-center">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Sessions</dt>
                      <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-stone-900">
                        {display.total_sessions}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                        to={`/mentors/${display.id}`}
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 ${focusRing}`}
                    >
                      Open full profile
                      <span aria-hidden>→</span>
                    </Link>
                    <Link
                        to="/mentors"
                        className={`inline-flex items-center justify-center rounded-full border-2 border-stone-900/10 bg-white px-6 py-3.5 text-sm font-semibold text-stone-900 transition hover:border-orange-300/70 ${focusRing}`}
                    >
                      See more mentors
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
  );
}

/**
 * HowItWorks — visual walkthrough, not descriptions.
 * Three stacked UI mockups showing search → profile → confirmation.
 */
function HowItWorks() {
  const STEPS = [
    {
      n: '01',
      title: 'Search who you need',
      desc: 'Filter by industry, role, company, or skill. Read real bios — not LinkedIn word-salad.',
      mock: (
          <>
            <div className="rounded-xl border border-stone-200 bg-white p-2 shadow-sm">
              <div className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2">
                <svg className="h-3.5 w-3.5 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
                </svg>
                <span className="text-xs font-medium text-stone-600">Product manager, Series B</span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {['Product', 'Strategy', 'Promo prep'].map((t) => (
                  <span key={t} className="rounded-full border border-orange-200/70 bg-white/90 px-2 py-0.5 text-[10px] font-medium text-orange-900">
                {t}
              </span>
              ))}
            </div>
            <div className="mt-3 space-y-1.5">
              {[0, 1].map((i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-stone-100 bg-white/80 p-1.5">
                    <div className={`h-6 w-6 rounded ${i === 0 ? 'bg-amber-200' : 'bg-violet-200'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="h-1.5 w-2/3 rounded bg-stone-200" />
                      <div className="mt-1 h-1 w-1/2 rounded bg-stone-100" />
                    </div>
                    <span className="rounded-full bg-stone-900 px-1.5 py-0.5 text-[8px] font-bold text-amber-50">View</span>
                  </div>
              ))}
            </div>
          </>
      ),
    },
    {
      n: '02',
      title: 'Pick a format and time',
      desc: 'Career advice, interview prep, resume review, or networking. Grab an open slot.',
      mock: (
          <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-rose-400 to-orange-500" />
              <div className="min-w-0 flex-1">
                <div className="h-1.5 w-3/4 rounded bg-stone-300" />
                <div className="mt-1 h-1 w-1/2 rounded bg-stone-100" />
              </div>
            </div>
            <div className="mt-2.5 grid grid-cols-7 gap-0.5">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                const states = ['bg-emerald-200', 'bg-emerald-200', 'bg-amber-200', 'bg-stone-200', 'bg-emerald-200', 'bg-amber-200', 'bg-stone-200'];
                const isSelected = d === 2;
                return (
                    <div
                        key={d}
                        className={`flex aspect-square items-center justify-center rounded text-[8px] font-bold ${states[d]} ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
                    >
                      {d + 15}
                    </div>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {['Career', 'Interview', 'Resume'].map((t, i) => (
                  <span
                      key={t}
                      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                          i === 1 ? 'bg-stone-900 text-amber-50' : 'border border-stone-200 bg-white text-stone-600'
                      }`}
                  >
                {t}
              </span>
              ))}
            </div>
          </div>
      ),
    },
    {
      n: '03',
      title: 'Meet and leave with a plan',
      desc: '30–45 min over video. You leave with a next step — not a vague "let\u2019s circle back."',
      mock: (
          <div className="rounded-xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-bold text-emerald-950">✓</div>
                <span className="text-[10px] font-semibold text-white">Confirmed</span>
              </div>
              <span className="text-[9px] text-stone-400">Tue, 2:00 PM</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-rose-400 to-orange-500" />
              <div className="min-w-0 flex-1">
                <div className="h-1.5 w-2/3 rounded bg-white/25" />
                <div className="mt-1 h-1 w-1/2 rounded bg-white/15" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-1.5">
              <svg className="h-3 w-3 text-stone-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-bold text-stone-900">Join video call</span>
            </div>
          </div>
      ),
      dark: true,
    },
  ];

  return (
      <section id="how-it-works" className="relative scroll-mt-20 overflow-hidden border-y border-stone-200/70 bg-gradient-to-b from-white via-amber-50/40 to-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-14 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">How it works</p>
            <h2 className="font-display text-balance text-3xl font-semibold text-stone-900 sm:text-4xl lg:text-[2.65rem] lg:leading-tight">
              From search to session in three steps.
            </h2>
          </Reveal>

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
            {STEPS.map(({ n, title, desc, mock, dark }, i) => (
                <Reveal key={n} delay={i * 100}>
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white shadow-bridge-card transition hover:-translate-y-1 hover:shadow-bridge-glow">
                    <div
                        className={`relative h-48 overflow-hidden p-5 ${
                            dark
                                ? 'bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950'
                                : i === 0
                                    ? 'bg-gradient-to-br from-stone-50 via-orange-50/40 to-amber-50/30'
                                    : 'bg-gradient-to-br from-amber-50/40 via-orange-50/40 to-white'
                        }`}
                    >
                      {mock}
                    </div>
                    <div className="p-6 sm:p-7">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-3xl font-semibold leading-none text-orange-300">{n}</span>
                        <span className="h-px flex-1 bg-stone-200" />
                      </div>
                      <h3 className="mt-4 font-display text-lg font-semibold text-stone-900 sm:text-xl">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">{desc}</p>
                    </div>
                  </div>
                </Reveal>
            ))}
          </div>
        </div>
      </section>
  );
}
/**
 * WhyBridge — honest comparison vs. the real alternatives a user has in mind.
 */
function WhyBridge() {
  const rows = [
    { label: 'You get a response', dm: '~10% reply rate', coaching: 'Always — they sell hours', bridge: 'Always — mentors opt-in to listings' },
    { label: 'They\u2019ve done your actual job', dm: 'Maybe', coaching: 'Rarely — usually pro coaches', bridge: 'Yes, that\u2019s the filter' },
    { label: 'Session has structure', dm: 'No', coaching: 'Yes', bridge: 'Yes — 4 named formats' },
    { label: 'Price is clear upfront', dm: '—', coaching: 'Often bundled/hidden', bridge: 'On every profile' },
    { label: 'You can see reviews first', dm: 'No', coaching: 'Curated testimonials', bridge: 'All reviews, unfiltered' },
    { label: 'Commitment', dm: 'None', coaching: 'Multi-session packages', bridge: 'One session at a time' },
  ];

  return (
      <section id="why-bridge" className="relative scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-12 max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Why Bridge</p>
            <h2 className="font-display text-balance text-3xl font-semibold text-stone-900 sm:text-4xl lg:text-[2.65rem] lg:leading-tight">
              You have three options right now. Here&apos;s how they compare.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">
              Most advice lives on LinkedIn DMs or expensive coaching packages. We built Bridge to sit in the middle:
              single-session bookings with people who actually did the thing.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-white shadow-bridge-card">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/70">
                    <th scope="col" className="px-4 py-4 font-semibold text-stone-900 sm:px-6" />
                    <th scope="col" className="px-3 py-4 text-center font-semibold text-stone-500 sm:px-4">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm">Cold LinkedIn DMs</span>
                        <span className="text-[10px] font-normal text-stone-400">Free, slow</span>
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-4 text-center font-semibold text-stone-500 sm:px-4">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm">Coaching platforms</span>
                        <span className="text-[10px] font-normal text-stone-400">$200–$500/mo packages</span>
                      </div>
                    </th>
                    <th scope="col" className="bg-gradient-to-b from-orange-50/80 to-amber-50/50 px-3 py-4 text-center font-semibold text-orange-950 sm:px-4">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm">Bridge</span>
                        <span className="text-[10px] font-normal text-orange-800/80">$25–$150 / session</span>
                      </div>
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  {rows.map((row, i) => (
                      <tr
                          key={row.label}
                          className={`border-b border-stone-100 last:border-0 ${i % 2 === 1 ? 'bg-stone-50/40' : ''}`}
                      >
                        <th scope="row" className="px-4 py-4 font-medium text-stone-800 sm:px-6">{row.label}</th>
                        <td className="px-3 py-4 text-center text-xs text-stone-500 sm:px-4 sm:text-sm">{row.dm}</td>
                        <td className="px-3 py-4 text-center text-xs text-stone-500 sm:px-4 sm:text-sm">{row.coaching}</td>
                        <td className="bg-orange-50/40 px-3 py-4 text-center text-xs font-medium text-stone-900 sm:px-4 sm:text-sm">{row.bridge}</td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
  );
}

/**
 * Outcomes — testimonials led by result, not quote.
 */
function Outcomes() {
  const outcomes = [
    {
      result: 'Got the offer',
      metric: '+32% comp',
      quote:
          'Two sessions with a former FAANG recruiter. She rewrote my answer to "tell me about yourself" in ten minutes. I got the offer a week later.',
      name: 'Tyler N.',
      role: 'Senior Engineer',
    },
    {
      result: 'Changed industries',
      metric: 'Banking → Startup',
      quote:
          'I was terrified to leave finance. One session with someone who made the exact same jump saved me six months of second-guessing.',
      name: 'Priya S.',
      role: 'Ex-Analyst, now PM',
    },
    {
      result: 'Got promoted',
      metric: 'IC → Staff',
      quote:
          'I\u2019d been stuck at senior for four years. My mentor called out exactly which work I was doing that didn\u2019t count. Promoted in the next cycle.',
      name: 'Jordan E.',
      role: 'Staff Engineer',
    },
  ];

  return (
      <section id="outcomes" className="relative scroll-mt-20 overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-orange-950" />
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
        />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-1/4 h-[min(480px,70vw)] w-[min(480px,70vw)] rounded-full bg-orange-500/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <Reveal className="mb-14 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">Outcomes</p>
            <h2 className="font-display text-balance text-3xl font-semibold text-white sm:text-4xl lg:text-[2.5rem]">
              What people walked away with
            </h2>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {outcomes.map(({ result, metric, quote, name, role }, i) => (
                <Reveal key={name} delay={i * 90}>
                  <figure
                      className={`relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-white/[0.07] p-7 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/[0.11] sm:p-8 ${
                          i === 1
                              ? 'border-orange-400/35 shadow-lg shadow-orange-950/40 ring-1 ring-orange-400/25 lg:scale-[1.02] lg:z-10'
                              : 'border-white/10 hover:border-white/20'
                      }`}
                  >
                    {/* Outcome headline — leads with result */}
                    <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white shadow-sm">
                    ✓
                  </span>
                      <div>
                        <p className="text-xs font-medium text-emerald-300">{result}</p>
                        <p className="font-display text-xl font-semibold text-white">{metric}</p>
                      </div>
                    </div>

                    <blockquote className="mt-5 flex-1 text-pretty">
                      <p className="text-sm leading-relaxed text-stone-200 sm:text-base">&ldquo;{quote}&rdquo;</p>
                    </blockquote>

                    <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5 text-sm">
                      <span className="text-stone-300">—</span>
                      <div>
                        <p className="font-semibold text-white">{name}</p>
                        <p className="text-xs text-orange-100/85">{role}</p>
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

/**
 * PricingBlock — transparent price info before the final CTA.
 */
function PricingBlock() {
  return (
      <section className="relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="grid gap-6 rounded-[2rem] border border-stone-200/90 bg-white p-8 shadow-bridge-card sm:p-10 lg:grid-cols-5 lg:items-center lg:gap-10 lg:p-12">
              <div className="lg:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Pricing, clearly</p>
                <h2 className="mt-3 font-display text-balance text-2xl font-semibold text-stone-900 sm:text-3xl lg:text-[2.25rem] lg:leading-tight">
                  No subscription to unlock mentors. You pay per session.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-stone-600">
                  Mentors set their own rates — shown on every profile before you book. Optional paid Bridge plans add
                  unlimited requests and extras, but they&apos;re not required to use the product.
                </p>
                <Link
                    to="/pricing"
                    className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 underline-offset-4 transition hover:text-orange-900 hover:underline ${focusRing} rounded-sm`}
                >
                  See pricing details
                  <span aria-hidden>→</span>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 lg:col-span-2">
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">From</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-stone-900">$25</p>
                  <p className="text-[11px] text-stone-500">per 30 min</p>
                </div>
                <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50/70 to-amber-50/50 p-4 text-center ring-1 ring-orange-300/30">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-800">Avg</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-orange-950">$60</p>
                  <p className="text-[11px] text-orange-900/80">per session</p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Up to</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-stone-900">$150</p>
                  <p className="text-[11px] text-stone-500">senior mentors</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
  );
}

function FinalCTA() {
  const { user } = useAuth();
  return (
      <section id="get-started" aria-labelledby="final-cta-heading" className="scroll-mt-20 px-4 pb-24 pt-10 sm:px-6 sm:pb-28 lg:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-600 via-amber-500 to-orange-700 px-8 py-16 text-center shadow-bridge-glow ring-1 ring-white/20 sm:px-14 sm:py-20">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
            <div aria-hidden className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-300/20 blur-2xl" />

            <h2
                id="final-cta-heading"
                className="relative font-display text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-[2.6rem] lg:leading-[1.12]"
            >
              One conversation with the right person changes things.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg leading-relaxed text-orange-50/95">
              Free to sign up. Free to browse. Pay only when you book.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {user ? (
                  <>
                    <Link
                        to="/mentors"
                        className={`inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-orange-700 shadow-lg transition hover:bg-orange-50 sm:w-auto ${focusRingWhite}`}
                    >
                      Browse mentors
                    </Link>
                    <Link
                        to="/dashboard"
                        className={`inline-flex w-full items-center justify-center rounded-full border-2 border-white/45 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 sm:w-auto ${focusRingWhite}`}
                    >
                      Go to dashboard
                    </Link>
                  </>
              ) : (
                  <>
                    <Link
                        to="/register"
                        className={`inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-orange-700 shadow-lg transition hover:bg-orange-50 sm:w-auto ${focusRingWhite}`}
                    >
                      Sign up free
                    </Link>
                    <Link
                        to="/mentors"
                        className={`inline-flex w-full items-center justify-center rounded-full border-2 border-white/45 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 sm:w-auto ${focusRingWhite}`}
                    >
                      Just show me mentors
                    </Link>
                  </>
              )}
            </div>
          </div>
        </Reveal>
      </section>
  );
}

export default function Landing() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    void (async () => {
      const { data } = await getFeaturedMentors();
      if (cancelled) return;
      setFeatured(data ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const spotlightMentor = useMemo(() => {
    if (!featured || featured.length === 0) return null;
    return featured[0];
  }, [featured]);

  return (
      <main id="main-content" aria-label="Bridge — home" className="overflow-x-hidden">
        <Hero />
        <FeaturedMentor mentor={spotlightMentor} loading={loading} />
        <HowItWorks />
        <WhyBridge />
        <Outcomes />
        <PricingBlock />
        <FinalCTA />
      </main>
  );
}