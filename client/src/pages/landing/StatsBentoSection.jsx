import RevealOnScroll from './RevealOnScroll';
import TiltCard from './TiltCard';
import StatCell from './StatCell';

export default function StatsBentoSection() {
  return (
    <section className="relative overflow-hidden py-28 bg-gradient-to-b from-[var(--bridge-canvas)] via-orange-50/10 to-[var(--bridge-canvas)]">
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <div className="mb-12 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[var(--bridge-accent)]">By the numbers</p>
              <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-[var(--bridge-text)] sm:text-3xl md:text-4xl lg:text-5xl">
                A platform people <span className="text-gradient-bridge">actually use</span>
              </h2>
            </div>
            <p className="max-w-xs text-[12px] leading-relaxed text-[var(--bridge-text-muted)]">
              No vanity metrics. Just signal: people show up, book again, and recommend.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:auto-rows-[176px]">
          {/* Featured mentor network cell — spans 2 rows */}
          <RevealOnScroll delay={0} className="col-span-2 lg:row-span-2">
            <TiltCard n={4} className="group relative h-full overflow-hidden rounded-3xl border border-orange-500/22 bg-[var(--bridge-surface)] p-7 sm:p-9 shadow-bridge-glow">
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 80% at 100% 100%,rgba(234,88,12,.08),transparent 70%)' }} />
              <div className="relative flex h-full flex-col justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-55" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bridge-accent)]">Mentor network</p>
                </div>
                <StatCell target={2400} suffix="+" label="Vetted mentors across 60+ industries" accent="from-orange-500 to-amber-400" />
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[['MC', 'from-amber-400 to-orange-500'], ['JR', 'from-orange-400 to-rose-500'], ['EV', 'from-rose-400 to-pink-500'], ['MK', 'from-emerald-400 to-teal-500']].map(([initials, grad]) => (
                      <div key={initials} className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--bridge-surface)] bg-gradient-to-br ${grad} text-[9px] font-bold text-white`}>
                        {initials}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-[var(--bridge-text-muted)]">
                    <span className="font-bold text-[var(--bridge-text)]">12 new</span> joined this week
                  </p>
                </div>
              </div>
            </TiltCard>
          </RevealOnScroll>

          <RevealOnScroll delay={120}>
            <TiltCard n={3} className="relative h-full overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/30 hover:shadow-bridge-glow">
              <div className="relative flex h-full flex-col justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--bridge-text-muted)]">Total bookings</p>
                <StatCell target={4800} suffix="+" label="Sessions booked" accent="from-orange-500 to-amber-400" />
              </div>
            </TiltCard>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <TiltCard n={3} className="relative h-full overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/30 hover:shadow-bridge-glow">
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map(i => (
                    <svg key={i} className="h-3 w-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <StatCell target={4.9} suffix="/5" label="Average rating" accent="from-orange-500 to-amber-400" decimal />
              </div>
            </TiltCard>
          </RevealOnScroll>

          <RevealOnScroll delay={280}>
            <TiltCard n={3} className="relative h-full overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/30 hover:shadow-bridge-glow">
              <div className="relative flex h-full flex-col justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--bridge-text-muted)]">Recommend</p>
                <StatCell target={97} suffix="%" label="Would recommend" accent="from-orange-500 to-amber-400" />
              </div>
            </TiltCard>
          </RevealOnScroll>

          <RevealOnScroll delay={360}>
            <TiltCard n={3} className="relative h-full overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/30 hover:shadow-bridge-glow">
              <div className="relative flex h-full flex-col justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--bridge-text-muted)]">Response time</p>
                <StatCell target={11} suffix=" min" label="Avg time to first reply" accent="from-orange-500 to-amber-400" />
              </div>
            </TiltCard>
          </RevealOnScroll>
        </div>

        {/* Footer stats strip */}
        <RevealOnScroll delay={420}>
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-5 sm:grid-cols-4 sm:gap-6 sm:px-8">
            {[
              { k: '$2.1M+', v: 'in offer increases unlocked' },
              { k: '47', v: 'industries covered' },
              { k: '92%', v: 'rebook within 30 days' },
              { k: '24/7', v: 'global mentor coverage' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-1 border-b border-[var(--bridge-border)] pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3 last:border-0">
                <p className="font-display text-2xl font-black tabular-nums text-[var(--bridge-text)] sm:text-3xl">{s.k}</p>
                <p className="text-[11px] text-[var(--bridge-text-muted)] leading-tight">{s.v}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
