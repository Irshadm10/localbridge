import { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { useFooterOffset } from '../utils/useFooterOffset';

const fabFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)] dark:focus-visible:ring-offset-stone-950';

export default function FeedbackFAB() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const bottomRef = useFooterOffset(24);

  return (
    <>
      <div ref={bottomRef} className="pointer-events-none fixed right-6 z-40" style={{ bottom: 24 }}>
        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          className={`group pointer-events-auto btn-sheen relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 pl-4 pr-5 py-3 text-sm font-semibold text-white shadow-[0_12px_36px_-8px_rgba(234,88,12,0.5)] ring-1 ring-white/25 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-10px_rgba(234,88,12,0.7)] hover:brightness-105 active:translate-y-0 dark:shadow-[0_18px_44px_-8px_rgba(251,146,60,0.55)] ${fabFocus}`}
          aria-label="Give feedback"
        >
          <span
            aria-hidden
            className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm transition group-hover:bg-white/25"
          >
            <MessageSquareText className="h-3.5 w-3.5 opacity-95" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.85)] animate-pulse-soft" />
          </span>
          <span className="relative">Feedback</span>
        </button>
      </div>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
