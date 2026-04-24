import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function buildAuthedClient(refreshToken, mentorProfileId) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await getSupabase()
        .from('mentor_profiles')
        .update({ google_refresh_token: tokens.refresh_token })
        .eq('id', mentorProfileId);
    }
  });
  return oauth2Client;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { mentor_profile_id, date } = req.body;

  if (!mentor_profile_id || !date) {
    return res.status(400).json({ error: 'mentor_profile_id and date are required' });
  }

  const { data: profile, error } = await getSupabase()
    .from('mentor_profiles')
    .select('google_refresh_token')
    .eq('id', mentor_profile_id)
    .maybeSingle();

  if (error || !profile) {
    return res.status(404).json({ error: 'Mentor profile not found' });
  }

  if (!profile.google_refresh_token) {
    return res.status(400).json({ busy: null, reason: 'Calendar not connected for this mentor' });
  }

  try {
    const oauth2Client = buildAuthedClient(profile.google_refresh_token, mentor_profile_id);

    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const { data: freeBusy } = await calendar.freebusy.query({
      requestBody: {
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        items: [{ id: 'primary' }],
      },
    });

    const busy = freeBusy.calendars?.primary?.busy ?? [];
    return res.json({ busy });
  } catch (err) {
    console.error('Availability error:', err);
    return res.status(500).json({ error: err.message });
  }
}
