import { useRef, useState, useEffect } from 'react';

export function useCountUp(target, duration = 1200) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setGo(true); obs.disconnect(); } },
      { threshold: 0.2, rootMargin: '50px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!go) return;
    let s = null;
    let frame = 0;
    const tick = (now) => {
      if (!s) s = now;
      const t = Math.min((now - s) / duration, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(target * e));
      if (t < 1) { frame = requestAnimationFrame(tick); }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [go, target, duration]);

  return [ref, val];
}

export function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? Math.min(window.scrollY / h, 1) : 0);
    };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return p;
}
