import { Link } from 'react-router-dom';
import mockMentors from '../api/mockMentors';
import useInView from '../utils/useInView';
import SessionTypeCard, { SESSION_TYPES } from '../components/SessionTypeCard';

// ─── Animation wrapper ────────────────────────────────────────────────────────

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Avatar helpers ───────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-violet-200 text-violet-800',
  'bg-amber-200 text-amber-800',
  'bg-emerald-200 text-emerald-800',
  'bg-sky-200 text-sky-800',
  'bg-rose-200 text-rose-800',
  'bg-indigo-200 text-indigo-800',
];

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-amber-50 pt-24 pb-28 px-6">
      {/* Decorative background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -left-16 w-[320px] h-[320px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
      />

      <div className="relative max-w-4xl mx-auto text-center">
        <div
          className="inline-block mb-5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-amber-100 text-amber-800 border border-amber-200"
          style={{ opacity: 1 }}
        >
          EARLY ACCESS — JOIN FREE
        </div>

        <h1
          className="text-5xl sm:text-6xl font-bold text-stone-900 leading-[1.1] tracking-tight mb-6"
          style={{
            animation: 'fadeUp 0.7s ease both',
          }}
        >
          Your next career move<br />
          <span className="text-amber-600">starts with a conversation.</span>
        </h1>

        <p
          className="text-lg sm:text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed mb-10"
          style={{ animation: 'fadeUp 0.7s ease 120ms both' }}
        >
          Connect with professionals who've been where you're going. Get career advice,
          interview prep, and real connections that open doors.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          style={{ animation: 'fadeUp 0.7s ease 220ms both' }}
        >
          <Link
            to="/mentors"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 active:bg-amber-700 transition-colors shadow-md shadow-amber-200"
          >
            Find a Mentor
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border-2 border-stone-300 text-stone-700 font-semibold text-sm hover:border-stone-500 hover:text-stone-900 transition-colors"
          >
            Become a Mentor
          </Link>
        </div>

        {/* Stats */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12"
          style={{ animation: 'fadeUp 0.7s ease 340ms both' }}
        >
          {[
            { value: '2,400+', label: 'Active Mentors' },
            { value: '85%', label: 'Got Interviews' },
            { value: '50+', label: 'Industries' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-stone-900">{value}</div>
              <div className="text-sm text-stone-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

// ─── How it Works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    title: 'Create Your Profile',
    desc: "Tell us your goals, current role, and the kind of guidance you're looking for. It takes two minutes.",
  },
  {
    n: '02',
    title: 'Browse & Match',
    desc: 'Explore mentors filtered by industry, expertise, and experience level until you find your fit.',
  },
  {
    n: '03',
    title: 'Book & Connect',
    desc: 'Schedule a 1-on-1 session, show up with your questions, and build a relationship that lasts.',
  },
];

function HowItWorks() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest text-amber-600 uppercase mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">Three steps to your next opportunity</h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(({ n, title, desc }, i) => (
            <Reveal key={n} delay={i * 100}>
              <div className="relative p-8 rounded-2xl border border-stone-100 bg-stone-50 hover:border-amber-200 hover:bg-amber-50 transition-colors h-full">
                <span className="text-5xl font-black text-amber-100 select-none leading-none block mb-4">
                  {n}
                </span>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">{title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Mentors ─────────────────────────────────────────────────────────

function MentorPreviewCard({ mentor }) {
  const color = avatarColor(mentor.name);
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
          {initials(mentor.name)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-stone-900 text-sm truncate">{mentor.name}</p>
          <p className="text-xs text-stone-500 truncate">{mentor.title} · {mentor.company}</p>
        </div>
      </div>

      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{mentor.bio}</p>

      <div className="flex flex-wrap gap-1.5">
        {mentor.expertise.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-stone-100">
        <span className="flex items-center gap-1 text-xs text-stone-500">
          <span className="text-amber-500">★</span>
          {mentor.rating.toFixed(1)} · {mentor.years_experience} yrs
        </span>
        <Link
          to={`/mentors/${mentor.id}`}
          className="text-xs px-3 py-1 rounded-full bg-stone-900 text-amber-50 hover:bg-stone-700 transition-colors"
        >
          View
        </Link>
      </div>
    </div>
  );
}

// ─── What can you work on? ────────────────────────────────────────────────────

function SessionTypes() {
  return (
    <section className="bg-amber-50 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest text-amber-600 uppercase mb-3">Session types</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">What can you work on?</h2>
          <p className="text-stone-500 mt-3 max-w-xl mx-auto text-base">
            Every session is focused and intentional. Pick the format that matches where you are right now.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SESSION_TYPES.map((type, i) => (
            <Reveal key={type.key} delay={i * 80}>
              <SessionTypeCard type={type} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Mentors ─────────────────────────────────────────────────────────

function FeaturedMentors() {
  const featured = mockMentors.slice(0, 3);
  return (
    <section className="bg-amber-50 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-amber-600 uppercase mb-3">Featured mentors</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">Meet a few of our mentors</h2>
          </div>
          <Link
            to="/mentors"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 underline underline-offset-4 transition-colors shrink-0"
          >
            Browse all mentors →
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {featured.map((m, i) => (
            <Reveal key={m.id} delay={i * 100}>
              <MentorPreviewCard mentor={m} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote:
      'Within two weeks of my first session, I had three interviews lined up. My mentor helped me reframe my entire narrative.',
    name: 'Tyler Nguyen',
    role: 'Now SWE at Amazon',
    initials: 'TN',
  },
  {
    quote:
      'I came from a non-target school and had no idea how to break into finance. My mentor had done it herself and showed me exactly how.',
    name: 'Priya Shah',
    role: 'Now Analyst at Goldman Sachs',
    initials: 'PS',
  },
  {
    quote:
      "I'd been stuck at the same company for four years. One honest conversation with my mentor gave me the confidence to make the leap.",
    name: 'Jordan Ellis',
    role: 'Now Senior PM at Notion',
    initials: 'JE',
  },
];

function Testimonials() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest text-amber-600 uppercase mb-3">Stories</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">Real people, real results</h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, name, role, initials: ini }, i) => (
            <Reveal key={name} delay={i * 100}>
              <div className="flex flex-col gap-5 p-7 rounded-2xl border border-stone-100 bg-stone-50 h-full">
                <span className="text-4xl text-amber-300 font-serif leading-none select-none">"</span>
                <p className="text-sm text-stone-700 leading-relaxed flex-1 -mt-4">{quote}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-stone-200">
                  <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                    {ini}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{name}</p>
                    <p className="text-xs text-stone-500">{role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Teaser ───────────────────────────────────────────────────────────

function PricingTeaser() {
  return (
    <section className="bg-amber-50 py-16 px-6">
      <Reveal>
        <div className="max-w-3xl mx-auto rounded-2xl border border-amber-200 bg-white px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <p className="font-semibold text-stone-900 text-lg mb-1">Plans starting at free.</p>
            <p className="text-sm text-stone-500">Upgrade for unlimited sessions and priority matching.</p>
          </div>
          <Link
            to="/pricing"
            className="shrink-0 px-6 py-2.5 rounded-full border-2 border-stone-900 text-stone-900 text-sm font-semibold hover:bg-stone-900 hover:text-amber-50 transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="bg-stone-900 py-28 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <h2 className="text-4xl sm:text-5xl font-bold text-amber-50 leading-tight mb-5">
            Ready to bridge the gap?
          </h2>
          <p className="text-stone-400 text-lg mb-10 max-w-xl mx-auto">
            Thousands of people have already taken the first step. Your mentor is waiting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-amber-500 text-white font-semibold text-sm hover:bg-amber-400 transition-colors shadow-lg shadow-amber-900/30"
            >
              Get Started Free
            </Link>
            <Link
              to="/mentors"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-stone-600 text-stone-300 font-semibold text-sm hover:border-stone-400 hover:text-white transition-colors"
            >
              Learn More
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <SessionTypes />
      <FeaturedMentors />
      <Testimonials />
      <PricingTeaser />
      <FinalCTA />
    </>
  );
}
