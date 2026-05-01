const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const CHAT_URL = 'https://api.openai.com/v1/chat/completions';

async function chatCompletion(systemPrompt, userMessage, maxTokens) {
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

export async function generateFollowUp(sessionType, question, answer) {
  const systemPrompt =
    'You are a warm intake assistant for a mentorship platform called Bridge. ' +
    "Ask one short, friendly follow-up question if the mentee's answer is vague or incomplete. " +
    'If the answer is detailed enough, respond with exactly: DONE';

  const userMessage =
    `Session type: ${sessionType}\n` +
    `Question: ${question}\n` +
    `Answer: ${answer}\n` +
    'Follow-up question or DONE:';

  const response = await chatCompletion(systemPrompt, userMessage, 120);
  return response === 'DONE' ? null : response;
}

export async function generateSummary(sessionType, transcript) {
  const systemPrompt =
    'You are an assistant that writes concise pre-session briefings for mentors on Bridge, a mentorship platform. ' +
    'Write in third person about the mentee. Be specific and actionable. Use plain text, no markdown.';

  const formattedTranscript = transcript
    .map(({ question, answer }) => `Q: ${question}\nA: ${answer}`)
    .join('\n\n');

  const userMessage =
    `Session type: ${sessionType}\n\n` +
    `Intake responses:\n${formattedTranscript}\n\n` +
    'Write a 3–5 sentence mentor briefing covering who this mentee is, what they want, their situation, and what the mentor should focus on:';

  return chatCompletion(systemPrompt, userMessage, 400);
}

// Resolves when the browser has finished speaking the text.
export function speakText(text) {
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.92;
    utter.pitch = 1.0;
    utter.onend = resolve;
    utter.onerror = resolve; // non-fatal — unblock the flow
    window.speechSynthesis.speak(utter);
  });
}
