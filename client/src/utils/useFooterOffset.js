import { useEffect, useRef } from 'react';

/**
 * Attaches a ref to a fixed-position element and directly sets its
 * style.bottom every animation frame so it stays above the footer.
 * Uses rAF + direct DOM mutation — no React re-renders on scroll.
 */
export function useFooterOffset(base = 24) {
  const ref = useRef(null);

  useEffect(() => {
    let rafId = null;

    const update = () => {
      rafId = null;
      const el = ref.current;
      if (!el) return;
      const footer = document.querySelector('footer');
      const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
      const overlap = window.innerHeight - footerTop;
      el.style.bottom = `${overlap > 0 ? base + overlap : base}px`;
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [base]);

  return ref;
}
