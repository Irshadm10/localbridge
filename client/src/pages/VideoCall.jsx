import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import supabase from '../api/supabase';
import { updateSessionStatus } from '../api/sessions';
import {
  Mic, MicOff, Video, VideoOff, ScreenShare, ScreenShareOff,
  MessageCircle, Pencil, Volume2, VolumeX,
  ArrowLeft, AlertCircle, Loader2, X, Send, Paperclip, Trash2,
  ChevronUp, UserX, LogOut, Users, Star,
  PhoneOff, Check,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

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

const SESSION_TYPE_LABELS = {
  career_advice:  'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review:  'Resume Review',
  networking:     'Networking',
};

const DRAW_COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ffffff'];

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatTimer(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?';
}

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

// ─── PreJoinScreen ────────────────────────────────────────────────────────────

function PreJoinScreen({ session, isMentor, user, onJoin }) {
  const previewRef   = useRef(null);
  const streamRef    = useRef(null);
  const [mic, setMic]             = useState(true);
  const [cam, setCam]             = useState(true);
  const [loading, setLoading]     = useState(true);
  const [previewErr, setPreviewErr] = useState(null);
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioId, setAudioId]     = useState('');
  const [videoId, setVideoId]     = useState('');

  const otherName    = isMentor ? (session?.mentee_name ?? 'Mentee') : (session?.mentor?.name ?? 'Mentor');
  const sessionLabel = SESSION_TYPE_LABELS[session?.session_type] ?? 'Session';

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        if (!alive) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (previewRef.current) previewRef.current.srcObject = stream;
        const all = await navigator.mediaDevices.enumerateDevices();
        if (!alive) return;
        setAudioDevices(all.filter((d) => d.kind === 'audioinput'));
        setVideoDevices(all.filter((d) => d.kind === 'videoinput'));
        const aId = stream.getAudioTracks()[0]?.getSettings().deviceId ?? '';
        const vId = stream.getVideoTracks()[0]?.getSettings().deviceId ?? '';
        setAudioId(aId);
        setVideoId(vId);
      } catch (err) {
        if (!alive) return;
        setPreviewErr(
          err.name === 'NotAllowedError'
            ? 'Camera/mic access denied — you can still join audio-only.'
            : (err.message || 'Could not access camera or microphone.'),
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  function toggleMic() {
    const t = streamRef.current?.getAudioTracks()[0];
    if (t) { t.enabled = !t.enabled; setMic(t.enabled); }
  }
  function toggleCam() {
    const t = streamRef.current?.getVideoTracks()[0];
    if (t) { t.enabled = !t.enabled; setCam(t.enabled); }
  }
  function join() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    onJoin({ mic, cam, audioId, videoId });
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-stone-950 p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-5 text-center">
          <h1 className="text-xl font-bold text-white sm:text-2xl">Ready to join?</h1>
          <p className="mt-1 text-sm text-stone-400">
            {sessionLabel} with <span className="font-semibold text-white">{otherName}</span>
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 lg:flex-row lg:justify-center">
          {/* Camera preview */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-stone-900 lg:max-w-lg">
            <video
              ref={previewRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${cam ? 'opacity-100' : 'opacity-0'}`}
              style={{ transform: 'scaleX(-1)' }}
            />
            {!cam && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-800 text-lg font-bold text-white">
                  {getInitials(user?.user_metadata?.full_name ?? user?.email)}
                </div>
                <span className="text-xs text-stone-500">Camera off</span>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-950/80">
                <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
              </div>
            )}
            {/* Quick toggles */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-xl bg-black/50 px-3 py-2 backdrop-blur-md">
              <button
                type="button"
                onClick={toggleMic}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                  mic ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white'
                }`}
              >
                {mic ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={toggleCam}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                  cam ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white'
                }`}
              >
                {cam ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Settings panel */}
          <div className="flex w-full flex-col gap-3 lg:w-64">
            {previewErr && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-300">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <span>{previewErr}</span>
              </div>
            )}
            {audioDevices.length > 0 && (
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">Microphone</label>
                <select
                  value={audioId}
                  onChange={(e) => setAudioId(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-orange-500/50"
                  style={{ colorScheme: 'dark', backgroundColor: '#1c1917', color: '#ffffff' }}
                >
                  {audioDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>
                  ))}
                </select>
              </div>
            )}
            {videoDevices.length > 0 && (
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-400">Camera</label>
                <select
                  value={videoId}
                  onChange={(e) => setVideoId(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-orange-500/50"
                  style={{ colorScheme: 'dark', backgroundColor: '#1c1917', color: '#ffffff' }}
                >
                  {videoDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="button"
              onClick={join}
              className="mt-1 w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(234,88,12,0.35)] transition hover:bg-orange-400 active:scale-95"
            >
              Join Meeting
            </button>
            <p className="text-center text-xs text-stone-500">
              {isMentor ? 'You are the host of this session' : 'You are joining as a participant'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ChatSidebar ──────────────────────────────────────────────────────────────

function ChatSidebar({ messages, sessionId, currentUserId, onSend, onClose }) {
  const [text, setText]         = useState('');
  const [uploading, setUploading] = useState(false);
  const bottomRef               = useRef(null);
  const fileInputRef            = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendText(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onSend({ kind: 'text', text: t });
    setText('');
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const path = `${currentUserId}/chat-${sessionId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('resumes').upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage.from('resumes').createSignedUrl(path, 3600);
      const url = signed?.signedUrl;
      if (!url) throw new Error('Could not get signed URL');
      const isImg = /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(file.name);
      onSend({ kind: isImg ? 'image' : 'file', url, name: file.name, size: file.size });
    } catch (err) {
      onSend({ kind: 'text', text: `⚠️ Upload failed: ${err.message}` });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex h-full w-72 flex-none flex-col border-l border-white/10 bg-stone-950/95 backdrop-blur-xl sm:w-80">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-sm font-semibold text-white">In-meeting chat</span>
        <button type="button" onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md text-stone-400 transition hover:bg-white/10 hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2.5 px-3 py-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MessageCircle className="mb-2 h-7 w-7 text-stone-700" />
            <p className="text-xs text-stone-500">No messages yet</p>
          </div>
        )}
        {messages.map((msg) => {
          const mine = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                mine ? 'bg-orange-500 text-white' : 'bg-stone-800 text-stone-100'
              }`}>
                {!mine && <p className="mb-0.5 text-[10px] font-semibold text-stone-400">{msg.senderName}</p>}
                {msg.kind === 'text' && <p className="break-words whitespace-pre-wrap">{msg.text}</p>}
                {msg.kind === 'image' && (
                  <a href={msg.url} target="_blank" rel="noopener noreferrer">
                    <img src={msg.url} alt={msg.name} className="max-h-44 w-full rounded-lg object-contain" />
                    <p className="mt-0.5 text-[10px] opacity-70">{msg.name}</p>
                  </a>
                )}
                {msg.kind === 'file' && (
                  <a href={msg.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{msg.name}</span>
                    {msg.size && <span className="flex-shrink-0 text-[10px] opacity-60">({formatBytes(msg.size)})</span>}
                  </a>
                )}
                <p className={`mt-0.5 text-right text-[10px] ${mine ? 'text-orange-200' : 'text-stone-500'}`}>
                  {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-white/10 p-2.5">
        <form onSubmit={sendText} className="flex items-end gap-2">
          <div className="flex flex-1 items-end overflow-hidden rounded-xl bg-stone-900 ring-1 ring-white/10 focus-within:ring-orange-500/40">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(e); } }}
              placeholder="Message…"
              rows={1}
              className="flex-1 resize-none px-3 py-2 text-sm placeholder-stone-500 focus:outline-none"
              style={{ maxHeight: 72, overflowY: 'auto', backgroundColor: '#1c1917', color: '#ffffff', caretColor: '#ffffff' }}
            />
            <label className={`flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg text-stone-400 transition hover:text-white ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
              <Paperclip className="h-3.5 w-3.5" />
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} disabled={uploading} />
            </label>
          </div>
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-400 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── DrawCanvas ───────────────────────────────────────────────────────────────

function DrawCanvas({ enabled, color, strokes, onStroke }) {
  const canvasRef   = useRef(null);
  const drawing     = useRef(false);
  const current     = useRef([]);

  // resize + redraw
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    function resize() {
      el.width  = el.offsetWidth;
      el.height = el.offsetHeight;
      redraw();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    return () => ro.disconnect();
  }, []);

  useEffect(() => { redraw(); }, [strokes]); // eslint-disable-line

  function redraw() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    strokes.forEach((s) => paintStroke(ctx, s, c.width, c.height));
  }

  function paintStroke(ctx, stroke, w, h) {
    if (!stroke?.points || stroke.points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = stroke.color ?? '#ef4444';
    ctx.lineWidth   = Math.max(2, (stroke.width ?? 3) * Math.min(w, h) / 800);
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.moveTo(stroke.points[0].x * w, stroke.points[0].y * h);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x * w, stroke.points[i].y * h);
    }
    ctx.stroke();
  }

  function pos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.touches?.[0]?.clientX ?? e.clientX;
    const cy = e.touches?.[0]?.clientY ?? e.clientY;
    return { x: (cx - rect.left) / rect.width, y: (cy - rect.top) / rect.height };
  }

  function down(e) {
    if (!enabled) return;
    drawing.current = true;
    current.current = [pos(e)];
    e.preventDefault();
  }
  function move(e) {
    if (!enabled || !drawing.current) return;
    const p = pos(e);
    current.current.push(p);
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const pts = current.current;
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth   = Math.max(2, 3 * Math.min(c.width, c.height) / 800);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.moveTo(pts[pts.length - 2].x * c.width, pts[pts.length - 2].y * c.height);
    ctx.lineTo(pts[pts.length - 1].x * c.width, pts[pts.length - 1].y * c.height);
    ctx.stroke();
    e.preventDefault();
  }
  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    if (current.current.length >= 2) {
      onStroke({ points: current.current, color, width: 3 });
    }
    current.current = [];
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${enabled ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
      style={{ zIndex: 18, touchAction: 'none' }}
      onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
      onTouchStart={down} onTouchMove={move} onTouchEnd={up}
    />
  );
}

// ─── MentorMenteeReviewModal ──────────────────────────────────────────────────

function MentorMenteeReviewModal({ session, menteeId, onDone }) {
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [notes, setNotes]       = useState('');
  const [saving, setSaving]     = useState(false);

  async function submit() {
    if (!rating) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('mentee_reviews').insert({
        session_id:         session.id,
        mentor_reviewer_id: user?.id,
        mentee_id:          menteeId,
        rating,
        notes: notes.trim() || null,
      });
    } catch { /* non-fatal */ }
    finally { setSaving(false); onDone(); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-stone-900 p-6 ring-1 ring-white/10">
        <h2 className="text-base font-bold text-white">Rate this mentee</h2>
        <p className="mt-1 text-xs text-stone-400">Private — never visible to anyone except admins.</p>
        <div className="mt-4 flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star className={`h-7 w-7 transition-colors ${i <= (hovered || rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-600'}`} />
            </button>
          ))}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Private notes (optional)…"
          rows={3}
          className="mt-4 w-full resize-none rounded-xl px-3 py-2.5 text-sm placeholder-stone-500 ring-1 ring-white/10 focus:outline-none focus:ring-orange-500/50"
          style={{ backgroundColor: '#292524', color: '#ffffff', caretColor: '#ffffff' }}
        />
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onDone} className="flex-1 rounded-xl bg-stone-800 py-2.5 text-sm font-medium text-stone-300 hover:bg-stone-700">Skip</button>
          <button
            type="button"
            onClick={submit}
            disabled={!rating || saving}
            className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white transition hover:bg-orange-400 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Review'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ text, type = 'info', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  const bg = type === 'warn' ? 'bg-amber-500/90' : type === 'error' ? 'bg-red-600/90' : 'bg-stone-800/90';
  return (
    <div className={`pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl ${bg} px-4 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur-md ring-1 ring-white/10`}>
      {text}
    </div>
  );
}

// ─── ControlButton ────────────────────────────────────────────────────────────

function CtrlBtn({ active = true, danger = false, onClick, title, children, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all active:scale-95 sm:h-12 sm:w-12 ${
        danger
          ? 'bg-red-600 text-white shadow-[0_4px_14px_rgba(239,68,68,0.45)] hover:bg-red-500'
          : active
          ? 'bg-white/10 text-white hover:bg-white/20'
          : 'bg-red-500 text-white hover:bg-red-400'
      }`}
    >
      {children}
      {badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-0.5 text-[10px] font-bold text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

// ─── Main VideoCall ───────────────────────────────────────────────────────────

export default function VideoCall() {
  const { sessionId }                  = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate                       = useNavigate();
  const isMentor                       = user ? isMentorAccount(user) : false;

  // ── Page state
  const [session,     setSession]     = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [accessError, setAccessError] = useState(null);
  const [permError,   setPermError]   = useState(null);

  // ── Call phases: prejoin | waiting | connecting | connected | ended | mentor-review
  const [callStatus,  setCallStatus]  = useState('prejoin');
  const [callStarted, setCallStarted] = useState(false);

  // ── Media toggles
  const [micOn,    setMicOn]    = useState(true);
  const [camOn,    setCamOn]    = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [remoteSharing, setRemoteSharing] = useState(false);

  // ── Device lists (populated after joining)
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [deviceMenu, setDeviceMenu]     = useState(null); // 'mic'|'cam'|'speaker'|null

  // ── UI panels
  const [chatOpen,    setChatOpen]    = useState(false);
  const [drawEnabled, setDrawEnabled] = useState(false);
  const [drawColor,   setDrawColor]   = useState(DRAW_COLORS[0]);
  const [drawStrokes, setDrawStrokes] = useState([]);
  const [showModPanel, setShowModPanel] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showMenteeReview, setShowMenteeReview] = useState(false);
  const [toast, setToast]             = useState(null);

  // ── Chat
  const [messages,    setMessages]    = useState([]);
  const [unread,      setUnread]      = useState(0);

  // ── Connection display
  const [elapsed,      setElapsed]      = useState(0);
  const [remoteActive, setRemoteActive] = useState(false);
  const [remoteMicOn,  setRemoteMicOn]  = useState(true);
  const [remoteCamOn,  setRemoteCamOn]  = useState(true);

  // ── Refs
  const localRef       = useRef(null);
  const remoteRef      = useRef(null);
  const localStream    = useRef(null);
  const screenTrack    = useRef(null);
  const pc             = useRef(null);
  const channel        = useRef(null);
  const pendingIce     = useRef([]);
  const timerInterval  = useRef(null);
  const startTime      = useRef(null);
  const joinCfg        = useRef({ mic: true, cam: true, audioId: '', videoId: '' });
  const menteeLeft     = useRef(false);
  const sessionEndedByMentor = useRef(false);
  const chatOpenRef    = useRef(false);

  const myName    = user?.user_metadata?.full_name ?? user?.email ?? 'You';
  const otherName = isMentor
    ? (session?.mentee_name ?? 'Mentee')
    : (session?.mentor?.name ?? 'Mentor');
  const sessionLabel = SESSION_TYPE_LABELS[session?.session_type] ?? 'Session';

  // keep chatOpenRef in sync so signal handler closure can check it
  useEffect(() => { chatOpenRef.current = chatOpen; }, [chatOpen]);

  // ── Session load ───────────────────────────────────────────────────────────
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
        const isMentee    = data.mentee_id       === user.id;
        const isMentorRow = data.mentor?.user_id === user.id;
        if (!isMentee && !isMentorRow) {
          if (!cancelled) setAccessError('You do not have access to this session.');
          return;
        }
        if (data.status === 'completed') {
          if (!cancelled) setAccessError('This session has already ended.');
          return;
        }
        if (data.status !== 'accepted') {
          if (!cancelled) setAccessError('This session has not been confirmed yet.');
          return;
        }
        const scheduledMs = new Date(data.scheduled_date).getTime();
        if (Date.now() < scheduledMs - 3 * 60 * 60 * 1000) {
          if (!cancelled) setAccessError('The video room opens 3 hours before the session starts.');
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

  // ── WebRTC setup (runs once when user clicks Join) ─────────────────────────
  useEffect(() => {
    if (!callStarted || !session || !user) return;

    let cancelled  = false;
    let didCleanup = false;
    let restartTimer = null;

    const otherUserId = session.mentor?.user_id === user.id
      ? session.mentee_id
      : session.mentor?.user_id;
    const isOfferer = otherUserId ? user.id < otherUserId : !isMentor;

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
      const buf = pendingIce.current;
      pendingIce.current = [];
      for (const c of buf) {
        try { await pc.current?.addIceCandidate(new RTCIceCandidate(c)); } catch { /* stale */ }
      }
    }
    async function negotiate(conn) {
      if (!conn || cancelled) return;
      try {
        const offer = await conn.createOffer();
        await conn.setLocalDescription(offer);
        send({ type: 'offer', sdp: conn.localDescription.sdp });
        setCallStatus('connecting');
      } catch (err) {
        console.error('negotiate error', err);
      }
    }

    // Create or recreate a peer connection — also called on mentee rejoin
    function buildPC() {
      const conn = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pc.current = conn;

      localStream.current?.getTracks().forEach((t) => conn.addTrack(t, localStream.current));

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
          if (!menteeLeft.current && isOfferer) {
            try { conn.restartIce(); } catch { /* noop */ }
            clearTimeout(restartTimer);
            restartTimer = setTimeout(() => {
              if (!cancelled && pc.current?.connectionState !== 'connected') setCallStatus('ended');
            }, 5000);
          }
        } else if (s === 'disconnected') {
          if (!menteeLeft.current) {
            clearTimeout(restartTimer);
            restartTimer = setTimeout(() => {
              if (!cancelled && pc.current?.connectionState !== 'connected') setCallStatus('ended');
            }, 8000);
          }
        } else if (s === 'connected') {
          clearTimeout(restartTimer);
          menteeLeft.current = false;
          setCallStatus('connected');
          startTimer();
        }
      };
      return conn;
    }

    async function setup() {
      // 1. Get local media
      const cfg = joinCfg.current;
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: cfg.videoId
            ? { deviceId: { exact: cfg.videoId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: cfg.audioId
            ? { deviceId: { exact: cfg.audioId }, echoCancellation: true, noiseSuppression: true }
            : { echoCancellation: true, noiseSuppression: true },
        });
      } catch (err) {
        if (cancelled) return;
        const msg = err.name === 'NotAllowedError'
          ? 'Camera/microphone access denied. Please allow permissions and reload.'
          : (err.message || 'Could not access camera or microphone.');
        setPermError(msg);
        return;
      }
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

      // Apply initial mic/cam state from pre-join
      stream.getAudioTracks().forEach((t) => { t.enabled = cfg.mic; });
      stream.getVideoTracks().forEach((t)  => { t.enabled = cfg.cam; });
      setMicOn(cfg.mic);
      setCamOn(cfg.cam);

      localStream.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;

      // Enumerate devices now that we have permission
      const all = await navigator.mediaDevices.enumerateDevices();
      if (!cancelled) {
        setAudioDevices(all.filter((d) => d.kind === 'audioinput'));
        setVideoDevices(all.filter((d) => d.kind === 'videoinput'));
        setOutputDevices(all.filter((d) => d.kind === 'audiooutput'));
      }

      // 2. Build peer connection
      buildPC();

      // 3. Signaling channel
      const ch = supabase.channel(`video:${sessionId}`, {
        config: { broadcast: { self: false }, presence: { key: user.id } },
      });
      channel.current = ch;

      ch.on('broadcast', { event: 'signal' }, async ({ payload }) => {
        if (cancelled) return;
        const conn = pc.current;
        const { type } = payload;

        // ── WebRTC signaling
        if (type === 'offer' || type === 'answer' || type === 'ice-candidate') {
          if (!conn) return;
          try {
            if (type === 'offer') {
              const collision = conn.signalingState !== 'stable';
              if (collision && isOfferer) return;
              await conn.setRemoteDescription({ type: 'offer', sdp: payload.sdp });
              await flushIce();
              const answer = await conn.createAnswer();
              await conn.setLocalDescription(answer);
              send({ type: 'answer', sdp: conn.localDescription.sdp });
              setCallStatus('connecting');
            } else if (type === 'answer') {
              if (conn.signalingState === 'have-local-offer') {
                await conn.setRemoteDescription({ type: 'answer', sdp: payload.sdp });
                await flushIce();
              }
            } else {
              if (conn.remoteDescription?.type) {
                try { await conn.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch { /* ignore */ }
              } else {
                pendingIce.current.push(payload.candidate);
              }
            }
          } catch (err) { console.error('signal error', err); }
          return;
        }

        // ── Call control
        if (type === 'hangup' && !isMentor) {
          setCallStatus('ended');
          return;
        }
        if (type === 'session-end') {
          // Mentor ended the meeting — mentee should get review prompt
          sessionEndedByMentor.current = true;
          setCallStatus('ended');
          return;
        }
        if (type === 'mentee-leave' && isMentor) {
          menteeLeft.current = true;
          clearTimeout(restartTimer);
          // Close old PC, go back to waiting so we're ready when mentee rejoins
          try { conn?.close(); } catch { /* noop */ }
          pc.current = null;
          setRemoteActive(false);
          if (remoteRef.current) remoteRef.current.srcObject = null;
          clearInterval(timerInterval.current);
          timerInterval.current = null;
          setElapsed(0);
          setCallStatus('waiting');
          setToast({ text: `${otherName} has left — they can rejoin`, type: 'info' });
          return;
        }

        // ── Media state broadcast (so we can show remote mute/cam icons)
        if (type === 'media-state') {
          if (payload.mic !== undefined) setRemoteMicOn(payload.mic);
          if (payload.cam !== undefined) setRemoteCamOn(payload.cam);
          return;
        }

        // ── Screen share notification
        if (type === 'screen-share-start') { setRemoteSharing(true); return; }
        if (type === 'screen-share-stop')  { setRemoteSharing(false); return; }

        // ── Chat
        if (type === 'chat-message') {
          const msg = { ...payload.msg, id: `${Date.now()}-${Math.random()}` };
          setMessages((prev) => [...prev, msg]);
          if (!chatOpenRef.current) setUnread((n) => n + 1);
          return;
        }

        // ── Drawing
        if (type === 'draw-stroke') {
          setDrawStrokes((prev) => [...prev, payload.stroke]);
          return;
        }
        if (type === 'draw-clear') {
          setDrawStrokes([]);
          return;
        }

        // ── Moderation (mentee receives from mentor)
        if (!isMentor && payload.target === user.id) {
          if (type === 'mod-mute-audio') {
            const t = localStream.current?.getAudioTracks()[0];
            if (t) { t.enabled = false; setMicOn(false); }
            setToast({ text: 'Host muted your microphone', type: 'warn' });
            send({ type: 'media-state', mic: false });
          } else if (type === 'mod-disable-video') {
            const t = localStream.current?.getVideoTracks()[0];
            if (t) { t.enabled = false; setCamOn(false); }
            setToast({ text: 'Host turned off your camera', type: 'warn' });
            send({ type: 'media-state', cam: false });
          } else if (type === 'mod-remove') {
            setToast({ text: 'You have been removed from the meeting', type: 'error' });
            setTimeout(() => navigate('/dashboard'), 1500);
          }
        }
      });

      // Presence: reconnect-aware offer/answer
      ch.on('presence', { event: 'sync' }, () => {
        if (cancelled) return;
        const state   = ch.presenceState();
        const peers   = Object.keys(state);
        const hasOther = peers.some((id) => id !== user.id);
        if (hasOther) {
          if (isOfferer) {
            if (!pc.current) buildPC();
            if (pc.current.signalingState === 'stable') void negotiate(pc.current);
          } else {
            setCallStatus((prev) => prev === 'connected' ? prev : 'connecting');
          }
        } else {
          setCallStatus((prev) => prev === 'connected' ? prev : 'waiting');
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
      screenTrack.current?.stop();
      screenTrack.current = null;
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
  }, [callStarted, session, user, sessionId, isMentor]); // eslint-disable-line

  // ── Handle callStatus === 'ended' navigation ───────────────────────────────
  useEffect(() => {
    if (callStatus !== 'ended') return;
    if (isMentor) {
      // Mentor: maybe show mentee review
      if (sessionEndedByMentor.current) {
        setShowMenteeReview(true);
      } else {
        navigate('/dashboard');
      }
      return;
    }
    // Mentee
    if (sessionEndedByMentor.current) {
      navigate('/dashboard', {
        state: {
          reviewSession: {
            sessionId:  session?.id ?? null,
            mentorId:   session?.mentor?.id   ?? null,
            mentorName: session?.mentor?.name ?? 'your mentor',
          },
        },
      });
    } else {
      navigate('/dashboard');
    }
  }, [callStatus]); // eslint-disable-line

  // ── Speaker mute (remote audio) ────────────────────────────────────────────
  useEffect(() => {
    if (remoteRef.current) remoteRef.current.muted = !speakerOn;
  }, [speakerOn]);

  // ── Audio output device routing ────────────────────────────────────────────
  function setOutputDevice(deviceId) {
    if (remoteRef.current?.setSinkId) {
      remoteRef.current.setSinkId(deviceId).catch(() => {});
    }
  }

  // ── Pre-join handler ───────────────────────────────────────────────────────
  function handleJoin(cfg) {
    joinCfg.current = cfg;
    setMicOn(cfg.mic);
    setCamOn(cfg.cam);
    setCallStarted(true);
    setCallStatus('setup');
  }

  // ── Mic / camera toggles ──────────────────────────────────────────────────
  function toggleMic() {
    const t = localStream.current?.getAudioTracks()[0];
    if (t) {
      t.enabled = !t.enabled;
      setMicOn(t.enabled);
      channel.current?.send({ type: 'broadcast', event: 'signal', payload: { type: 'media-state', mic: t.enabled } });
    }
  }
  function toggleCam() {
    const t = localStream.current?.getVideoTracks()[0];
    if (t) {
      t.enabled = !t.enabled;
      setCamOn(t.enabled);
      channel.current?.send({ type: 'broadcast', event: 'signal', payload: { type: 'media-state', cam: t.enabled } });
    }
  }

  // ── Device switching ──────────────────────────────────────────────────────
  async function switchAudioInput(deviceId) {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId }, echoCancellation: true, noiseSuppression: true },
      });
      const newTrack = newStream.getAudioTracks()[0];
      const sender   = pc.current?.getSenders().find((s) => s.track?.kind === 'audio');
      if (sender) await sender.replaceTrack(newTrack);
      localStream.current?.getAudioTracks().forEach((t) => t.stop());
      // rebuild stream
      const vTracks = localStream.current?.getVideoTracks() ?? [];
      const combined = new MediaStream([newTrack, ...vTracks]);
      localStream.current = combined;
    } catch { /* ignore */ }
    setDeviceMenu(null);
  }
  async function switchVideoInput(deviceId) {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      const newTrack = newStream.getVideoTracks()[0];
      newTrack.enabled = camOn;
      const sender   = pc.current?.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(newTrack);
      localStream.current?.getVideoTracks().forEach((t) => t.stop());
      const aTracks = localStream.current?.getAudioTracks() ?? [];
      const combined = new MediaStream([...aTracks, newTrack]);
      localStream.current = combined;
      if (localRef.current) localRef.current.srcObject = combined;
    } catch { /* ignore */ }
    setDeviceMenu(null);
  }

  // ── Screen share ──────────────────────────────────────────────────────────
  async function startScreenShare() {
    try {
      const sStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const sTrk    = sStream.getVideoTracks()[0];
      const sender  = pc.current?.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(sTrk);
      screenTrack.current?.stop();
      screenTrack.current = sTrk;
      // update local pip
      const aTracks = localStream.current?.getAudioTracks() ?? [];
      const newStream = new MediaStream([...aTracks, sTrk]);
      localStream.current = newStream;
      if (localRef.current) {
        localRef.current.srcObject = newStream;
        localRef.current.style.transform = ''; // don't mirror screen share
      }
      sTrk.onended = stopScreenShare;
      setIsSharing(true);
      channel.current?.send({ type: 'broadcast', event: 'signal', payload: { type: 'screen-share-start' } });
    } catch (err) {
      if (err.name !== 'NotAllowedError') console.error('Screen share error:', err);
    }
  }
  async function stopScreenShare() {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      const newTrack = newStream.getVideoTracks()[0];
      newTrack.enabled = camOn;
      const sender = pc.current?.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(newTrack);
      screenTrack.current?.stop();
      screenTrack.current = null;
      const aTracks = localStream.current?.getAudioTracks() ?? [];
      const combined = new MediaStream([...aTracks, newTrack]);
      localStream.current = combined;
      if (localRef.current) {
        localRef.current.srcObject = combined;
        localRef.current.style.transform = 'scaleX(-1)';
      }
      setIsSharing(false);
      channel.current?.send({ type: 'broadcast', event: 'signal', payload: { type: 'screen-share-stop' } });
    } catch { /* ignore */ }
  }

  // ── Drawing ───────────────────────────────────────────────────────────────
  function handleStroke(stroke) {
    setDrawStrokes((prev) => [...prev, stroke]);
    channel.current?.send({ type: 'broadcast', event: 'signal', payload: { type: 'draw-stroke', stroke } });
  }
  function clearDrawing() {
    setDrawStrokes([]);
    channel.current?.send({ type: 'broadcast', event: 'signal', payload: { type: 'draw-clear' } });
  }

  // ── Chat ──────────────────────────────────────────────────────────────────
  function handleSendMessage(msgData) {
    const msg = {
      ...msgData,
      id:         `${Date.now()}-${Math.random()}`,
      senderId:   user.id,
      senderName: myName,
      ts:         Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    channel.current?.send({ type: 'broadcast', event: 'signal', payload: { type: 'chat-message', msg } });
  }
  function openChat() {
    setChatOpen(true);
    setUnread(0);
  }

  // ── Moderation (mentor only) ──────────────────────────────────────────────
  function modAction(action) {
    const menteeId = session?.mentee_id;
    if (!menteeId) return;
    channel.current?.send({ type: 'broadcast', event: 'signal', payload: { type: action, target: menteeId } });
    if (action === 'mod-mute-audio')    setToast({ text: 'Muted mentee\'s microphone', type: 'info' });
    if (action === 'mod-disable-video') setToast({ text: 'Turned off mentee\'s camera', type: 'info' });
    if (action === 'mod-remove')        setToast({ text: 'Removed mentee from the meeting', type: 'info' });
    setShowModPanel(false);
  }

  // ── End / Leave ───────────────────────────────────────────────────────────
  const endMeeting = useCallback(async () => {
    setShowEndConfirm(false);
    sessionEndedByMentor.current = true;
    // broadcast session-end so mentee knows to get review prompt
    try { channel.current?.send({ type: 'broadcast', event: 'signal', payload: { type: 'session-end' } }); } catch { /* noop */ }
    clearInterval(timerInterval.current);
    timerInterval.current = null;
    screenTrack.current?.stop();
    screenTrack.current = null;
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
  }, [session]);

  const leaveMeeting = useCallback(() => {
    // Mentee leaves — session NOT ended, can rejoin
    try { channel.current?.send({ type: 'broadcast', event: 'signal', payload: { type: 'mentee-leave' } }); } catch { /* noop */ }
    clearInterval(timerInterval.current);
    timerInterval.current = null;
    screenTrack.current?.stop();
    screenTrack.current = null;
    localStream.current?.getTracks().forEach((t) => t.stop());
    localStream.current = null;
    try { pc.current?.close(); } catch { /* noop */ }
    pc.current = null;
    if (channel.current) {
      try { channel.current.untrack(); } catch { /* noop */ }
      supabase.removeChannel(channel.current);
      channel.current = null;
    }
    navigate('/dashboard');
  }, [navigate]);

  // ── Render guards ──────────────────────────────────────────────────────────
  if (authLoading || pageLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-stone-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }
  if (accessError) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-stone-950 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">Cannot join call</p>
          <p className="mt-1 text-sm text-stone-400">{accessError}</p>
        </div>
        <button type="button" onClick={() => navigate('/dashboard')}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-stone-300 transition hover:bg-stone-800 hover:text-white">
          <ArrowLeft className="h-4 w-4" />Back to Dashboard
        </button>
      </div>
    );
  }
  if (permError) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-stone-950 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15">
          <VideoOff className="h-7 w-7 text-amber-400" />
        </div>
        <p className="text-lg font-bold text-white">Camera access needed</p>
        <p className="mt-1 max-w-xs text-sm text-stone-400">{permError}</p>
        <button type="button" onClick={() => window.location.reload()}
          className="mt-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-400">
          Try again
        </button>
      </div>
    );
  }
  if (callStatus === 'prejoin') {
    return <PreJoinScreen session={session} isMentor={isMentor} user={user} onJoin={handleJoin} />;
  }
  if (callStatus === 'ended' && !showMenteeReview) {
    // Navigation handled by effect; show brief ended screen as fallback
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-stone-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // ── Main call UI ───────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-stone-950">
      {/* Toast */}
      {toast && <Toast text={toast.text} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* Mentor mentee-review modal */}
      {showMenteeReview && (
        <MentorMenteeReviewModal
          session={session}
          menteeId={session?.mentee_id}
          onDone={async () => {
            try { await updateSessionStatus(session.id, 'completed'); } catch { /* non-fatal */ }
            setShowMenteeReview(false);
            navigate('/dashboard');
          }}
        />
      )}

      {/* End meeting confirmation */}
      {showEndConfirm && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-stone-900 p-5 text-center ring-1 ring-white/10">
            <p className="font-bold text-white">End meeting for everyone?</p>
            <p className="mt-1 text-xs text-stone-400">All participants will be disconnected.</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setShowEndConfirm(false)} className="flex-1 rounded-xl bg-stone-800 py-2.5 text-sm text-stone-300 hover:bg-stone-700">Cancel</button>
              <button type="button" onClick={endMeeting} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-500">End for all</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex h-12 flex-none items-center justify-between px-3 sm:px-4">
        <button type="button" onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 rounded-xl bg-black/30 px-2.5 py-1.5 text-xs font-medium text-stone-300 backdrop-blur-md transition hover:bg-black/50 hover:text-white sm:px-3">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        <div className="flex items-center gap-2 rounded-xl bg-black/30 px-3 py-1.5 backdrop-blur-md">
          {callStatus === 'connected' && (
            <>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="font-mono text-xs font-semibold tabular-nums text-white">{formatTimer(elapsed)}</span>
              <span className="h-3 w-px bg-stone-600" />
            </>
          )}
          <span className="text-xs text-stone-300">{sessionLabel}</span>
          {remoteSharing && (
            <>
              <span className="h-3 w-px bg-stone-600" />
              <span className="text-xs text-blue-400">Screen sharing</span>
            </>
          )}
        </div>

        {/* Remote peer status indicators */}
        <div className="flex items-center gap-1.5">
          {!remoteMicOn  && <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20"><MicOff  className="h-3.5 w-3.5 text-red-400" /></div>}
          {!remoteCamOn  && <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20"><VideoOff className="h-3.5 w-3.5 text-red-400" /></div>}
        </div>
      </div>

      {/* ── Main area (video + optional chat sidebar) ────────────────────────── */}
      <div className="relative flex flex-1 overflow-hidden">

        {/* Video area */}
        <div className="relative flex-1 overflow-hidden bg-stone-950">
          {/* Remote video */}
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${remoteActive ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Waiting / connecting overlay */}
          {(callStatus === 'waiting' || callStatus === 'connecting' || callStatus === 'setup') && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-stone-950/90 backdrop-blur-sm">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-xl font-black text-white shadow-[0_0_40px_rgba(234,88,12,0.35)]">
                {getInitials(otherName)}
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-stone-950">
                  <span className="inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-amber-400 opacity-75" />
                </span>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-white">{otherName}</p>
                <p className="mt-0.5 text-xs text-stone-400">{sessionLabel}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-stone-800 bg-stone-900 px-3.5 py-1.5">
                <Loader2 className="h-3 w-3 animate-spin text-orange-400" />
                <span className="text-xs text-stone-400">
                  {callStatus === 'waiting' ? `Waiting for ${otherName}…` : 'Connecting…'}
                </span>
              </div>
            </div>
          )}

          {/* Drawing canvas overlay */}
          <DrawCanvas
            enabled={drawEnabled}
            color={drawColor}
            strokes={drawStrokes}
            onStroke={handleStroke}
          />

          {/* Drawing toolbar (shows when draw is enabled) */}
          {drawEnabled && (
            <div className="absolute left-3 top-3 z-20 flex flex-col items-center gap-2 rounded-xl bg-black/50 p-2 backdrop-blur-md">
              {DRAW_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setDrawColor(c)}
                  className={`h-5 w-5 rounded-full transition-transform hover:scale-110 ${drawColor === c ? 'ring-2 ring-white scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="mt-1 h-px w-4 bg-white/20" />
              <button type="button" onClick={clearDrawing} className="flex h-6 w-6 items-center justify-center rounded-lg text-stone-400 transition hover:text-white" title="Clear drawing">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Moderation panel (mentor only) */}
          {isMentor && showModPanel && (
            <div className="absolute right-3 top-3 z-20 w-56 rounded-xl bg-stone-900/95 p-3 shadow-xl ring-1 ring-white/10 backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-300">Participant controls</span>
                <button type="button" onClick={() => setShowModPanel(false)} className="text-stone-500 hover:text-white"><X className="h-3.5 w-3.5" /></button>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-stone-800 px-2.5 py-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">{getInitials(otherName)}</div>
                <span className="text-xs font-medium text-white">{otherName}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <button type="button" onClick={() => modAction('mod-mute-audio')} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-stone-300 transition hover:bg-stone-800 hover:text-white">
                  <MicOff className="h-3.5 w-3.5" />Mute microphone
                </button>
                <button type="button" onClick={() => modAction('mod-disable-video')} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-stone-300 transition hover:bg-stone-800 hover:text-white">
                  <VideoOff className="h-3.5 w-3.5" />Turn off camera
                </button>
                <button type="button" onClick={() => modAction('mod-remove')} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10">
                  <UserX className="h-3.5 w-3.5" />Remove from meeting
                </button>
              </div>
            </div>
          )}

          {/* Local PiP */}
          <div
            className="absolute bottom-3 right-3 z-20 overflow-hidden rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] ring-2 ring-white/10"
            style={{ width: 'clamp(100px, 16vw, 180px)', aspectRatio: '16/9' }}
          >
            <video
              ref={localRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: isSharing ? '' : 'scaleX(-1)' }}
            />
            {!camOn && !isSharing && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-900">
                <VideoOff className="h-5 w-5 text-stone-500" />
              </div>
            )}
            <div className="absolute bottom-1 left-1.5 text-[10px] font-semibold text-white/70 truncate max-w-[90%]">
              {isSharing ? 'Your screen' : myName}
            </div>
            {!micOn && (
              <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600">
                <MicOff className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Chat sidebar */}
        {chatOpen && (
          <ChatSidebar
            messages={messages}
            sessionId={sessionId}
            currentUserId={user?.id}
            onSend={handleSendMessage}
            onClose={() => setChatOpen(false)}
          />
        )}
      </div>

      {/* ── Controls bar ────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex h-16 flex-none items-center justify-between px-3 sm:h-[72px] sm:px-4">

        {/* Left group: mic, cam, speaker */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mic */}
          <div className="relative">
            <CtrlBtn active={micOn} onClick={toggleMic} title={micOn ? 'Mute' : 'Unmute'}>
              {micOn ? <Mic className="h-4 w-4 sm:h-5 sm:w-5" /> : <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />}
            </CtrlBtn>
            {audioDevices.length > 1 && (
              <button type="button" onClick={() => setDeviceMenu(deviceMenu === 'mic' ? null : 'mic')}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-stone-700 text-stone-300 transition hover:bg-stone-600">
                <ChevronUp className="h-2.5 w-2.5" />
              </button>
            )}
            {deviceMenu === 'mic' && (
              <DeviceMenu devices={audioDevices} onSelect={switchAudioInput} onClose={() => setDeviceMenu(null)} label="Microphone" />
            )}
          </div>

          {/* Camera */}
          <div className="relative">
            <CtrlBtn active={camOn} onClick={toggleCam} title={camOn ? 'Turn off camera' : 'Turn on camera'}>
              {camOn ? <Video className="h-4 w-4 sm:h-5 sm:w-5" /> : <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" />}
            </CtrlBtn>
            {videoDevices.length > 1 && (
              <button type="button" onClick={() => setDeviceMenu(deviceMenu === 'cam' ? null : 'cam')}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-stone-700 text-stone-300 transition hover:bg-stone-600">
                <ChevronUp className="h-2.5 w-2.5" />
              </button>
            )}
            {deviceMenu === 'cam' && (
              <DeviceMenu devices={videoDevices} onSelect={switchVideoInput} onClose={() => setDeviceMenu(null)} label="Camera" />
            )}
          </div>

          {/* Speaker */}
          <div className="relative">
            <CtrlBtn active={speakerOn} onClick={() => setSpeakerOn((v) => !v)} title={speakerOn ? 'Mute speaker' : 'Unmute speaker'}>
              {speakerOn ? <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />}
            </CtrlBtn>
            {outputDevices.length > 1 && (
              <button type="button" onClick={() => setDeviceMenu(deviceMenu === 'speaker' ? null : 'speaker')}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-stone-700 text-stone-300 transition hover:bg-stone-600">
                <ChevronUp className="h-2.5 w-2.5" />
              </button>
            )}
            {deviceMenu === 'speaker' && (
              <DeviceMenu
                devices={outputDevices}
                onSelect={(id) => { setOutputDevice(id); setDeviceMenu(null); }}
                onClose={() => setDeviceMenu(null)}
                label="Speaker / Headphones"
              />
            )}
          </div>
        </div>

        {/* Center group: screen share, draw, chat */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <CtrlBtn active={!isSharing} onClick={isSharing ? stopScreenShare : startScreenShare} title={isSharing ? 'Stop sharing' : 'Share screen'}>
            {isSharing ? <ScreenShareOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <ScreenShare className="h-4 w-4 sm:h-5 sm:w-5" />}
          </CtrlBtn>

          <CtrlBtn active={!drawEnabled} onClick={() => setDrawEnabled((v) => !v)} title={drawEnabled ? 'Stop drawing' : 'Draw on screen'}>
            <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
          </CtrlBtn>

          <CtrlBtn active onClick={chatOpen ? () => setChatOpen(false) : openChat} title="Chat" badge={chatOpen ? 0 : unread}>
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </CtrlBtn>

          {isMentor && (
            <CtrlBtn active onClick={() => setShowModPanel((v) => !v)} title="Participant controls">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </CtrlBtn>
          )}
        </div>

        {/* Right group: end / leave */}
        <div className="flex items-center">
          {isMentor ? (
            <button
              type="button"
              onClick={() => setShowEndConfirm(true)}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(239,68,68,0.4)] transition hover:bg-red-500 active:scale-95 sm:px-4 sm:text-sm"
            >
              <PhoneOff className="h-4 w-4" />
              <span className="hidden sm:inline">End Meeting</span>
              <span className="sm:hidden">End</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={leaveMeeting}
              className="flex items-center gap-1.5 rounded-xl bg-stone-700 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-red-600 active:scale-95 sm:px-4 sm:text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Leave Meeting</span>
              <span className="sm:hidden">Leave</span>
            </button>
          )}
        </div>
      </div>

      {/* close device menu on backdrop click */}
      {deviceMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setDeviceMenu(null)} />
      )}
    </div>
  );
}

// ─── DeviceMenu (used inside controls bar) ────────────────────────────────────

function DeviceMenu({ devices, onSelect, onClose, label }) {
  return (
    <div className="absolute bottom-full left-0 z-30 mb-2 w-56 rounded-xl bg-stone-900 p-1.5 shadow-xl ring-1 ring-white/10">
      <p className="mb-1 px-2 pt-1 text-[10px] font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      {devices.map((d) => (
        <button
          key={d.deviceId}
          type="button"
          onClick={() => onSelect(d.deviceId)}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-stone-300 transition hover:bg-stone-800 hover:text-white"
        >
          <Check className="h-3 w-3 flex-shrink-0 text-transparent" />
          <span className="truncate">{d.label || d.kind}</span>
        </button>
      ))}
    </div>
  );
}
