/**
 * VideoCall — full-featured Jitsi call for an accepted Bridge session.
 *
 * Route: /session/:sessionId/video (App.jsx). Mounted from Dashboard "Join Call" buttons.
 * Access: only the mentee OR the linked mentor (via mentor_profiles.user_id) when status === 'accepted'.
 * Room: session.video_room_url (set by acceptSession in api/sessions.js) → falls back to `bridge-<id>`.
 *
 * All UI (mic / camera / screen share / chat / tile view / whiteboard / virtual background /
 * raise hand / recording / settings) is provided by the embedded Jitsi Meet toolbar.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ArrowLeft, Video, VideoOff, ExternalLink } from 'lucide-react';
import supabase from '../api/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

const FALLBACK_DOMAIN = 'meet.jit.si';
const externalApiSrc = (domain) => `https://${domain}/external_api.js`;

// Jitsi 8+ toolbar buttons. Order matters for the overflow menu.
const TOOLBAR_BUTTONS = [
  'microphone',
  'camera',
  'desktop',
  'fullscreen',
  'hangup',
  'chat',
  'participants-pane',
  'tileview',
  'raisehand',
  'whiteboard',
  'select-background',
  'settings',
  'videoquality',
  'filmstrip',
  'invite',
  'shortcuts',
  'toggle-camera',
  'mute-everyone',
  'mute-video-everyone',
  'security',
  'stats',
  'livestreaming',
  'recording',
  'sharedvideo',
  'etherpad',
  'feedback',
  'help',
];

function loadJitsiScript(domain) {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  const src = externalApiSrc(domain);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Jitsi script')));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Jitsi script'));
    document.head.appendChild(script);
  });
}

/** Try to get a JaaS JWT from our Supabase Edge Function. Returns null if JaaS is not configured. */
async function fetchJitsiToken(sessionId) {
  try {
    const { data, error } = await supabase.functions.invoke('jitsi-token', {
      body: { sessionId },
    });
    if (error) {
      if (String(error.message || '').toLowerCase().includes('not found')) return null;
      const body = error.context?.response ? await error.context.response.json().catch(() => null) : null;
      if (body?.error === 'jaas_not_configured') return null;
      throw error;
    }
    if (!data?.jwt) return null;
    return data;
  } catch (err) {
    console.warn('Jitsi token fetch failed, falling back to meet.jit.si:', err?.message ?? err);
    return null;
  }
}

export default function VideoCall() {
  const { sessionId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [jitsiError, setJitsiError] = useState(null);

  const containerRef = useRef(null);
  const apiRef = useRef(null);

  /** Fetch session and authorize the current user. */
  const loadSession = useCallback(async () => {
    try {
      const { data, error: sessErr } = await supabase
        .from('sessions')
        .select('*, mentor:mentor_id(id, name, user_id)')
        .eq('id', sessionId)
        .single();

      if (sessErr) throw sessErr;
      if (!data) throw new Error('Session not found.');

      const isMentee = data.mentee_id === user.id;
      const isMentor = data.mentor?.user_id === user.id;
      if (!isMentee && !isMentor) {
        setError('You do not have access to this session.');
        return;
      }
      if (data.status !== 'accepted') {
        setError('This session is not confirmed yet. The mentor must accept before the call can start.');
        return;
      }
      setSession(data);
    } catch (err) {
      console.error('Error loading session:', err);
      setError(err.message ?? 'Could not load session.');
    } finally {
      setLoading(false);
    }
  }, [sessionId, user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    void loadSession();
  }, [user, authLoading, loadSession, navigate]);

  /** Deterministic room: prefer persisted URL so both peers land in the same room. */
  const getRoomName = useCallback(() => {
    if (!sessionId) return '';
    const url = session?.video_room_url;
    if (url) {
      try {
        const path = new URL(url).pathname.replace(/^\//, '');
        if (path) return path.split('/')[0] || path;
      } catch {
        /* fall through */
      }
    }
    return `bridge-${sessionId.replace(/-/g, '')}`;
  }, [session, sessionId]);

  /** Init Jitsi iframe once session is ready. */
  useEffect(() => {
    if (!session || loading || error) return;
    if (apiRef.current) return;

    const roomName = getRoomName();
    if (!roomName || !containerRef.current) return;

    let cancelled = false;
    let overlayTimeout = null;

    (async () => {
      try {
        // Ask Supabase Edge Function for a signed JaaS token — gives mentor moderator rights.
        const token = await fetchJitsiToken(sessionId);
        const domain = token?.domain ?? FALLBACK_DOMAIN;
        const finalRoom = token?.roomName ?? roomName;

        await loadJitsiScript(domain);
        if (cancelled || !containerRef.current) return;

        const api = new window.JitsiMeetExternalAPI(domain, {
          roomName: finalRoom,
          ...(token?.jwt ? { jwt: token.jwt } : {}),
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: user.user_metadata?.full_name ?? user.email ?? 'Bridge User',
            email: user.email ?? '',
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
            disableDeepLinking: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableClosePage: false,
            disableInviteFunctions: false,
            toolbarButtons: TOOLBAR_BUTTONS,
            // Enable Jitsi's Excalidraw-powered whiteboard (drawing live on a shared canvas).
            whiteboard: {
              enabled: true,
              collabServerBaseUrl: 'https://excalidraw-backend.jit.si',
            },
            // Keep the filmstrip + participants pane usable on small viewports
            filmstrip: { disableResizable: false, disableStageFilmstrip: false },
            // Use the default meet.jit.si deployment options; users can pick devices/bg via toolbar.
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: '#0b0b0a',
            DISABLE_VIDEO_BACKGROUND: false,
            MOBILE_APP_PROMO: false,
            HIDE_INVITE_MORE_HEADER: true,
            TOOLBAR_BUTTONS, // Fallback for older Jitsi builds.
          },
        });

        apiRef.current = api;

        const markReady = () => {
          if (cancelled) return;
          setJitsiLoaded(true);
          if (overlayTimeout) {
            clearTimeout(overlayTimeout);
            overlayTimeout = null;
          }
        };

        // Any of these means the iframe is live and rendering.
        api.addListener('videoConferenceJoined', markReady);
        api.addListener('participantJoined', markReady);
        api.addListener('cameraError', markReady);
        api.addListener('micError', markReady);

        // Fallback: if events don't fire within 7s (common behind some networks), hide overlay
        // so the embedded Jitsi prejoin / permissions UI is visible and interactive.
        overlayTimeout = setTimeout(markReady, 7000);

        api.addListener('readyToClose', () => {
          if (cancelled) return;
          navigate('/dashboard');
        });
      } catch (err) {
        console.error('Jitsi init failed:', err);
        if (!cancelled) setJitsiError(err.message ?? 'Failed to load video call.');
      }
    })();

    return () => {
      cancelled = true;
      if (overlayTimeout) clearTimeout(overlayTimeout);
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch {
          /* ignore */
        }
        apiRef.current = null;
      }
    };
  }, [session, loading, error, getRoomName, user, navigate]);

  if (authLoading || loading) {
    return <LoadingSpinner label="Loading session…" className="min-h-screen" />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bridge-page flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-bridge-card p-8 max-w-md w-full text-center">
          <VideoOff className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">Cannot join call</h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const jitsiDirectUrl = `https://${FALLBACK_DOMAIN}/${getRoomName()}`;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-stone-900 text-white shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-stone-300 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          {session && (
            <>
              <span className="text-stone-600">·</span>
              <span className="text-sm font-medium text-stone-200">Session #{sessionId.slice(0, 8)}</span>
            </>
          )}
        </div>
        <a
          href={jitsiDirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-stone-400 hover:text-white transition-colors"
        >
          Open in browser
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Embed area */}
      {jitsiError ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-stone-800 p-8 text-center gap-6">
          <VideoOff className="h-16 w-16 text-stone-500" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Could not load video call</h3>
            <p className="text-stone-400 mb-6">{jitsiError}. Open it directly in your browser instead.</p>
            <a
              href={jitsiDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
            >
              <Video className="h-5 w-5" />
              Open Video Call
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="text-xs text-stone-500 max-w-sm">
            Room: <code className="bg-stone-700 px-2 py-0.5 rounded text-stone-300">{getRoomName()}</code>
          </p>
        </div>
      ) : (
        <div ref={containerRef} className="relative flex-1 min-h-0 bg-stone-900">
          {!jitsiLoaded && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-stone-900/85">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-stone-400 text-sm">Connecting to video call…</p>
                <p className="text-stone-500 text-xs mt-2">
                  If this takes more than a few seconds, allow camera &amp; microphone access in your browser.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
