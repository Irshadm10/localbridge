import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CHROME = 'linear-gradient(160deg,#ffffff 0%,#fef3c7 18%,#fcd34d 35%,#fb923c 55%,#ea580c 75%,#9a3412 100%)';
const BRIDGE_LETTERS = ['B', 'R', 'I', 'D', 'G', 'E'];
const LETTER_STAGGER = [0, 0.06, 0.12, 0.18, 0.24, 0.30];
const LETTER_VECTORS = [
  { sx: '-400px', sy: '-260px', rx: '300deg',  ry: '-180deg', rz: '150deg'  },
  { sx: '360px',  sy: '-180px', rx: '-270deg', ry: '360deg',  rz: '-90deg'  },
  { sx: '-60px',  sy: '340px',  rx: '450deg',  ry: '-90deg',  rz: '200deg'  },
  { sx: '300px',  sy: '220px',  rx: '-360deg', ry: '-240deg', rz: '80deg'   },
  { sx: '-420px', sy: '120px',  rx: '180deg',  ry: '300deg',  rz: '-240deg' },
  { sx: '280px',  sy: '-300px', rx: '-420deg', ry: '-120deg', rz: '280deg'  },
];

const PARTICLES = Array.from({ length: 60 }, (_, i) => {
  const angle = (i / 60) * Math.PI * 2;
  return {
    angle,
    radius: 80 + Math.random() * 120,
    speed: 0.5 + Math.random() * 0.8,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 0.8,
  };
});

const INTRO_CSS = `
  @keyframes introOut{0%{opacity:1;transform:scale(1);filter:blur(0);}50%{opacity:0.6;transform:scale(1.05);filter:blur(4px);}100%{opacity:0;transform:scale(1.12);filter:blur(12px);visibility:hidden;}}
  @keyframes introStageOut{0%{opacity:1;transform:scale(1) perspective(1000px) rotateX(0deg);filter:blur(0);}100%{opacity:0;transform:scale(1.3) perspective(1000px) rotateX(15deg);filter:blur(16px);}}
  @keyframes introExitFlash{0%{opacity:0;}30%{opacity:0.6;}100%{opacity:0;}}
  @keyframes introOrbIn{0%{opacity:0;transform:translate(-50%,-50%) scale(0) rotate(0deg);}100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(360deg);}}
  @keyframes introOrbDrift{0%{transform:translate(-50%,-50%) translate(0,0) rotate(0deg);}25%{transform:translate(-50%,-50%) translate(4vmin,-3vmin) rotate(90deg);}50%{transform:translate(-50%,-50%) translate(-2vmin,2vmin) rotate(180deg);}75%{transform:translate(-50%,-50%) translate(3vmin,-1vmin) rotate(270deg);}100%{transform:translate(-50%,-50%) translate(0,0) rotate(360deg);}}
  @keyframes introHeroIn{0%{opacity:0;transform:scale(0.1) rotateX(90deg) rotateY(45deg) rotateZ(-30deg) translateZ(-200px);filter:blur(40px);}40%{opacity:1;transform:scale(1.2) rotateX(-10deg) rotateY(-15deg) rotateZ(10deg) translateZ(50px);filter:blur(0);}60%{transform:scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px);}100%{opacity:1;transform:scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px);filter:blur(0);}}
  @keyframes introHeroMorph{0%{opacity:1;transform:scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg);filter:blur(0);}30%{opacity:1;transform:scale(1.8) rotateX(20deg) rotateY(-20deg) rotateZ(10deg);filter:blur(2px);}60%{opacity:0.8;transform:scale(2.5) rotateX(45deg) rotateY(-45deg) rotateZ(30deg);filter:blur(8px);}100%{opacity:0;transform:scale(4) rotateX(90deg) rotateY(-90deg) rotateZ(60deg);filter:blur(24px);}}
  @keyframes introLetter3D{0%{opacity:0;transform:translate3d(var(--sx),var(--sy),-1600px) rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(var(--rz)) scale(0.04);filter:blur(50px) brightness(10);}10%{opacity:1;filter:blur(18px) brightness(5);}20%{filter:blur(2px) brightness(2);}40%{transform:translate3d(calc(var(--sx)*-0.13),calc(var(--sy)*-0.10),0px) rotateX(calc(var(--rx)*0.09)) rotateY(calc(var(--ry)*0.09)) rotateZ(calc(var(--rz)*0.06)) scale(1.24);filter:blur(0) brightness(1.8);}55%{transform:translate3d(calc(var(--sx)*0.04),calc(var(--sy)*0.03),0px) rotateX(calc(var(--rx)*-0.02)) rotateY(calc(var(--ry)*-0.02)) rotateZ(0deg) scale(0.94);filter:brightness(1.05);}68%{transform:translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1.06);}80%{transform:translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(0.98);}91%{transform:translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1.01);}100%{opacity:1;transform:translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);filter:blur(0) brightness(1);}}
  @keyframes introParticle{0%{opacity:0;transform:translate(-50%,-50%) rotate(0deg) scale(0);}20%{opacity:1;transform:translate(calc(var(--px)),calc(var(--py))) rotate(180deg) scale(1);}50%{opacity:0.8;transform:translate(calc(var(--px)*1.5),calc(var(--py)*1.5)) rotate(360deg) scale(0.8);}100%{opacity:0;transform:translate(calc(var(--px)*2.5),calc(var(--py)*2.5)) rotate(720deg) scale(0);}}
  @keyframes introShockwave{0%{opacity:0;transform:scale(0.1) rotate(0deg);border-width:8px;}20%{opacity:1;transform:scale(0.5) rotate(45deg);border-width:4px;}100%{opacity:0;transform:scale(3) rotate(180deg);border-width:0px;}}
  @keyframes introFlash{0%,100%{opacity:0;}10%{opacity:0.5;}30%{opacity:0.2;}50%{opacity:0;}}
  @keyframes introScale{0%{opacity:0;transform:scaleX(0) rotateY(90deg);}100%{opacity:1;transform:scaleX(1) rotateY(0deg);}}
  @keyframes introTaglineIn{0%{opacity:0;transform:scale(0.9) translateY(30px) rotateX(-20deg);filter:blur(8px);}50%{opacity:1;filter:blur(0);}70%{transform:scale(1.02) translateY(-5px) rotateX(5deg);}100%{opacity:1;transform:scale(1) translateY(0) rotateX(0deg);filter:blur(0);}}
  @keyframes introGlitch{0%{filter:drop-shadow(-5px 0 0 rgba(255,40,40,.9)) drop-shadow(5px 0 0 rgba(0,220,255,.9)) drop-shadow(0 0 50px rgba(251,191,36,.7));}20%{filter:drop-shadow(-3px 0 0 rgba(255,40,40,.6)) drop-shadow(3px 0 0 rgba(0,220,255,.6)) drop-shadow(0 0 80px rgba(234,88,12,1));}45%{filter:drop-shadow(0 0 60px rgba(251,191,36,1)) drop-shadow(0 0 120px rgba(234,88,12,.7)) drop-shadow(0 3px 0 rgba(255,255,255,.3));}75%{filter:drop-shadow(0 0 35px rgba(251,146,60,.7)) drop-shadow(0 0 70px rgba(234,88,12,.4));}100%{filter:drop-shadow(0 0 20px rgba(234,88,12,.5)) drop-shadow(0 2px 0 rgba(255,255,255,.15));}}
  @keyframes introChromatic{0%,100%{filter:drop-shadow(0 0 0 transparent);}25%{filter:drop-shadow(-2px 0 0 rgba(255,0,0,0.5)) drop-shadow(2px 0 0 rgba(0,255,255,0.5));}50%{filter:drop-shadow(0 0 0 transparent);}75%{filter:drop-shadow(-1px 0 0 rgba(255,0,0,0.3)) drop-shadow(1px 0 0 rgba(0,255,255,0.3));}}
  @media (prefers-reduced-motion: reduce){*{animation-duration:0.01ms!important;animation-iteration-count:1!important;}}
`;

export default function IntroLoader() {
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem('bridge_intro_seen') === '1') {
        setDone(true);
      }
    } catch {
      setDone(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted || done) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const finish = () => {
      try { sessionStorage.setItem('bridge_intro_seen', '1'); } catch {}
      setDone(true);
    };
    const timer = setTimeout(finish, 3800);
    const skip = () => { clearTimeout(timer); finish(); };
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', skip);
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [mounted, done]);

  if (done) return null;

  const dismiss = () => {
    try { sessionStorage.setItem('bridge_intro_seen', '1'); } catch {}
    setDone(true);
  };

  return createPortal(
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 120% 80% at 50% 50%,#1a0d08 0%,#0d0704 40%,#000 100%)',
        animation: 'introOut 0.8s cubic-bezier(.55,0,.2,1) 3.2s forwards',
      }}
    >
      <style>{INTRO_CSS}</style>

      {/* Nebula background */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 150% 100% at 30% 50%,rgba(234,88,12,0.08) 0%,transparent 50%),radial-gradient(ellipse 120% 80% at 70% 50%,rgba(251,146,60,0.06) 0%,transparent 50%)',
      }} />

      {/* Animated gradient orbs */}
      {[
        { x: '25%', y: '30%', c: 'rgba(234,88,12,.28)', s: '52vmin', d: '18s', delay: 0 },
        { x: '75%', y: '70%', c: 'rgba(251,146,60,.22)', s: '58vmin', d: '22s', delay: 0.1 },
        { x: '50%', y: '50%', c: 'rgba(251,191,36,.18)', s: '68vmin', d: '26s', delay: 0.2 },
      ].map((o, i) => (
        <div key={i} aria-hidden className="absolute rounded-full pointer-events-none" style={{
          left: o.x, top: o.y, width: o.s, height: o.s,
          background: `radial-gradient(circle,${o.c} 0%,transparent 70%)`,
          filter: 'blur(60px)',
          opacity: 0,
          animation: `introOrbIn 1s cubic-bezier(.22,1,.36,1) ${0.08 + o.delay}s forwards, introOrbDrift ${o.d} ease-in-out ${1 + o.delay}s infinite`,
        }} />
      ))}

      {/* Particle system */}
      {PARTICLES.map((p, i) => (
        <div key={i} aria-hidden className="absolute rounded-full pointer-events-none" style={{
          left: '50%', top: '50%',
          width: `${p.size}px`, height: `${p.size}px`,
          background: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#fb923c' : '#f97316',
          boxShadow: `0 0 ${p.size * 2}px ${i % 3 === 0 ? 'rgba(251,191,36,.8)' : i % 3 === 1 ? 'rgba(251,146,60,.8)' : 'rgba(249,115,22,.8)'}`,
          opacity: 0,
          '--px': `${Math.cos(p.angle) * p.radius}px`,
          '--py': `${Math.sin(p.angle) * p.radius}px`,
          animation: `introParticle ${1.2 + p.speed}s cubic-bezier(.22,1,.36,1) ${0.3 + p.delay}s forwards`,
        }} />
      ))}

      {/* Holographic conic gradient */}
      <div aria-hidden className="absolute inset-[-20%] pointer-events-none" style={{
        background: 'conic-gradient(from 45deg at 50% 50%,transparent 0deg,rgba(234,88,12,.08) 60deg,transparent 120deg,rgba(251,191,36,.06) 180deg,transparent 240deg,rgba(251,146,60,.05) 300deg,transparent 360deg)',
        opacity: 0, mixBlendMode: 'screen',
        animation: 'introOrbIn 1.4s ease 0.4s forwards',
      }} />

      {/* Vignette */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 100% 80% at 50% 50%,transparent 40%,rgba(0,0,0,.9) 100%)',
      }} />

      {/* Transformation flash */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle 40vmin at 50% 50%,rgba(255,247,237,.5) 0%,rgba(251,191,36,.25) 30%,transparent 60%)',
        opacity: 0,
        animation: 'introFlash 0.6s cubic-bezier(.22,1,.36,1) 1.2s forwards',
      }} />

      {/* Exit flash */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle 55vmin at 50% 50%,rgba(255,247,237,.5) 0%,rgba(251,191,36,.25) 30%,transparent 65%)',
        opacity: 0,
        animation: 'introExitFlash 0.8s cubic-bezier(.55,0,.2,1) 3.2s forwards',
      }} />

      {/* Center stage */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ animation: 'introStageOut 0.8s cubic-bezier(.55,0,.2,1) 3.2s forwards', willChange: 'transform,opacity,filter', perspective: '1200px' }}
      >
        <div className="relative flex items-center justify-center" style={{ width: 'clamp(300px,44vw,540px)', height: 'clamp(220px,30vw,340px)' }}>

          {/* Shockwave rings */}
          {[0, 0.08, 0.16].map((delay, i) => (
            <div key={i} aria-hidden className="absolute rounded-full pointer-events-none" style={{
              width: '32%', height: '32%',
              border: `${3 - i}px solid ${i === 0 ? 'rgba(251,191,36,.9)' : i === 1 ? 'rgba(234,88,12,.7)' : 'rgba(251,146,60,.5)'}`,
              boxShadow: `0 0 ${40 - i * 8}px rgba(234,88,12,.5), inset 0 0 ${30 - i * 6}px rgba(251,191,36,.2)`,
              opacity: 0,
              animation: `introShockwave ${1.1 + i * 0.15}s cubic-bezier(.22,1,.36,1) ${1.2 + delay}s forwards`,
            }} />
          ))}

          {/* Hero B with 3D rotation */}
          <span aria-hidden className="absolute font-display font-black leading-none pointer-events-none" style={{
            fontSize: 'clamp(7rem,17vw,13rem)',
            background: CHROME,
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            filter: 'drop-shadow(0 0 60px rgba(234,88,12,.8)) drop-shadow(0 3px 0 rgba(255,255,255,.2))',
            opacity: 0,
            animation: 'introHeroIn 0.95s cubic-bezier(.22,1,.36,1) 0.2s forwards, introHeroMorph 0.65s cubic-bezier(.6,0,.4,1) 1.2s forwards, introChromatic 0.3s ease 1.15s forwards',
            willChange: 'transform,opacity,filter',
          }}>B</span>

          {/* BRIDGE letters with 3D explosion */}
          <div className="absolute font-display font-black leading-none flex items-baseline"
            style={{ fontSize: 'clamp(3rem,7.5vw,6.2rem)', perspective: '1400px', perspectiveOrigin: '50% 50%' }}
          >
            {BRIDGE_LETTERS.map((ch, i) => {
              const v = LETTER_VECTORS[i];
              return (
                <span key={i} style={{
                  background: CHROME,
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                  display: 'inline-block',
                  opacity: 0,
                  '--sx': v.sx, '--sy': v.sy, '--rx': v.rx, '--ry': v.ry, '--rz': v.rz,
                  animation: `introLetter3D 1.1s cubic-bezier(.22,1,.36,1) ${1.5 + LETTER_STAGGER[i]}s forwards, introGlitch 0.6s ease ${1.8 + LETTER_STAGGER[i]}s forwards`,
                  willChange: 'transform,opacity,filter',
                }}>{ch}</span>
              );
            })}
          </div>
        </div>

        {/* Tagline pill */}
        <div className="mt-8 px-6 py-2.5 rounded-full" style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          opacity: 0,
          animation: 'introTaglineIn 0.7s cubic-bezier(.22,1,.36,1) 2.4s forwards',
        }}>
          <p className="text-center font-display font-semibold uppercase text-white/80"
            style={{ fontSize: 'clamp(0.58rem,1.1vw,0.76rem)', letterSpacing: '0.38em' }}>
            Mentorship. Networking. Outcomes.
          </p>
        </div>

        {/* Accent line */}
        <div className="mt-6 overflow-hidden" style={{ height: '1.5px', width: 'clamp(150px,22vw,240px)', background: 'rgba(255,255,255,0.06)' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg,transparent,rgba(234,88,12,.9) 30%,rgba(251,191,36,1) 50%,rgba(234,88,12,.9) 70%,transparent)',
            transformOrigin: 'left',
            opacity: 0,
            animation: 'introScale 0.8s cubic-bezier(.22,1,.36,1) 2.55s forwards',
          }} />
        </div>
      </div>
    </div>,
    document.body
  );
}
