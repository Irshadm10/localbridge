import { getMenteeProfile, upsertMenteeProfile } from './menteeProfile';

export async function getAIMatchedMentors({ menteeProfile, mentors, resumeText }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY is not set.');

  const mentorList = mentors.map((m) => ({
    mentor_id: m.id,
    name: m.name,
    title: m.title,
    company: m.company,
    industry: m.industry,
    bio: m.bio,
    years_experience: m.years_experience,
    expertise: m.expertise,
    rating: m.rating,
    total_sessions: m.total_sessions,
    tier: m.tier,
  }));

  const userMessage = `
MENTEE PROFILE:
- Current role: ${menteeProfile.current_position ?? 'Not specified'}
- Target role: ${menteeProfile.target_role ?? 'Not specified'}
- Target industry: ${menteeProfile.target_industry ?? 'Not specified'}
- Years of experience: ${menteeProfile.years_experience ?? 'Not specified'}
- Top goals: ${(menteeProfile.top_goals ?? []).join(', ') || 'Not specified'}
- Session types needed: ${(menteeProfile.session_types_needed ?? []).join(', ') || 'Not specified'}
- Availability: ${menteeProfile.availability ?? 'Not specified'}
- Bio summary: ${menteeProfile.bio_summary ?? 'Not provided'}
${resumeText ? `\nRESUME (base64-encoded PDF — use for additional background context):\n${resumeText}` : '\nRESUME: Not provided'}

AVAILABLE MENTORS (${mentorList.length} total):
${JSON.stringify(mentorList, null, 2)}

Return ONLY valid JSON matching this exact schema — no markdown, no explanation, nothing else:
{
  "top_matches": [
    {
      "mentor_id": "uuid string matching mentor_profiles.id",
      "match_score": <number 0-100>,
      "match_label": "Strong Match" | "Good Match" | "Solid Match",
      "reasons": ["reason 1", "reason 2", "reason 3"]
    }
  ],
  "honorable_mentions": [
    {
      "mentor_id": "uuid string",
      "match_score": <number 0-100>,
      "match_label": <string>,
      "reason": "one sentence"
    }
  ]
}

top_matches must have exactly 3 entries. honorable_mentions must have exactly 2 entries.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1500,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert career counselor and mentor matching engine. Your job is to analyze a mentee\'s profile and goals, then identify the best mentor matches from a provided list. You evaluate alignment across: industry fit, career stage, goal relevance, expertise overlap, and session type compatibility. You always return structured JSON only — no prose, no markdown fences, no explanation.',
        },
        { role: 'user', content: userMessage },
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
    throw new Error(`Failed to parse OpenAI response as JSON. Raw output: ${rawText}`);
  }

  if (!Array.isArray(parsed.top_matches) || parsed.top_matches.length !== 3) {
    throw new Error('OpenAI returned malformed top_matches (expected exactly 3).');
  }
  if (!Array.isArray(parsed.honorable_mentions) || parsed.honorable_mentions.length !== 2) {
    throw new Error('OpenAI returned malformed honorable_mentions (expected exactly 2).');
  }

  return parsed;
}

export async function saveMenteeAssessment(userId, profileData) {
  return upsertMenteeProfile(userId, profileData);
}

export async function loadMenteeAssessment(userId) {
  return getMenteeProfile(userId);
}
