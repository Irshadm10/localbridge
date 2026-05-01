import RevealOnScroll from './RevealOnScroll';
import TiltCard from './TiltCard';

const STEPS = [
  {
    num: '01',
    chip: '"PM at a Series B"',
    time: '10 sec',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" strokeLinecap="round" />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
    title: 'Tell us your goal',
    desc: 'Plain English. Our AI searches 2,400+ professionals and ranks the exact few most likely to move the needle.',
    accent: 'from-orange-500 to-amber-400',
    ring: 'ring-orange-500/22',
  },
  {
    num: '02',
    chip: '98% match · $60/session',
    time: '30 sec',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Pick your mentor',
    desc: 'Real bios, honest reviews, exact rates — all visible before you commit. No surprises.',
    accent: 'from-amber-400 to-orange-400',
    ring: 'ring-amber-500/22',
  },
  {
    num: '03',
    chip: 'Session confirmed ✓',
    time: '13 sec',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" />
        <path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Book and get unstuck',
    desc: 'Real-time availability. Built-in video room. No Zoom links, no scheduling back-and-forth.',
    accent: 'from-emerald-400 to-teal-500',
    ring: 'ring-emerald-500/22',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how" className="relative overflow-hidden py-28 bg-[var(--bridge-canvas)]">
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <div className="mb-16 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">How it works</p>
              <h2 className="mt-3 font-display font-black leading-[0.96] tracking-[-0.025em] text-[var(--bridge-text)]"
                style={{ fontSize: 'clamp(2rem, min(5vw, 4.5rem), 4.5rem)' }}>
                Three steps.<br /><span className="text-gradient-bridge">One hour.</span> Real momentum.
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-65" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Avg. time-to-session: <span className="font-black">53 sec</span>
            </div>
          </div>
        </RevealOnScroll>

        <div className="relative grid gap-5 sm:grid-cols-3">
          {/* Animated flow line connecting steps */}
          <div aria-hidden className="pointer-events-none absolute top-[110px] left-[16%] right-[16%] hidden h-[2px] sm:block overflow-hidden rounded-full">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,transparent 0%,rgba(234,88,12,.18) 18%,rgba(234,88,12,.18) 82%,transparent 100%)' }} />
            <div className="absolute inset-y-0 w-1/3 b-pulse-flow" style={{ background: 'linear-gradient(90deg,transparent 0%,rgba(234,88,12,.85) 50%,transparent 100%)' }} />
          </div>

          {STEPS.map((step, i) => (
            <RevealOnScroll key={i} delay={i * 140}>
              <TiltCard n={5} className="group relative h-full overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-card hover:border-orange-500/30 hover:shadow-bridge-glow transition-all">
                <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%,rgba(234,88,12,.06),transparent 70%)' }} />
                <div className={`pointer-events-none absolute -top-2 -right-2 font-display text-[8.5rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br ${step.accent} opacity-[0.07] transition-all duration-700 group-hover:opacity-[0.18] group-hover:scale-110`}>
                  {step.num}
                </div>
                <div className="relative">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.accent} text-white shadow-[0_8px_28px_rgba(234,88,12,.32)] ring-2 ${step.ring}`}>
                    {step.icon}
                  </div>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className={`font-display text-xs font-black text-transparent bg-clip-text bg-gradient-to-r ${step.accent}`}>{step.num}</span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-faint)]">• {step.time}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold tracking-tight text-[var(--bridge-text)]">{step.title}</h3>
                  <p className="mt-2 text-[13px] text-[var(--bridge-text-muted)] leading-relaxed">{step.desc}</p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/60 px-3 py-1.5 text-[10px] font-bold text-[var(--bridge-text-secondary)]">
                    <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-br ${step.accent}`} />{step.chip}
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
