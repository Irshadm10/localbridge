import { useState, useEffect } from 'react';

/**
 * Returns a dynamic `bottom` pixel value that rises above the footer
 * as it scrolls into the viewport, keeping fixed-position FABs clear of it.
 */
export function useFooterOffset(base = 24) {
  const [bottom, setBottom] = useState(base);

  useEffect(() => {
    const update = () => {
      const footer = document.querySelector('footer');
      if (!footer) { setBottom(base); return; }
      const footerTop = footer.getBoundingClientRect().top;
      const overlap = window.innerHeight - footerTop;
      setBottom(overlap > 0 ? base + overlap : base);
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [base]);

  return bottom;
}
