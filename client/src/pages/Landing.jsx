import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedMentors } from '../api/mentors';
import Reveal from '../components/Reveal';
import { useAuth } from '../context/useAuth';
import { focusRing } from '../ui';
import MentorAvatar from '../components/MentorAvatar';

// ─── Animated counter ─────────────────────────────────────────────────────────
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

// ─── Data ─────────────────────────────────────────────────────────────────────
const AVATAR_GRAD = {
  amber:   'from-amber-400 to-orange-500',
  emerald: 'from-emerald-400 to-teal-500',
  sky:     'from-sky-400 to-blue-500',
  rose:    'from-rose-400 to-pink-500',
  violet:  'from-violet-400 to-purple-500',
  teal:    'from-teal-400 to-emerald-500',
  orange:  'from-orange-400 to-rose-500',
  pink:    'from-pink-400 to-rose-500',
};

const ACTIVITY = [
  { ini: 'TN', name: 'Tyler N.',    tone: 'amber',   text: 'booked Interview Prep',        with: 'Maya Chen',     time: '2m ago'  },
  { ini: 'PS', name: 'Priya S.',    tone: 'emerald', text: 'landed a Staff PM role',       with: '',              time: '1h ago',  win: true  },
  { ini: 'LK', name: 'Liam K.',     tone: 'sky',     text: 'booked Resume Review',         with: 'Jordan R.',     time: '5m ago'  },
  { ini: 'AM', name: 'Aisha M.',    tone: 'rose',    text: 'accepted an offer at Figma',   with: '',              time: '3h ago',  win: true  },
  { ini: 'JD', name: 'James D.',    tone: 'violet',  text: 'booked Career Advice',         with: 'Elena Voss',    time: '8m ago'  },
  { ini: 'SR', name: 'Sofia R.',    tone: 'teal',    text: 'left a 5-star review',         with: 'Marcus Lee',    time: '11m ago' },
  { ini: 'KH', name: 'Kai H.',      tone: 'orange',  text: 'booked a Networking call',     with: 'Tom Rodriguez', time: '15m ago' },
  { ini: 'NP', name: 'Nina P.',     tone: 'pink',    text: 'made the switch from finance', with: '',              time: '6h ago',  win: true  },
];

const MENTORS_ROW1 = [
  { name: 'Maya Chen',      title: 'Director of Product',  co: 'Linear',     tags: ['PM Strategy','Promotion'],     rate: 95,  rating: 4.9, sessions: 86,  tone: 'amber'  },
  { name: 'Jordan Reeves',  title: 'Ex-FAANG Recruiter',   co: 'Google',     tags: ['Interview Prep','Offers'],     rate: 60,  rating: 4.8, sessions: 142, tone: 'orange' },
  { name: 'Elena Voss',     title: 'RN → UX Designer',     co: 'IDEO',       tags: ['Career Switch','Portfolio'],   rate: 45,  rating: 5.0, sessions: 58,  tone: 'rose'   },
  { name: 'Marcus Lee',     title: 'Engineering Manager',   co: 'Stripe',     tags: ['EM Path','System Design'],    rate: 120, rating: 4.9, sessions: 203, tone: 'sky'    },
  { name: 'Dr. Aisha Park', title: 'Biotech Founder',       co: 'Stanford',   tags: ['Fundraising','Science Biz'],  rate: 150, rating: 4.7, sessions: 37,  tone: 'violet' },
  { name: 'Tom Rodriguez',  title: 'VP of Sales',           co: 'Salesforce', tags: ['Enterprise Sales','SDR→AE'],  rate: 55,  rating: 4.8, sessions: 95,  tone: 'teal'   },
];
const MENTORS_ROW2 = [
  { name: 'Sarah Kim',      title: 'Head of Design',        co: 'Airbnb',     tags: ['Design Systems','Leadership'], rate: 85,  rating: 4.9, sessions: 64,  tone: 'pink'   },
  { name: 'Raj Patel',      title: 'Principal Engineer',    co: 'Meta',       tags: ['Architecture','Staff Eng'],    rate: 110, rating: 4.8, sessions: 118, tone: 'emerald'},
  { name: 'Camille Dubois', title: 'Brand Strategist',      co: 'Nike',       tags: ['Brand','Creative Strategy'],  rate: 70,  rating: 5.0, sessions: 43,  tone: 'rose'   },
  { name: 'Alex Wong',      title: 'Growth Lead',           co: 'Notion',     tags: ['Growth','Retention','PLG'],    rate: 90,  rating: 4.7, sessions: 77,  tone: 'amber'  },
  { name: 'Diana Ferreira', title: 'Data Science Manager',  co: 'Spotify',    tags: ['ML','Analytics','People Mgr'],rate: 100, rating: 4.9, sessions: 52,  tone: 'sky'    },
  { name: 'Omar Hassan',    title: 'Startup Founder',        co: 'YC W23',     tags: ['Fundraising','0→1'],           rate: 130, rating: 4.8, sessions: 29,  tone: 'teal'   },
];

const OUTCOMES = [
  { result: 'Got the offer', metric: '+32% comp',        name: 'Tyler N.',   role: 'Senior Engineer', tone: 'amber',   quote: 'Two sessions with a former FAANG recruiter. She rewrote my "tell me about yourself" in ten minutes. Offer came a week later.' },
  { result: 'Changed industries', metric: 'Banking → PM', name: 'Priya S.',  role: 'Ex-Analyst, now PM', tone: 'emerald', quote: 'I was terrified to leave finance. One session with someone who made the exact same jump saved me six months of second-guessing.' },
  { result: 'Got promoted', metric: 'IC → Staff',         name: 'Jordan E.', role: 'Staff Engineer',  tone: 'sky',     quote: "Stuck at Senior for four years. My mentor called out exactly which work didn't count. Promoted in the next cycle." },
];

const WHY_ROWS = [
  { label: 'You get a response',     dm: '~10% reply rate',    coaching: 'Always',             bridge: 'Always — mentors opt in' },
  { label: "They've done your job",  dm: 'Maybe',              coaching: 'Rarely',             bridge: 'Yes — that\'s the filter' },
  { label: 'Structured session',     dm: 'No',                 coaching: 'Yes',                bridge: 'Yes — 4 named formats' },
  { label: 'Price shown upfront',    dm: '—',                  coaching: 'Often hidden',       bridge: 'On every profile' },
  { label: 'Real unfiltered reviews',dm: 'No',                 coaching: 'Curated only',       bridge: 'All reviews, unfiltered' },
  { label: 'Commitment',             dm: 'None',               coaching: 'Multi-session pkg',  bridge: 'One session at a time' },
];

// ─── Scene animator (product preview) ────────────────────────────────────────
function ProductScene() {
  const [scene, setScene] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setScene(s => (s + 1) % 3), 3200);
    return () => clearInterval(id);
  }, []);

  const scenes = [
    // Scene 0 — search / AI match
    <div key="search" className="flex flex-col gap-3 px-4 py-4 sm:px-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">AI Mentor Match</p>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
        <svg className="h-3.5 w-3.5 shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>
        <span className="text-xs text-white/50">I want to become a PM at a Series B startup</span>
        <span className="ml-auto h-4 w-px animate-pulse bg-orange-400" />
      </div>
      <div className="space-y-2">
        {[
          { ini: 'MC', name: 'Maya Chen', tag: 'PM Strategy', match: 98, tone: 'amber' },
          { ini: 'JR', name: 'Jordan Reeves', tag: 'Product Growth', match: 94, tone: 'orange' },
          { ini: 'EV', name: 'Elena Voss', tag: 'Career Switch', match: 91, tone: 'rose' },
        ].map((m, i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2 transition hover:bg-white/10"
            style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[m.tone]} text-[9px] font-bold text-white`}>{m.ini}</div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-white">{m.name}</p>
              <p className="text-[10px] text-white/40">{m.tag}</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1 w-12 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${m.match}%` }} />
              </div>
              <span className="text-[10px] font-bold text-orange-400">{m.match}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // Scene 1 — mentor profile
    <div key="profile" className="flex flex-col gap-3 px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">MC</div>
        <div>
          <p className="text-sm font-semibold text-white">Maya Chen</p>
          <p className="text-[11px] text-white/50">Director of Product · Linear</p>
        </div>
        <div className="ml-auto rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400">● Available</div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {['PM Strategy','Promotion','Roadmapping'].map(t => (
          <span key={t} className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-medium text-orange-300">{t}</span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[['4.9 ★','Rating'],['86','Sessions'],['$95','/ session']].map(([v,l]) => (
          <div key={l} className="rounded-xl bg-white/5 px-2 py-2 text-center">
            <p className="text-sm font-bold text-white">{v}</p>
            <p className="text-[9px] text-white/40">{l}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {['Career Advice','Interview Prep','Resume Review'].map(t => (
          <div key={t} className="flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2 text-[11px] text-white/60 hover:border-orange-500/40 hover:text-white/90 transition cursor-pointer">
            <svg className="h-3 w-3 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" strokeLinecap="round"/></svg>
            {t}
          </div>
        ))}
      </div>
    </div>,

    // Scene 2 — session booked
    <div key="booked" className="flex flex-col items-center gap-3 px-4 py-6 sm:px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div>
        <p className="text-base font-bold text-white">Session confirmed!</p>
        <p className="mt-0.5 text-[12px] text-white/50">Tomorrow · 3:00 PM EST · 45 min</p>
      </div>
      <div className="w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white">MC</div>
          <div className="text-left">
            <p className="text-[11px] font-semibold text-white">Maya Chen</p>
            <p className="text-[10px] text-white/40">Career Advice Session</p>
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/60">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.361a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" strokeLinecap="round"/></svg>
            Video room ready
          </div>
        </div>
      </div>
      <div className="flex w-full gap-2">
        <div className="flex-1 rounded-xl bg-white/5 py-2 text-[11px] font-medium text-white/60">Add to Calendar</div>
        <div className="flex-1 rounded-xl bg-orange-500 py-2 text-[11px] font-bold text-white">Join Room</div>
      </div>
    </div>,
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0a07] shadow-[0_0_80px_rgba(234,88,12,0.15)]" style={{ minHeight: 290 }}>
      {/* top bar */}
      <div className="flex items-center gap-1.5 border-b border-white/8 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
        <span className="ml-auto text-[10px] text-white/20">bridge.app</span>
      </div>
      {/* scene tabs */}
      <div className="flex gap-0 border-b border-white/8">
        {['AI Match','Profile','Booked ✓'].map((tab, i) => (
          <button key={i} onClick={() => setScene(i)}
            className={`flex-1 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${scene === i ? 'text-orange-400 border-b-2 border-orange-400' : 'text-white/25 hover:text-white/50'}`}>
            {tab}
          </button>
        ))}
      </div>
      {/* scene content */}
      <div key={scene} style={{ animation: 'bridge-scale-in 320ms cubic-bezier(0.16,1,0.3,1)' }}>
        {scenes[scene]}
      </div>
    </div>
  );
}

// ─── Mentor marquee card ──────────────────────────────────────────────────────
function MarqueeCard({ m }) {
  return (
    <div className="inline-flex shrink-0 flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm hover:border-orange-500/30 hover:bg-white/8 transition w-52">
      <div className="flex items-center gap-2.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[m.tone]} text-[11px] font-bold text-white`}>
          {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold text-white">{m.name}</p>
          <p className="truncate text-[10px] text-white/40">{m.co}</p>
        </div>
      </div>
      <p className="text-[11px] text-white/60 leading-relaxed">{m.title}</p>
      <div className="flex flex-wrap gap-1">
        {m.tags.slice(0, 2).map(t => (
          <span key={t} className="rounded-full bg-orange-500/12 px-2 py-0.5 text-[9px] font-medium text-orange-300">{t}</span>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-white/8 pt-2">
        <span className="text-[10px] font-bold text-white">{'★'.repeat(Math.round(m.rating))} <span className="text-white/40">{m.rating}</span></span>
        <span className="text-[11px] font-bold text-orange-400">${m.rate}/mo</span>
      </div>
    </div>
  );
}

// ─── Testimonial rotator ──────────────────────────────────────────────────────
function TestimonialRotator() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % OUTCOMES.length), 4500);
    return () => clearInterval(id);
  }, []);
  const o = OUTCOMES[idx];
  return (
    <div className="relative flex flex-col items-center text-center">
      <div key={idx} style={{ animation: 'bridge-scale-in 400ms cubic-bezier(0.16,1,0.3,1)' }} className="flex flex-col items-center gap-4">
        <svg className="h-8 w-8 text-orange-400/50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
        <p className="max-w-lg text-base font-medium text-white/80 leading-relaxed italic">&ldquo;{o.quote}&rdquo;</p>
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[o.tone]} text-[10px] font-bold text-white`}>
            {o.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="text-left">
            <p className="text-[12px] font-semibold text-white">{o.name}</p>
            <p className="text-[11px] text-white/40">{o.role}</p>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-400">{o.result} · {o.metric}</span>
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        {OUTCOMES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-8 bg-orange-400' : 'w-1.5 bg-white/20'}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Stat item (needs its own component so hook rules are satisfied) ──────────
function StatItem({ target, suffix, label, accent, decimal }) {
  const raw = decimal ? target * 10 : target;
  const [ref, value] = useCountUp(raw);
  const display = decimal ? (value / 10).toFixed(1) : value.toLocaleString();
  return (
    <div ref={ref} className="flex flex-col items-center gap-2 text-center">
      <p className={`font-display text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${accent} sm:text-6xl`}>
        {display}{suffix}
      </p>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">{label}</p>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function Landing() {
  const { user } = useAuth();
  const [featuredMentors, setFeaturedMentors] = useState([]);

  useEffect(() => {
    getFeaturedMentors(6).then(data => { if (data?.length) setFeaturedMentors(data); });
  }, []);

  const displayMentors = featuredMentors.length ? featuredMentors : MENTORS_ROW1;

  return (
    <div className="relative overflow-x-hidden bg-[var(--bridge-canvas)]">

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO — always dark, dramatic, cinematic
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden bg-[#060403]">

        {/* CSS grid overlay */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(234,88,12,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,0.06) 1px,transparent 1px)',
            backgroundSize: '64px 64px',
          }} />

        {/* Blob orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-blob-breathe absolute -top-32 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full opacity-25"
            style={{ background: 'radial-gradient(circle,rgba(234,88,12,0.6) 0%,rgba(234,88,12,0.1) 55%,transparent 75%)' }} />
          <div className="animate-blob-breathe absolute bottom-0 -left-48 h-[500px] w-[500px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle,rgba(251,146,60,0.5) 0%,transparent 70%)', animationDelay: '1.2s' }} />
          <div className="animate-blob-breathe absolute bottom-24 -right-32 h-[400px] w-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle,rgba(234,88,12,0.4) 0%,transparent 70%)', animationDelay: '2.4s' }} />
        </div>

        {/* Spinning gradient ring behind content */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-48 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
          <div className="border-gradient-bridge animate-border-bridge h-[640px] w-[640px] rounded-full opacity-20" />
        </div>

        {/* Grain texture */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.04]" />

        {/* ── Content ── */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-28 pb-0 sm:px-6 lg:px-8 lg:pt-36">

          {/* Live badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 shadow-sm backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Live · 2,400+ vetted mentors</span>
            </div>
          </div>

          {/* Headline */}
          <div className="mt-8 text-center">
            <h1 className="font-display leading-[0.9] tracking-tight text-white"
              style={{ fontSize: 'clamp(3.5rem,9vw,7.5rem)', fontWeight: 900 }}>
              <span className="block">Your next</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500" style={{ filter: 'drop-shadow(0 0 48px rgba(234,88,12,0.6))' }}>
                career move
              </span>
              <span className="block">starts with</span>
              <span className="block text-white/30">one conversation.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg text-white/50 leading-relaxed">
              Real mentors. Real sessions. Real outcomes. Skip the LinkedIn cold messages — book a 1-on-1 with someone who's already done what you want to do.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to={user ? '/mentors' : '/register'}
              className="btn-sheen relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-sm font-bold text-white shadow-[0_0_48px_rgba(234,88,12,0.45)] transition hover:shadow-[0_0_64px_rgba(234,88,12,0.65)] hover:scale-[1.03] active:scale-95">
              Find your mentor
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link to="/mentors"
              className="border-gradient-bridge animate-border-bridge inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white/70 transition hover:text-white">
              Browse mentors →
            </Link>
          </div>

          {/* Floating chips */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            {/* chip: match */}
            <div className="pointer-events-none absolute -left-4 top-8 hidden xl:block z-20"
              style={{ animation: 'landing-float-soft 7s 0.3s ease-in-out infinite' }}>
              <div className="flex items-center gap-2 rounded-2xl border border-white/12 bg-[#0d0a07]/95 px-3.5 py-2.5 shadow-bridge-float backdrop-blur-xl">
                <span className="text-base">🎯</span>
                <div>
                  <p className="text-[10px] font-bold text-white">98% AI Match</p>
                  <p className="text-[9px] text-white/40">PM Strategy · Maya Chen</p>
                </div>
              </div>
            </div>
            {/* chip: win */}
            <div className="pointer-events-none absolute -right-4 top-12 hidden xl:block z-20"
              style={{ animation: 'landing-float-soft 8s 1.5s ease-in-out infinite' }}>
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-[#0d0a07]/95 px-3.5 py-2.5 shadow-bridge-float backdrop-blur-xl">
                <span className="text-base">🎉</span>
                <div>
                  <p className="text-[10px] font-bold text-emerald-400">Offer accepted</p>
                  <p className="text-[9px] text-white/40">+32% comp · Tyler N.</p>
                </div>
              </div>
            </div>
            {/* chip: live */}
            <div className="pointer-events-none absolute -left-8 bottom-16 hidden xl:block z-20"
              style={{ animation: 'landing-float-soft 9s 0.8s ease-in-out infinite' }}>
              <div className="flex items-center gap-2 rounded-2xl border border-white/12 bg-[#0d0a07]/95 px-3.5 py-2.5 shadow-bridge-float backdrop-blur-xl">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
                </span>
                <p className="text-[10px] font-bold text-white/70">3 people booking now</p>
              </div>
            </div>
            {/* chip: review */}
            <div className="pointer-events-none absolute -right-8 bottom-24 hidden xl:block z-20"
              style={{ animation: 'landing-float-soft 6.5s 2.2s ease-in-out infinite' }}>
              <div className="flex items-center gap-2 rounded-2xl border border-white/12 bg-[#0d0a07]/95 px-3.5 py-2.5 shadow-bridge-float backdrop-blur-xl">
                <span className="text-base">⭐</span>
                <div>
                  <p className="text-[10px] font-bold text-white">4.9 / 5 avg rating</p>
                  <p className="text-[9px] text-white/40">from 4,800+ sessions</p>
                </div>
              </div>
            </div>

            {/* Product preview */}
            <ProductScene />
          </div>
        </div>

        {/* Bottom fade */}
        <div aria-hidden className="pointer-events-none absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[var(--bridge-canvas)] to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          ACTIVITY TICKER
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="relative border-y border-[var(--bridge-border)]/60 bg-[var(--bridge-surface-muted)]/30 py-3">
        <div className="overflow-hidden" style={{ maskImage: 'linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)' }}>
          <div className="flex w-max animate-landing-marquee gap-3 pr-3">
            {[...ACTIVITY, ...ACTIVITY].map((item, i) => (
              <div key={i} className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/80 px-3.5 py-2 backdrop-blur-sm">
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[item.tone]} text-[9px] font-bold text-white`}>{item.ini}</div>
                <span className="whitespace-nowrap text-[12px] font-medium text-[var(--bridge-text-secondary)]">
                  <span className="font-semibold text-[var(--bridge-text)]">{item.name}</span>{' '}{item.text}
                  {item.with && <>{' '}<span className="text-[var(--bridge-text-muted)]">with</span>{' '}<span className="font-semibold text-[var(--bridge-text)]">{item.with}</span></>}
                </span>
                {item.win && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-300">🎉 Win</span>}
                <span className="text-[10px] text-[var(--bridge-text-faint)]">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          STATS — dark dramatic band
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#060403] py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(234,88,12,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,0.04) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <StatItem target={2400} suffix="+"   label="Vetted mentors"    accent="from-orange-400 to-amber-400" />
            <StatItem target={4800} suffix="+"   label="Sessions booked"   accent="from-amber-400 to-orange-500" />
            <StatItem target={49}   suffix="/5"  label="Average rating"    accent="from-rose-400 to-orange-400"  decimal />
            <StatItem target={97}   suffix="%"   label="Would recommend"   accent="from-emerald-400 to-teal-400" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          MENTOR MARQUEE — two rows, opposite directions
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[var(--bridge-canvas)] py-20">
        <Reveal>
          <div className="mb-12 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-500">Our mentors</p>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
              Professionals who've<br /><span className="text-gradient-bridge">been where you want to go</span>
            </h2>
          </div>
        </Reveal>
        {/* Row 1 — left */}
        <div className="relative" style={{ maskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)' }}>
          <div className="flex w-max animate-landing-marquee gap-4 pr-4 pb-4">
            {[...MENTORS_ROW1, ...MENTORS_ROW1].map((m, i) => <MarqueeCard key={i} m={m} />)}
          </div>
        </div>
        {/* Row 2 — right (reverse) */}
        <div className="relative mt-4" style={{ maskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)' }}>
          <div className="flex w-max gap-4 pr-4" style={{ animation: 'landing-marquee 38s linear infinite reverse' }}>
            {[...MENTORS_ROW2, ...MENTORS_ROW2].map((m, i) => <MarqueeCard key={i} m={m} />)}
          </div>
        </div>
        <div className="mt-12 flex justify-center">
          <Link to="/mentors"
            className="btn-sheen inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-6 py-3 text-sm font-semibold text-[var(--bridge-text)] shadow-bridge-card transition hover:border-orange-500/50 hover:shadow-bridge-glow">
            Browse all 2,400+ mentors →
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS — dark, large numbered steps
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#060403] py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(234,88,12,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,0.04) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        {/* Blob */}
        <div aria-hidden className="animate-blob-breathe pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,rgba(234,88,12,0.7) 0%,transparent 70%)' }} />
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-16 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-400">How it works</p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Three steps.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">One hour.</span><br />Real momentum.
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-3">
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
                num: '03', accent: 'from-emerald-400 to-teal-400', chip: 'Session confirmed ✓',
                icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: 'Book and get unstuck',
                desc: 'Real-time availability. Built-in video room. No Zoom links, no scheduling emails. One session, done.',
              },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-orange-500/30 hover:bg-white/8">
                  {/* Big number */}
                  <div className={`font-display text-[5rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br ${step.accent} opacity-20 transition group-hover:opacity-35`}>{step.num}</div>
                  <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-white/70">{step.icon}</div>
                  <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-white/50 leading-relaxed">{step.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[10px] font-semibold text-white/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />{step.chip}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TESTIMONIALS — rotating, centered
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 bg-[var(--bridge-canvas)]">
        <div aria-hidden className="animate-blob-breathe pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,rgba(234,88,12,0.4) 0%,transparent 70%)' }} />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-500">Real outcomes</p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl">People who got unstuck</h2>
            </div>
          </Reveal>
          <TestimonialRotator />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          BENTO — feature grid, dark
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#060403] py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(234,88,12,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,0.04) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-400">Why Bridge</p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">real results</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: '🧠', title: 'AI-powered matching',
                desc: 'Describe your goal in plain English. Our model ranks 2,400+ mentors by relevance to your exact situation.',
                wide: true, accent: 'orange',
              },
              {
                icon: '🔒', title: 'Vetted professionals only',
                desc: 'Every mentor is reviewed. No random LinkedIn strangers.',
                accent: 'amber',
              },
              {
                icon: '⚡', title: 'One session at a time',
                desc: 'No packages, no subscriptions. Pay for one hour, commit to nothing.',
                accent: 'rose',
              },
              {
                icon: '📹', title: 'Built-in video rooms',
                desc: 'No Zoom links. Video room is auto-generated and ready the moment your session is accepted.',
                accent: 'sky',
              },
              {
                icon: '📆', title: 'Real-time availability',
                desc: 'Google Calendar integration. See actual open slots, book in 30 seconds.',
                accent: 'emerald',
              },
              {
                icon: '⭐', title: 'Honest reviews',
                desc: 'All reviews, unfiltered. No curated testimonials. Know exactly who you\'re booking.',
                accent: 'violet',
              },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-orange-500/20 hover:bg-white/8 ${f.wide ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="mt-4 text-base font-bold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-white/50 leading-relaxed">{f.desc}</p>
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          COMPARISON TABLE
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 bg-[var(--bridge-canvas)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-500">Why not just DM on LinkedIn?</p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl">
                Bridge vs the alternatives
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-card">
              {/* header */}
              <div className="grid grid-cols-4 border-b border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/50">
                <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--bridge-text-faint)]"></div>
                {['LinkedIn DMs','Life Coaching','Bridge'].map((h, i) => (
                  <div key={h} className={`border-l border-[var(--bridge-border)] px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.15em] ${i === 2 ? 'text-orange-500' : 'text-[var(--bridge-text-muted)]'}`}>{h}</div>
                ))}
              </div>
              {WHY_ROWS.map((row, i) => (
                <div key={i} className={`grid grid-cols-4 border-b border-[var(--bridge-border)]/50 ${i % 2 === 0 ? '' : 'bg-[var(--bridge-surface-muted)]/20'}`}>
                  <div className="px-4 py-3.5 text-[12px] font-semibold text-[var(--bridge-text-secondary)]">{row.label}</div>
                  {[row.dm, row.coaching, row.bridge].map((v, j) => (
                    <div key={j} className={`border-l border-[var(--bridge-border)]/50 px-4 py-3.5 text-center text-[12px] ${j === 2 ? 'font-semibold text-orange-500' : 'text-[var(--bridge-text-muted)]'}`}>{v}</div>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FINAL CTA — dark, dramatic
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#060403] py-32">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(234,88,12,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,0.05) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        {/* Central orb */}
        <div aria-hidden className="animate-blob-breathe pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(234,88,12,0.18) 0%,rgba(234,88,12,0.04) 50%,transparent 75%)' }} />
        {/* Spinning ring */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
          <div className="border-gradient-bridge animate-border-bridge h-[520px] w-[520px] rounded-full opacity-15" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-400">Ready?</p>
            <h2 className="mt-4 font-display leading-[0.95] tracking-tight text-white"
              style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 900 }}>
              One conversation<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">changes everything.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-base text-white/50 leading-relaxed">
              Stop spinning. Book a session with someone who's walked the exact path you're on — and made it through.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to={user ? '/mentors' : '/register'}
                className="btn-sheen inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-10 py-5 text-base font-bold text-white shadow-[0_0_64px_rgba(234,88,12,0.5)] transition hover:shadow-[0_0_80px_rgba(234,88,12,0.7)] hover:scale-[1.03] active:scale-95">
                Get started for free
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link to="/about"
                className="text-sm font-medium text-white/40 transition hover:text-white/70 underline underline-offset-4">
                Learn more about Bridge
              </Link>
            </div>
            {/* Trust signals */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-[11px] text-white/25">
              <span>No credit card required</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>First session guaranteed</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Cancel any time</span>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
