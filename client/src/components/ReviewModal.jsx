/**
 * ReviewModal — star rating + optional comment form for post-session mentor reviews.
 *
 * Shown automatically after a video call ends (via navigate state from VideoCall.jsx)
 * and on-demand via the "Leave a Review" button on completed sessions (5-day window).
 *
 * Props
 * -----
 * - sessionId   string          — sessions.id being reviewed
 * - mentorId    string          — mentor_profiles.id
 * - mentorName  string          — display name for copy
 * - mentorEmail string | null   — forwarded to sendReviewNotificationEmail
 * - onClose     () => void      — called when the user dismisses without submitting
 * - onSubmitted (review) => void — called after successful DB insert
 */

import { useState, useEffect, useCallback } from 'react';
import { X, Star } from 'lucide-react';
import { createReview, sendReviewNotificationEmail } from '../api/reviews';
import { useAuth } from '../context/useAuth';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

function StarButton({ index, filled, hovered, onHover, onClick }) {
  const active = filled || hovered;
  return (
    <button
      type="button"
      aria-label={`Rate ${index} out of 5`}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(0)}
      onClick={() => onClick(index)}
      className="group p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:scale-110"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-9 w-9 transition-colors duration-100 ${
          active ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.55)]' : 'text-stone-200'
        }`}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.5}
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    </button>
  );
}

export default function ReviewModal({
  sessionId,
  mentorId,
  mentorName,
  mentorEmail,
  onClose,
  onSubmitted,
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && !submitting && !done) onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, submitting, done]);

  // Auto-close after success
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [done, onClose]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (rating < 1) {
        setError('Please select a star rating before submitting.');
        return;
      }
      setSubmitting(true);
      setError(null);

      const { data, error: reviewError } = await createReview({
        sessionId,
        mentorId,
        rating,
        comment: comment.trim() || null,
      });

      if (reviewError) {
        const msg = reviewError.message ?? '';
        if (msg.includes('reviews_session_reviewer_unique') || msg.includes('duplicate')) {
          setError('You have already reviewed this session.');
        } else {
          setError(msg || 'Could not submit review. Please try again.');
        }
        setSubmitting(false);
        return;
      }

      // Fire-and-forget emails — never block the success state
      void sendReviewNotificationEmail({
        mentorName,
        mentorEmail: mentorEmail ?? null,
        reviewerEmail: user?.email ?? null,
        rating,
        comment: comment.trim() || null,
        sessionId,
      });

      setDone(true);
      setSubmitting(false);
      if (onSubmitted) onSubmitted(data);
    },
    [rating, comment, sessionId, mentorId, mentorName, mentorEmail, user, onSubmitted],
  );

  const displayRating = hovered || rating;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        onClick={!submitting && !done ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-[0_32px_80px_-12px_rgba(28,25,23,0.35)]">
        {/* Orange accent bar */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

        {!done ? (
          <form onSubmit={handleSubmit} noValidate>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-7 pb-2 pt-7">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-600">
                  Session review
                </p>
                <h2
                  id="review-modal-title"
                  className="mt-1 font-display text-xl font-bold text-stone-900"
                >
                  How was your session with {mentorName}?
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="Close"
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-400 transition hover:border-stone-300 hover:bg-stone-100 hover:text-stone-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stars */}
            <div className="flex flex-col items-center gap-2 px-7 py-5">
              <div className="flex items-center gap-1" role="group" aria-label="Star rating">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarButton
                    key={i}
                    index={i}
                    filled={i <= rating}
                    hovered={i <= hovered}
                    onHover={setHovered}
                    onClick={setRating}
                  />
                ))}
              </div>
              <p
                className={`h-5 text-sm font-semibold transition-colors ${
                  displayRating > 0 ? 'text-amber-600' : 'text-stone-400'
                }`}
              >
                {displayRating > 0 ? LABELS[displayRating] : 'Tap a star to rate'}
              </p>
            </div>

            {/* Comment */}
            <div className="px-7 pb-2">
              <label className="block text-xs font-semibold text-stone-600 mb-1.5" htmlFor="review-comment">
                Leave a note{' '}
                <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <textarea
                id="review-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share what made this session valuable…"
                maxLength={800}
                className="w-full resize-none rounded-xl border border-[var(--bridge-border)] bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 transition focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/25"
              />
              <p className="mt-1 text-right text-[10px] text-stone-400">
                {comment.length}/800
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="mx-7 mb-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 px-7 pb-7 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] py-3 text-sm font-semibold text-stone-600 transition hover:border-stone-300 hover:bg-stone-50 disabled:opacity-50"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={submitting || rating < 1}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white shadow-[0_6px_18px_-4px_rgba(234,88,12,0.45)] transition hover:from-amber-400 hover:to-orange-400 hover:shadow-[0_8px_24px_-6px_rgba(234,88,12,0.6)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        ) : (
          /* Success state */
          <div className="flex flex-col items-center gap-3 px-7 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-[0_8px_24px_-6px_rgba(16,185,129,0.55)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-7 w-7">
                <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">Review submitted!</h2>
              <p className="mt-1.5 text-sm text-stone-500">
                Thanks for the feedback — it helps {mentorName.split(' ')[0]} improve.
              </p>
            </div>
            <div className="mt-1 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  viewBox="0 0 24 24"
                  className={`h-6 w-6 ${i <= rating ? 'text-amber-400' : 'text-stone-200'}`}
                  fill="currentColor"
                >
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
