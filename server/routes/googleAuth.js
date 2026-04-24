import express from 'express';
import { google } from 'googleapis';
import supabase from '../config/supabase.js';

const router = express.Router();

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

const ALLOWED_ORIGINS = new Set(
  process.env.CLIENT_URL
    ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5175']
    : ['http://localhost:5173', 'http://localhost:5175']
);

// GET /auth/google?mentor_profile_id=<uuid>
// Pass &json=1 to receive { url } as JSON instead of a redirect (used by the client-side button).
router.get('/', (req, res) => {
  const { mentor_profile_id, json } = req.query;
  if (!mentor_profile_id) {
    return res.status(400).json({ error: 'mentor_profile_id is required' });
  }

  const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || '';
  const safeOrigin = ALLOWED_ORIGINS.has(origin) ? origin : (process.env.CLIENT_URL || 'http://localhost:5173');
  const state = JSON.stringify({ profileId: mentor_profile_id, origin: safeOrigin });

  const oauth2Client = getOAuth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    state,
  });

  if (json === '1') {
    return res.json({ url });
  }
  res.redirect(url);
});

// GET /auth/google/callback
router.get('/callback', async (req, res) => {
  const { code, state: rawState, error: oauthError } = req.query;
  let profileId, clientUrl;
  try {
    const parsed = JSON.parse(rawState);
    profileId = parsed.profileId;
    clientUrl = ALLOWED_ORIGINS.has(parsed.origin) ? parsed.origin : (process.env.CLIENT_URL || 'http://localhost:5173');
  } catch {
    profileId = rawState;
    clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  }

  if (oauthError || !code || !profileId) {
    return res.redirect(`${clientUrl}/dashboard?calendar=error`);
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    const updates = { calendar_connected: true };
    if (tokens.refresh_token) {
      updates.google_refresh_token = tokens.refresh_token;
    }

    const { error } = await supabase
      .from('mentor_profiles')
      .update(updates)
      .eq('id', profileId);

    if (error) {
      console.error('Failed to store tokens:', error);
      return res.redirect(`${clientUrl}/dashboard?calendar=error`);
    }

    res.redirect(`${clientUrl}/dashboard?calendar=connected`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect(`${clientUrl}/dashboard?calendar=error`);
  }
});

export default router;
