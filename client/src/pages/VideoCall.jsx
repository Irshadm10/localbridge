import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import supabase from '../api/supabase';
import { updateSessionStatus } from '../api/sessions';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  ArrowLeft, AlertCircle, Loader2,
} from 'lucide-react';

// STUN gets you started; free TURN handles symmetric NAT (cellular, corporate
// Wi-Fi). For production traffic, swap openrelay for your own TURN credentials
// from Twilio, Metered, Cloudflare Calls, etc.
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
  {
    urls: [
      'turn:openrelay.metered.ca:80',
      'turn:openrelay.metered.ca:443',
      'turn:openrelay.metered.ca:443?transport=tcp',
    ],
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

const MEDIA_CONSTRAINTS = {
  video: {
    width:  { ideal: 1280, max: 1920 },
    height: { ideal: 720,  max: 1080 },
    frameRate: { ideal: 30, max: 30 },
    facingMode: 'user',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl:  true,
  },
};

const SESSION_TYPE_LABELS = {
  career_advice:  'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review:  'Resume Review',
  networking:     'Networking',
};

function formatTimer(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function VideoCall() {
  const { sessionId }                  = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate                       = useNavigate();
  const isMentor                       = user ? isMentorAccount(user) : false;

  const [session,      setSession]      = useState(null);
  const [pageLoading,  setPageLoading]  = useState(true);
  const [accessError,  setAccessError]  = useState(null);
  const [permError,    setPermError]    = useState(null);
  const [callStatus,   setCallStatus]   = useState('setup');
  const [micOn,        setMicOn]        = useState(true);
  const [camOn,        setCamOn]        = useState(true);
  const [elapsed,      setElapsed]      = useState(0);
  const [remoteActive, setRemoteActive] = useState(false);

  const localRef      = useRef(null);
  const remoteRef     = useRef(null);
  const localStream   = useRef(null);
  const pc            = useRef(null);
  const channel       = useRef(null);
  const pendingIce    = useRef([]);
  const timerInterval = useRef(null);
  const startTime     = useRef(null);

  // ── Load & authorize session ──────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*, mentor:mentor_id(id, name, user_id)')
          .eq('id', sessionId)
          .single();
        if (error) throw error;
        if (!data)  throw new Error('Session not found.');
        const isMentee    = data.mentee_id        === user.id;
        const isMentorRow = data.mentor?.user_id  === user.id;
        if (!isMentee && !isMentorRow) {
          if (!cancelled) setAccessError('You do not have access to this session.');
          return;
        }
        if (data.status !== 'accepted') {
          if (!cancelled) setAccessError('This session has not been confirmed yet.');
          return;
        }
        if (!cancelled) setSession(data);
      } catch (err) {
        if (!cancelled) setAccessError(err.message ?? 'Could not load session.');
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId, user, authLoading, navigate]);

  // ── Main WebRTC setup ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!session || !user) return;

    let cancelled  = false;
    let didCleanup = false;
    let restartTimer = null;

    // Deterministic offerer: whoever has the lexicographically smaller user id
    // creates the offer once both peers are present. Role-independent so the
    // call works regardless of who joins first.
    const otherUserId = session.mentor?.user_id === user.id
      ? session.mentee_id
      : session.mentor?.user_id;
    const isOfferer   = otherUserId ? user.id < otherUserId : !isMentor;

    function send(payload) {
      channel.current?.send({ type: 'broadcast', event: 'signal', payload });
    }

    function startTimer() {
      if (timerInterval.current) return;
      startTime.current = Date.now();
      timerInterval.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
      }, 1000);
    }

    async function flushIce() {
      const buffered = pendingIce.current;
      pendingIce.current = [];
      for (const c of buffered) {
        try { await pc.current?.addIceCandidate(new RTCIceCandidate(c)); }
        catch { /* ignore stale candidate */ }
      }
    }

    async function negotiate() {
      if (!pc.current || cancelled) return;
      try {
        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);
        send({ type: 'offer', sdp: pc.current.localDescription.sdp });
        setCallStatus('connecting');
      } catch (err) {
        console.error('negotiate error', err);
      }
    }

    async function setup() {
      // 1. Local media
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      } catch (err) {
        if (cancelled) return;
        const msg = err.name === 'NotAllowedError'
          ? 'Camera and microphone access was denied. Please allow permissions in your browser and reload.'
          : (err.message || 'Could not access camera or microphone.');
        setPermError(msg);
        return;
      }
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

      localStream.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;

      // 2. Peer connection
      const conn = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pc.current = conn;

      stream.getTracks().forEach((t) => conn.addTrack(t, stream));

      conn.ontrack = ({ streams }) => {
        if (cancelled) return;
        if (remoteRef.current) remoteRef.current.srcObject = streams[0];
        setRemoteActive(true);
        setCallStatus('connected');
        startTimer();
      };

      conn.onicecandidate = ({ candidate }) => {
        if (candidate) send({ type: 'ice-candidate', candidate: candidate.toJSON() });
      };

      conn.onconnectionstatechange = () => {
        if (cancelled || !pc.current) return;
        const s = conn.connectionState;
        if (s === 'failed') {
          // Try a single ICE restart before giving up.
          if (isOfferer) {
            try { conn.restartIce(); } catch { /* noop */ }
            clearTimeout(restartTimer);
            restartTimer = setTimeout(() => {
              if (!cancelled && pc.current?.connectionState !== 'connected') {
                setCallStatus('ended');
              }
            }, 5000);
          }
        } else if (s === 'disconnected') {
          // Brief drop — give it a few seconds before ending.
          clearTimeout(restartTimer);
          restartTimer = setTimeout(() => {
            if (!cancelled && pc.current?.connectionState !== 'connected') {
              setCallStatus('ended');
            }
          }, 8000);
        } else if (s === 'connected') {
          clearTimeout(restartTimer);
        }
      };

      // 3. Signaling channel with PRESENCE
      const ch = supabase.channel(`video:${sessionId}`, {
        config: {
          broadcast: { self: false },
          presence:  { key: user.id },
        },
      });
      channel.current = ch;

      ch.on('broadcast', { event: 'signal' }, async ({ payload }) => {
        if (cancelled || !pc.current) return;
        const conn2 = pc.current;
        const { type, sdp, candidate } = payload;
        try {
          if (type === 'offer') {
            const offerCollision = conn2.signalingState !== 'stable';
            if (offerCollision && isOfferer) return; // polite peer wins
            await conn2.setRemoteDescription({ type: 'offer', sdp });
            await flushIce();
            const answer = await conn2.createAnswer();
            await conn2.setLocalDescription(answer);
            send({ type: 'answer', sdp: conn2.localDescription.sdp });
            setCallStatus('connecting');
          } else if (type === 'answer') {
            if (conn2.signalingState === 'have-local-offer') {
              await conn2.setRemoteDescription({ type: 'answer', sdp });
              await flushIce();
            }
          } else if (type === 'ice-candidate') {
            if (conn2.remoteDescription && conn2.remoteDescription.type) {
              try { await conn2.addIceCandidate(new RTCIceCandidate(candidate)); }
              catch { /* ignore */ }
            } else {
              pendingIce.current.push(candidate);
            }
          } else if (type === 'hangup') {
            setCallStatus('ended');
          }
        } catch (err) {
          console.error('signal handler error', err);
        }
      });

      // Presence: when the other user joins (or is already there), the
      // designated offerer creates an offer. This is robust against join order.
      ch.on('presence', { event: 'sync' }, () => {
        if (cancelled || !pc.current) return;
        const state = ch.presenceState();
        const peers = Object.keys(state);
        const otherHere = peers.some((id) => id !== user.id);
        if (otherHere) {
          if (isOfferer && pc.current.signalingState === 'stable') {
            void negotiate();
          } else {
            setCallStatus((prev) => (prev === 'connected' ? prev : 'connecting'));
          }
        } else {
          setCallStatus((prev) => (prev === 'connected' ? prev : 'waiting'));
        }
      });

      await ch.subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && !cancelled) {
          await ch.track({ uid: user.id, joined_at: Date.now() });
          setCallStatus('waiting');
        }
      });
    }

    void setup();

    return () => {
      if (didCleanup) return;
      didCleanup = true;
      cancelled  = true;
      clearTimeout(restartTimer);
      clearInterval(timerInterval.current);
      timerInterval.current = null;
      try { send({ type: 'hangup' }); } catch { /* noop */ }
      localStream.current?.getTracks().forEach((t) => t.stop());
      localStream.current = null;
      try { pc.current?.close(); } catch { /* noop */ }
      pc.current = null;
      if (channel.current) {
        try { channel.current.untrack(); } catch { /* noop */ }
        supabase.removeChannel(channel.current);
        channel.current = null;
      }
    };
  }, [session, user, sessionId, isMentor]);

  // ── End call ──────────────────────────────────────────────────────────────
  const handleEndCall = useCallback(async () => {
    try { channel.current?.send({ type: 'broadcast', event: 'signal', payload: { type: 'hangup' } }); }
    catch { /* noop */ }
    clearInterval(timerInterval.current);
    timerInterval.current = null;
    localStream.current?.getTracks().forEach((t) => t.stop());
    localStream.current = null;
    try { pc.current?.close(); } catch { /* noop */ }
    pc.current = null;
    if (channel.current) {
      try { channel.current.untrack(); } catch { /* noop */ }
      supabase.removeChannel(channel.current);
      channel.current = null;
    }
    setCallStatus('ended');

    const isMentee = session?.mentee_id === user?.id;
    if (isMentee && session?.id) {
      try { await updateSessionStatus(session.id, 'completed'); } catch { /* non-fatal */ }
      navigate('/dashboard', {
        state: {
          reviewSession: {
            sessionId:  session.id,
            mentorId:   session.mentor?.id   ?? null,
            mentorName: session.mentor?.name ?? 'your mentor',
          },
        },
      });
    } else {
      navigate('/dashboard');
    }
  }, [navigate, session, user]);

  // ── Mic / camera toggles ─────────────────────────────────────────────────
  function toggleMic() {
    const track = localStream.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  }
  function toggleCam() {
    const track = localStream.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); }
  }

  // ── Derived display info ──────────────────────────────────────────────────
  const otherName = isMentor
    ? (session?.mentee_name ?? 'Mentee')
    : (session?.mentor?.name ?? 'Mentor');
  const sessionTypeLabel = SESSION_TYPE_LABELS[session?.session_type] ?? session?.session_type ?? 'Session';
  const myName = user?.user_metadata?.full_name ?? user?.email ?? 'You';

  // ── Loading / error states ────────────────────────────────────────────────
  if (authLoading || pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-950 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">Cannot join call</p>
          <p className="mt-1 text-sm text-stone-400">{accessError}</p>
        </div>
        <button type="button" onClick={() => navigate('/dashboard')}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#1c1917] px-4 py-2.5 text-sm font-semibold text-stone-300 transition hover:bg-stone-800 hover:text-white">
          <ArrowLeft className="h-4 w-4" />Back to Dashboard
        </button>
      </div>
    );
  }

  if (permError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-950 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15">
          <VideoOff className="h-7 w-7 text-amber-400" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">Camera access needed</p>
          <p className="mt-1 max-w-xs text-sm text-stone-400">{permError}</p>
        </div>
        <button type="button" onClick={() => window.location.reload()}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-400">
          Try again
        </button>
      </div>
    );
  }

  if (callStatus === 'ended') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-950 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-800">
          <PhoneOff className="h-7 w-7 text-stone-400" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">Call ended</p>
          {elapsed > 0 && <p className="mt-1 text-sm text-stone-500">Duration: {formatTimer(elapsed)}</p>}
        </div>
        <button type="button" onClick={() => navigate('/dashboard')}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-400">
          <ArrowLeft className="h-4 w-4" />Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Main call UI ──────────────────────────────────────────────────────────
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-stone-950">
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${remoteActive ? 'opacity-100' : 'opacity-0'}`}
      />

      {(callStatus === 'waiting' || callStatus === 'connecting') && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-stone-950/90 backdrop-blur-sm">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-2xl font-black text-white shadow-[0_0_40px_rgba(234,88,12,0.4)]">
            {otherName.charAt(0).toUpperCase()}
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-stone-950">
              <span className="inline-flex h-3 w-3 animate-ping rounded-full bg-amber-400 opacity-75" />
            </span>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{otherName}</p>
            <p className="mt-1 text-sm text-stone-400">{sessionTypeLabel}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-stone-800 bg-stone-900 px-4 py-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-400" />
            <span className="text-[13px] text-stone-400">
              {callStatus === 'waiting' ? `Waiting for ${otherName} to join…` : 'Connecting…'}
            </span>
          </div>
        </div>
      )}

      <div className="relative z-20 flex shrink-0 items-center justify-between px-4 py-3">
        <button type="button" onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 text-sm font-medium text-stone-300 backdrop-blur-md transition hover:bg-black/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>

        <div className="flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 backdrop-blur-md">
          {callStatus === 'connected' && (
            <>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="font-mono text-sm font-semibold tabular-nums text-white">
                {formatTimer(elapsed)}
              </span>
              <span className="mx-1 h-3 w-px bg-stone-600" />
            </>
          )}
          <span className="text-[13px] text-stone-300">{sessionTypeLabel}</span>
        </div>
      </div>

      <div className="absolute bottom-24 right-4 z-20 overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] ring-2 ring-white/10"
        style={{ width: 160, height: 112 }}>
        <video
          ref={localRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        {!camOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900">
            <VideoOff className="h-6 w-6 text-stone-500" />
          </div>
        )}
        <div className="absolute bottom-1.5 left-2 text-[10px] font-semibold text-white/70">{myName}</div>
      </div>

      <div className="relative z-20 mt-auto flex shrink-0 items-center justify-center gap-3 pb-8 pt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-black/40 px-5 py-3.5 backdrop-blur-xl ring-1 ring-white/10">
          <button type="button" onClick={toggleMic}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
              micOn
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-red-500 text-white hover:bg-red-400'
            }`}
            aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}>
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          <button type="button" onClick={toggleCam}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
              camOn
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-red-500 text-white hover:bg-red-400'
            }`}
            aria-label={camOn ? 'Turn off camera' : 'Turn on camera'}>
            {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          <div className="h-8 w-px bg-white/15" />

          <button type="button" onClick={handleEndCall}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-[0_4px_16px_rgba(239,68,68,0.4)] transition hover:bg-red-500 active:scale-95"
            aria-label="End call">
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
