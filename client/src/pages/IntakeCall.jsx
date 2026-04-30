import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mic, MicOff, CheckCircle2, Loader2 } from 'lucide-react'
import supabase from '../api/supabase'
import { useAuth } from '../context/useAuth'

const QUESTIONS = {
  career_advice: [
    "Tell me about your current role or situation — where are you right now in your career?",
    "What's the main challenge or decision you're facing that made you book this session?",
    "What would a great outcome from today's session look like for you?",
  ],
  interview_prep: [
    "What role and company are you interviewing for, and how far along in the process are you?",
    "Which part of the interview are you most nervous about — technical questions, behavioural, or something else?",
    "What's your biggest weakness going into this interview right now?",
  ],
  resume_review: [
    "What kind of role are you targeting, and what's your current experience level?",
    "What do you feel is the weakest part of your resume right now?",
    "Are there any specific accomplishments or experiences you're not sure how to include?",
  ],
  networking: [
    "What's your goal with networking — are you trying to break into a new industry, find a job, or build relationships?",
    "Tell me about your current network — who do you know, and where are the gaps?",
    "What's held you back from networking more effectively so far?",
  ],
}

const SESSION_TYPE_LABELS = {
  career_advice: 'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review: 'Resume Review',
  networking: 'Networking',
}

// flow states: idle | speaking | listening | processing | complete | error

export default function IntakeCall() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [pageState, setPageState] = useState('loading') // loading | ready | already_done | no_support
  const [sessionData, setSessionData] = useState(null)
  const [mentorName, setMentorName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // flow
  const [flowState, setFlowState] = useState('idle')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [phase, setPhase] = useState('main') // main | followup
  const [interimText, setInterimText] = useState('')

  // WebRTC
  const pcRef = useRef(null)
  const dcRef = useRef(null)
  const localStreamRef = useRef(null)
  const transcriptRef = useRef([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [transcriptItems, setTranscriptItems] = useState([])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      pcRef.current?.close()
      window.speechSynthesis?.cancel()
    }
  }, [])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes orbPulse {
        from { transform: scale(0.95); opacity: 0.6; }
        to { transform: scale(1.15); opacity: 1; }
      }
      @keyframes orbBreath {
        from { transform: scale(0.92); }
        to { transform: scale(1.08); }
      }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  // Auth + session fetch
  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/dashboard'); return }
    if (pageState === 'no_support') return

    async function load() {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, session_type, mentor_id, intake_completed')
        .eq('id', sessionId)
        .eq('mentee_id', user.id)
        .single()

      if (error || !data) { navigate('/dashboard'); return }

      const { data: mentor } = await supabase
        .from('mentor_profiles')
        .select('name')
        .eq('id', data.mentor_id)
        .single()

      setMentorName(mentor?.name ?? 'your mentor')
      setSessionData(data)
      setPageState(data.intake_completed ? 'already_done' : 'ready')
    }

    load().catch(() => navigate('/dashboard'))
  }, [authLoading, user, sessionId, navigate, pageState])

  async function startRealtimeSession() {
    setIsConnecting(true)
    setFlowState('speaking') // 'speaking' = session is live

    try {
      // 1. Fetch ephemeral token from our backend
      const res = await fetch('/api/realtime-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: sessionData.session_type,
          sessionId: sessionId,
        }),
      })
      if (!res.ok) throw new Error('Failed to get realtime session token')
      const data = await res.json()
      const ephemeralKey = data.client_secret?.value
      if (!ephemeralKey) throw new Error('No ephemeral key returned')

      // 2. Set up WebRTC peer connection
      const pc = new RTCPeerConnection()
      pcRef.current = pc

      pc.oniceconnectionstatechange = () => {
        if (
          pc.iceConnectionState === 'disconnected' ||
          pc.iceConnectionState === 'failed'
        ) {
          setErrorMessage('Connection dropped. Please try again.')
          setFlowState('error')
        }
      }

      // 3. Play assistant audio in an audio element
      const audioEl = document.createElement('audio')
      audioEl.autoplay = true
      audioEl.setAttribute('playsinline', '')
      document.body.appendChild(audioEl)
      pc.ontrack = (e) => { audioEl.srcObject = e.streams[0] }

      // 4. Add microphone track
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream
      stream.getTracks().forEach(track => pc.addTrack(track, stream))

      // 5. Set up data channel for events
      const dc = pc.createDataChannel('oai-events')
      dcRef.current = dc

      dc.onmessage = (e) => {
        let event
        try { event = JSON.parse(e.data) } catch { return }
        handleRealtimeEvent(event)
      }

      dc.addEventListener('open', () => {
        dc.send(JSON.stringify({
          type: 'session.update',
          session: {
            instructions: null
          }
        }))
        dc.send(JSON.stringify({
          type: 'response.create',
          response: {
            modalities: ['audio', 'text']
          }
        }))
      })

      // 6. Create SDP offer and get answer from OpenAI
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const sdpRes = await fetch(
        'https://api.openai.com/v1/realtime?model=gpt-realtime-1.5',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      )
      if (!sdpRes.ok) throw new Error('WebRTC SDP exchange failed')
      const answerSdp = await sdpRes.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

      setIsConnecting(false)
    } catch (err) {
      setErrorMessage(err?.message ?? 'Could not start voice session')
      setFlowState('error')
      setIsConnecting(false)
    }
  }

  function handleRealtimeEvent(event) {
    // Capture assistant transcript
    if (
      event.type === 'response.audio_transcript.done' &&
      event.transcript
    ) {
      transcriptRef.current.push({ role: 'assistant', text: event.transcript })
      setTranscriptItems(prev => [...prev, { role: 'assistant', text: event.transcript }])
    }

    // Capture user transcript
    if (
      event.type === 'conversation.item.input_audio_transcription.completed' &&
      event.transcript
    ) {
      transcriptRef.current.push({ role: 'user', text: event.transcript })
      setTranscriptItems(prev => [...prev, { role: 'user', text: event.transcript }])
      setInterimText(event.transcript)
    }

    // Handle complete_intake function call
    if (
      event.type === 'response.function_call_arguments.done' &&
      event.name === 'complete_intake'
    ) {
      endSessionAndSummarise()
    }
  }

  async function endSessionAndSummarise() {
    // Stop all tracks and close connection
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    pcRef.current?.close()
    document.querySelectorAll('audio[playsinline]').forEach(el => el.remove())

    setFlowState('processing')

    try {
      const transcript = transcriptRef.current
      const sessionType = sessionData.session_type

      // Build summary via standard OpenAI chat completion
      const formatted = transcript
        .map(t => `${t.role === 'assistant' ? 'Bridge' : 'Mentee'}: ${t.text}`)
        .join('\n')

      const summaryRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 500,
          messages: [
            {
              role: 'system',
              content:
                'You are generating a mentor briefing from a voice intake interview transcript. ' +
                'Write in third person about the mentee. Be specific and actionable. ' +
                'Use plain text only, no markdown, no bullet symbols.',
            },
            {
              role: 'user',
              content:
                `Session type: ${sessionType}\n\n` +
                `Transcript:\n${formatted}\n\n` +
                'Generate a mentor briefing in this exact format:\n\n' +
                'MENTOR BRIEFING\n' +
                'Session type: [session type]\n\n' +
                'Who the mentee is: [2-3 sentences on background and situation]\n\n' +
                'What they want from this session: [1-2 sentences on goal]\n\n' +
                'Key challenges: [2-3 sentences on specific problems raised]\n\n' +
                'What to focus on: [1-2 sentences of direct guidance for the mentor]',
            },
          ],
        }),
      })

      const summaryData = await summaryRes.json()
      const summary = summaryData.choices?.[0]?.message?.content?.trim() ?? ''

      // Save to Supabase sessions table
      await supabase
        .from('sessions')
        .update({ intake_summary: summary, intake_completed: true })
        .eq('id', sessionId)

      setFlowState('complete')
    } catch (err) {
      setErrorMessage(err?.message ?? 'Failed to save intake summary')
      setFlowState('error')
    }
  }

  // ── Screens ────────────────────────────────────────────────────────────────

  if (pageState === 'loading' || (authLoading && pageState === 'loading')) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bridge-canvas)' }}>
        <Loader2 className="animate-spin text-amber-400" size={36} />
      </div>
    )
  }

  if (pageState === 'no_support') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bridge-canvas)' }}>
        <div className="text-center max-w-sm">
          <MicOff size={48} className="mx-auto mb-4" style={{ color: 'var(--bridge-text-muted)' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--bridge-text)' }}>
            Voice input not supported
          </h2>
          <p className="text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
            Your browser doesn't support voice input. Please use Chrome or Edge.
          </p>
        </div>
      </div>
    )
  }

  if (pageState === 'already_done') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bridge-canvas)' }}>
        <div
          className="rounded-2xl p-8 text-center max-w-sm shadow-xl"
          style={{ background: 'var(--bridge-surface)', border: '1px solid var(--bridge-border)' }}
        >
          <CheckCircle2 size={52} className="mx-auto mb-4 text-amber-400" />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--bridge-text)' }}>
            You've already completed your intake
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--bridge-text-muted)' }}>
            Your mentor is ready for your session.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-amber-500 hover:bg-amber-400 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (flowState === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bridge-canvas)' }}>
        <div className="text-center max-w-sm">
          <CheckCircle2 size={64} className="mx-auto mb-6 text-emerald-400" />
          <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--bridge-text)' }}>
            All done!
          </h2>
          <p className="text-base mb-8" style={{ color: 'var(--bridge-text-muted)' }}>
            Your mentor will be prepared for your session.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-amber-500 hover:bg-amber-400 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Main intake UI ─────────────────────────────────────────────────────────

  const questions = sessionData ? (QUESTIONS[sessionData.session_type] ?? QUESTIONS.career_advice) : []
  const totalQuestions = questions.length
  const isListening = flowState === 'listening'
  const isBusy = flowState === 'speaking' || flowState === 'processing'
  const isIdle = flowState === 'idle'
  const isLive = flowState === 'speaking' || flowState === 'listening'

  const stateLabel = isConnecting
    ? 'Connecting...'
    : {
        idle: 'Tap to speak',
        speaking: 'Session live',
        listening: 'Listening...',
        processing: 'Processing...',
        error: 'Error',
      }[flowState] ?? ''

  // Connecting loading screen
  if (isConnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: 'var(--bridge-canvas)' }}>
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-24 h-24 rounded-full border border-amber-400/20 animate-ping" />
          <div className="absolute w-16 h-16 rounded-full border border-amber-400/40 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Mic size={20} className="text-amber-400" />
          </div>
        </div>
        <p className="text-sm font-semibold tracking-widest uppercase text-amber-400 mb-2">
          Connecting to Bridge AI
        </p>
        <p className="text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
          Setting up your voice session...
        </p>
      </div>
    )
  }

  // Active session UI (live)
  if ((flowState === 'speaking' || flowState === 'listening') && !isConnecting) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bridge-canvas)' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--bridge-border)' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              {SESSION_TYPE_LABELS[sessionData?.session_type]} · Intake
            </p>
            <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--bridge-text)' }}>
              Session with {mentorName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Live</span>
          </div>
        </div>

        {/* Transcript area — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 max-w-2xl mx-auto w-full">
          {transcriptItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
                Your conversation will appear here...
              </p>
            </div>
          ) : (
            transcriptItems.map((item, i) => (
              <div
                key={i}
                className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    item.role === 'user'
                      ? 'bg-amber-500 text-white rounded-br-sm'
                      : 'rounded-bl-sm'
                  }`}
                  style={item.role === 'assistant' ? {
                    background: 'var(--bridge-surface)',
                    border: '1px solid var(--bridge-border)',
                    color: 'var(--bridge-text)'
                  } : {}}
                >
                  {item.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom bar — visualizer + controls */}
        <div className="border-t px-6 py-5" style={{ borderColor: 'var(--bridge-border)', background: 'var(--bridge-surface)' }}>
          {/* Orb visualizer */}
          <div className="flex justify-center mb-4">
            <div className="relative flex items-center justify-center">
              {/* Outer glow rings */}
              <div
                className="absolute rounded-full"
                style={{
                  width: '120px',
                  height: '120px',
                  background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)',
                  animation: flowState === 'speaking'
                    ? 'orbPulse 1.2s ease-in-out infinite alternate'
                    : 'orbPulse 2.5s ease-in-out infinite alternate',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: '90px',
                  height: '90px',
                  background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)',
                  animation: flowState === 'speaking'
                    ? 'orbPulse 0.9s ease-in-out infinite alternate'
                    : 'orbPulse 2s ease-in-out infinite alternate',
                  animationDelay: '0.2s',
                }}
              />
              {/* Core orb */}
              <div
                className="rounded-full"
                style={{
                  width: '64px',
                  height: '64px',
                  background: flowState === 'speaking'
                    ? 'radial-gradient(circle at 35% 35%, #fde68a, #f59e0b, #d97706)'
                    : flowState === 'listening'
                    ? 'radial-gradient(circle at 35% 35%, #6ee7b7, #10b981, #059669)'
                    : 'radial-gradient(circle at 35% 35%, #fde68a, #f59e0b, #d97706)',
                  animation: flowState === 'speaking'
                    ? 'orbBreath 1s ease-in-out infinite alternate'
                    : 'orbBreath 2.5s ease-in-out infinite alternate',
                  boxShadow: flowState === 'speaking'
                    ? '0 0 30px rgba(245,158,11,0.6), 0 0 60px rgba(245,158,11,0.3)'
                    : flowState === 'listening'
                    ? '0 0 30px rgba(16,185,129,0.6), 0 0 60px rgba(16,185,129,0.3)'
                    : '0 0 20px rgba(245,158,11,0.4)',
                }}
              />
            </div>
          </div>
          {/* Status + end button */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: 'var(--bridge-text-muted)' }}>
              {flowState === 'speaking' ? 'Bridge AI is speaking...' : 'Listening to you...'}
            </p>
            <button
              onClick={endSessionAndSummarise}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-500/80 hover:bg-red-500 transition-colors"
            >
              <MicOff size={14} />
              End Session
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Processing screen
  if (flowState === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bridge-canvas)' }}>
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-sm font-medium" style={{ color: 'var(--bridge-text)' }}>
            Generating mentor briefing...
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--bridge-text-muted)' }}>
            This will just take a moment
          </p>
        </div>
      </div>
    )
  }

  // Idle card (flowState === 'idle' or 'error')
  return (
    <div className="min-h-screen" style={{ background: 'var(--bridge-canvas)' }}>
      {/* Hero */}
      <div className="bg-stone-950 border-b border-white/10 px-6 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
          {SESSION_TYPE_LABELS[sessionData?.session_type] ?? 'Session'} · Intake
        </p>
        <h1 className="text-2xl font-bold text-white mb-2">
          Session with {mentorName}
        </h1>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          Before your session, we'd like to learn a bit about you so your mentor can hit the ground running.
        </p>
      </div>

      {/* Card */}
      <div className="max-w-xl mx-auto px-4 py-10">
        <div
          className="rounded-2xl p-8 shadow-xl"
          style={{ background: 'var(--bridge-surface)', border: '1px solid var(--bridge-border)' }}
        >
          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--bridge-text-muted)' }}>
              {isIdle
                ? `${totalQuestions} questions`
                : `Question ${Math.min(currentQuestionIndex + 1, totalQuestions)} of ${totalQuestions}${phase === 'followup' ? ' · follow-up' : ''}`}
            </p>
            {!isIdle && (
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 w-6 rounded-full transition-colors"
                    style={{ background: i <= currentQuestionIndex ? '#f59e0b' : 'var(--bridge-border)' }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Question text */}
          <p
            className="text-xl font-medium leading-snug text-center mb-10"
            style={{ color: 'var(--bridge-text)', minHeight: '4rem' }}
          >
            {isIdle
              ? "Ready when you are. We'll ask you a few short questions — just speak naturally."
              : currentQuestion}
          </p>

          {/* Mic button */}
          <div className="flex flex-col items-center gap-3 mb-6">
            {isConnecting ? (
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--bridge-border)' }}>
                <Loader2 size={32} className="text-amber-400 animate-spin" />
              </div>
            ) : isIdle ? (
              <button
                onClick={startRealtimeSession}
                className="relative w-20 h-20 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-400 shadow-lg transition-all"
              >
                <Mic size={32} className="text-white" />
              </button>
            ) : isLive ? (
              <button
                onClick={endSessionAndSummarise}
                title="Tap to end session"
                className="relative w-20 h-20 rounded-full flex items-center justify-center bg-amber-500 shadow-lg shadow-amber-500/40"
              >
                <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-40" />
                <Mic size={32} className="text-white relative z-10" />
              </button>
            ) : flowState === 'error' ? (
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, red 15%, transparent)' }}>
                <MicOff size={32} className="text-red-400" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--bridge-border)' }}>
                <Loader2 size={32} className="text-amber-400 animate-spin" />
              </div>
            )}

            <p className="text-sm font-medium" style={{ color: 'var(--bridge-text-muted)' }}>
              {stateLabel}
            </p>
          </div>

          {/* Live transcript box */}
          {!isIdle && flowState !== 'error' && (
            <div
              className="rounded-xl px-4 py-3 text-sm leading-relaxed"
              style={{
                background: 'var(--bridge-canvas)',
                border: '1px solid var(--bridge-border)',
                color: 'var(--bridge-text)',
                minHeight: '64px',
              }}
            >
              {interimText ? (
                interimText
              ) : (
                <span style={{ color: 'var(--bridge-text-muted)' }}>
                  {isListening ? 'Waiting for speech…' : isBusy ? ' ' : ''}
                </span>
              )}
            </div>
          )}

          {/* Error */}
          {flowState === 'error' && (
            <p className="text-sm text-red-400 text-center mt-4">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}
