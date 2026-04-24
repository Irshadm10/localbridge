import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGINS = new Set(
  process.env.CLIENT_URL
    ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5175']
    : ['http://localhost:5173', 'http://localhost:5175']
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

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
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

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

    return res.redirect(`${clientUrl}/dashboard?calendar=connected`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    return res.redirect(`${clientUrl}/dashboard?calendar=error`);
  }
}
