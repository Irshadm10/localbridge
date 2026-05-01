import RevealOnScroll from './RevealOnScroll';
import TiltCard from './TiltCard';

const PROMISE_CARDS = [
  {
    icon: '⚡',
    title: 'One session at a time',
    desc: 'No packages, no lock-ins. Pay for exactly what you need.',
    extra: (
      <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-[var(--bridge-text-faint)]">
        <span className="line-through opacity-50">3-month pkg</span>
        <svg className="h-3 w-3 text-[var(--bridge-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[var(--bridge-accent)]">1 hour</span>
      </div>
    ),
  },
  {
    icon: '💵',
    title: 'Price on every profile',
    desc: 'No "contact us for pricing" opacity. Rates are front and center.',
  },
  {
    icon: '💬',
    title: 'Unfiltered reviews',
    desc: 'All reviews published — good and critical. No curation.',
  },
  {
    icon: '🎥',
    title: 'Built-in video, zero friction',
    desc: 'Custom room auto-generated per session. No Zoom links needed.',
  },
  {
    icon: '🎯',
    title: 'Sessions with a structure',
    desc: 'Four named formats so you walk in knowing what you'll walk out with.',
    extra: (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {['Career Advice', 'Interview Prep', 'Resume Review', 'Networking'].map(t => (
          <span key={t} className="rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--bridge-text-muted)]">{t}</span>
        ))}
      </div>
    ),
    wide: true,
  },
];

export default function ManifestoSection() {
  return (
    <section className="relative overflow-hidden py-24 bg-[var(--bridge-canvas)]">
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <div className="mb-12 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">Why Bridge works</p>
              <h2 className="mt-3 font-display font-black leading-[1.02] tracking-tight text-[var(--bridge-text)]"
                style={{ fontSize: 'clamp(1.75rem, min(4.5vw, 3.5rem), 3.5rem)' }}>
                Six promises.<br /><span className="text-gradient-bridge">Zero exceptions.</span>
              </h2>
            </div>
            <p className="max-w-xs text-[12px] leading-relaxed text-[var(--bridge-text-muted)]">
              Built around the things career platforms keep getting wrong — because we lived through them too.
            </p>
          </div>
        </RevealOnScroll>

        {/* Featured promise */}
        <RevealOnScroll delay={0}>
          <TiltCard n={3} className="group relative overflow-hidden rounded-3xl border border-orange-500/22 bg-[var(--bridge-surface)] p-7 sm:p-9 shadow-bridge-glow mb-4">
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 70% at 100% 0%,rgba(234,88,12,.08),transparent 70%)' }} />
            <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/22 bg-orange-500/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--bridge-accent)] mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400" /> The filter
                </div>
                <h3 className="font-display text-2xl font-black leading-tight text-[var(--bridge-text)] sm:text-3xl">
                  Only people who've <span className="text-gradient-bridge">done your job</span>.
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--bridge-text-muted)]">
                  Every mentor has lived the exact role you're targeting. We filter on outcome, not credentials. No generic coaches, no unverified bios.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:max-w-[220px]">
                {['PMs at Series B+', 'EMs at hyperscalers', 'RNs → UX', 'VPs of Sales', 'Founders post-YC', 'Top studios'].map(t => (
                  <span key={t} className="rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-2.5 py-1 text-[10px] font-medium text-[var(--bridge-text-muted)]">{t}</span>
                ))}
              </div>
            </div>
          </TiltCard>
        </RevealOnScroll>

        {/* Supporting promise cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROMISE_CARDS.map((card, i) => (
            <RevealOnScroll key={i} delay={80 + i * 60} className={card.wide ? 'sm:col-span-1 lg:col-span-2' : ''}>
              <TiltCard n={3} className="group relative h-full overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/28 hover:shadow-bridge-glow transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bridge-surface-muted)] text-xl ring-1 ring-[var(--bridge-border)]">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--bridge-text)]">{card.title}</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--bridge-text-muted)]">{card.desc}</p>
                    {card.extra}
                  </div>
                </div>
              </TiltCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
