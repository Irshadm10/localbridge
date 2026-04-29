import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mic, MicOff, CheckCircle2, Loader2 } from 'lucide-react'
import supabase from '../api/supabase'
import { generateFollowUp, generateSummary, speakText } from '../api/intake'
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

  const recognitionRef = useRef(null)

  // SpeechRecognition setup
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setPageState('no_support')
      return
    }
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = true
    rec.lang = 'en-US'
    recognitionRef.current = rec
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      window.speechSynthesis.cancel()
    }
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

  function listenForAnswer() {
    return new Promise((resolve) => {
      const rec = recognitionRef.current
      if (!rec) { resolve(''); return }

      setFlowState('listening')
      setInterimText('')

      let finalAnswer = ''

      rec.onresult = (event) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript
          if (event.results[i].isFinal) finalAnswer += text + ' '
          else interim = text
        }
        setInterimText(finalAnswer + interim)
      }

      rec.onerror = () => resolve(finalAnswer.trim() || '[no response]')
      rec.onend = () => resolve(finalAnswer.trim() || '[no response]')

      try { rec.start() } catch { resolve('[no response]') }
    })
  }

  async function runIntakeFlow() {
    const sessionType = sessionData.session_type
    const questions = QUESTIONS[sessionType] ?? QUESTIONS.career_advice
    const collected = []

    try {
      for (let i = 0; i < questions.length; i++) {
        setCurrentQuestionIndex(i)
        setCurrentQuestion(questions[i])
        setPhase('main')
        setInterimText('')

        // Speak question, wait for it to finish, then listen
        setFlowState('speaking')
        await speakText(questions[i])

        const mainAnswer = await listenForAnswer()

        // Check for follow-up
        setFlowState('processing')
        let followUp = null
        try { followUp = await generateFollowUp(sessionType, questions[i], mainAnswer) } catch { /* skip */ }

        if (followUp) {
          setPhase('followup')
          setCurrentQuestion(followUp)
          setInterimText('')

          setFlowState('speaking')
          await speakText(followUp)

          const followUpAnswer = await listenForAnswer()

          collected.push({ question: questions[i], answer: mainAnswer })
          collected.push({ question: followUp, answer: followUpAnswer })
        } else {
          collected.push({ question: questions[i], answer: mainAnswer })
        }

        setFlowState('processing')
      }

      // Generate and save summary
      let summary = ''
      try { summary = await generateSummary(sessionType, collected) } catch {
        summary = collected.map(t => `Q: ${t.question}\nA: ${t.answer}`).join('\n\n')
      }

      await supabase
        .from('sessions')
        .update({ intake_summary: summary, intake_completed: true })
        .eq('id', sessionId)

      setFlowState('complete')
    } catch (err) {
      setErrorMessage(err?.message ?? 'Something went wrong.')
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

  const stateLabel = {
    idle: 'Tap to speak',
    speaking: 'Speaking...',
    listening: 'Listening...',
    processing: 'Processing...',
    error: 'Error',
  }[flowState] ?? ''

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
            {isIdle ? (
              <button
                onClick={runIntakeFlow}
                className="relative w-20 h-20 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-400 shadow-lg transition-all"
              >
                <Mic size={32} className="text-white" />
              </button>
            ) : isListening ? (
              <button
                onClick={() => recognitionRef.current?.stop()}
                title="Tap to finish speaking"
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
                  {isListening ? 'Waiting for speech…' : isBusy ? ' ' : ''}
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
