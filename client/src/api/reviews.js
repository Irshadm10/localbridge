import supabase from './supabase';
import { sendSupportEmail } from './supportEmail';
import { COMPANY_EMAIL } from '../config/contact';

/**
 * @param {{ sessionId: string, mentorId: string, rating: number, comment?: string|null }} params
 */
export async function createReview({ sessionId, mentorId, rating, comment }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  if (!user) return { data: null, error: new Error('You must be signed in to leave a review.') };

  const result = await supabase
    .from('reviews')
    .insert({
      session_id: sessionId,
      mentor_id: mentorId,
      reviewer_id: user.id,
      rating,
      comment: comment ?? null,
    })
    .select()
    .single();

  if (!result.error) {
    // Recalculate and persist the average rating on the mentor profile
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('mentor_id', mentorId);
    if (allReviews?.length) {
      const avg = allReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / allReviews.length;
      await supabase
        .from('mentor_profiles')
        .update({ rating: Math.round(avg * 100) / 100 })
        .eq('id', mentorId);
    }
  }

  return result;
}

export async function getReviewsForMentor(mentorId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('mentor_id', mentorId)
    .order('created_at', { ascending: false });

  return { data: data ?? [], error };
}

/**
 * Returns the set of session IDs that the current user has already reviewed.
 * Used to hide the "Leave a Review" button once a review is submitted.
 */
export async function getMyReviewedSessionIds() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: new Set(), error: null };

  const { data, error } = await supabase
    .from('reviews')
    .select('session_id')
    .eq('reviewer_id', user.id);

  return { data: new Set((data ?? []).map((r) => r.session_id)), error };
}

/**
 * Sends two review notification emails:
 *  1. Company inbox via Web3Forms
 *  2. Mentor's email via Supabase Edge Function (if mentorEmail is provided)
 *
 * Failures are non-fatal — the review is already saved in the DB by the time this runs.
 *
 * @param {{ mentorName: string, mentorEmail: string|null, reviewerEmail: string|null, rating: number, comment: string|null, sessionId: string }} params
 */
export async function sendReviewNotificationEmail({
  mentorName,
  mentorEmail,
  reviewerEmail,
  rating,
  comment,
  sessionId,
}) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const ticketId = `REV-${sessionId.slice(0, 8).toUpperCase()}`;
  const subject = `[Bridge] New Review for ${mentorName} — ${stars} (${rating}/5)`;
  const commentText = comment?.trim() || '(No written comment left)';

  const sharedMeta = {
    Mentor: mentorName,
    'Mentor Email': mentorEmail || '(not on file)',
    Rating: `${rating}/5  ${stars}`,
    'Session ID': sessionId,
  };

  // 1. Company email via Web3Forms
  try {
    await sendSupportEmail({
      kind: 'feedback',
      ticketId,
      subject,
      body: commentText,
      replyTo: reviewerEmail || undefined,
      fromName: 'Bridge Review System',
      meta: sharedMeta,
    });
  } catch (err) {
    console.warn('[review] Company email failed:', err?.message ?? err);
  }

  // 2. Mentor email via Edge Function (Resend), only if we have an address
  if (mentorEmail?.trim()) {
    try {
      await supabase.functions.invoke('send-support-email', {
        body: {
          kind: 'feedback',
          ticketId,
          subject: `[Bridge] You received a new review — ${stars}`,
          body: commentText,
          replyTo: reviewerEmail || undefined,
          fromName: 'Bridge Review System',
          meta: {
            ...sharedMeta,
            'Sent to': mentorEmail,
          },
          toOverride: mentorEmail,
        },
      });
    } catch (err) {
      console.warn('[review] Mentor email failed:', err?.message ?? err);
    }
  }
}
