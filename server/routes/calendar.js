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

function buildAuthedClient(refreshToken, mentorProfileId) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  // Persist any newly-issued refresh token (Google rotates them occasionally)
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

// POST /calendar/availability
// Body: { mentor_profile_id, date }  (date: ISO string or YYYY-MM-DD)
// Returns: { busy: [{ start, end }] }
router.post('/availability', async (req, res) => {
  const { mentor_profile_id, date } = req.body;

  if (!mentor_profile_id || !date) {
    return res.status(400).json({ error: 'mentor_profile_id and date are required' });
  }

  const { data: profile, error } = await supabase
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

    // Build start/end for the requested day in UTC
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
    res.json({ busy });
  } catch (err) {
    console.error('Availability error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /calendar/book
// Body: { mentor_profile_id, mentee_email, mentee_name, session_type,
//         scheduled_date, duration_minutes, bridge_session_id }
// Returns: { google_event_id }
router.post('/book', async (req, res) => {
  const {
    mentor_profile_id,
    mentee_email,
    mentee_name,
    session_type,
    scheduled_date,
    duration_minutes = 60,
    bridge_session_id,
  } = req.body;

  if (!mentor_profile_id || !session_type || !scheduled_date) {
    return res
      .status(400)
      .json({ error: 'mentor_profile_id, session_type, and scheduled_date are required' });
  }

  const { data: profile, error } = await supabase
    .from('mentor_profiles')
    .select('google_refresh_token')
    .eq('id', mentor_profile_id)
    .maybeSingle();

  if (error || !profile) {
    return res.status(404).json({ error: 'Mentor profile not found' });
  }

  if (!profile.google_refresh_token) {
    return res.status(400).json({ error: 'Calendar not connected for this mentor' });
  }

  try {
    const oauth2Client = buildAuthedClient(profile.google_refresh_token, mentor_profile_id);

    const start = new Date(scheduled_date);
    const end = new Date(start.getTime() + duration_minutes * 60 * 1000);

    const attendees = [];
    if (mentee_email) attendees.push({ email: mentee_email, displayName: mentee_name });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const { data: event } = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `Bridge Mentorship: ${session_type.replace(/_/g, ' ')}`,
        description: `Bridge mentorship session — ${session_type}. Join on Bridge.`,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        attendees,
      },
    });

    res.json({ google_event_id: event.id });
  } catch (err) {
    console.error('Book error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
