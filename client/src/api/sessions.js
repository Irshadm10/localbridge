import supabase from './supabase';

/**
 * @param {{ mentorId: string, sessionType: string, scheduledDate: string|null, message?: string|null }} params
 */
export async function createSession({ mentorId, sessionType, scheduledDate, message }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { data: null, error: userError };
  }
  if (!user) {
    return { data: null, error: new Error('You must be signed in to book a session.') };
  }

  return supabase
    .from('sessions')
    .insert({
      mentee_id: user.id,
      mentor_id: mentorId,
      session_type: sessionType,
      scheduled_date: scheduledDate,
      message: message ?? null,
    })
    .select()
    .single();
}

export async function getMySessions() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { data: null, error: userError };
  }
  if (!user) {
    return { data: [], error: null };
  }

  const { data: profile } = await supabase
    .from('mentor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const orParts = [`mentee_id.eq.${user.id}`];
  if (profile?.id) {
    orParts.push(`mentor_id.eq.${profile.id}`);
  }

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .or(orParts.join(','))
    .order('created_at', { ascending: false });

  if (error) return { data: null, error };

  const ids = [...new Set((sessions ?? []).map((s) => s.mentor_id).filter(Boolean))];
  let nameById = {};
  if (ids.length > 0) {
    const { data: profiles } = await supabase.from('mentor_profiles').select('id, name, title').in('id', ids);
    nameById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  }

  const rows = (sessions ?? []).map((row) => ({
    ...row,
    mentor_name: nameById[row.mentor_id]?.name ?? null,
    mentor_title: nameById[row.mentor_id]?.title ?? null,
  }));

  return { data: rows, error: null };
}

/**
 * @param {string} sessionId
 * @param {'pending'|'accepted'|'declined'|'completed'} status
 */
export async function updateSessionStatus(sessionId, status) {
  return supabase.from('sessions').update({ status }).eq('id', sessionId).select().single();
}

/** @deprecated Use getMySessions */
export async function getMySession() {
  return getMySessions();
}
