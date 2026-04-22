import supabase from './supabase';

export const RESUMES_BUCKET = 'resumes';

const SAFE_NAME = (n) => n.replace(/[^a-zA-Z0-9._-]/g, '_');

export function resumeObjectPath(userId, file) {
  return `${userId}/${Date.now()}_${SAFE_NAME(file.name)}`;
}

export async function uploadResumeFile(userId, file) {
  const path = resumeObjectPath(userId, file);
  const { error } = await supabase.storage.from(RESUMES_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return {
    path,
    filename: file.name,
    mime: file.type || null,
    uploaded_at: new Date().toISOString(),
  };
}

export async function removeResumeFile(storagePath) {
  if (!storagePath) return;
  const { error } = await supabase.storage.from(RESUMES_BUCKET).remove([storagePath]);
  if (error) throw error;
}

export async function getResumeSignedUrl(storagePath, expiresSec = 3600) {
  const { data, error } = await supabase.storage
    .from(RESUMES_BUCKET)
    .createSignedUrl(storagePath, expiresSec);
  if (error) throw error;
  return data.signedUrl;
}

export async function removeAllResumesForUser(userId) {
  const { data: list, error: listErr } = await supabase.storage.from(RESUMES_BUCKET).list(userId);
  if (listErr) throw listErr;
  if (!list?.length) return;
  const paths = list.map((f) => `${userId}/${f.name}`);
  const { error } = await supabase.storage.from(RESUMES_BUCKET).remove(paths);
  if (error) throw error;
}
