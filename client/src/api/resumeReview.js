import supabase from './supabase';

const BUCKET = 'resumes';

export async function uploadResumeToBucket(userId, file) {
  const path = `${userId}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: 'application/pdf' });

  if (uploadError) throw uploadError;
  return path;
}

export async function saveResumeReview(userId, reviewData) {
  try {
    await supabase.from('resume_reviews').delete().eq('user_id', userId);
  } catch {
    // non-fatal — proceed to insert
  }

  const { data, error } = await supabase
    .from('resume_reviews')
    .insert({ user_id: userId, ...reviewData })
    .select()
    .single();

  if (error) return { data: null, error };
  return { data, error: null };
}

export async function getResumeReview(userId) {
  const { data, error } = await supabase
    .from('resume_reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { data: null, error };
  return { data, error: null };
}

export async function deleteResumeReview(userId) {
  const { data: existing } = await getResumeReview(userId);

  if (existing?.resume_file_url) {
    await supabase.storage.from(BUCKET).remove([existing.resume_file_url]);
  }

  const { error } = await supabase
    .from('resume_reviews')
    .delete()
    .eq('user_id', userId);

  return { error: error ?? null };
}
