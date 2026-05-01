import { useRef } from 'react';

export default function MagneticWrapper({ children, s = 0.3 }) {
  const r = useRef(null);
  const f = useRef(null);

  return (
    <div
      ref={r}
      onMouseMove={e => {
        if (f.current) cancelAnimationFrame(f.current);
        f.current = requestAnimationFrame(() => {
          const el = r.current;
          if (!el) return;
          const b = el.getBoundingClientRect();
          el.style.transform = `translate(${(e.clientX - (b.left + b.width / 2)) * s}px,${(e.clientY - (b.top + b.height / 2)) * s}px)`;
        });
      }}
      onMouseLeave={() => { const el = r.current; if (el) el.style.transform = ''; }}
      style={{ transition: 'transform 360ms cubic-bezier(0.2,0.9,0.32,1)', display: 'inline-block' }}
    >
      {children}
    </div>
  );
}
