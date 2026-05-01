import { Link } from 'react-router-dom';
import { MENTORS_ROW1, MENTORS_ROW2 } from './landingData';
import MentorCard from './MentorCard';
import MagneticWrapper from './MagneticWrapper';
import RevealOnScroll from './RevealOnScroll';

export default function MentorMarqueeSection() {
  return (
    <section id="mentors" className="relative overflow-hidden py-24 bg-[var(--bridge-canvas)]">
      <RevealOnScroll>
        <div className="mb-12 px-5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">Our mentors</p>
          <h2 className="mt-4 font-display text-2xl font-black tracking-tight text-[var(--bridge-text)] sm:text-3xl md:text-4xl lg:text-5xl">
            Professionals who've been<br /><span className="text-gradient-bridge">where you want to go</span>
          </h2>
        </div>
      </RevealOnScroll>

      {/* Row 1 — scrolls left */}
      <div className="b-marq">
        <div className="overflow-hidden b-mask-x">
          <div className="b-ticker flex w-max gap-4 pb-4 pr-4">
            {[...MENTORS_ROW1, ...MENTORS_ROW1].map((m, i) => <MentorCard key={i} m={m} />)}
          </div>
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="b-marq mt-4">
        <div className="overflow-hidden b-mask-x">
          <div className="b-ticker-r flex w-max gap-4 pr-4">
            {[...MENTORS_ROW2, ...MENTORS_ROW2].map((m, i) => <MentorCard key={i} m={m} />)}
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-center px-5">
        <MagneticWrapper>
          <Link
            to="/mentors"
            data-cursor="Browse"
            className="btn-sheen group inline-flex items-center gap-2.5 rounded-full border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-8 py-4 text-sm font-bold text-[var(--bridge-text)] shadow-bridge-card transition-all hover:border-orange-500/42 hover:shadow-bridge-glow"
          >
            Browse all 2,400+ mentors
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </MagneticWrapper>
      </div>
    </section>
  );
}
