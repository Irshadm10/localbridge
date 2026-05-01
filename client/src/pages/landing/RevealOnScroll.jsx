import { useRef, useState, useEffect } from 'react';

export default function RevealOnScroll({ children, delay = 0, className = '' }) {
  const r = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = r.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={r} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 700ms ease ${delay}ms, transform 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}
