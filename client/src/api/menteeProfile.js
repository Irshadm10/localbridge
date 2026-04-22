import supabase from './supabase';

export async function getMenteeProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('mentee_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return { data: null, error };
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function upsertMenteeProfile(userId, profileData) {
  try {
    const { data, error } = await supabase
      .from('mentee_profiles')
      .upsert({ user_id: userId, ...profileData, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) return { data: null, error };
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function deleteMenteeProfile(userId) {
  try {
    const { error } = await supabase
      .from('mentee_profiles')
      .delete()
      .eq('user_id', userId);
    if (error) return { error };
    return { error: null };
  } catch (e) {
    return { error: e };
  }
}
