import { google } from 'googleapis';

const ALLOWED_ORIGINS = new Set(
  process.env.CLIENT_URL
    ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5175']
    : ['http://localhost:5173', 'http://localhost:5175']
);

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { mentor_profile_id } = req.query;
  if (!mentor_profile_id) {
    return res.status(400).json({ error: 'mentor_profile_id is required' });
  }

  const origin = req.headers.origin || '';
  const safeOrigin = ALLOWED_ORIGINS.has(origin) ? origin : (process.env.CLIENT_URL || 'http://localhost:5173');
  const state = JSON.stringify({ profileId: mentor_profile_id, origin: safeOrigin });

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    state,
  });

  return res.json({ url });
}
