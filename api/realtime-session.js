// Required env var: OPENAI_API_KEY
// Add to Vercel dashboard under Settings > Environment Variables
// Scope: Production + Preview
// This key must never be prefixed with VITE_ — server only

import { intakePrompt } from './prompts/intakePrompt.js'

const VALID_SESSION_TYPES = ['career_advice', 'interview_prep', 'resume_review', 'networking']

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { sessionType, sessionId } = req.body ?? {}

  if (!sessionType || !VALID_SESSION_TYPES.includes(sessionType)) {
    return res.status(400).json({ error: 'Invalid or missing sessionType' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured' })

  try {
    const instructions =
      intakePrompt +
      '\n\nThe session type for this interview is: ' +
      sessionType +
      '. Ask only the questions for this session type.'

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-realtime-1.5',
        voice: 'ballad',
        instructions,
        input_audio_transcription: { model: 'gpt-4o-mini-transcribe' },
        turn_detection: {
          type: 'semantic_vad',
          eagerness: 'auto',
        },
        tools: [
          {
            type: 'function',
            name: 'complete_intake',
            description: 'Called when the intake interview is fully complete',
            parameters: {
              type: 'object',
              properties: {
                session_type: { type: 'string' },
                status: { type: 'string' },
              },
              required: ['session_type', 'status'],
            },
          },
        ],
        tool_choice: 'auto',
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(500).json({ error: `OpenAI error (${response.status}): ${errText}` })
    }

    const data = await response.json()
    return res.json(data)
  } catch (err) {
    console.error('[realtime-session] error:', err)
    return res.status(500).json({ error: err?.message ?? 'Failed to create realtime session' })
  }
}
