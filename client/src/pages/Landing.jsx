import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'motion/react';
import { useAuth } from '../context/useAuth';
import Reveal from '../components/Reveal';
import { useFooterOffset } from '../utils/useFooterOffset';

/* ─── Hooks ─────────────────────────────────────────────────── */
function useMouseParallax() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const h = (e) => setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return mouse;
}

function useCountUp(target, duration = 2400) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const raf = requestAnimationFrame(function tick(now) {
      if (!start) start = now;
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setValue(Math.round(target * ease));
      if (t < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return [ref, value];
}

function useIntersect(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── Data ──────────────────────────────────────────────────── */
const AVATAR_GRAD = {
  amber: 'from-amber-400 to-orange-500', emerald: 'from-emerald-400 to-teal-500',
  sky: 'from-sky-400 to-blue-500', rose: 'from-rose-400 to-pink-500',
  violet: 'from-violet-400 to-purple-500', teal: 'from-teal-400 to-emerald-500',
  orange: 'from-orange-400 to-rose-500', pink: 'from-pink-400 to-rose-500',
};

const ACTIVITY = [
  { ini: 'TN', name: 'Tyler N.',  tone: 'amber',   text: 'booked Interview Prep',      with: 'Maya Chen',     time: '2m ago'  },
  { ini: 'PS', name: 'Priya S.',  tone: 'emerald', text: 'landed a Staff PM role',     time: '1h ago',  win: true },
  { ini: 'LK', name: 'Liam K.',   tone: 'sky',     text: 'booked Resume Review',       with: 'Jordan R.',     time: '5m ago'  },
  { ini: 'AM', name: 'Aisha M.',  tone: 'rose',    text: 'accepted an offer at Figma', time: '3h ago',  win: true },
  { ini: 'JD', name: 'James D.',  tone: 'violet',  text: 'booked Career Advice',       with: 'Elena Voss',    time: '8m ago'  },
  { ini: 'SR', name: 'Sofia R.',  tone: 'teal',    text: 'left a 5-star review',       with: 'Marcus Lee',    time: '11m ago' },
  { ini: 'KH', name: 'Kai H.',    tone: 'orange',  text: 'booked a Networking call',   with: 'Tom Rodriguez', time: '15m ago' },
  { ini: 'NP', name: 'Nina P.',   tone: 'pink',    text: 'made the switch from finance', time: '6h ago', win: true },
];

const MENTORS_ROW1 = [
  { name: 'Maya Chen',      title: 'Director of Product',  co: 'Linear',     tags: ['PM Strategy','Promotion'],    rate: 95,  rating: 4.9, sessions: 86,  tone: 'amber',   online: true  },
  { name: 'Jordan Reeves',  title: 'Ex-FAANG Recruiter',   co: 'Google',     tags: ['Interview Prep','Offers'],    rate: 60,  rating: 4.8, sessions: 142, tone: 'orange'             },
  { name: 'Elena Voss',     title: 'RN → UX Designer',     co: 'IDEO',       tags: ['Career Switch','Portfolio'],  rate: 45,  rating: 5.0, sessions: 58,  tone: 'rose',    online: true  },
  { name: 'Marcus Lee',     title: 'Engineering Manager',   co: 'Stripe',     tags: ['EM Path','System Design'],   rate: 120, rating: 4.9, sessions: 203, tone: 'sky'                },
  { name: 'Dr. Aisha Park', title: 'Biotech Founder',       co: 'Stanford',   tags: ['Fundraising','Science Biz'], rate: 150, rating: 4.7, sessions: 37,  tone: 'violet',  online: true  },
  { name: 'Tom Rodriguez',  title: 'VP of Sales',           co: 'Salesforce', tags: ['Enterprise Sales','SDR→AE'], rate: 55,  rating: 4.8, sessions: 95,  tone: 'teal'               },
];
const MENTORS_ROW2 = [
  { name: 'Sarah Kim',      title: 'Head of Design',        co: 'Airbnb',     tags: ['Design Systems','Leadership'], rate: 85,  rating: 4.9, sessions: 64,  tone: 'pink',    online: true  },
  { name: 'Raj Patel',      title: 'Principal Engineer',    co: 'Meta',       tags: ['Architecture','Staff Eng'],    rate: 110, rating: 4.8, sessions: 118, tone: 'emerald'            },
  { name: 'Camille Dubois', title: 'Brand Strategist',      co: 'Nike',       tags: ['Brand','Creative Strategy'],  rate: 70,  rating: 5.0, sessions: 43,  tone: 'rose'               },
  { name: 'Alex Wong',      title: 'Growth Lead',           co: 'Notion',     tags: ['Growth','Retention','PLG'],   rate: 90,  rating: 4.7, sessions: 77,  tone: 'amber'              },
  { name: 'Diana Ferreira', title: 'Data Science Manager',  co: 'Spotify',    tags: ['ML','Analytics'],              rate: 100, rating: 4.9, sessions: 52,  tone: 'sky'                },
  { name: 'Omar Hassan',    title: 'Startup Founder',        co: 'YC W23',     tags: ['Fundraising','0→1'],           rate: 130, rating: 4.8, sessions: 29,  tone: 'teal'               },
];

const OUTCOMES = [
  { result: 'Got the offer',      metric: '+32% comp',     name: 'Tyler N.',  role: 'Senior Engineer',    tone: 'amber',   quote: 'Two sessions with a former FAANG recruiter. She rewrote my "tell me about yourself" in ten minutes. Offer came a week later.'         },
  { result: 'Changed industries', metric: 'Banking → PM',  name: 'Priya S.',  role: 'Ex-Analyst, now PM', tone: 'emerald', quote: 'I was terrified to leave finance. One session with someone who made the exact same jump saved me six months of second-guessing.'     },
  { result: 'Got promoted',       metric: 'IC → Staff',    name: 'Jordan E.', role: 'Staff Engineer',     tone: 'sky',     quote: "Stuck at Senior for four years. My mentor called out exactly which work didn't count. Promoted in the next cycle."                  },
  { result: 'Landed dream role',  metric: 'PM at Stripe',  name: 'Anika R.',  role: 'Product Manager',    tone: 'violet',  quote: 'I had 12 final rounds in my career and bombed 11. After two sessions on frameworks and positioning, I closed my dream offer.'     },
];

const PRINCIPLES = [
  { num: '01', title: 'Only people who\'ve done your job', desc: 'Every mentor has lived the role you\'re targeting. No generic advice, no unverified bios.' },
  { num: '02', title: 'One session at a time',             desc: 'No packages. No subscriptions. Pay for exactly what you need, nothing more.'               },
  { num: '03', title: 'All reviews, unfiltered',           desc: 'Every review is visible — the glowing ones and the ones that save you from a bad fit.'      },
  { num: '04', title: 'Price on every profile',            desc: 'Exact rate shown before you even click. No "contact us for pricing" opacity.'               },
  { num: '05', title: 'Sessions with a structure',         desc: 'Four named formats — Career Advice, Interview Prep, Resume Review, Networking.'              },
  { num: '06', title: 'Video built in, zero friction',     desc: 'Custom room auto-generated per session. No Zoom, no scheduling back-and-forth.'             },
];

const WHY_ROWS = [
  { label: 'You get a response',      dm: '~10% reply rate',  coaching: 'Always',            bridge: 'Always — mentors opt in' },
  { label: "They've done your job",   dm: 'Maybe',            coaching: 'Rarely',            bridge: "Yes — that's the filter" },
  { label: 'Structured session',      dm: 'No',               coaching: 'Yes',               bridge: 'Yes — 4 named formats'   },
  { label: 'Price shown upfront',     dm: '—',                coaching: 'Often hidden',      bridge: 'On every profile'        },
  { label: 'Real unfiltered reviews', dm: 'No',               coaching: 'Curated only',      bridge: 'All reviews, unfiltered' },
  { label: 'Commitment',              dm: 'None',             coaching: 'Multi-session pkg', bridge: 'One session at a time'   },
];

/* ─── Enhanced Particle Canvas ───────────────────────────────── */
function EnhancedParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const particles = Array.from({ length: 185 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      size: Math.random() * 1.5 + 1.5,
      speed: Math.random() * 0.28 + 0.06,
      opacity: Math.random() * 0.38 + 0.07,
      drift: (Math.random() - 0.5) * 0.22,
      vx: 0, vy: 0,
    }));
    let id;
    const DISPERSE_R = 130, DISPERSE_F = 1.0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const { x: mx, y: my } = mouseRef.current;
      particles.forEach(p => {
        const dx = p.x - mx, dy = p.y - my;
        const dist = Math.hypot(dx, dy);
        if (dist < DISPERSE_R && dist > 0) {
          const f = (DISPERSE_R - dist) / DISPERSE_R * DISPERSE_F;
          p.vx += (dx / dist) * f; p.vy += (dy / dist) * f;
        }
        p.vx *= 0.90; p.vy *= 0.90;
        p.x += p.drift + p.vx; p.y -= p.speed + p.vy;
        if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(234,88,12,${p.opacity})`;
        ctx.fill();
      });
      id = requestAnimationFrame(draw);
    }
    draw();
    const onMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(id); window.removeEventListener('mousemove', onMove); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" style={{ opacity: 0.58 }} />;
}

/* ─── Spotlight Cursor ───────────────────────────────────────── */
function SpotlightCursor({ heroRef }) {
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const [active, setActive] = useState(false);
  useEffect(() => {
    const section = heroRef?.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame;
    const onMove = (e) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setActive(true);
      });
    };
    const onLeave = () => setActive(false);
    section.addEventListener('mousemove', onMove, { passive: true });
    section.addEventListener('mouseleave', onLeave);
    return () => {
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [heroRef]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[6]"
      style={{
        background: 'rgba(5,2,1,0.50)',
        opacity: active ? 1 : 0,
        transition: 'opacity 700ms ease',
        maskImage: `radial-gradient(circle 400px at ${pos.x}px ${pos.y}px, transparent 0%, transparent 28%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.92) 80%)`,
        WebkitMaskImage: `radial-gradient(circle 400px at ${pos.x}px ${pos.y}px, transparent 0%, transparent 28%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.92) 80%)`,
      }}
    />
  );
}

/* ─── 3D Portal Rings ───────────────────────────────────────── */
function Portal3D() {
  const rings = [
    { s: 640, dur: 9,  dir: 1,  op: 0.22 },
    { s: 490, dur: 13, dir: -1, op: 0.18 },
    { s: 360, dur: 10, dir: 1,  op: 0.15 },
    { s: 250, dur: 16, dir: -1, op: 0.12 },
    { s: 160, dur: 11, dir: 1,  op: 0.10 },
  ];
  return (
    <div style={{ position: 'relative', width: 640, height: 640, perspective: 700, perspectiveOrigin: '50% 52%' }}>
      {rings.map((r, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: r.s, height: r.s,
          left: (640 - r.s) / 2, top: (640 - r.s) / 2,
          borderRadius: '50%',
          border: `1px solid rgba(234,88,12,${r.op})`,
          transform: 'rotateX(72deg)',
          animation: `l-portal-spin ${r.dur}s linear infinite ${r.dir === -1 ? 'reverse' : ''}`,
          boxShadow: `0 0 18px rgba(234,88,12,${r.op * 0.55})`,
        }}>
          <div style={{
            position: 'absolute', width: 5, height: 5, borderRadius: '50%',
            top: -2.5, left: '50%', transform: 'translateX(-50%)',
            background: `rgba(251,146,60,${r.op * 3})`,
            boxShadow: `0 0 10px rgba(251,146,60,0.9)`,
          }} />
        </div>
      ))}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(234,88,12,0.14) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />
    </div>
  );
}

/* ─── Spring 3D Mentor Card ─────────────────────────────────── */
function Spring3DMentorCard() {
  const containerRef = useRef(null);
  const reduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const rXMV = useMotionValue(0);
  const rYMV = useMotionValue(0);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const cfg = { stiffness: 135, damping: 20, mass: 0.55 };
  const rotateX = useSpring(rXMV, cfg);
  const rotateY = useSpring(rYMV, cfg);
  const lightX = useSpring(glowX, cfg);
  const lightY = useSpring(glowY, cfg);
  const background = useMotionTemplate`radial-gradient(circle 210px at ${lightX}% ${lightY}%, rgba(234,88,12,0.26) 0%, rgba(251,146,60,0.10) 40%, transparent 65%)`;
  const onMove = useCallback((e) => {
    if (reduced.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    rXMV.set((y - 0.5) * -28);
    rYMV.set((x - 0.5) * 28);
    glowX.set(x * 100);
    glowY.set(y * 100);
  }, [rXMV, rYMV, glowX, glowY]);
  const onLeave = useCallback(() => {
    rXMV.set(0); rYMV.set(0); glowX.set(50); glowY.set(50);
  }, [rXMV, rYMV, glowX, glowY]);
  return (
    <div ref={containerRef} style={{ perspective: 900 }} onMouseMove={onMove} onMouseLeave={onLeave}>
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.13] bg-white/[0.055] shadow-[0_32px_80px_rgba(0,0,0,0.62),0_0_0_1px_rgba(255,255,255,0.07)] backdrop-blur-2xl"
      >
        <motion.div className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background }} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-base font-bold text-white shadow-[0_6px_20px_rgba(234,88,12,0.52)]">
                MC
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[rgba(8,3,1,0.9)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
                </span>
              </div>
              <div>
                <p className="text-[13px] font-bold text-white/92">Maya Chen</p>
                <p className="text-[11px] text-white/42">Director of Product</p>
              </div>
            </div>
            <div className="rounded-full border border-orange-500/25 bg-orange-500/12 px-3 py-1 text-[9px] font-bold text-orange-300">Linear</div>
          </div>
          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['PM Strategy','Promotion','Roadmapping','OKRs'].map(tag => (
              <span key={tag} className="rounded-full border border-white/[0.09] bg-white/[0.06] px-2.5 py-0.5 text-[9px] font-medium text-white/55">{tag}</span>
            ))}
          </div>
          {/* Stats */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[['4.9 ★','Rating'],['86','Sessions'],['$95/hr','Rate']].map(([v,l]) => (
              <div key={l} className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-center">
                <p className="text-sm font-bold text-white/88">{v}</p>
                <p className="text-[9px] text-white/30">{l}</p>
              </div>
            ))}
          </div>
          {/* Bio */}
          <p className="mt-4 text-[11px] text-white/38 leading-relaxed">
            Former PM at Google → Linear. I help PMs at Series A–C companies nail their strategy and get promoted.
          </p>
          {/* CTA */}
          <button className="mt-5 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-[11px] font-bold text-white shadow-[0_0_32px_rgba(234,88,12,0.48)] transition hover:shadow-[0_0_48px_rgba(234,88,12,0.72)]">
            Book a session · $95
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent" />
      </motion.div>
    </div>
  );
}

/* ─── Tilt Card ─────────────────────────────────────────────── */
function TiltCard({ children, className = '', intensity = 7 }) {
  const ref = useRef(null);
  const handleMouseMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--tilt-x', `${(y - 0.5) * -intensity}deg`);
    el.style.setProperty('--tilt-y', `${(x - 0.5) * intensity}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  }, [intensity]);
  const handleMouseLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  }, []);
  return <div ref={ref} className={`tilt-card cursor-glow ${className}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>{children}</div>;
}

/* ─── Magnetic Button ───────────────────────────────────────── */
function MagneticWrap({ children, strength = 0.28 }) {
  const ref = useRef(null);
  const frameRef = useRef(null);
  const handleMouseMove = (e) => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * strength;
      const dy = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate(${dx}px,${dy}px)`;
    });
  };
  const handleMouseLeave = () => { const el = ref.current; if (el) el.style.transform = ''; };
  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 380ms cubic-bezier(0.2,0.9,0.32,1)', display: 'inline-block' }}>
      {children}
    </div>
  );
}

/* ─── Split Text Animate ────────────────────────────────────── */
function SplitText({ text, delay = 0, className = '', charDelay = 28 }) {
  const [ref, visible] = useIntersect(0.1);
  return (
    <span ref={ref} className={className} aria-label={text} style={{ display: 'inline' }}>
      {text.split('').map((ch, i) => (
        <span key={i} style={{
          display: 'inline-block',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: `opacity 480ms ease ${delay + i * charDelay}ms, transform 540ms cubic-bezier(0.16,1,0.3,1) ${delay + i * charDelay}ms`,
        }}>{ch === ' ' ? ' ' : ch}</span>
      ))}
    </span>
  );
}

/* ─── Floating Nav Dock ──────────────────────────────────────── */
function FloatingDock() {
  const [mounted, setMounted] = useState(false);
  const bottom = useFooterOffset(24);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 600);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (id) => {
    if (id === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const items = [
    { label: 'Home',         id: 'top'          },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Mentors',      id: 'mentors'      },
    { label: 'Outcomes',     id: 'outcomes'     },
    { label: 'Get Started',  id: 'get-started', primary: true },
  ];

  return (
    <div
      className="pointer-events-none fixed left-1/2 z-40"
      style={{
        bottom,
        transform: `translateX(-50%) translateY(${mounted ? '0px' : '5rem'})`,
        opacity: mounted ? 1 : 0,
        transition: 'transform 500ms cubic-bezier(0.16,1,0.3,1), opacity 380ms ease, bottom 150ms ease',
      }}
    >
      <nav
        aria-label="Page sections"
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#0c0906]/94 px-2 py-2 shadow-[0_20px_70px_rgba(0,0,0,0.75),0_0_90px_rgba(234,88,12,0.14)] backdrop-blur-2xl"
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => scrollTo(item.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-semibold transition-all duration-200 ${
              item.primary
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_30px_rgba(234,88,12,0.48)] hover:shadow-[0_0_44px_rgba(234,88,12,0.7)]'
                : 'text-white/40 hover:bg-white/[0.07] hover:text-white/82'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ─── Product Scene ─────────────────────────────────────────── */
function ProductScene() {
  const [scene, setScene] = useState(0);
  useEffect(() => { const id = setInterval(() => setScene(s => (s + 1) % 3), 3600); return () => clearInterval(id); }, []);
  const scenes = [
    <div key="search" className="flex flex-col gap-3 px-5 py-5">
      <p className="text-[9px] font-black uppercase tracking-[0.26em] text-orange-400">AI Mentor Match</p>
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-3 py-2.5">
        <svg className="h-3.5 w-3.5 shrink-0 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>
        <span className="text-[11px] text-white/40">I want to become a PM at a Series B startup</span>
        <span className="ml-auto h-3.5 w-px animate-pulse bg-orange-400" />
      </div>
      <div className="space-y-1.5">
        {[{ ini:'MC',name:'Maya Chen',tag:'PM Strategy',match:98,tone:'amber'},{ ini:'JR',name:'Jordan Reeves',tag:'Product Growth',match:94,tone:'orange'},{ ini:'EV',name:'Elena Voss',tag:'Career Switch',match:91,tone:'rose'}].map((m,i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-xl bg-white/[0.035] px-3 py-2 transition-all hover:bg-white/[0.07]">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[m.tone]} text-[9px] font-bold text-white`}>{m.ini}</div>
            <div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-white">{m.name}</p><p className="text-[9px] text-white/32">{m.tag}</p></div>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-14 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{width:`${m.match}%`}}/></div>
              <span className="text-[10px] font-bold text-orange-400">{m.match}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>,
    <div key="profile" className="flex flex-col gap-3 px-5 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow-[0_4px_18px_rgba(234,88,12,0.45)]">MC</div>
        <div><p className="text-sm font-semibold text-white">Maya Chen</p><p className="text-[11px] text-white/40">Director of Product · Linear</p></div>
        <div className="ml-auto rounded-full bg-emerald-500/14 border border-emerald-500/20 px-2.5 py-1 text-[9px] font-bold text-emerald-400">● Available</div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {['PM Strategy','Promotion','Roadmapping'].map(t=><span key={t} className="rounded-full border border-orange-500/22 bg-orange-500/10 px-2.5 py-0.5 text-[9px] font-medium text-orange-300">{t}</span>)}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[['4.9 ★','Rating'],['86','Sessions'],['$95/hr','Rate']].map(([v,l])=><div key={l} className="rounded-xl bg-white/[0.04] px-2 py-2 text-center"><p className="text-sm font-bold text-white">{v}</p><p className="text-[9px] text-white/30">{l}</p></div>)}
      </div>
      <div className="space-y-1.5">
        {['Career Advice','Interview Prep','Resume Review'].map(t=><div key={t} className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.05] px-3 py-2 text-[11px] text-white/50 transition hover:border-orange-500/30 hover:text-white/82"><svg className="h-3 w-3 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" strokeLinecap="round"/></svg>{t}</div>)}
      </div>
    </div>,
    <div key="booked" className="flex flex-col items-center gap-3.5 px-5 py-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_55px_rgba(16,185,129,0.6)]">
        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div><p className="text-base font-bold text-white">Session confirmed!</p><p className="mt-0.5 text-[11px] text-white/40">Tomorrow · 3:00 PM EST · 45 min</p></div>
      <div className="w-full rounded-2xl border border-emerald-500/18 bg-emerald-500/[0.07] p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white">MC</div>
          <div className="text-left"><p className="text-[11px] font-semibold text-white">Maya Chen</p><p className="text-[10px] text-white/32">Career Advice Session</p></div>
          <div className="ml-auto flex items-center gap-1 rounded-full bg-white/[0.07] px-2 py-1 text-[10px] text-white/50"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.361a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" strokeLinecap="round"/></svg>Video ready</div>
        </div>
      </div>
      <div className="flex w-full gap-2">
        <div className="flex-1 rounded-xl bg-white/[0.05] py-2 text-[11px] font-medium text-white/45">Add to Calendar</div>
        <div className="flex-1 rounded-xl bg-orange-500 py-2 text-[11px] font-bold text-white shadow-[0_0_24px_rgba(234,88,12,0.55)]">Join Room</div>
      </div>
    </div>,
  ];
  return (
    <div className="bridge-shine-overlay relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0906] shadow-[0_0_120px_rgba(234,88,12,0.22),0_48px_90px_rgba(0,0,0,0.55)]" style={{minHeight:300}}>
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70"/><span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70"/><span className="h-2.5 w-2.5 rounded-full bg-green-500/70"/>
        <span className="ml-auto text-[9px] text-white/16">bridge.app</span>
      </div>
      <div className="flex border-b border-white/[0.06]">
        {['AI Match','Profile','Booked ✓'].map((tab,i)=>(
          <button key={i} onClick={()=>setScene(i)} className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] transition ${scene===i?'border-b-2 border-orange-400 text-orange-400':'text-white/20 hover:text-white/45'}`}>{tab}</button>
        ))}
      </div>
      <div key={scene} style={{animation:'bridge-scale-in 300ms cubic-bezier(0.16,1,0.3,1)'}}>{scenes[scene]}</div>
    </div>
  );
}

/* ─── Marquee Card ──────────────────────────────────────────── */
function MarqueeCard({ m }) {
  const ref = useRef(null);
  const mm = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--tilt-x', `${((e.clientY-r.top)/r.height-0.5)*-6}deg`);
    el.style.setProperty('--tilt-y', `${((e.clientX-r.left)/r.width-0.5)*6}deg`);
    el.style.setProperty('--mx', `${((e.clientX-r.left)/r.width)*100}%`);
    el.style.setProperty('--my', `${((e.clientY-r.top)/r.height)*100}%`);
  };
  const ml = () => { const el = ref.current; if (!el) return; el.style.setProperty('--tilt-x','0deg'); el.style.setProperty('--tilt-y','0deg'); };
  return (
    <div ref={ref} onMouseMove={mm} onMouseLeave={ml}
      className="tilt-card cursor-glow inline-flex shrink-0 w-60 flex-col gap-3 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-4 shadow-bridge-card transition-all duration-300 hover:border-orange-500/35 hover:shadow-bridge-glow">
      <div className="flex items-center gap-2.5">
        <div className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[m.tone]} text-[11px] font-bold text-white shadow-[0_4px_14px_rgba(0,0,0,0.22)]`}>
          {m.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
          {m.online && <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[var(--bridge-surface)]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-200"/></span>}
        </div>
        <div className="min-w-0"><p className="truncate text-[12px] font-semibold text-[var(--bridge-text)]">{m.name}</p><p className="truncate text-[10px] text-[var(--bridge-text-faint)]">{m.co}</p></div>
      </div>
      <p className="text-[11px] text-[var(--bridge-text-muted)] leading-relaxed">{m.title}</p>
      <div className="flex flex-wrap gap-1">
        {m.tags.slice(0,2).map(t=><span key={t} className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[9px] font-semibold text-orange-600 dark:text-orange-300">{t}</span>)}
      </div>
      <div className="flex items-center justify-between border-t border-[var(--bridge-border)] pt-2.5">
        <span className="text-[10px] font-medium text-[var(--bridge-text-muted)]">★ {m.rating} · {m.sessions} sessions</span>
        <span className="text-[11px] font-bold text-orange-500">${m.rate}/hr</span>
      </div>
    </div>
  );
}

/* ─── Stat Item ─────────────────────────────────────────────── */
function StatItem({ target, suffix, label, accent, decimal }) {
  const raw = decimal ? target * 10 : target;
  const [ref, value] = useCountUp(raw, 2600);
  const display = decimal ? (value / 10).toFixed(1) : value.toLocaleString();
  return (
    <div ref={ref} className="flex flex-col items-center gap-3 text-center">
      <div className="relative">
        <p className={`font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${accent}`}
          style={{ fontSize: 'clamp(3.2rem,7vw,6.5rem)', lineHeight: 0.92 }}>
          {display}{suffix}
        </p>
        <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-14 bg-gradient-to-r ${accent}`} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[var(--bridge-text-faint)]">{label}</p>
    </div>
  );
}

/* ─── Testimonial Card ──────────────────────────────────────── */
function TestimonialCard({ o, idx, active, onClick }) {
  return (
    <TiltCard
      className={`group relative flex flex-col gap-5 overflow-hidden rounded-3xl border p-7 shadow-bridge-card transition-all duration-500 cursor-pointer ${active ? 'border-orange-500/40 bg-[var(--bridge-surface)] shadow-bridge-glow scale-[1.02]' : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] hover:border-orange-500/25 hover:shadow-bridge-glow'}`}
      onClick={onClick}
    >
      <div aria-hidden className="pointer-events-none absolute -top-6 -left-2 font-editorial text-[8rem] font-black leading-none text-orange-500/[0.07] select-none">&ldquo;</div>
      <div className="flex gap-1">
        {[0,1,2,3,4].map(i=><svg key={i} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
      </div>
      <p className="flex-1 text-sm text-[var(--bridge-text-secondary)] leading-relaxed">&ldquo;{o.quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[o.tone]} text-[10px] font-bold text-white shadow-[0_0_18px_rgba(0,0,0,0.3)]`}>
          {o.name.split(' ').map(n=>n[0]).join('')}
        </div>
        <div><p className="text-[12px] font-bold text-[var(--bridge-text)]">{o.name}</p><p className="text-[10px] text-[var(--bridge-text-faint)]">{o.role}</p></div>
        <div className="ml-auto rounded-full border border-emerald-500/25 bg-emerald-500/12 px-3 py-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{o.result} · {o.metric}</div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </TiltCard>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════════════════════ */
export default function Landing() {
  const { user } = useAuth();
  const mouse = useMouseParallax();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setActiveTestimonial(i => (i + 1) % OUTCOMES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const parallaxStyle = (dx, dy, scale = 1) => ({
    transform: `translate(${(mouse.x - 0.5) * dx}px, ${(mouse.y - 0.5) * dy}px) scale(${scale})`,
    transition: 'transform 900ms cubic-bezier(0.2,0.9,0.32,1)',
  });

  return (
    <div className="relative overflow-x-hidden">
      {/* Global landing CSS */}
      <style>{`
        @keyframes l-portal-spin { from{transform:rotateX(72deg) rotate(0deg)}to{transform:rotateX(72deg) rotate(360deg)} }
        @keyframes l-hero-in { from{opacity:0;transform:translateY(32px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes l-scan { 0%{transform:translateY(-100%)}100%{transform:translateY(100vh)} }
        @keyframes l-ticker { from{transform:translateX(0)}to{transform:translateX(-50%)} }
        @keyframes l-float-a { 0%,100%{transform:translateY(0) rotate(-0.4deg)}50%{transform:translateY(-12px) rotate(0.4deg)} }
        @keyframes l-float-b { 0%,100%{transform:translateY(0) rotate(0.3deg)}50%{transform:translateY(-8px) rotate(-0.5deg)} }
        @keyframes l-number-in { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        @keyframes l-line-draw { from{width:0}to{width:100%} }
        @keyframes l-blob { 0%,100%{border-radius:42% 58% 36% 64%/54% 44% 56% 46%;transform:scale(1)}50%{border-radius:58% 42% 64% 36%/44% 58% 46% 54%;transform:scale(1.04) translate(0,-3%)} }
        @keyframes l-spin-slow { to{transform:rotate(360deg)} }
        @keyframes l-pulse-ring { 0%{transform:scale(1);opacity:0.6}100%{transform:scale(1.5);opacity:0} }
        .l-hero-in { animation: l-hero-in 900ms cubic-bezier(0.16,1,0.3,1) both }
        .l-hero-in-1 { animation: l-hero-in 900ms 100ms cubic-bezier(0.16,1,0.3,1) both }
        .l-hero-in-2 { animation: l-hero-in 900ms 220ms cubic-bezier(0.16,1,0.3,1) both }
        .l-hero-in-3 { animation: l-hero-in 900ms 360ms cubic-bezier(0.16,1,0.3,1) both }
        .l-hero-in-4 { animation: l-hero-in 900ms 500ms cubic-bezier(0.16,1,0.3,1) both }
        .l-float-a { animation: l-float-a 8s ease-in-out infinite }
        .l-float-b { animation: l-float-b 10s ease-in-out infinite }
        .l-ticker { animation: l-ticker 40s linear infinite }
        .l-ticker-rev { animation: l-ticker 44s linear infinite reverse }
        .l-marquee-wrap:hover .l-ticker,
        .l-marquee-wrap:hover .l-ticker-rev { animation-play-state:paused }
        .l-blob { animation: l-blob 18s ease-in-out infinite; will-change:transform,border-radius }
        .l-principle-line { animation: l-line-draw 800ms cubic-bezier(0.16,1,0.3,1) both }
        .mask-x { -webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 92%,transparent 100%); mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 92%,transparent 100%) }
      `}</style>

      <FloatingDock />

      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden" style={{ backgroundColor: 'var(--bridge-hero-bg)' }}>
        {/* Enhanced particle field — 185 particles with mouse dispersion */}
        <EnhancedParticleCanvas />
        {/* Spotlight cursor reveal */}
        <SpotlightCursor heroRef={heroRef} />

        {/* Layered grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ backgroundImage:'linear-gradient(rgba(234,88,12,0.048) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,0.048) 1px,transparent 1px)', backgroundSize:'72px 72px' }} />

        {/* Radial glow top */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background:'radial-gradient(ellipse 85% 55% at 50% 5%,rgba(234,88,12,0.18) 0%,transparent 65%)' }} />

        {/* Parallax orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="l-blob absolute -top-52 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full opacity-20"
            style={{ background:'radial-gradient(circle,rgba(234,88,12,0.65) 0%,rgba(234,88,12,0.05) 52%,transparent 70%)', ...parallaxStyle(-22, -14) }} />
          <div className="absolute -bottom-28 -left-72 h-[700px] w-[700px] rounded-full opacity-12"
            style={{ background:'radial-gradient(circle,rgba(251,146,60,0.55) 0%,transparent 65%)', ...parallaxStyle(18, 20) }} />
          <div className="absolute top-1/3 -right-48 h-[600px] w-[600px] rounded-full opacity-9"
            style={{ background:'radial-gradient(circle,rgba(234,88,12,0.45) 0%,transparent 65%)', ...parallaxStyle(28, -16) }} />
          <div className="absolute top-1/2 left-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-7"
            style={{ background:'radial-gradient(circle,rgba(251,191,36,0.75) 0%,transparent 72%)' }} />
        </div>

        {/* Scan line */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background:'linear-gradient(90deg,transparent,rgba(234,88,12,0.4),transparent)', animation:'l-scan 8s linear infinite', animationDelay:'-2s' }} />

        {/* Noise */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.028]" />

        {/* 3D Portal — positioned behind right column */}
        <div aria-hidden className="pointer-events-none absolute right-[4%] top-16 hidden lg:block opacity-60"
          style={{ ...parallaxStyle(-8, -6, 1) }}>
          <Portal3D />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-20 sm:px-6 lg:px-8 lg:pt-36">

          {/* Live pill */}
          <div className={`flex justify-center lg:justify-start ${heroLoaded ? 'l-hero-in' : 'opacity-0'}`}>
            <MagneticWrap strength={0.15}>
              <div className="group inline-flex cursor-default items-center gap-2.5 rounded-full border border-white/[0.09] bg-white/[0.03] px-5 py-2.5 backdrop-blur-xl transition hover:border-orange-500/25 hover:bg-orange-500/[0.06]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.26em] text-white/45">Live · 2,400+ vetted mentors</span>
              </div>
            </MagneticWrap>
          </div>

          {/* Two-column layout */}
          <div className="mt-10 flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-14 xl:gap-20">

            {/* ── Left column: headline + CTAs ── */}
            <div className="flex-1 text-center lg:text-left">

              <div className={heroLoaded ? 'l-hero-in-1' : 'opacity-0'}>
                <h1 style={{ fontSize: 'clamp(3.2rem,8.5vw,7.5rem)', fontWeight: 900, lineHeight: 0.88, letterSpacing: '-0.025em', color: 'rgba(255,255,255,0.82)' }}>
                  <span className="block" style={{ opacity: 0.72 }}>Your next</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500"
                    style={{ filter: 'drop-shadow(0 0 80px rgba(234,88,12,0.7))' }}>career move</span>
                  <span className="block" style={{ opacity: 0.86 }}>starts with</span>
                  <span className="font-editorial block italic"
                    style={{ color:'rgba(255,255,255,0.16)', fontSize:'0.82em', letterSpacing:'-0.01em' }}>
                    one conversation.
                  </span>
                </h1>
              </div>

              <div className={`mt-8 ${heroLoaded ? 'l-hero-in-2' : 'opacity-0'}`}>
                <p className="mx-auto max-w-[460px] text-[1.04rem] text-white/38 leading-relaxed lg:mx-0 lg:max-w-[480px]">
                  Real mentors. Real sessions. Real outcomes. Skip the cold messages — book a 1-on-1 with someone who's already been where you want to go.
                </p>
              </div>

              <div className={`mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start ${heroLoaded ? 'l-hero-in-3' : 'opacity-0'}`}>
                <MagneticWrap>
                  <Link to={user ? '/mentors' : '/register'}
                    className="btn-sheen relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 px-10 py-4 text-[0.92rem] font-bold text-white shadow-[0_0_72px_rgba(234,88,12,0.55)] transition-all hover:shadow-[0_0_100px_rgba(234,88,12,0.82)] hover:scale-[1.04] active:scale-[0.97]">
                    Find your mentor
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full"
                      style={{ animation:'l-pulse-ring 2s ease-out infinite', boxShadow:'0 0 0 0 rgba(234,88,12,0.6)' }} />
                  </Link>
                </MagneticWrap>
                <MagneticWrap>
                  <Link to="/mentors"
                    className="border-gradient-bridge animate-border-bridge inline-flex items-center gap-2 rounded-full px-8 py-4 text-[0.92rem] font-semibold text-white/52 transition hover:text-white/85">
                    Browse mentors →
                  </Link>
                </MagneticWrap>
              </div>

              <div className={`mt-6 flex flex-wrap justify-center gap-x-5 gap-y-1 lg:justify-start ${heroLoaded ? 'l-hero-in-3' : 'opacity-0'}`}>
                {['No credit card required','First session guaranteed','Cancel anytime'].map((t,i) => (
                  <span key={i} className="flex items-center gap-1.5 text-[10px] text-white/22">
                    {i>0 && <span className="h-1 w-1 rounded-full bg-white/15"/>}
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right column: Spring 3D mentor card ── */}
            <div className={`relative shrink-0 w-full max-w-sm lg:w-[380px] xl:w-[420px] ${heroLoaded ? 'l-hero-in-4' : 'opacity-0'}`}>

              {/* Chip — AI match */}
              <div className="pointer-events-none absolute -left-8 -top-6 z-20 l-float-a hidden lg:block">
                <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.09] bg-[#0b0906]/96 px-4 py-3 backdrop-blur-xl shadow-[0_12px_55px_rgba(234,88,12,0.22)]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-sm shadow-[0_4px_14px_rgba(234,88,12,0.45)]">🎯</div>
                  <div><p className="text-[10px] font-bold text-white">98% AI Match</p><p className="text-[9px] text-white/30">PM Strategy · Maya Chen</p></div>
                </div>
              </div>

              {/* Chip — offer */}
              <div className="pointer-events-none absolute -right-6 -top-3 z-20 l-float-b hidden lg:block">
                <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/16 bg-[#0b0906]/96 px-4 py-3 backdrop-blur-xl shadow-[0_12px_55px_rgba(16,185,129,0.18)]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm shadow-[0_4px_14px_rgba(16,185,129,0.45)]">🎉</div>
                  <div><p className="text-[10px] font-bold text-emerald-400">Offer accepted</p><p className="text-[9px] text-white/30">+32% comp · Tyler N.</p></div>
                </div>
              </div>

              {/* Chip — booking live */}
              <div className="pointer-events-none absolute -left-10 bottom-8 z-20 l-float-a hidden lg:block" style={{ animationDelay:'-3s' }}>
                <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.07] bg-[#0b0906]/96 px-4 py-3 backdrop-blur-xl">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-400" />
                  </span>
                  <p className="text-[10px] font-bold text-white/55">3 people booking now</p>
                </div>
              </div>

              {/* Chip — rating */}
              <div className="pointer-events-none absolute -right-8 bottom-4 z-20 l-float-b hidden lg:block" style={{ animationDelay:'-5s' }}>
                <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/16 bg-[#0b0906]/96 px-4 py-3 backdrop-blur-xl">
                  <span className="text-sm">⭐</span>
                  <div><p className="text-[10px] font-bold text-amber-400">4.9 / 5 avg</p><p className="text-[9px] text-white/30">from 4,800+ sessions</p></div>
                </div>
              </div>

              <Spring3DMentorCard />
            </div>
          </div>

        </div>
      </section>

      {/* Hero fade-out */}
      <div aria-hidden className="pointer-events-none -mt-1 h-48 w-full"
        style={{ background:'linear-gradient(to bottom,#150803 0%,#1c0c05 12%,#281408 24%,#381c0e 36%,rgba(62,26,8,0.9) 50%,rgba(95,42,12,0.65) 62%,rgba(145,68,20,0.38) 74%,rgba(195,110,40,0.14) 86%,var(--bridge-canvas) 100%)' }} />

      {/* ════════════════════════════════════════════════════════
          PRODUCT PREVIEW — app flow walkthrough
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 bg-[var(--bridge-canvas)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">See it in action</p>
              <h2 className="mt-3 font-display text-2xl font-black tracking-tight text-[var(--bridge-text)] sm:text-3xl">
                From search to session in <span className="text-gradient-bridge">under a minute</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <Reveal delay={60}>
              <div className="space-y-5">
                {[
                  { n:'01', title:'Describe your goal', desc:'Tell our AI what you want — "land a PM role at a Series B" or "get promoted to Staff." It surfaces the exact mentors most likely to help.' },
                  { n:'02', title:'Pick from ranked matches', desc:'Real bios, honest reviews, exact rates — all visible before you commit. No surprises, no back-and-forth.' },
                  { n:'03', title:'Book and get unstuck', desc:'Real-time availability, built-in video room. Session confirmed in under 30 seconds.' },
                ].map((s,i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="shrink-0 font-display text-2xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-orange-500/50 to-amber-400/30">{s.n}</span>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--bridge-text)]">{s.title}</h3>
                      <p className="mt-1 text-[13px] text-[var(--bridge-text-muted)] leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={120}>
              <ProductScene />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          ACTIVITY TICKER
      ════════════════════════════════════════════════════════ */}
      <div className="l-marquee-wrap relative border-y border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/40 py-3">
        <div className="overflow-hidden mask-x">
          <div className="l-ticker flex w-max gap-3 pr-3">
            {[...ACTIVITY, ...ACTIVITY].map((item, i) => (
              <div key={i} className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/90 px-4 py-2 shadow-bridge-tile backdrop-blur-sm">
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[item.tone]} text-[9px] font-bold text-white`}>{item.ini}</div>
                <span className="whitespace-nowrap text-[11px] font-medium text-[var(--bridge-text-secondary)]">
                  <span className="font-bold text-[var(--bridge-text)]">{item.name}</span>{' '}{item.text}
                  {item.with && <>{' '}<span className="text-[var(--bridge-text-muted)]">with</span>{' '}<span className="font-bold text-[var(--bridge-text)]">{item.with}</span></>}
                </span>
                {item.win && <span className="rounded-full border border-emerald-500/18 bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-300">🎉 Win</span>}
                <span className="text-[10px] text-[var(--bridge-text-faint)]">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          STATS — oversized numbers
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28 bg-[var(--bridge-surface-muted)]/22">
        <div aria-hidden className="l-blob pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
          style={{ background:'radial-gradient(circle,var(--bridge-aurora-1) 0%,transparent 65%)' }} />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">By the numbers</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                A platform people <span className="text-gradient-bridge">actually use</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-y-12 gap-x-8 sm:grid-cols-4">
            <StatItem target={2400} suffix="+"  label="Vetted mentors"   accent="from-orange-500 to-amber-400" />
            <StatItem target={4800} suffix="+"  label="Sessions booked"  accent="from-amber-500 to-orange-400" />
            <StatItem target={4.9}  suffix="/5" label="Average rating"   accent="from-rose-400 to-orange-500" decimal />
            <StatItem target={97}   suffix="%"  label="Would recommend"  accent="from-emerald-400 to-teal-500" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          BEFORE / AFTER — transformation section
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-32 bg-[var(--bridge-canvas)]">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">The difference</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                Before Bridge.<br/><span className="text-gradient-bridge">After Bridge.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Before */}
            <Reveal delay={0}>
              <TiltCard className="group relative overflow-hidden rounded-3xl border border-red-500/15 bg-[var(--bridge-surface)] p-8 shadow-bridge-card" intensity={5}>
                <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background:'radial-gradient(ellipse 70% 50% at 50% 0%,rgba(239,68,68,0.055),transparent 70%)' }} />
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/8 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Without Bridge
                </div>
                <div className="space-y-4">
                  {[
                    { icon:'✉️', title:'Cold LinkedIn DMs', desc:'~10% reply rate. Weeks of silence. No structure.' },
                    { icon:'❓', title:'Who are these coaches?', desc:'Unverified backgrounds. Hidden pricing. Vague outcomes.' },
                    { icon:'🎲', title:'Guessing what to work on', desc:'Generic advice that doesn\'t apply to your situation.' },
                    { icon:'🔁', title:'3-month package lock-in', desc:'Forced commitment before you even know if it\'s working.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3.5 rounded-2xl border border-red-500/10 bg-red-500/[0.04] px-4 py-3.5 transition-all hover:border-red-500/20">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <p className="text-[13px] font-bold text-[var(--bridge-text)] line-through decoration-red-400/60">{item.title}</p>
                        <p className="mt-0.5 text-[11px] text-[var(--bridge-text-muted)] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TiltCard>
            </Reveal>

            {/* After */}
            <Reveal delay={120}>
              <TiltCard className="group relative overflow-hidden rounded-3xl border border-orange-500/25 bg-[var(--bridge-surface)] p-8 shadow-bridge-glow" intensity={5}>
                <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background:'radial-gradient(ellipse 70% 50% at 50% 0%,rgba(234,88,12,0.1),transparent 70%)' }} />
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                  <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60"/><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-400"/></span> With Bridge
                </div>
                <div className="space-y-4">
                  {[
                    { icon:'🎯', title:'AI matches in seconds', desc:'Tell us your goal. Ranked mentors surface instantly — no browsing 1,000 profiles.' },
                    { icon:'✅', title:'Vetted professionals only', desc:'Real bios, honest rates, unfiltered reviews on every profile.' },
                    { icon:'🧭', title:'Structured 4-format sessions', desc:'Career Advice, Interview Prep, Resume Review, Networking — you choose.' },
                    { icon:'⚡', title:'One session at a time', desc:'Pay per session. Cancel nothing. Total flexibility from day one.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3.5 rounded-2xl border border-orange-500/15 bg-orange-500/[0.05] px-4 py-3.5 transition-all hover:border-orange-500/30 hover:bg-orange-500/[0.08]">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <p className="text-[13px] font-bold text-[var(--bridge-text)]">{item.title}</p>
                        <p className="mt-0.5 text-[11px] text-[var(--bridge-text-muted)] leading-relaxed">{item.desc}</p>
                      </div>
                      <svg className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  ))}
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          HOW IT WORKS — numbered journey
      ════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative overflow-hidden py-32 bg-[var(--bridge-surface-muted)]/28">
        <div aria-hidden className="l-blob pointer-events-none absolute left-1/2 top-1/2 h-[750px] w-[750px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-16"
          style={{ background:'radial-gradient(circle,var(--bridge-aurora-2) 0%,transparent 65%)' }} />
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">How it works</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                Three steps.<br/><span className="text-gradient-bridge">One hour.</span><br/>Real momentum.
              </h2>
            </div>
          </Reveal>

          <div className="relative grid gap-6 sm:grid-cols-3">
            {/* Connector */}
            <div aria-hidden className="pointer-events-none absolute top-12 left-[calc(16.67%+3rem)] right-[calc(16.67%+3rem)] hidden h-px sm:block"
              style={{ background:'linear-gradient(90deg,transparent 0%,var(--bridge-border-strong) 20%,var(--bridge-border-strong) 80%,transparent 100%)' }} />

            {[
              { num:'01', accent:'from-orange-500 to-amber-400', chip:'"PM at a Series B"',
                icon:<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" strokeLinecap="round"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>,
                title:'Tell us your goal', desc:'Plain English. Our AI searches 2,400+ professionals and ranks the exact few most likely to move the needle.' },
              { num:'02', accent:'from-amber-400 to-orange-400', chip:'98% match · $60/session',
                icon:<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title:'Pick your mentor', desc:'Real bios, honest reviews, exact rates — all visible before you commit. No surprises.' },
              { num:'03', accent:'from-emerald-400 to-teal-500', chip:'Session confirmed ✓',
                icon:<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title:'Book and get unstuck', desc:'Real-time availability. Built-in video room. No Zoom links, no scheduling back-and-forth.' },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 140}>
                <TiltCard className="group relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-card hover:border-orange-500/30 hover:shadow-bridge-glow">
                  <div className={`font-display text-[6rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br ${step.accent} opacity-9 transition-opacity duration-300 group-hover:opacity-20`}>{step.num}</div>
                  <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/16">{step.icon}</div>
                  <h3 className="mt-5 text-lg font-bold text-[var(--bridge-text)]">{step.title}</h3>
                  <p className="mt-2.5 text-sm text-[var(--bridge-text-muted)] leading-relaxed">{step.desc}</p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-3.5 py-1.5 text-[10px] font-bold text-[var(--bridge-text-faint)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400"/>{step.chip}
                  </div>
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"/>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          MENTOR MARQUEE
      ════════════════════════════════════════════════════════ */}
      <section id="mentors" className="relative overflow-hidden py-28 bg-[var(--bridge-canvas)]">
        <Reveal>
          <div className="mb-14 px-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Our mentors</p>
            <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
              Professionals who've been<br/><span className="text-gradient-bridge">where you want to go</span>
            </h2>
          </div>
        </Reveal>

        <div className="l-marquee-wrap">
          <div className="overflow-hidden mask-x">
            <div className="l-ticker flex w-max gap-4 pb-4 pr-4">
              {[...MENTORS_ROW1, ...MENTORS_ROW1].map((m, i) => <MarqueeCard key={i} m={m} />)}
            </div>
          </div>
        </div>
        <div className="l-marquee-wrap mt-4">
          <div className="overflow-hidden mask-x">
            <div className="l-ticker-rev flex w-max gap-4 pr-4">
              {[...MENTORS_ROW2, ...MENTORS_ROW2].map((m, i) => <MarqueeCard key={i} m={m} />)}
            </div>
          </div>
        </div>

        <div className="mt-14 flex justify-center px-4">
          <MagneticWrap>
            <Link to="/mentors"
              className="btn-sheen group inline-flex items-center gap-2.5 rounded-full border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-8 py-4 text-sm font-bold text-[var(--bridge-text)] shadow-bridge-card transition-all hover:border-orange-500/45 hover:shadow-bridge-glow">
              Browse all 2,400+ mentors
              <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </MagneticWrap>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════════════ */}
      <section id="outcomes" className="relative overflow-hidden py-32"
        style={{ background:'linear-gradient(180deg,var(--bridge-canvas) 0%,#160a04 8%,#0d0603 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ backgroundImage:'linear-gradient(rgba(234,88,12,0.038) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,0.038) 1px,transparent 1px)', backgroundSize:'72px 72px' }} />
        <div aria-hidden className="l-blob pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-16"
          style={{ background:'radial-gradient(circle,rgba(234,88,12,0.5) 0%,transparent 65%)' }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.028]" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400">Real outcomes</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                People who <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">got unstuck</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {OUTCOMES.map((o, i) => (
              <Reveal key={i} delay={i * 80}>
                <TestimonialCard o={o} idx={i} active={activeTestimonial === i} onClick={() => setActiveTestimonial(i)} />
              </Reveal>
            ))}
          </div>

          <div className="mt-10 flex justify-center gap-2">
            {OUTCOMES.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === activeTestimonial ? 'w-10 bg-orange-400' : 'w-2 bg-white/15 hover:bg-white/30'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Dark → canvas */}
      <div aria-hidden className="pointer-events-none h-24 w-full"
        style={{ background:'linear-gradient(to bottom,#0d0603 0%,var(--bridge-canvas) 100%)' }} />

      {/* ════════════════════════════════════════════════════════
          PRINCIPLES — numbered list (Impeccable/Icomat-inspired)
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28 bg-[var(--bridge-canvas)]">
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-16">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Our principles</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                What we believe<br/><span className="text-gradient-bridge">makes this work</span>
              </h2>
            </div>
          </Reveal>

          <div className="space-y-0 divide-y divide-[var(--bridge-border)]">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="group flex items-start gap-6 py-7 transition-all duration-300 hover:bg-orange-500/[0.02] -mx-4 px-4 rounded-2xl">
                  <span className="shrink-0 font-display text-[2.2rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-orange-500/40 to-amber-400/25 transition-all duration-300 group-hover:from-orange-500 group-hover:to-amber-400"
                    style={{ minWidth: '3.2rem' }}>{p.num}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-[var(--bridge-border)] transition-all duration-700 group-hover:bg-orange-500/30" />
                    </div>
                    <h3 className="mt-2.5 text-[1.05rem] font-bold text-[var(--bridge-text)]">{p.title}</h3>
                    <p className="mt-1.5 text-sm text-[var(--bridge-text-muted)] leading-relaxed max-w-xl">{p.desc}</p>
                  </div>
                  <svg className="mt-2 h-5 w-5 shrink-0 text-[var(--bridge-border-strong)] transition-all duration-300 group-hover:text-orange-500 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          BENTO FEATURES
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28 bg-[var(--bridge-surface-muted)]/28">
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Why Bridge</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                Built for <span className="text-gradient-bridge">real results</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon:'🧠', title:'AI-powered matching',       desc:'Describe your goal in plain English. Our model ranks 2,400+ mentors by relevance to your exact situation.',  accent:'from-orange-500/15 to-amber-500/8'   },
              { icon:'🔒', title:'Vetted professionals only',  desc:'Every mentor is reviewed. No random strangers, no unverified bios.',                                          accent:'from-violet-500/10 to-purple-500/5'  },
              { icon:'⚡', title:'One session at a time',      desc:'No packages, no subscriptions. Pay for one hour, commit to nothing.',                                          accent:'from-amber-500/15 to-orange-500/8'  },
              { icon:'📹', title:'Built-in video rooms',       desc:'No Zoom links. Your room is auto-generated and ready the moment your session is accepted.',                    accent:'from-sky-500/10 to-blue-500/5'      },
              { icon:'📆', title:'Real-time availability',     desc:'Google Calendar integration. See actual open slots, book in 30 seconds.',                                       accent:'from-teal-500/10 to-emerald-500/5'  },
              { icon:'⭐', title:'Honest, unfiltered reviews', desc:'All reviews visible. No curated testimonials. Know exactly who you\'re booking.',                               accent:'from-rose-500/10 to-pink-500/5'     },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 60}>
                <TiltCard className="group relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/30 hover:shadow-bridge-glow">
                  <div aria-hidden className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br ${f.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl ring-1 ring-orange-500/15 transition-all duration-300 group-hover:bg-orange-500/16 group-hover:ring-orange-500/30">{f.icon}</div>
                    <h3 className="mt-5 text-base font-bold text-[var(--bridge-text)]">{f.title}</h3>
                    <p className="mt-2.5 text-sm text-[var(--bridge-text-muted)] leading-relaxed">{f.desc}</p>
                  </div>
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/38 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"/>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          COMPARISON TABLE
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-28 bg-[var(--bridge-canvas)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Why not just DM on LinkedIn?</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                Bridge vs the alternatives
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-card">
              <div className="grid grid-cols-4 border-b border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/40">
                <div className="px-5 py-4"/>
                {['LinkedIn DMs','Life Coaching','Bridge'].map((h, i) => (
                  <div key={h} className={`border-l border-[var(--bridge-border)] px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] ${i===2?'text-orange-500':'text-[var(--bridge-text-muted)]'}`}>
                    {i===2 ? (
                      <span className="inline-flex flex-col items-center gap-1">
                        {h}
                        <span className="rounded-full bg-orange-500/12 px-2 py-0.5 text-[8px] font-black text-orange-500 uppercase tracking-widest">best</span>
                      </span>
                    ) : h}
                  </div>
                ))}
              </div>
              {WHY_ROWS.map((row, i) => (
                <div key={i} className={`grid grid-cols-4 border-b border-[var(--bridge-border)]/40 last:border-0 ${i%2===0?'':'bg-[var(--bridge-surface-muted)]/18'}`}>
                  <div className="px-5 py-4 text-[12px] font-semibold text-[var(--bridge-text-secondary)]">{row.label}</div>
                  {[row.dm, row.coaching, row.bridge].map((v, j) => (
                    <div key={j} className={`border-l border-[var(--bridge-border)]/35 px-4 py-4 text-center text-[12px] ${j===2?'font-bold text-orange-500':'text-[var(--bridge-text-muted)]'}`}>
                      {j===2&&v!=='—' ? (
                        <span className="inline-flex items-center justify-center gap-1.5">
                          <svg className="h-3.5 w-3.5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {v}
                        </span>
                      ) : v}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Canvas → dark CTA */}
      <div aria-hidden className="pointer-events-none h-52 w-full"
        style={{ background:'linear-gradient(to bottom,var(--bridge-canvas) 0%,rgba(220,155,70,0.06) 14%,rgba(195,110,40,0.16) 26%,rgba(145,68,20,0.38) 38%,rgba(95,42,12,0.63) 50%,rgba(62,26,8,0.83) 62%,#2e1606 75%,#1e0d04 87%,#150803 100%)' }} />

      {/* ════════════════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════════════════ */}
      <section id="get-started" className="relative overflow-hidden py-40" style={{ backgroundColor:'var(--bridge-hero-bg)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ backgroundImage:'linear-gradient(rgba(234,88,12,0.042) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,0.042) 1px,transparent 1px)', backgroundSize:'72px 72px' }} />

        {/* Massive glow */}
        <div aria-hidden className="l-blob pointer-events-none absolute left-1/2 top-1/2 h-[950px] w-[950px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background:'radial-gradient(circle,rgba(234,88,12,0.24) 0%,rgba(234,88,12,0.04) 42%,transparent 68%)' }} />

        {/* Portal rings */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
          <div className="border-gradient-bridge animate-border-bridge h-[620px] w-[620px] rounded-full opacity-10" />
        </div>
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
          <div className="border-gradient-bridge animate-border-bridge h-[420px] w-[420px] rounded-full opacity-7"
            style={{ animationDuration:'10s', animationDirection:'reverse' }} />
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.028]" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-orange-500/20 bg-orange-500/8 px-5 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.26em] text-orange-400/80">Ready to get unstuck?</span>
            </div>

            <h2 className="font-display leading-[0.9] tracking-tight text-white"
              style={{ fontSize:'clamp(2.8rem,7vw,6rem)', fontWeight:900 }}>
              One conversation<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500"
                style={{ filter:'drop-shadow(0 0 50px rgba(234,88,12,0.65))' }}>
                changes everything.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-md text-base text-white/38 leading-relaxed">
              Stop spinning. Book a session with someone who's walked the exact path you're on — and made it through.
            </p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <MagneticWrap>
                <Link to={user ? '/mentors' : '/register'}
                  className="btn-sheen relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-11 py-5 text-base font-bold text-white shadow-[0_0_80px_rgba(234,88,12,0.6)] transition hover:shadow-[0_0_110px_rgba(234,88,12,0.9)] hover:scale-[1.05] active:scale-[0.97]">
                  Get started for free
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </MagneticWrap>
              <Link to="/about" className="text-sm font-semibold text-white/28 underline underline-offset-4 transition hover:text-white/60">
                Learn more about Bridge
              </Link>
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[10px] text-white/18">
              {['No credit card required','First session guaranteed','Cancel any time'].map((t, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i>0 && <span className="h-1 w-1 rounded-full bg-white/14"/>}
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
