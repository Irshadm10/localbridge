import supabase from "./supabase";

export const DEFAULT_BIO =
  "You're live on Bridge as a mentor. Update your headline, story, and focus areas so the right mentees know what to book you for.";

const _ensureInFlight = new Map();

export async function ensureMentorProfileForUser(user) {
  if (!user?.id) return null;
  if (_ensureInFlight.has(user.id)) return _ensureInFlight.get(user.id);

  const p = (async () => {
    const { data: existing } = await supabase
      .from("mentor_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing?.id) return existing;

    const meta = user.user_metadata ?? {};
    const name =
      (typeof meta.full_name === "string" && meta.full_name.trim()) ||
      user.email?.split("@")[0] ||
      "New mentor";

    const { data, error } = await supabase
      .from("mentor_profiles")
      .insert({
        user_id: user.id,
        name,
        email: user.email ?? null,
        title: "Mentor",
        company: null,
        industry: "technology",
        bio: DEFAULT_BIO,
        years_experience: null,
        expertise: [],
        rating: 0,
        total_sessions: 0,
        available: true,
        tier: "rising",
        image_url: meta.avatar_url ?? null,
        onboarding_complete: false,
        calendar_connected: false,
      })
      .select("id")
      .single();

    if (error) throw error;
    return data;
  })();

  _ensureInFlight.set(user.id, p);
  try {
    return await p;
  } finally {
    _ensureInFlight.delete(user.id);
  }
}

export async function getMentorOnboardingProfile(userId) {
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveMentorOnboardingStep(profileId, updates) {
  const { data, error } = await supabase
    .from("mentor_profiles")
    .update(updates)
    .eq("id", profileId)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function completeMentorOnboarding(profileId) {
  const { data, error } = await supabase
    .from("mentor_profiles")
    .update({ onboarding_complete: true })
    .eq("id", profileId)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function polishMentorProfile({ bio, expertise, workExperience = [] }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY is not set.');

  const prompt = `Polish the following mentor profile and return ONLY valid JSON with exactly these three keys:
- bio: rewrite in first person, professional tone, 2-3 compelling sentences
- expertise: keep as clean Title Case strings, max 8 tags
- work_experience: rewrite each description to one punchy achievement-focused sentence (preserve the same array structure)

Raw data:
${JSON.stringify({ bio, expertise, work_experience: workExperience }, null, 2)}

Return ONLY valid JSON — no markdown, no preamble, no code fences.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 2000,
      messages: [
        { role: 'system', content: 'You are a professional profile writer. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`OpenAI API error ${response.status}: ${body}`);
  }

  const json = await response.json();
  const rawText = json.choices?.[0]?.message?.content ?? '';
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse AI response as JSON.');
  }

  if (typeof parsed.bio !== 'string') throw new Error('AI returned an invalid bio.');
  if (!Array.isArray(parsed.expertise)) throw new Error('AI returned invalid expertise.');

  return parsed;
}

export async function updateMentorProfile(profileId, data) {
  const { error } = await supabase
    .from('mentor_profiles')
    .update(data)
    .eq('id', profileId);
  if (error) throw error;
}
