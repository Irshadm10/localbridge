const LEVEL_CONTEXT = {
  entry: 'entry-level (0–2 years of experience, applying to entry-level roles)',
  mid: 'mid-level (3–7 years of experience, applying to mid-senior roles)',
  senior: 'senior-level (8+ years of experience, applying to senior or leadership roles)',
};

function base64ToBlob(base64, mimeType) {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mimeType });
}

export async function getAIResumeReview({ resumeBase64, experienceLevel }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY is not set.');

  const levelDesc = LEVEL_CONTEXT[experienceLevel] ?? LEVEL_CONTEXT.entry;

  const userText = `Review this resume for a ${levelDesc} candidate. Grade it strictly and honestly — do not inflate scores.

Grading scale:
- 90–100 → A: nearly flawless, would pass any ATS and impress any recruiter
- 80–89 → B: strong resume, minor improvements needed
- 70–79 → C: average, significant issues holding it back
- 60–69 → D: major problems, needs substantial rework
- Below 60 → F: not ready to submit

Return ONLY valid JSON — no markdown, no preamble, no explanation outside the JSON object:
{
  "numeric_score": <integer 0-100>,
  "letter_grade": <"A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F">,
  "overall_feedback": "<2–3 sentence overall assessment>",
  "sections": {
    "contact_info": {
      "score": <integer 0-100>,
      "feedback": "<specific feedback>",
      "rewrites": ["<improved line or suggestion>", "<another suggestion>"]
    },
    "summary": { "score": ..., "feedback": "...", "rewrites": [...] },
    "experience": { "score": ..., "feedback": "...", "rewrites": [...] },
    "skills": { "score": ..., "feedback": "...", "rewrites": [...] },
    "education": { "score": ..., "feedback": "...", "rewrites": [...] },
    "formatting": { "score": ..., "feedback": "...", "rewrites": [...] }
  }
}`;

  // Upload the PDF to the Files API so it can be referenced in chat completions
  const blob = base64ToBlob(resumeBase64, 'application/pdf');
  const formData = new FormData();
  formData.append('file', blob, 'resume.pdf');
  formData.append('purpose', 'user_data');

  const uploadRes = await fetch('https://api.openai.com/v1/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!uploadRes.ok) {
    const body = await uploadRes.text().catch(() => '');
    throw new Error(`OpenAI file upload error ${uploadRes.status}: ${body}`);
  }

  const { id: fileId } = await uploadRes.json();

  let response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content:
              "You are a professional resume coach and career advisor with 20+ years of experience reviewing resumes for top companies including Fortune 500s, leading tech firms, and competitive graduate programs. You are direct, specific, and actionable. You never give empty praise — every piece of feedback includes a concrete suggestion. You grade against the candidate's stated experience level and role target, not against perfection.",
          },
          {
            role: 'user',
            content: [
              { type: 'file', file: { file_id: fileId } },
              { type: 'text', text: userText },
            ],
          },
        ],
      }),
    });
  } finally {
    // Clean up the uploaded file regardless of whether the API call succeeded
    fetch(`https://api.openai.com/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${apiKey}` },
    }).catch(() => {});
  }

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
    throw new Error(
      'We had trouble reading your resume. Make sure it\'s a text-based PDF, not a scanned image.',
    );
  }

  const required = ['numeric_score', 'letter_grade', 'overall_feedback', 'sections'];
  const sectionKeys = ['contact_info', 'summary', 'experience', 'skills', 'education', 'formatting'];

  if (required.some((k) => parsed[k] == null)) {
    throw new Error(
      'We had trouble reading your resume. Make sure it\'s a text-based PDF, not a scanned image.',
    );
  }

  if (sectionKeys.some((k) => !parsed.sections[k])) {
    throw new Error(
      'We had trouble reading your resume. Make sure it\'s a text-based PDF, not a scanned image.',
    );
  }

  return parsed;
}
