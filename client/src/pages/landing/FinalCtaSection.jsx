import { Link } from 'react-router-dom';
import RevealOnScroll from './RevealOnScroll';
import MagneticWrapper from './MagneticWrapper';

const GUARANTEE_BADGES = [
  { icon: '💳', label: 'No credit card', sub: 'Sign up free · pay per session' },
  { icon: '🛡️', label: 'First session guaranteed', sub: "Full refund if it isn't a fit" },
  { icon: '🔓', label: 'Cancel any time', sub: 'No subscriptions, ever' },
];

export default function FinalCtaSection({ user }) {
  return (
    <section id="start" className="relative overflow-hidden py-24 sm:py-32 lg:py-40" style={{ backgroundColor: 'var(--bridge-hero-bg)' }}>
      {/* Grid background */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(rgba(234,88,12,.038) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,.038) 1px,transparent 1px)', backgroundSize: '88px 88px' }} />

      {/* Center glow blob */}
      <div aria-hidden className="b-blob pointer-events-none absolute left-1/2 top-1/2 h-[960px] w-[960px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle,rgba(234,88,12,.3) 0%,rgba(234,88,12,.05) 42%,transparent 68%)' }} />

      {/* Concentric portal rings */}
      {[820, 640, 460, 300].map((size, i) => (
        <div key={i} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
          <div style={{
            width: size, height: size, borderRadius: '50%',
            border: `1px solid rgba(234,88,12,${0.16 - i * 0.025})`,
            animation: `bPortal ${12 + i * 3}s linear infinite ${i % 2 ? 'reverse' : ''}`,
            boxShadow: `0 0 ${30 + i * 8}px rgba(234,88,12,${0.1 - i * 0.018})`,
          }} />
        </div>
      ))}

      {/* Floating ember dots */}
      {[[12, 18, 1], [78, 32, 2], [24, 72, 1.5], [88, 68, 1.2], [52, 12, 1.8], [66, 84, 1.3]].map(([x, y, d], i) => (
        <span key={i} aria-hidden className="b-float pointer-events-none absolute hidden lg:block" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `-${d}s` }}>
          <span className="flex h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_18px_rgba(234,88,12,.85)]" />
        </span>
      ))}

      <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.022]" />

      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8">
        <RevealOnScroll>
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-orange-500/22 bg-orange-500/8 px-5 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-55" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-400/85">Ready to get unstuck?</span>
          </div>

          <h2 className="font-display font-black leading-[0.86] tracking-[-0.035em] text-white"
            style={{ fontSize: 'clamp(2.2rem, min(6.5vw, 5.5rem), 5.5rem)' }}>
            One conversation<br />
            <span className="shimmer-text" style={{ filter: 'drop-shadow(0 0 55px rgba(234,88,12,.7))' }}>
              changes everything.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed sm:mt-7 sm:text-base" style={{ color: 'rgba(255,255,255,.42)' }}>
            Stop spinning. Book a session with someone who's walked the exact path you're on — and made it through.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-11 sm:gap-4">
            <MagneticWrapper>
              <Link
                to={user ? '/mentors' : '/register'}
                data-cursor="Start"
                className="btn-sheen b-pulse inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-sm font-bold text-white shadow-[0_0_88px_rgba(234,88,12,.65)] transition hover:scale-[1.05] hover:shadow-[0_0_120px_rgba(234,88,12,.9)] active:scale-[.97] sm:gap-3 sm:px-11 sm:py-5 sm:text-base"
              >
                Get started for free
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </MagneticWrapper>
            <MagneticWrapper>
              <Link
                to="/about"
                data-cursor="hover"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-6 py-4 text-sm font-semibold backdrop-blur-sm transition-all hover:border-white/[0.22] hover:bg-white/[0.08] sm:px-7 sm:py-5"
                style={{ color: 'rgba(255,255,255,.65)' }}
              >
                Learn more
                <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </MagneticWrapper>
          </div>

          {/* Guarantee badges */}
          <div className="mt-12 grid gap-2.5 sm:grid-cols-3">
            {GUARANTEE_BADGES.map((b, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 backdrop-blur-xl text-left">
                <span className="text-base">{b.icon}</span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white/80 leading-tight">{b.label}</p>
                  <p className="text-[10px] text-white/35 leading-tight mt-0.5">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
