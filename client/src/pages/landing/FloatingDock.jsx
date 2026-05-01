import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFooterOffset } from '../../utils/useFooterOffset';

const NAV_ITEMS = [
  { label: 'Home', id: 'top' },
  { label: 'How It Works', id: 'how' },
  { label: 'Mentors', id: 'mentors' },
  { label: 'Outcomes', id: 'outcomes' },
  { label: 'Get Started', id: 'start', primary: true },
];

export default function FloatingDock() {
  const [visible, setVisible] = useState(false);
  const bRef = useFooterOffset(24);

  useEffect(() => {
    const fn = () => { setVisible(window.scrollY > window.innerHeight * 0.85); };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = id => {
    if (id === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return createPortal(
    <div
      ref={bRef}
      className="pointer-events-none fixed left-1/2 z-[9999]"
      style={{
        bottom: 24,
        transform: `translateX(-50%) translateY(${visible ? '0' : '5rem'})`,
        opacity: visible ? 1 : 0,
        transition: 'transform 500ms cubic-bezier(0.16,1,0.3,1),opacity 380ms ease',
      }}
    >
      <nav className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/[0.07] bg-[#0c0906]/95 px-2 py-2 shadow-[0_24px_80px_rgba(0,0,0,0.85),0_0_100px_rgba(234,88,12,0.12)] backdrop-blur-2xl">
        {NAV_ITEMS.map((item, i) => (
          <button
            key={i}
            onClick={() => scrollTo(item.id)}
            data-cursor="hover"
            className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-semibold transition-all duration-200 ${
              item.primary
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_30px_rgba(234,88,12,0.5)]'
                : 'text-white/38 hover:bg-white/[0.06] hover:text-white/80'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>,
    document.body
  );
}
