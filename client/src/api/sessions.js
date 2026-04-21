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

export async function createSession(sessionData) {
  const { data, error } = await supabase
    .from("sessions")
    .insert([sessionData])
    .select()
    .single();
  if (error) throw error;
  return data;
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
