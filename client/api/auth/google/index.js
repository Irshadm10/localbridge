// GOOGLE_REDIRECT_URI must be set to https://<your-vercel-domain>/auth/google/callback
// in Vercel's environment variables dashboard.
import { ALLOWED_ORIGINS, getClientUrl } from '../../_lib/allowedOrigins.js';
import { getOAuth2Client } from '../../_lib/oauth.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { mentor_profile_id, json } = req.query;
  if (!mentor_profile_id) {
    return res.status(400).json({ error: 'mentor_profile_id is required' });
  }

  const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || '';
  const safeOrigin = getClientUrl(origin);
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
}
