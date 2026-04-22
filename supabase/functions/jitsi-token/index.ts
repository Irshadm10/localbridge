// Supabase Edge Function: mint a short-lived JaaS (8x8.vc Jitsi) JWT.
// Mentors linked to the session are signed as moderators; mentees are not.
// Secrets required: JAAS_APP_ID, JAAS_KID, JAAS_PRIVATE_KEY (PKCS#8 PEM).
//
// Deploy: supabase functions deploy jitsi-token
// Invoke:  supabase.functions.invoke('jitsi-token', { body: { sessionId } })

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const APP_ID = Deno.env.get("JAAS_APP_ID") ?? "";
const KID = Deno.env.get("JAAS_KID") ?? "";
const PRIVATE_KEY_PEM = Deno.env.get("JAAS_PRIVATE_KEY") ?? "";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

async function importRsaPrivateKey(pem: string): Promise<CryptoKey> {
  const cleaned = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const bytes = Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "pkcs8",
    bytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!APP_ID || !KID || !PRIVATE_KEY_PEM) {
    return jsonResponse({ error: "jaas_not_configured" }, 503);
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return jsonResponse({ error: "missing_authorization" }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) return jsonResponse({ error: "unauthorized" }, 401);

    const { sessionId } = await req.json().catch(() => ({}));
    if (!sessionId) return jsonResponse({ error: "missing_session_id" }, 400);

    // DB is the single source of truth for mentor/mentee identity on this session.
    const { data: session, error: sessErr } = await supabase
      .from("sessions")
      .select("id, status, mentee_id, mentor:mentor_id(user_id)")
      .eq("id", sessionId)
      .single();
    if (sessErr || !session) return jsonResponse({ error: "session_not_found" }, 404);

    const isMentee = session.mentee_id === user.id;
    const mentor = Array.isArray(session.mentor) ? session.mentor[0] : session.mentor;
    const isMentor = mentor?.user_id === user.id;
    if (!isMentee && !isMentor) return jsonResponse({ error: "forbidden" }, 403);
    if (session.status !== "accepted") {
      return jsonResponse({ error: "session_not_accepted" }, 409);
    }

    const displayName =
      (user.user_metadata?.full_name as string | undefined) ??
      user.email ??
      "Bridge User";

    // Deterministic room so both parties land in the same conference.
    const roomSlug = `bridge-${String(sessionId).replace(/-/g, "")}`;
    const fullRoom = `${APP_ID}/${roomSlug}`;

    const key = await importRsaPrivateKey(PRIVATE_KEY_PEM);

    const payload = {
      aud: "jitsi",
      iss: "chat",
      sub: APP_ID,
      room: "*",
      nbf: getNumericDate(0),
      exp: getNumericDate(60 * 60 * 2), // 2h
      context: {
        user: {
          id: user.id,
          name: displayName,
          email: user.email ?? "",
          moderator: isMentor ? "true" : "false",
        },
        features: {
          livestreaming: "false",
          recording: isMentor ? "true" : "false",
          "outbound-call": "false",
          transcription: "false",
        },
      },
    };

    const jwt = await create(
      { alg: "RS256", typ: "JWT", kid: KID },
      payload,
      key,
    );

    return jsonResponse({
      jwt,
      domain: "8x8.vc",
      appId: APP_ID,
      roomName: fullRoom,
      isMentor,
    });
  } catch (err) {
    console.error("jitsi-token error:", err);
    return jsonResponse({ error: "internal_error", message: String(err?.message ?? err) }, 500);
  }
});
