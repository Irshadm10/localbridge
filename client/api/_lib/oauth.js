import { google } from 'googleapis';
import supabase from './supabase.js';

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function buildAuthedClient(refreshToken, mentorProfileId) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await supabase
        .from('mentor_profiles')
        .update({ google_refresh_token: tokens.refresh_token })
        .eq('id', mentorProfileId);
    }
  });
  return oauth2Client;
}
