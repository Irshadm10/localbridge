import supabase from "./supabase";

export async function getMentorById(mentorProfileId) {
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select("*")
    .eq("id", mentorProfileId)
    .single();
  if (error) throw error;
  return data;
}

export async function getAllMentors(filters = {}) {
  let query = supabase.from("mentor_profiles").select("*");
  Object.entries(filters).forEach(([field, value]) => {
    query = query.eq(field, value);
  });
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getFeaturedMentors() {
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select("*")
    .limit(6);
  if (error) throw error;
  return data || [];
}
