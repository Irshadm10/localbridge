import { WHY_ROWS } from './landingData';
import RevealOnScroll from './RevealOnScroll';

const COLUMN_HEADERS = [
  { label: 'LinkedIn DMs', sub: 'Cold outreach' },
  { label: 'Life Coaching', sub: 'Generic advice' },
  { label: 'Bridge', sub: 'Done-it mentors', best: true },
];

export default function ComparisonSection() {
  return (
    <section className="relative overflow-hidden py-24 bg-[var(--bridge-canvas)]">
      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
        <RevealOnScroll>
          <div className="mb-12 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">Why not just DM on LinkedIn?</p>
              <h2 className="mt-3 font-display font-black leading-[1] tracking-[-0.025em] text-[var(--bridge-text)]"
                style={{ fontSize: 'clamp(1.85rem, min(4.8vw, 3.8rem), 3.8rem)' }}>
                Bridge vs<br /><span className="text-gradient-bridge">the alternatives</span>
              </h2>
            </div>
            <p className="max-w-xs text-[12px] leading-relaxed text-[var(--bridge-text-muted)]">
              Side-by-side, decided in a minute. The same six questions you'd ask any platform — just answered honestly.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={120}>
          <div className="relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-card">
            {/* Bridge column glow */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/4 hidden sm:block"
              style={{ background: 'linear-gradient(180deg,rgba(234,88,12,.05),rgba(234,88,12,.02) 50%,rgba(234,88,12,.06))' }} />

            {/* Table header */}
            <div className="relative grid grid-cols-4 border-b-2 border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/40">
              <div className="px-5 py-5">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--bridge-text-faint)]">Compare on</p>
              </div>
              {COLUMN_HEADERS.map(h => (
                <div key={h.label} className={`border-l border-[var(--bridge-border)] px-4 py-5 text-center ${h.best ? 'bg-orange-500/[0.04]' : ''}`}>
                  {h.best ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-black text-orange-500 tracking-tight">{h.label}</span>
                        <span className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-widest shadow-[0_0_18px_rgba(234,88,12,.45)]">Best</span>
                      </div>
                      <span className="text-[10px] font-semibold text-orange-400/80">{h.sub}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[12px] font-bold text-[var(--bridge-text-muted)] tracking-tight">{h.label}</span>
                      <span className="text-[9px] text-[var(--bridge-text-faint)]">{h.sub}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {WHY_ROWS.map((row, i) => (
              <div key={i} className={`relative grid grid-cols-4 border-b border-[var(--bridge-border)]/35 last:border-0 transition-colors hover:bg-[var(--bridge-surface-muted)]/20 ${i % 2 === 0 ? '' : 'bg-[var(--bridge-surface-muted)]/14'}`}>
                <div className="px-5 py-5 text-[13px] font-bold text-[var(--bridge-text)] flex items-center">{row.label}</div>
                {[
                  { v: row.dm, best: false },
                  { v: row.coaching, best: false },
                  { v: row.bridge, best: true },
                ].map((cell, j) => (
                  <div key={j} className={`relative border-l border-[var(--bridge-border)]/30 px-4 py-5 text-center text-[12.5px] transition-all ${cell.best ? 'font-bold text-orange-600 dark:text-orange-400' : 'text-[var(--bridge-text-muted)]'}`}>
                    {cell.best && cell.v !== '—' ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
                          <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {cell.v}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {cell.v !== '—' && cell.v !== 'No' && cell.v !== 'None' && !cell.v.startsWith('~') ? (
                          <span className="h-1 w-1 rounded-full bg-[var(--bridge-text-faint)]" />
                        ) : (
                          <svg className="h-3 w-3 text-red-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                          </svg>
                        )}
                        {cell.v}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Summary footer */}
            <div className="relative grid grid-cols-4 border-t-2 border-[var(--bridge-border)] bg-orange-500/[0.04]">
              <div className="px-5 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--bridge-text-faint)]">Summary</div>
              <div className="border-l border-[var(--bridge-border)] px-4 py-4 text-center text-[11px] font-semibold text-red-400/80">High effort · low signal</div>
              <div className="border-l border-[var(--bridge-border)] px-4 py-4 text-center text-[11px] font-semibold text-amber-500/80">Generic · expensive</div>
              <div className="border-l border-[var(--bridge-border)] px-4 py-4 text-center text-[11px] font-black text-orange-500">Targeted · transparent</div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
