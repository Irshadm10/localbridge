import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function CalendarSuccessToast() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get('calendar') === 'connected') {
      setVisible(true);
      const next = new URLSearchParams(searchParams);
      next.delete('calendar');
      setSearchParams(next, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-3.5 shadow-lg ring-1 ring-black/5"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-700">✓</span>
      <p className="text-sm font-semibold text-stone-800">Google Calendar connected successfully!</p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        ×
      </button>
    </div>
  );
}
