import { ALLOWED_ORIGINS, getClientUrl } from '../../_lib/allowedOrigins.js';
import { getOAuth2Client } from '../../_lib/oauth.js';
import supabase from '../../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { code, state: rawState, error: oauthError } = req.query;
  let profileId, clientUrl;
  try {
    const parsed = JSON.parse(rawState);
    profileId = parsed.profileId;
    clientUrl = ALLOWED_ORIGINS.has(parsed.origin) ? parsed.origin : getClientUrl('');
  } catch {
    profileId = rawState;
    clientUrl = getClientUrl('');
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
}
