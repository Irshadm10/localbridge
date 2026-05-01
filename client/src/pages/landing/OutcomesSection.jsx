import { OUTCOMES, AVATAR_GRAD } from './landingData';
import RevealOnScroll from './RevealOnScroll';

export default function OutcomesSection() {
  return (
    <section id="outcomes" className="relative overflow-hidden py-24 bg-gradient-to-b from-[var(--bridge-canvas)] to-[var(--bridge-canvas)]">
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <RevealOnScroll>
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[var(--bridge-accent)]">Real outcomes</p>
              <h2 className="mt-2 font-display font-black tracking-[-0.02em] text-[var(--bridge-text)]"
                style={{ fontSize: 'clamp(1.8rem,4vw,3rem)' }}>
                People who got <span className="text-gradient-bridge">unstuck</span>.
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2 text-[11px] font-bold text-[var(--bridge-text-muted)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-65" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>97% would recommend</span>
            </div>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OUTCOMES.map((o, i) => (
            <RevealOnScroll key={i} delay={i * 60}>
              <div className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/28 hover:shadow-bridge-glow transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5">
                    {[0, 1, 2, 3, 4].map(k => (
                      <svg key={k} className="h-3 w-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-2.5 py-1 text-[9px] font-bold text-[var(--bridge-text-muted)] whitespace-nowrap">
                    {o.result}
                  </span>
                </div>
                <p className="flex-1 text-[13px] text-[var(--bridge-text-muted)] leading-relaxed">&ldquo;{o.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 pt-4 border-t border-[var(--bridge-border)]">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[o.tone]} text-[10px] font-bold text-white`}>
                    {o.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-bold text-[var(--bridge-text)]">{o.name}</p>
                    <p className="truncate text-[10px] text-[var(--bridge-text-faint)]">{o.role}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-[var(--bridge-accent)] whitespace-nowrap">{o.metric}</span>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
