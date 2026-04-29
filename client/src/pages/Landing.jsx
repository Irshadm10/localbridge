import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedMentors } from '../api/mentors';
import Reveal from '../components/Reveal';
import { useAuth } from '../context/useAuth';

function useCountUp(target, duration = 2200) {
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

const AVATAR_GRAD = {
  amber: 'from-amber-400 to-orange-500', emerald: 'from-emerald-400 to-teal-500',
  sky: 'from-sky-400 to-blue-500', rose: 'from-rose-400 to-pink-500',
  violet: 'from-violet-400 to-purple-500', teal: 'from-teal-400 to-emerald-500',
  orange: 'from-orange-400 to-rose-500', pink: 'from-pink-400 to-rose-500',
};

const ACTIVITY = [
  { ini: 'TN', name: 'Tyler N.',  tone: 'amber',   text: 'booked Interview Prep',        with: 'Maya Chen',     time: '2m ago'  },
  { ini: 'PS', name: 'Priya S.',  tone: 'emerald', text: 'landed a Staff PM role',       with: '',              time: '1h ago',  win: true },
  { ini: 'LK', name: 'Liam K.',   tone: 'sky',     text: 'booked Resume Review',         with: 'Jordan R.',     time: '5m ago'  },
  { ini: 'AM', name: 'Aisha M.',  tone: 'rose',    text: 'accepted an offer at Figma',   with: '',              time: '3h ago',  win: true },
  { ini: 'JD', name: 'James D.',  tone: 'violet',  text: 'booked Career Advice',         with: 'Elena Voss',    time: '8m ago'  },
  { ini: 'SR', name: 'Sofia R.',  tone: 'teal',    text: 'left a 5-star review',         with: 'Marcus Lee',    time: '11m ago' },
  { ini: 'KH', name: 'Kai H.',    tone: 'orange',  text: 'booked a Networking call',     with: 'Tom Rodriguez', time: '15m ago' },
  { ini: 'NP', name: 'Nina P.',   tone: 'pink',    text: 'made the switch from finance', with: '',              time: '6h ago',  win: true },
];

const MENTORS_ROW1 = [
  { name: 'Maya Chen',      title: 'Director of Product',  co: 'Linear',     tags: ['PM Strategy','Promotion'],    rate: 95,  rating: 4.9, sessions: 86,  tone: 'amber'  },
  { name: 'Jordan Reeves',  title: 'Ex-FAANG Recruiter',   co: 'Google',     tags: ['Interview Prep','Offers'],    rate: 60,  rating: 4.8, sessions: 142, tone: 'orange' },
  { name: 'Elena Voss',     title: 'RN → UX Designer',     co: 'IDEO',       tags: ['Career Switch','Portfolio'],  rate: 45,  rating: 5.0, sessions: 58,  tone: 'rose'   },
  { name: 'Marcus Lee',     title: 'Engineering Manager',   co: 'Stripe',     tags: ['EM Path','System Design'],   rate: 120, rating: 4.9, sessions: 203, tone: 'sky'    },
  { name: 'Dr. Aisha Park', title: 'Biotech Founder',       co: 'Stanford',   tags: ['Fundraising','Science Biz'], rate: 150, rating: 4.7, sessions: 37,  tone: 'violet' },
  { name: 'Tom Rodriguez',  title: 'VP of Sales',           co: 'Salesforce', tags: ['Enterprise Sales','SDR→AE'], rate: 55,  rating: 4.8, sessions: 95,  tone: 'teal'   },
];
const MENTORS_ROW2 = [
  { name: 'Sarah Kim',      title: 'Head of Design',        co: 'Airbnb',     tags: ['Design Systems','Leadership'], rate: 85,  rating: 4.9, sessions: 64,  tone: 'pink'   },
  { name: 'Raj Patel',      title: 'Principal Engineer',    co: 'Meta',       tags: ['Architecture','Staff Eng'],    rate: 110, rating: 4.8, sessions: 118, tone: 'emerald'},
  { name: 'Camille Dubois', title: 'Brand Strategist',      co: 'Nike',       tags: ['Brand','Creative Strategy'],  rate: 70,  rating: 5.0, sessions: 43,  tone: 'rose'   },
  { name: 'Alex Wong',      title: 'Growth Lead',           co: 'Notion',     tags: ['Growth','Retention','PLG'],   rate: 90,  rating: 4.7, sessions: 77,  tone: 'amber'  },
  { name: 'Diana Ferreira', title: 'Data Science Manager',  co: 'Spotify',    tags: ['ML','Analytics'],              rate: 100, rating: 4.9, sessions: 52,  tone: 'sky'    },
  { name: 'Omar Hassan',    title: 'Startup Founder',        co: 'YC W23',     tags: ['Fundraising','0→1'],           rate: 130, rating: 4.8, sessions: 29,  tone: 'teal'   },
];

const OUTCOMES = [
  { result: 'Got the offer',      metric: '+32% comp',       name: 'Tyler N.',  role: 'Senior Engineer',    tone: 'amber',   quote: 'Two sessions with a former FAANG recruiter. She rewrote my "tell me about yourself" in ten minutes. Offer came a week later.' },
  { result: 'Changed industries', metric: 'Banking → PM',   name: 'Priya S.',  role: 'Ex-Analyst, now PM', tone: 'emerald', quote: 'I was terrified to leave finance. One session with someone who made the exact same jump saved me six months of second-guessing.' },
  { result: 'Got promoted',       metric: 'IC → Staff',      name: 'Jordan E.', role: 'Staff Engineer',     tone: 'sky',     quote: "Stuck at Senior for four years. My mentor called out exactly which work didn't count. Promoted in the next cycle." },
];

const WHY_ROWS = [
  { label: 'You get a response',      dm: '~10% reply rate',  coaching: 'Always',            bridge: 'Always — mentors opt in' },
  { label: "They've done your job",   dm: 'Maybe',            coaching: 'Rarely',            bridge: "Yes — that's the filter" },
  { label: 'Structured session',      dm: 'No',               coaching: 'Yes',               bridge: 'Yes — 4 named formats'   },
  { label: 'Price shown upfront',     dm: '—',                coaching: 'Often hidden',      bridge: 'On every profile'        },
  { label: 'Real unfiltered reviews', dm: 'No',               coaching: 'Curated only',      bridge: 'All reviews, unfiltered' },
  { label: 'Commitment',              dm: 'None',             coaching: 'Multi-session pkg', bridge: 'One session at a time'   },
];

function TiltCard({ children, className = '', intensity = 7 }) {
  const ref = useRef(null);
  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--tilt-x', `${(y - 0.5) * -intensity}deg`);
    el.style.setProperty('--tilt-y', `${(x - 0.5) * intensity}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  }, [intensity]);
  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  }, []);
  return (
    <div ref={ref} className={`tilt-card cursor-glow ${className}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </div>
  );
}

function FloatingDock({ user }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      const y = window.scrollY;
      const heroH = window.innerHeight;
      const nearBottom = y + window.innerHeight > document.documentElement.scrollHeight - 250;
      setVisible(y > heroH * 0.82 && !nearBottom);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  const items = [
    { label: 'Browse Mentors',   href: '/mentors',        route: true  },
    { label: 'How It Works',     href: '#how-it-works',   route: false },
    { label: 'Success Stories',  href: '#outcomes',       route: false },
    { label: 'Pricing',          href: '/pricing',        route: true  },
    { label: user ? 'Dashboard →' : 'Get Started →', href: user ? '/dashboard' : '/register', route: true, primary: true },
  ];

  return (
    <div
      aria-hidden={!visible || dismissed}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ease-out"
      style={{
        transform: `translateX(-50%) translateY(${visible && !dismissed ? '0' : '5rem'})`,
        opacity: visible && !dismissed ? 1 : 0,
        pointerEvents: visible && !dismissed ? 'auto' : 'none',
      }}
    >
      <div className="flex items-center gap-1 rounded-full border border-white/[0.09] bg-[#0c0906]/92 px-2 py-2 shadow-[0_16px_60px_rgba(0,0,0,0.7),0_0_80px_rgba(234,88,12,0.12)] backdrop-blur-2xl">
        {items.map((item, i) =>
          item.route ? (
            <Link key={i} to={item.href}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-semibold transition-all ${
                item.primary
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_28px_rgba(234,88,12,0.45)] hover:shadow-[0_0_40px_rgba(234,88,12,0.65)]'
                  : 'text-white/45 hover:bg-white/[0.06] hover:text-white/85'
              }`}>
              {item.label}
            </Link>
          ) : (
            <a key={i} href={item.href}
              className="whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-semibold text-white/45 transition hover:bg-white/[0.06] hover:text-white/85">
              {item.label}
            </a>
          )
        )}
        <button onClick={() => setDismissed(true)} aria-label="Dismiss"
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-white/18 transition hover:bg-white/[0.08] hover:text-white/50">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ProductScene() {
  const [scene, setScene] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setScene(s => (s + 1) % 3), 3400);
    return () => clearInterval(id);
  }, []);
  const scenes = [
    <div key="search" className="flex flex-col gap-3 px-4 py-4 sm:px-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-400">AI Mentor Match</p>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
        <svg className="h-3.5 w-3.5 shrink-0 text-white/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>
        <span className="text-xs text-white/45">I want to become a PM at a Series B startup</span>
        <span className="ml-auto h-4 w-px animate-pulse bg-orange-400" />
      </div>
      <div className="space-y-2">
        {[
          { ini: 'MC', name: 'Maya Chen',     tag: 'PM Strategy',    match: 98, tone: 'amber'  },
          { ini: 'JR', name: 'Jordan Reeves', tag: 'Product Growth', match: 94, tone: 'orange' },
          { ini: 'EV', name: 'Elena Voss',    tag: 'Career Switch',  match: 91, tone: 'rose'   },
        ].map((m, i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2 transition hover:bg-white/[0.08]">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[m.tone]} text-[9px] font-bold text-white`}>{m.ini}</div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-white">{m.name}</p>
              <p className="text-[10px] text-white/35">{m.tag}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-14 overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${m.match}%` }} />
              </div>
              <span className="text-[10px] font-bold text-orange-400">{m.match}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>,
    <div key="profile" className="flex flex-col gap-3 px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow-[0_4px_16px_rgba(234,88,12,0.4)]">MC</div>
        <div>
          <p className="text-sm font-semibold text-white">Maya Chen</p>
          <p className="text-[11px] text-white/45">Director of Product · Linear</p>
        </div>
        <div className="ml-auto rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">● Available</div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {['PM Strategy','Promotion','Roadmapping'].map(t => (
          <span key={t} className="rounded-full border border-orange-500/25 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-medium text-orange-300">{t}</span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[['4.9 ★','Rating'],['86','Sessions'],['$95','/ session']].map(([v,l]) => (
          <div key={l} className="rounded-xl bg-white/[0.05] px-2 py-2 text-center">
            <p className="text-sm font-bold text-white">{v}</p>
            <p className="text-[9px] text-white/35">{l}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {['Career Advice','Interview Prep','Resume Review'].map(t => (
          <div key={t} className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-2 text-[11px] text-white/55 transition hover:border-orange-500/35 hover:text-white/85">
            <svg className="h-3 w-3 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" strokeLinecap="round"/></svg>
            {t}
          </div>
        ))}
      </div>
    </div>,
    <div key="booked" className="flex flex-col items-center gap-3 px-4 py-6 sm:px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_50px_rgba(16,185,129,0.55)]">
        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div>
        <p className="text-base font-bold text-white">Session confirmed!</p>
        <p className="mt-0.5 text-[12px] text-white/45">Tomorrow · 3:00 PM EST · 45 min</p>
      </div>
      <div className="w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white">MC</div>
          <div className="text-left">
            <p className="text-[11px] font-semibold text-white">Maya Chen</p>
            <p className="text-[10px] text-white/35">Career Advice Session</p>
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-full bg-white/[0.08] px-2 py-1 text-[10px] text-white/55">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.361a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" strokeLinecap="round"/></svg>
            Video ready
          </div>
        </div>
      </div>
      <div className="flex w-full gap-2">
        <div className="flex-1 rounded-xl bg-white/[0.05] py-2 text-[11px] font-medium text-white/55">Add to Calendar</div>
        <div className="flex-1 rounded-xl bg-orange-500 py-2 text-[11px] font-bold text-white">Join Room</div>
      </div>
    </div>,
  ];
  return (
    <div className="bridge-shine-overlay relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b0906] shadow-[0_0_100px_rgba(234,88,12,0.18),0_40px_80px_rgba(0,0,0,0.5)]" style={{ minHeight: 290 }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 60px rgba(234,88,12,0.05)' }} />
      <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/75" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/75" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/75" />
        <span className="ml-auto text-[10px] text-white/18">bridge.app</span>
      </div>
      <div className="flex border-b border-white/[0.07]">
        {['AI Match','Profile','Booked ✓'].map((tab, i) => (
          <button key={i} onClick={() => setScene(i)}
            className={`flex-1 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${scene === i ? 'border-b-2 border-orange-400 text-orange-400' : 'text-white/22 hover:text-white/45'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div key={scene} style={{ animation: 'bridge-scale-in 320ms cubic-bezier(0.16,1,0.3,1)' }}>
        {scenes[scene]}
      </div>
    </div>
  );
}

function MarqueeCard({ m }) {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--tilt-x', `${(y - 0.5) * -6}deg`);
    el.style.setProperty('--tilt-y', `${(x - 0.5) * 6}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  };
  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  };
  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      className="tilt-card cursor-glow inline-flex shrink-0 w-56 flex-col gap-3 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-4 shadow-bridge-card transition-shadow duration-300 hover:border-orange-500/35 hover:shadow-bridge-glow">
      <div className="flex items-center gap-2.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[m.tone]} text-[11px] font-bold text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)]`}>
          {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold text-[var(--bridge-text)]">{m.name}</p>
          <p className="truncate text-[10px] text-[var(--bridge-text-faint)]">{m.co}</p>
        </div>
      </div>
      <p className="text-[11px] text-[var(--bridge-text-muted)] leading-relaxed">{m.title}</p>
      <div className="flex flex-wrap gap-1">
        {m.tags.slice(0, 2).map(t => (
          <span key={t} className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[9px] font-semibold text-orange-600 dark:text-orange-300">{t}</span>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-[var(--bridge-border)] pt-2.5">
        <span className="text-[10px] font-medium text-[var(--bridge-text-muted)]">★ {m.rating} · {m.sessions} sessions</span>
        <span className="text-[11px] font-bold text-orange-500">${m.rate}/hr</span>
      </div>
    </div>
  );
}

function StatItem({ target, suffix, label, accent, decimal }) {
  const raw = decimal ? target * 10 : target;
  const [ref, value] = useCountUp(raw);
  const display = decimal ? (value / 10).toFixed(1) : value.toLocaleString();
  return (
    <div ref={ref} className="group flex flex-col items-center gap-3 text-center">
      <div className="relative">
        <p className={`font-display text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${accent} sm:text-6xl lg:text-7xl`}>
          {display}{suffix}
        </p>
        <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-15 bg-gradient-to-r ${accent}`} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--bridge-text-faint)]">{label}</p>
    </div>
  );
}

function TestimonialRotator() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % OUTCOMES.length), 4800);
    return () => clearInterval(id);
  }, []);
  const o = OUTCOMES[idx];
  return (
    <div className="flex flex-col items-center text-center">
      <div key={idx} style={{ animation: 'bridge-scale-in 400ms cubic-bezier(0.16,1,0.3,1)' }} className="flex flex-col items-center gap-5">
        <div className="flex gap-1">
          {[0,1,2,3,4].map(i => (
            <svg key={i} className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
        </div>
        <p className="max-w-xl text-[1.15rem] font-medium text-white/82 leading-relaxed">&ldquo;{o.quote}&rdquo;</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[o.tone]} text-[11px] font-bold text-white shadow-[0_0_24px_rgba(0,0,0,0.4)]`}>
            {o.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">{o.name}</p>
            <p className="text-[11px] text-white/38">{o.role}</p>
          </div>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/15 px-4 py-1.5 text-[11px] font-bold text-emerald-400">{o.result} · {o.metric}</span>
        </div>
      </div>
      <div className="mt-8 flex gap-2">
        {OUTCOMES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === idx ? 'w-10 bg-orange-400' : 'w-2 bg-white/15 hover:bg-white/30'}`} />
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="relative overflow-x-hidden">
      <FloatingDock user={user} />

      {/* ═══════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden" style={{ backgroundColor: 'var(--bridge-hero-bg)' }}>

        {/* Primary grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(234,88,12,0.055) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,0.055) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />

        {/* Radial depth overlay */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 10%,rgba(234,88,12,0.13) 0%,transparent 60%)' }} />

        {/* Orb system */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-blob-breathe absolute -top-48 left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full opacity-22"
            style={{ background: 'radial-gradient(circle,rgba(234,88,12,0.62) 0%,rgba(234,88,12,0.07) 50%,transparent 68%)' }} />
          <div className="animate-blob-breathe absolute -bottom-24 -left-60 h-[650px] w-[650px] rounded-full opacity-14"
            style={{ background: 'radial-gradient(circle,rgba(251,146,60,0.55) 0%,transparent 62%)', animationDelay: '1.8s' }} />
          <div className="animate-blob-breathe absolute top-1/3 -right-44 h-[550px] w-[550px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle,rgba(234,88,12,0.45) 0%,transparent 62%)', animationDelay: '3.2s' }} />
          <div className="absolute top-1/2 left-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-8 blur-3xl"
            style={{ background: 'radial-gradient(circle,rgba(251,191,36,0.7) 0%,transparent 70%)' }} />
        </div>

        {/* Spinning rings */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-52 -translate-x-1/2 hidden lg:block">
          <div className="border-gradient-bridge animate-border-bridge h-[720px] w-[720px] rounded-full opacity-12" />
        </div>
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-52 -translate-x-1/2 hidden lg:block">
          <div className="border-gradient-bridge animate-border-bridge h-[520px] w-[520px] rounded-full opacity-8"
            style={{ animationDuration: '11s', animationDirection: 'reverse' }} />
        </div>

        {/* Grain */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.032]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-28 sm:px-6 lg:px-8 lg:pt-40">

          {/* Live badge */}
          <div className="flex justify-center">
            <div className="group inline-flex cursor-default items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.035] px-5 py-2 backdrop-blur-xl transition hover:border-orange-500/25 hover:bg-orange-500/[0.06]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/48">Live · 2,400+ vetted mentors</span>
            </div>
          </div>

          {/* Headline */}
          <div className="mt-10 text-center" style={{ perspective: '1200px' }}>
            <h1 className="font-display leading-[0.87] tracking-tight text-white"
              style={{ fontSize: 'clamp(3.8rem,10vw,8.8rem)', fontWeight: 900 }}>
              <span className="block" style={{ opacity: 0.78 }}>Your next</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500"
                style={{ filter: 'drop-shadow(0 0 70px rgba(234,88,12,0.65))' }}>career move</span>
              <span className="block" style={{ opacity: 0.88 }}>starts with</span>
              <span className="block font-editorial italic"
                style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.85em', letterSpacing: '-0.01em' }}>
                one conversation.
              </span>
            </h1>
            <p className="mx-auto mt-10 max-w-[480px] text-[1.05rem] text-white/42 leading-relaxed">
              Real mentors. Real sessions. Real outcomes. Skip the LinkedIn cold messages — book a 1-on-1 with someone who's already done what you want to do.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <Link to={user ? '/mentors' : '/register'}
              className="btn-sheen relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 px-9 py-4 text-[0.9rem] font-bold text-white shadow-[0_0_64px_rgba(234,88,12,0.52)] transition hover:shadow-[0_0_90px_rgba(234,88,12,0.78)] hover:scale-[1.04] active:scale-[0.97]">
              Find your mentor
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link to="/dashboard"
              className="border-gradient-bridge animate-border-bridge inline-flex items-center gap-2 rounded-full px-8 py-4 text-[0.9rem] font-semibold text-white/58 transition hover:text-white/88">
              View Dashboard →
            </Link>
          </div>

          {/* Scroll hint */}
          <div className="mt-10 flex justify-center">
            <div className="flex flex-col items-center gap-2 opacity-25">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white">Scroll</span>
              <div className="flex h-8 w-5 items-start justify-center rounded-full border border-white/30 p-1">
                <div className="h-2 w-1 rounded-full bg-white/70"
                  style={{ animation: 'bridge-scale-in 2s ease-in-out infinite alternate' }} />
              </div>
            </div>
          </div>

          {/* Floating chips + product preview */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="pointer-events-none absolute -left-6 top-6 z-20 hidden xl:block"
              style={{ animation: 'landing-float-soft 7s 0.3s ease-in-out infinite' }}>
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#0b0906]/95 px-4 py-3 backdrop-blur-xl shadow-[0_10px_50px_rgba(234,88,12,0.2)]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-sm shadow-[0_4px_12px_rgba(234,88,12,0.4)]">🎯</div>
                <div>
                  <p className="text-[10px] font-bold text-white">98% AI Match</p>
                  <p className="text-[9px] text-white/32">PM Strategy · Maya Chen</p>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-6 top-10 z-20 hidden xl:block"
              style={{ animation: 'landing-float-soft 8s 1.7s ease-in-out infinite' }}>
              <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/18 bg-[#0b0906]/95 px-4 py-3 backdrop-blur-xl shadow-[0_10px_50px_rgba(16,185,129,0.18)]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm shadow-[0_4px_12px_rgba(16,185,129,0.4)]">🎉</div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-400">Offer accepted</p>
                  <p className="text-[9px] text-white/32">+32% comp · Tyler N.</p>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -left-10 bottom-16 z-20 hidden xl:block"
              style={{ animation: 'landing-float-soft 9s 1s ease-in-out infinite' }}>
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-[#0b0906]/95 px-4 py-3 backdrop-blur-xl shadow-bridge-float">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-400" />
                </span>
                <p className="text-[10px] font-bold text-white/62">3 people booking now</p>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-12 bottom-24 z-20 hidden xl:block"
              style={{ animation: 'landing-float-soft 6.5s 2.6s ease-in-out infinite' }}>
              <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/18 bg-[#0b0906]/95 px-4 py-3 backdrop-blur-xl shadow-bridge-float">
                <span className="text-sm">⭐</span>
                <div>
                  <p className="text-[10px] font-bold text-amber-400">4.9 / 5 avg</p>
                  <p className="text-[9px] text-white/32">from 4,800+ sessions</p>
                </div>
              </div>
            </div>
            <ProductScene />
          </div>
        </div>
      </section>

      {/* ── Hero → content gradient ── */}
      <div aria-hidden className="pointer-events-none h-52 w-full"
        style={{ background: 'linear-gradient(to bottom,#150803 0%,#1c0c05 10%,#281408 20%,#381c0e 32%,rgba(62,26,8,0.9) 44%,rgba(95,42,12,0.65) 56%,rgba(145,68,20,0.4) 68%,rgba(195,110,40,0.16) 80%,rgba(220,155,70,0.06) 90%,var(--bridge-canvas) 100%)' }} />

      {/* ═══════════════════════════════════════════════════════
          ACTIVITY TICKER
      ═══════════════════════════════════════════════════════ */}
      <div className="landing-marquee-hover-pause relative border-y border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/45 py-3.5">
        <div className="overflow-hidden mask-fade-x">
          <div className="flex w-max animate-landing-marquee gap-3 pr-3">
            {[...ACTIVITY, ...ACTIVITY].map((item, i) => (
              <div key={i} className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/88 px-4 py-2 shadow-bridge-tile backdrop-blur-sm">
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[item.tone]} text-[9px] font-bold text-white`}>{item.ini}</div>
                <span className="whitespace-nowrap text-[12px] font-medium text-[var(--bridge-text-secondary)]">
                  <span className="font-semibold text-[var(--bridge-text)]">{item.name}</span>{' '}{item.text}
                  {item.with && <>{' '}<span className="text-[var(--bridge-text-muted)]">with</span>{' '}<span className="font-semibold text-[var(--bridge-text)]">{item.with}</span></>}
                </span>
                {item.win && <span className="rounded-full border border-emerald-500/18 bg-emerald-500/12 px-2.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-300">🎉 Win</span>}
                <span className="text-[10px] text-[var(--bridge-text-faint)]">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          STATS
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28 bg-[var(--bridge-surface-muted)]/28">
        <div aria-hidden className="animate-blob-breathe pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-28"
          style={{ background: 'radial-gradient(circle,var(--bridge-aurora-1) 0%,transparent 62%)' }} />
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-500">By the numbers</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                A platform people<br />
                <span className="text-gradient-bridge">actually use</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-4">
            <StatItem target={2400} suffix="+"  label="Vetted mentors"  accent="from-orange-500 to-amber-400" />
            <StatItem target={4800} suffix="+"  label="Sessions booked" accent="from-amber-500 to-orange-400" />
            <StatItem target={4.9}  suffix="/5" label="Average rating"  accent="from-rose-400 to-orange-500"  decimal />
            <StatItem target={97}   suffix="%"  label="Would recommend" accent="from-emerald-400 to-teal-500" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MENTOR MARQUEE
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28 bg-[var(--bridge-canvas)]">
        <Reveal>
          <div className="mb-14 text-center px-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-500">Our mentors</p>
            <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
              Professionals who've been<br />
              <span className="text-gradient-bridge">where you want to go</span>
            </h2>
          </div>
        </Reveal>

        <div className="landing-marquee-hover-pause">
          <div className="overflow-hidden mask-fade-x">
            <div className="flex w-max animate-landing-marquee gap-4 pr-4 pb-4">
              {[...MENTORS_ROW1, ...MENTORS_ROW1].map((m, i) => <MarqueeCard key={i} m={m} />)}
            </div>
          </div>
        </div>

        <div className="landing-marquee-hover-pause mt-4">
          <div className="overflow-hidden mask-fade-x">
            <div className="flex w-max gap-4 pr-4" style={{ animation: 'landing-marquee 42s linear infinite reverse' }}>
              {[...MENTORS_ROW2, ...MENTORS_ROW2].map((m, i) => <MarqueeCard key={i} m={m} />)}
            </div>
          </div>
        </div>

        <div className="mt-14 flex justify-center px-4">
          <Link to="/mentors"
            className="btn-sheen group inline-flex items-center gap-2.5 rounded-full border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-7 py-3.5 text-sm font-semibold text-[var(--bridge-text)] shadow-bridge-card transition hover:border-orange-500/45 hover:shadow-bridge-glow">
            Browse all 2,400+ mentors
            <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative overflow-hidden py-32 bg-[var(--bridge-surface-muted)]/32">
        <div aria-hidden className="animate-blob-breathe pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-18"
          style={{ background: 'radial-gradient(circle,var(--bridge-aurora-2) 0%,transparent 62%)' }} />
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-500">How it works</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                Three steps.<br />
                <span className="text-gradient-bridge">One hour.</span><br />
                Real momentum.
              </h2>
            </div>
          </Reveal>
          <div className="relative grid gap-6 sm:grid-cols-3">
            {/* Connecting beam */}
            <div aria-hidden className="pointer-events-none absolute top-11 left-[calc(16.7%+2rem)] right-[calc(16.7%+2rem)] hidden h-px sm:block"
              style={{ background: 'linear-gradient(90deg,transparent 0%,var(--bridge-border-strong) 25%,var(--bridge-border-strong) 75%,transparent 100%)' }} />
            {[
              {
                num: '01', accent: 'from-orange-500 to-amber-400', chip: '"PM at a Series B startup"',
                icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" strokeLinecap="round"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>,
                title: 'Tell us your goal',
                desc: 'Plain English. Our AI searches 2,400+ professionals and surfaces the exact few most likely to move the needle for you.',
              },
              {
                num: '02', accent: 'from-amber-400 to-orange-400', chip: '98% match · $60/session',
                icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: 'Pick your mentor',
                desc: 'Real bios, honest reviews, exact rates — all visible before you commit to anything. No surprises.',
              },
              {
                num: '03', accent: 'from-emerald-400 to-teal-500', chip: 'Session confirmed ✓',
                icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: 'Book and get unstuck',
                desc: 'Real-time availability. Built-in video room. No Zoom links, no scheduling emails. One session, done.',
              },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 130}>
                <TiltCard className="group relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-card hover:border-orange-500/32 hover:shadow-bridge-glow">
                  <div className={`font-display text-[5.5rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br ${step.accent} opacity-10 transition-opacity duration-300 group-hover:opacity-22`}>
                    {step.num}
                  </div>
                  <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/18">
                    {step.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[var(--bridge-text)]">{step.title}</h3>
                  <p className="mt-2.5 text-sm text-[var(--bridge-text-muted)] leading-relaxed">{step.desc}</p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-3.5 py-1.5 text-[10px] font-semibold text-[var(--bridge-text-faint)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />{step.chip}
                  </div>
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/38 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS — always dark
      ═══════════════════════════════════════════════════════ */}
      <section id="outcomes" className="relative overflow-hidden py-32"
        style={{ background: 'linear-gradient(180deg,var(--bridge-canvas) 0%,#160a04 8%,#0d0603 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(234,88,12,0.042) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,0.042) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        <div aria-hidden className="animate-blob-breathe pointer-events-none absolute left-1/2 top-1/2 h-[750px] w-[750px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-18"
          style={{ background: 'radial-gradient(circle,rgba(234,88,12,0.52) 0%,transparent 62%)' }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.03]" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-400">Real outcomes</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                People who<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">got unstuck</span>
              </h2>
            </div>
          </Reveal>
          <TestimonialRotator />
        </div>
      </section>

      {/* ── Dark → canvas ── */}
      <div aria-hidden className="pointer-events-none h-24 w-full"
        style={{ background: 'linear-gradient(to bottom,#0d0603 0%,var(--bridge-canvas) 100%)' }} />

      {/* ═══════════════════════════════════════════════════════
          BENTO FEATURES
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28 bg-[var(--bridge-surface-muted)]/32">
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-500">Why Bridge</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                Built for <span className="text-gradient-bridge">real results</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '🧠', title: 'AI-powered matching',      desc: 'Describe your goal in plain English. Our model ranks 2,400+ mentors by relevance to your exact situation.'  },
              { icon: '🔒', title: 'Vetted professionals only', desc: 'Every mentor is reviewed. No random LinkedIn strangers, no unverified bios.'                                  },
              { icon: '⚡', title: 'One session at a time',     desc: 'No packages, no subscriptions. Pay for one hour, commit to nothing.'                                           },
              { icon: '📹', title: 'Built-in video rooms',      desc: 'No Zoom links. Your room is auto-generated and ready the moment your session is accepted.'                      },
              { icon: '📆', title: 'Real-time availability',    desc: 'Google Calendar integration. See actual open slots, book in 30 seconds.'                                        },
              { icon: '⭐', title: 'Honest, unfiltered reviews', desc: 'All reviews visible. No curated testimonials. Know exactly who you\'re booking.'                               },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 65}>
                <TiltCard className="group relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/32 hover:shadow-bridge-glow">
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="mt-5 text-base font-bold text-[var(--bridge-text)]">{f.title}</h3>
                  <p className="mt-2.5 text-sm text-[var(--bridge-text-muted)] leading-relaxed">{f.desc}</p>
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          COMPARISON TABLE
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-28 bg-[var(--bridge-canvas)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-500">Why not just DM on LinkedIn?</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                Bridge vs the alternatives
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-card">
              <div className="grid grid-cols-4 border-b border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/45">
                <div className="px-5 py-4" />
                {['LinkedIn DMs','Life Coaching','Bridge'].map((h, i) => (
                  <div key={h} className={`border-l border-[var(--bridge-border)] px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.15em] ${i === 2 ? 'text-orange-500' : 'text-[var(--bridge-text-muted)]'}`}>
                    {i === 2 ? (
                      <span className="inline-flex flex-col items-center gap-1">
                        {h}
                        <span className="rounded-full bg-orange-500/12 px-2 py-0.5 text-[8px] font-black text-orange-500 uppercase tracking-widest">best</span>
                      </span>
                    ) : h}
                  </div>
                ))}
              </div>
              {WHY_ROWS.map((row, i) => (
                <div key={i} className={`grid grid-cols-4 border-b border-[var(--bridge-border)]/40 last:border-0 ${i % 2 === 0 ? '' : 'bg-[var(--bridge-surface-muted)]/22'}`}>
                  <div className="px-5 py-4 text-[12px] font-semibold text-[var(--bridge-text-secondary)]">{row.label}</div>
                  {[row.dm, row.coaching, row.bridge].map((v, j) => (
                    <div key={j} className={`border-l border-[var(--bridge-border)]/38 px-4 py-4 text-center text-[12px] ${j === 2 ? 'font-semibold text-orange-500' : 'text-[var(--bridge-text-muted)]'}`}>
                      {j === 2 && v !== '—' ? (
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

      {/* ── Canvas → dark CTA ── */}
      <div aria-hidden className="pointer-events-none h-52 w-full"
        style={{ background: 'linear-gradient(to bottom,var(--bridge-canvas) 0%,rgba(220,155,70,0.06) 14%,rgba(195,110,40,0.16) 26%,rgba(145,68,20,0.38) 38%,rgba(95,42,12,0.63) 50%,rgba(62,26,8,0.83) 62%,#2e1606 75%,#1e0d04 87%,#150803 100%)' }} />

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA — always dark
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-36" style={{ backgroundColor: 'var(--bridge-hero-bg)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(234,88,12,0.048) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,0.048) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        <div aria-hidden className="animate-blob-breathe pointer-events-none absolute left-1/2 top-1/2 h-[850px] w-[850px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(234,88,12,0.22) 0%,rgba(234,88,12,0.04) 42%,transparent 68%)' }} />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
          <div className="border-gradient-bridge animate-border-bridge h-[580px] w-[580px] rounded-full opacity-11" />
        </div>
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
          <div className="border-gradient-bridge animate-border-bridge h-[390px] w-[390px] rounded-full opacity-7"
            style={{ animationDuration: '10s', animationDirection: 'reverse' }} />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.032]" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-400">Ready?</p>
            <h2 className="mt-5 font-display leading-[0.92] tracking-tight text-white"
              style={{ fontSize: 'clamp(2.8rem,6.5vw,5.5rem)', fontWeight: 900 }}>
              One conversation<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500"
                style={{ filter: 'drop-shadow(0 0 44px rgba(234,88,12,0.58))' }}>
                changes everything.
              </span>
            </h2>
            <p className="mx-auto mt-7 max-w-md text-base text-white/42 leading-relaxed">
              Stop spinning. Book a session with someone who's walked the exact path you're on — and made it through.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link to={user ? '/mentors' : '/register'}
                className="btn-sheen inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-10 py-5 text-base font-bold text-white shadow-[0_0_72px_rgba(234,88,12,0.55)] transition hover:shadow-[0_0_100px_rgba(234,88,12,0.82)] hover:scale-[1.04] active:scale-[0.97]">
                Get started for free
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link to="/about"
                className="text-sm font-medium text-white/32 underline underline-offset-4 transition hover:text-white/62">
                Learn more about Bridge
              </Link>
            </div>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/20">
              {['No credit card required', 'First session guaranteed', 'Cancel any time'].map((t, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="h-1 w-1 rounded-full bg-white/15" />}
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
