import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import MagneticWrapper from './MagneticWrapper';

export default function HeroSection({ user, isDark, ready }) {
  const headRef = useRef(null);

  useEffect(() => {
    if (!ready || !headRef.current) return;
    const words = headRef.current.querySelectorAll('[data-w]');
    gsap.fromTo(words,
      { y: 60, opacity: 0, rotateX: -25 },
      { y: 0, opacity: 1, rotateX: 0, duration: 1.1, ease: 'power4.out', stagger: 0.09, delay: 0.1, transformOrigin: '0% 50%' }
    );
  }, [ready]);

  return (
    <section className="relative flex flex-col overflow-hidden min-h-[90vh]">
      {/* Mesh gradient background */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#0c0906] via-[#111009] to-[#070604]' : 'bg-gradient-to-br from-stone-50 via-orange-50/60 to-amber-50/40'}`} />
        <div className={`absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full blur-[60px] opacity-60 ${isDark ? 'bg-gradient-to-br from-orange-500/12 to-amber-500/8' : 'bg-gradient-to-br from-orange-400/20 to-amber-300/15'}`} />
        <div className={`absolute top-[30%] right-[5%] w-[300px] h-[300px] rounded-full blur-[50px] opacity-50 ${isDark ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/6' : 'bg-gradient-to-br from-amber-400/15 to-orange-300/10'}`} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--bridge-canvas)] to-transparent z-[1]" />

      {/* Top utility bar */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-4 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 backdrop-blur-xl transition-all duration-700 ${isDark ? 'border-white/[0.08] bg-white/[0.03]' : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)]'} ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-65" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
            </span>
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/45' : 'text-[var(--bridge-text-muted)]'}`}>
              Live · 2,400+ vetted
            </span>
          </div>
          <div className={`hidden md:flex items-center gap-3 transition-all duration-700 delay-200 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <svg key={i} className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className={`text-[11px] font-semibold ${isDark ? 'text-white/55' : 'text-[var(--bridge-text-secondary)]'}`}>
              <span className={`font-bold ${isDark ? 'text-white/85' : 'text-[var(--bridge-text)]'}`}>4.9</span> · 4,800+ sessions
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-1 flex-col justify-start px-5 pt-8 pb-8 sm:px-8 lg:pb-12">
        {/* Headline */}
        <div ref={headRef} style={{ perspective: '1000px', overflow: 'hidden' }}>
          <h1
            className={`font-display font-black leading-[0.92] tracking-[-0.03em] text-center ${isDark ? 'text-white/75' : 'text-[var(--bridge-text)]'}`}
            style={{ fontSize: 'clamp(3rem, min(8vw, 8rem), 8rem)' }}
          >
            <span data-w>Your next</span>
            <span data-w className={isDark ? 'shimmer-text' : 'text-gradient-bridge'}
              style={isDark ? { filter: 'drop-shadow(0 0 80px rgba(234,88,12,.6))' } : {}}>
              career move
            </span>
            <span data-w>starts with</span>
            <span data-w className={`font-editorial italic ${isDark ? 'text-white/22' : 'text-[var(--bridge-text-faint)]'}`} style={{ fontSize: '0.78em' }}>
              one conversation.
            </span>
          </h1>
        </div>

        {/* Description + CTAs */}
        <div className={`mt-6 flex flex-col items-center text-center transition-all duration-1000 delay-500 sm:mt-8 lg:mt-10 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="max-w-xl text-[0.95rem] leading-relaxed text-[var(--bridge-text-muted)] sm:text-[1.05rem]">
            Real mentors. Real sessions. Real outcomes. Skip the cold messages — book a 1-on-1 with someone who's already walked your path.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8 sm:gap-4">
            <MagneticWrapper>
              <Link
                to={user ? '/mentors' : '/register'}
                data-cursor="Start"
                className="b-pulse btn-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-[0.9rem] font-bold text-white shadow-[0_0_40px_rgba(234,88,12,.45)] transition-all hover:scale-[1.05] hover:shadow-[0_0_70px_rgba(234,88,12,.7)] active:scale-[0.97] sm:gap-3 sm:px-9 sm:py-4 sm:text-[0.95rem]"
              >
                Find your mentor
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </MagneticWrapper>
            <MagneticWrapper>
              <Link
                to="/mentors"
                data-cursor="Browse"
                className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-[0.9rem] font-semibold transition-all sm:px-8 sm:py-4 sm:text-[0.95rem] ${isDark ? 'border-white/[0.10] bg-white/[0.04] hover:border-white/[0.18] hover:bg-white/[0.07]' : 'border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] hover:border-orange-500/40 hover:shadow-bridge-card'}`}
                style={{ color: isDark ? 'rgba(255,255,255,.55)' : 'var(--bridge-text)' }}
              >
                Browse mentors →
              </Link>
            </MagneticWrapper>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1">
            {['No credit card required', 'First session guaranteed', 'Cancel anytime'].map((t, i) => (
              <span key={i} className="flex items-center gap-2 text-[10px] text-[var(--bridge-text-faint)]">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-[var(--bridge-border-strong)]" />}{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
