/**
 * dashboardCinematic — high-end UI primitives for the dashboard.
 * Pure presentational. No API calls, no Supabase, no calendar/video logic.
 * Reuses the existing Bridge orange/amber palette + design tokens.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

const STYLE_ID = 'bridge-dashboard-cinematic-styles';
const CSS = `
@keyframes bDashAurora{0%,100%{transform:translate3d(0,0,0) scale(1)}33%{transform:translate3d(4%,-3%,0) scale(1.04)}66%{transform:translate3d(-3%,4%,0) scale(.97)}}
.bd-aurora{animation:bDashAurora 22s ease-in-out infinite;will-change:transform}
@keyframes bDashShine{0%{transform:translateX(-100%)}55%,100%{transform:translateX(220%)}}
.bd-shine{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:inherit}
.bd-shine::after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.18) 50%,transparent 70%);transform:translateX(-100%);animation:bDashShine 2.4s cubic-bezier(.2,.6,.2,1) infinite;mix-blend-mode:overlay}
.bd-card-edge{position:relative;isolation:isolate}
.bd-card-edge::before{content:'';position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:linear-gradient(135deg,rgba(234,88,12,.0) 0%,rgba(234,88,12,.45) 35%,rgba(251,191,36,.35) 65%,rgba(234,88,12,0) 100%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity 350ms ease;pointer-events:none;z-index:1}
.bd-card-edge:hover::before{opacity:1}
@keyframes bDashRise{from{opacity:0;transform:translate3d(0,12px,0)}to{opacity:1;transform:none}}
.bd-rise{animation:bDashRise .55s cubic-bezier(.16,1,.3,1) both}
@keyframes bDashGoalGlow{0%,100%{filter:drop-shadow(0 0 6px rgba(234,88,12,.45))}50%{filter:drop-shadow(0 0 14px rgba(251,191,36,.7))}}
.bd-goal-glow{animation:bDashGoalGlow 3.2s ease-in-out infinite}
@keyframes bDashSpark{from{transform:scaleY(0)}to{transform:scaleY(var(--bd-h,1))}}
.bd-spark-bar{transform-origin:bottom;animation:bDashSpark .9s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--bd-d,0ms)}
.bd-grain{position:absolute;inset:0;pointer-events:none;mix-blend-mode:overlay;opacity:.06;background-image:radial-gradient(circle at 1px 1px,#fff 1px,transparent 0);background-size:3px 3px}
@keyframes bDashPulseRing{0%{box-shadow:0 0 0 0 rgba(234,88,12,.55),0 0 0 0 rgba(251,191,36,.35)}70%{box-shadow:0 0 0 14px rgba(234,88,12,0),0 0 0 22px rgba(251,191,36,0)}100%{box-shadow:0 0 0 0 rgba(234,88,12,0),0 0 0 0 rgba(251,191,36,0)}}
.bd-pulse-ring{animation:bDashPulseRing 2.4s cubic-bezier(.4,0,.6,1) infinite}
@keyframes bDashNameShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.bd-name-shimmer{background-image:linear-gradient(110deg,transparent 0%,transparent 35%,rgba(255,255,255,.55) 50%,transparent 65%,transparent 100%);background-size:200% 100%;background-repeat:no-repeat;-webkit-background-clip:text;background-clip:text;animation:bDashNameShimmer 4.8s ease-in-out infinite}
@keyframes bDashStatusShine{0%{transform:translateX(-120%) skewX(-18deg)}55%,100%{transform:translateX(220%) skewX(-18deg)}}
.bd-status-shine{position:relative;overflow:hidden}
.bd-status-shine::after{content:'';position:absolute;top:0;bottom:0;left:0;width:40%;background:linear-gradient(110deg,transparent 0%,rgba(255,255,255,.55) 50%,transparent 100%);animation:bDashStatusShine 3.2s cubic-bezier(.2,.6,.2,1) infinite;pointer-events:none}
@media (prefers-reduced-motion: reduce){.bd-aurora,.bd-shine::after,.bd-rise,.bd-goal-glow,.bd-spark-bar,.bd-pulse-ring,.bd-name-shimmer,.bd-status-shine::after{animation:none!important}}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const tag = document.createElement('style');
  tag.id = STYLE_ID;
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

/* ─── useInView ──────────────────────────────────────────────── */
export function useInView(opts = { threshold: 0.2, once: true }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    ensureStyles();
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (opts.once) io.disconnect();
        } else if (!opts.once) {
          setInView(false);
        }
      },
      { threshold: opts.threshold ?? 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [opts.threshold, opts.once]);
  return [ref, inView];
}

/* ─── KineticNumber ──────────────────────────────────────────── */
/** Animated count-up. Decimal supported. Tabular nums. */
export function KineticNumber({ to = 0, ms = 1000, decimal = false, suffix = '', prefix = '', className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.3, once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 4);
      setVal(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, ms]);
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {decimal ? val.toFixed(1) : Math.round(val).toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── GoalRing ───────────────────────────────────────────────── */
/** Circular progress ring with neon glow. Defaults sized for a bento tile. */
export function GoalRing({ value = 0, max = 1, size = 152, label = 'Goal', sub = null }) {
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  const [ref, inView] = useInView({ threshold: 0.4, once: true });
  const animatedDash = inView ? dash : 0;
  return (
    <div ref={ref} className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="bd-goal-glow -rotate-90">
        <defs>
          <linearGradient id="bdGoalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(234,88,12,0.10)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#bdGoalGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${animatedDash} ${c}`}
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.16,1,.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-[2.1rem] font-black tabular-nums leading-none tracking-tight text-[var(--bridge-text)]">
          <KineticNumber to={Math.round(pct * 100)} ms={900} suffix="%" />
        </p>
        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] font-semibold text-[var(--bridge-text-faint)]">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Sparkline ──────────────────────────────────────────────── */
/** Tiny bar chart. Accepts data array of numbers. */
export function Sparkline({ data = [], height = 56, className = '' }) {
  const max = Math.max(1, ...data);
  return (
    <div className={`flex items-end gap-[3px] ${className}`} style={{ height }}>
      {data.map((v, i) => {
        const h = Math.max(0.06, v / max);
        const tone = v === 0
          ? 'bg-[var(--bridge-border)]'
          : 'bg-gradient-to-t from-orange-500 via-amber-400 to-orange-300';
        return (
          <span
            key={i}
            className={`bd-spark-bar block w-full min-w-[3px] rounded-sm ${tone}`}
            style={{ height: `${h * 100}%`, '--bd-h': h, '--bd-d': `${i * 35}ms` }}
            title={`${v}`}
          />
        );
      })}
    </div>
  );
}

/* ─── Tilt3D ─────────────────────────────────────────────────── */
/** Mousemove parallax tilt. Wraps a single child. */
export function Tilt3D({ children, max = 6, className = '', glare = true }) {
  const ref = useRef(null);
  useEffect(() => {
    ensureStyles();
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let tx = 0, ty = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tx = -py * max;
      ty = px * max;
      el.style.setProperty('--bd-glare-x', `${(px + 0.5) * 100}%`);
      el.style.setProperty('--bd-glare-y', `${(py + 0.5) * 100}%`);
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const apply = () => {
      raf = 0;
      el.style.transform = `perspective(1000px) rotateX(${tx}deg) rotateY(${ty}deg)`;
    };
    const onLeave = () => {
      tx = 0; ty = 0;
      el.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
      el.style.setProperty('--bd-glare-x', `50%`);
      el.style.setProperty('--bd-glare-y', `50%`);
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [max]);
  return (
    <div
      ref={ref}
      className={`relative will-change-transform transition-transform duration-150 ease-out ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
      {glare && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{
            background: 'radial-gradient(circle at var(--bd-glare-x,50%) var(--bd-glare-y,50%), rgba(255,255,255,0.10), transparent 40%)',
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </div>
  );
}

/* ─── Magnetic ───────────────────────────────────────────────── */
/** Magnetic hover wrapper for buttons/links. */
export function Magnetic({ children, strength = 0.32, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = `translate3d(0,0,0)`;
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);
  return (
    <span ref={ref} className={`inline-block transition-transform duration-200 ease-out ${className}`}>
      {children}
    </span>
  );
}

/* ─── ShineHover ─────────────────────────────────────────────── */
/** Adds an animated gradient sweep border on hover. Wraps a single child. */
export function ShineHover({ children, className = '' }) {
  return (
    <span className={`relative bd-card-edge ${className}`}>
      {children}
    </span>
  );
}

/* ─── AuroraBg ───────────────────────────────────────────────── */
/** Drift-animated gradient orbs behind the dashboard. Fixed, behind content. */
export function AuroraBg() {
  useEffect(() => { ensureStyles(); }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="bd-aurora absolute -top-1/4 -left-1/4 h-[60vmax] w-[60vmax] rounded-full opacity-[0.15]"
        style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.55) 0%, transparent 65%)', filter: 'blur(60px)' }}
      />
      <div
        className="bd-aurora absolute top-1/3 -right-1/4 h-[55vmax] w-[55vmax] rounded-full opacity-[0.10]"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 65%)', animationDelay: '-7s', filter: 'blur(70px)' }}
      />
      <div
        className="bd-aurora absolute -bottom-1/4 left-1/4 h-[40vmax] w-[40vmax] rounded-full opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.45) 0%, transparent 65%)', animationDelay: '-14s', filter: 'blur(80px)' }}
      />
      <div className="bd-grain" />
    </div>
  );
}

/* ─── useDailyActivity ───────────────────────────────────────── */
/** Returns last `days` days of session counts (most recent last). */
export function useDailyActivity(sessions = [], days = 14) {
  return useMemo(() => {
    const out = new Array(days).fill(0);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const DAY = 24 * 60 * 60 * 1000;
    for (const s of sessions) {
      const t = new Date(s.created_at ?? s.scheduled_date).getTime();
      if (!Number.isFinite(t)) continue;
      const delta = Math.floor((today - t) / DAY);
      if (delta < 0 || delta >= days) continue;
      out[days - 1 - delta] += 1;
    }
    return out;
  }, [sessions, days]);
}

/* ─── useGoalProgress ────────────────────────────────────────── */
/** Completed sessions in current calendar month vs target. */
export function useGoalProgress(sessions = [], target = 4) {
  return useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const completed = sessions.filter(
      (s) => s.status === 'completed' && new Date(s.scheduled_date ?? s.created_at).getTime() >= monthStart,
    ).length;
    return { completed, target, pct: target > 0 ? Math.min(1, completed / target) : 0 };
  }, [sessions, target]);
}
