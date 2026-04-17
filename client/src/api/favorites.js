import supabase from './supabase';

/** UUID strings from PostgREST vs JS must match for Set — normalize casing. */
function normId(id) {
  if (id == null || id === '') return id;
  return String(id).toLowerCase();
}

async function getAuthedUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user) return session.user;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getMyFavorites() {
  try {
    const user = await getAuthedUser();
    if (!user) return { data: [], error: null };

    const { data, error } = await supabase.from('favorites').select('mentor_id').eq('user_id', user.id);

    if (error) return { data: [], error };
    return { data: (data ?? []).map((r) => normId(r.mentor_id)), error: null };
  } catch (e) {
    return { data: [], error: e };
  }
}

export async function toggleFavorite(mentorId) {
  const id = normId(mentorId);
  if (!id) return { data: null, error: new Error('Invalid mentor.') };

  try {
    const user = await getAuthedUser();
    if (!user) return { data: null, error: new Error('Sign in to save favorites.') };

    const { data: existing, error: findError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('mentor_id', id)
      .maybeSingle();

    if (findError) return { data: null, error: findError };

    if (existing) {
      const { error } = await supabase.from('favorites').delete().eq('id', existing.id);
      return { data: { favorited: false }, error };
    }

    const { error } = await supabase.from('favorites').insert({ user_id: user.id, mentor_id: id });
    return { data: { favorited: true }, error };
  } catch (e) {
    return { data: null, error: e };
  }
}
