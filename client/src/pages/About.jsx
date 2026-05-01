import { Link } from 'react-router-dom';
import { Sparkles, Scale, Target, ShieldCheck, Linkedin, Github, Mail } from 'lucide-react';
import Reveal from '../components/Reveal';
import { focusRing, pageShell } from '../ui';

const VALUES = [
  {
    title: 'Authenticity',
    desc: 'Real mentors, real experience, real outcomes. No gurus, no grifters — just people who already did the thing.',
    icon: Sparkles,
    accent: 'from-orange-500 to-amber-400',
    text: 'text-orange-700 dark:text-orange-300',
  },
  {
    title: 'Accessibility',
    desc: "Quality mentorship shouldn't be reserved for the privileged few. Every session is a discrete purchase, not a package.",
    icon: Scale,
    accent: 'from-amber-500 to-yellow-400',
    text: 'text-amber-700 dark:text-amber-300',
  },
  {
    title: 'Impact',
    desc: 'We measure ourselves by outcomes — offers, promotions, transitions, clarity — not vanity metrics.',
    icon: Target,
    accent: 'from-rose-500 to-orange-400',
    text: 'text-rose-700 dark:text-rose-300',
  },
  {
    title: 'Trust',
    desc: 'Every mentor is vetted. Every review is real. Every payment is held until the session is complete.',
    icon: ShieldCheck,
    accent: 'from-emerald-500 to-teal-400',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
];

const TEAM = [
  { name: 'Muaz S', role: 'Product & engineering', hue: 'from-orange-400 via-amber-400 to-rose-400', tag: 'MS' },
  { name: 'Ahmet Y', role: 'Growth & partnerships', hue: 'from-sky-400 via-indigo-400 to-violet-400', tag: 'AY' },
  { name: 'Aayush P', role: 'Design & brand', hue: 'from-emerald-400 via-teal-400 to-sky-400', tag: 'AP' },
  { name: 'Omar A', role: 'Mentor experience', hue: 'from-amber-400 via-orange-400 to-rose-400', tag: 'OA' },
  { name: 'Irshad M', role: 'Community & ops', hue: 'from-fuchsia-400 via-pink-400 to-orange-400', tag: 'IM' },
];

const STATS = [
  { v: '2,400+', l: 'Vetted mentors' },
  { v: '4,800+', l: 'Sessions booked' },
  { v: '4.9', l: 'Avg rating' },
  { v: '50+', l: 'Industries covered' },
];

export default function About() {
  return (
    <main className={`${pageShell}`}>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-20%] -z-10 h-[70vmax] w-[70vmax] -translate-x-1/2 opacity-60 dark:opacity-80"
          style={{
            background:
              'conic-gradient(from 200deg at 50% 50%, rgba(251,146,60,0.16), rgba(253,230,138,0.12), rgba(234,88,12,0.2), rgba(251,146,60,0.16))',
            filter: 'blur(90px)',
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.06] mix-blend-overlay dark:opacity-[0.12]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 shadow-sm backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span aria-hidden className="absolute inline-flex h-full w-full rounded-full bg-orange-400/70 animate-pulse-soft" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-secondary)]">About Bridge</span>
            </div>
            <h1 className="font-editorial text-balance text-[3rem] font-normal leading-[0.98] tracking-[-0.024em] text-[var(--bridge-text)] sm:text-[4rem] sm:leading-[0.96] lg:text-[5rem]">
              Careers change in{' '}
              <span className="relative inline-block">
                <span className="relative z-10 font-editorial italic text-gradient-bridge">conversation</span>
                <span aria-hidden className="absolute bottom-1 left-0 right-0 -z-0 h-[0.35em] -rotate-1 bg-[var(--landing-hero-highlight)]" />
              </span>
              , not in courses.
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-[var(--bridge-text-secondary)] sm:text-xl sm:leading-[1.55]">
              Bridge exists because the best career advice rarely comes from books —
              it comes from someone who already did what you're about to try.
            </p>
          </Reveal>

          <Reveal delay={140}>
            <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {STATS.map((s) => (
                <div
                  key={s.l}
                  className="group rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-4 text-center shadow-bridge-tile backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-bridge-card cursor-glow"
                >
                  <dt className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-muted)]">{s.l}</dt>
                  <dd className="mt-2 font-display text-2xl font-semibold tabular-nums text-[var(--bridge-text)] sm:text-3xl">{s.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── Mission + Story (editorial split) ───────────────────────── */}
      <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-5 lg:gap-8">
          <Reveal className="lg:col-span-3">
            <article className="group relative h-full overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-8 shadow-bridge-card sm:p-10">
              <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br from-orange-400/25 to-amber-300/10 blur-3xl" />
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-700 dark:text-orange-300">Our mission</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-[var(--bridge-text)] sm:text-4xl">
                Democratize access to <span className="font-editorial italic text-gradient-bridge">the right conversation</span>.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[var(--bridge-text-secondary)] sm:text-lg">
                The right ten minutes with the right person can alter the trajectory of a life. We're making those ten minutes
                bookable — no cold DMs, no monthly retainer, no gatekeeping. Just a direct line to practitioners who've
                already done the job you're trying to do.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {['Single sessions', 'Vetted mentors', 'Clear pricing', 'Real reviews'].map((t) => (
                  <span key={t} className="rounded-full border border-orange-200/70 bg-orange-50/80 px-3 py-1 text-xs font-medium text-orange-900 dark:bg-orange-950/40 dark:text-orange-100">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-2">
            <article className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-orange-300/30 bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 p-8 text-amber-50 shadow-bridge-float sm:p-9">
              <div aria-hidden className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/25 blur-3xl" />
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200/90">Our story</p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">Started in 2026 with a simple observation.</h2>
              <p className="relative mt-5 border-l-2 border-amber-400/40 pl-5 text-base leading-relaxed text-stone-200">
                Cold DMs go unanswered. Coaching packages cost thousands. The people with real answers weren't reachable —
                so we made them reachable, one hour at a time.
              </p>
              <div className="mt-auto pt-7 text-xs text-amber-100/80">— Founders, Bridge</div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────── */}
      <section className="relative border-y border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-bridge">
          <Reveal className="mb-14 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-700 dark:text-orange-300">What we believe</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-[var(--bridge-text)] sm:text-5xl">
              Values we <span className="font-editorial italic text-gradient-bridge">actually</span> use.
            </h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-tile transition duration-500 hover:-translate-y-1 hover:shadow-bridge-card cursor-glow">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${v.accent} text-white shadow-[0_8px_22px_-6px_rgba(234,88,12,0.45)] transition-transform group-hover:scale-105`}>
                    <v.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <p className={`mt-5 text-[11px] font-bold uppercase tracking-[0.2em] ${v.text}`}>Principle 0{i + 1}</p>
                  <p className="mt-1 font-display text-xl font-semibold text-[var(--bridge-text)]">{v.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--bridge-text-secondary)]">{v.desc}</p>
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent opacity-0 transition group-hover:opacity-100" />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ────────────────────────────────────────────────────── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-bridge">
          <Reveal className="mb-14 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-700 dark:text-orange-300">Leadership</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-[var(--bridge-text)] sm:text-5xl">
                The people <span className="font-editorial italic text-gradient-bridge">behind</span> Bridge.
              </h2>
            </div>
            <p className="text-sm text-[var(--bridge-text-muted)] sm:max-w-xs sm:text-right">
              Mentorship from professionals helped us, as founders, get to where we are today.
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={i * 70}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 shadow-bridge-tile transition duration-500 hover:-translate-y-1 hover:shadow-bridge-card cursor-glow">
                  {/* Portrait placeholder */}
                  <div className={`relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-br ${m.hue}`}>
                    <div aria-hidden className="absolute inset-0 bg-bridge-noise opacity-[0.25] mix-blend-overlay" />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                      {m.tag}
                    </span>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5">
                      <a
                        href="#"
                        aria-label={`${m.name} on LinkedIn`}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white backdrop-blur-md transition hover:bg-white/35 ${focusRing}`}
                      >
                        <Linkedin className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href="#"
                        aria-label={`${m.name} on GitHub`}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white backdrop-blur-md transition hover:bg-white/35 ${focusRing}`}
                      >
                        <Github className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href="#"
                        aria-label={`Email ${m.name}`}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white backdrop-blur-md transition hover:bg-white/35 ${focusRing}`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="font-display text-lg font-semibold text-[var(--bridge-text)]">{m.name}</p>
                    <p className="mt-0.5 text-sm font-medium text-orange-700 dark:text-orange-300">{m.role}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="px-4 pb-28 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-600 via-amber-500 to-orange-700 px-8 py-16 text-center shadow-bridge-glow ring-1 ring-white/25 sm:px-14 sm:py-20">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.14] mix-blend-overlay" />
            <div aria-hidden className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-300/25 blur-2xl" />
            <h2 className="relative font-display text-balance text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.6rem]">
              Ready to find your person?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-orange-50/95">
              Free to browse. Pay only when you book.
            </p>
            <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/mentors"
                className={`btn-sheen inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-orange-700 shadow-[0_12px_36px_-8px_rgba(28,25,23,0.25)] transition hover:-translate-y-0.5 hover:bg-orange-50 hover:shadow-[0_18px_44px_-10px_rgba(28,25,23,0.35)] ${focusRing}`}
              >
                Browse mentors <span aria-hidden>→</span>
              </Link>
              <Link
                to="/register"
                className={`inline-flex items-center gap-2 rounded-full border-2 border-white/45 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 ${focusRing}`}
              >
                Sign up free
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
