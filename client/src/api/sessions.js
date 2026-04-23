import supabase from "./supabase";

export async function getMySession(userId) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("mentee_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createSession({ mentor_id, session_type, scheduled_date, message }) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: userError || new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert([{
      mentor_id,
      mentee_id: user.id,
      session_type,
      scheduled_date,
      message: message || null,
      status: "pending",
    }])
    .select()
    .single();

  return { data, error };
}

export async function updateSessionStatus(sessionId, status) {
  const { data, error } = await supabase
    .from("sessions")
    .update({ status })
    .eq("id", sessionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
