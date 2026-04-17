import supabase from './supabase';

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

  return supabase
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
}

export async function getReviewsForMentor(mentorId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('mentor_id', mentorId)
    .order('created_at', { ascending: false });

  return { data: data ?? [], error };
}
