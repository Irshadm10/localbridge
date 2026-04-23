import express from 'express';
import { google } from 'googleapis';
import supabase from '../config/supabase.js';
import supabaseAuth from '../middleware/supabaseAuth.js';

const router = express.Router();

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

async function refreshAndPersistTokens(oauth2Client, mentorProfileId) {
  oauth2Client.on('tokens', async (tokens) => {
    const updates = { google_access_token: tokens.access_token };
    if (tokens.expiry_date) {
      updates.google_token_expiry = new Date(tokens.expiry_date).toISOString();
    }
    if (tokens.refresh_token) {
      updates.google_refresh_token = tokens.refresh_token;
    }
    await supabase.from('mentor_profiles').update(updates).eq('id', mentorProfileId);
  });
}

// GET /api/calendar/connect — returns a Google OAuth URL for the authenticated mentor
router.get('/connect', supabaseAuth, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('mentor_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error || !profile) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    const oauth2Client = getOAuth2Client();
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      state: profile.id,
    });

    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/calendar/callback — Google redirects here after the user grants consent
router.get('/callback', async (req, res) => {
  const { code, state: profileId, error: oauthError } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (oauthError || !code || !profileId) {
    return res.redirect(`${clientUrl}/onboarding?calendar_error=1`);
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    const updates = {
      calendar_connected: true,
      google_access_token: tokens.access_token,
      google_token_expiry: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : null,
    };
    if (tokens.refresh_token) {
      updates.google_refresh_token = tokens.refresh_token;
    }

    const { error } = await supabase
      .from('mentor_profiles')
      .update(updates)
      .eq('id', profileId);

    if (error) {
      console.error('Failed to store tokens:', error);
      return res.redirect(`${clientUrl}/onboarding?calendar_error=1`);
    }

    res.redirect(`${clientUrl}/onboarding?calendar_connected=true`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect(`${clientUrl}/onboarding?calendar_error=1`);
  }
});

// GET /api/calendar/availability/:mentorId — returns 14-day busy times for the mentor's calendar
router.get('/availability/:mentorId', async (req, res) => {
  const { mentorId } = req.params;

  try {
    const { data: profile, error } = await supabase
      .from('mentor_profiles')
      .select('google_refresh_token, google_access_token, google_token_expiry')
      .eq('id', mentorId)
      .maybeSingle();

    if (error || !profile?.google_refresh_token) {
      return res.status(404).json({ error: 'Calendar not connected for this mentor' });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: profile.google_refresh_token,
      access_token: profile.google_access_token,
      expiry_date: profile.google_token_expiry
        ? new Date(profile.google_token_expiry).getTime()
        : null,
    });
    refreshAndPersistTokens(oauth2Client, mentorId);

    const now = new Date();
    const twoWeeksLater = new Date(now);
    twoWeeksLater.setDate(now.getDate() + 14);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const { data: freeBusy } = await calendar.freebusy.query({
      requestBody: {
        timeMin: now.toISOString(),
        timeMax: twoWeeksLater.toISOString(),
        items: [{ id: 'primary' }],
      },
    });

    const busyTimes = freeBusy.calendars?.primary?.busy ?? [];
    res.json({ busyTimes });
  } catch (err) {
    console.error('Availability error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/calendar/event — creates a Google Calendar event for a confirmed session
router.post('/event', supabaseAuth, async (req, res) => {
  const { mentorProfileId, sessionType, scheduledDate, message } = req.body;

  if (!mentorProfileId || !sessionType || !scheduledDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data: mentorProfile, error: mpError } = await supabase
      .from('mentor_profiles')
      .select('google_refresh_token, google_access_token, google_token_expiry, name')
      .eq('id', mentorProfileId)
      .maybeSingle();

    if (mpError || !mentorProfile) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    if (!mentorProfile.google_refresh_token) {
      return res.json({ skipped: true, reason: 'Mentor has no calendar connected' });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: mentorProfile.google_refresh_token,
      access_token: mentorProfile.google_access_token,
      expiry_date: mentorProfile.google_token_expiry
        ? new Date(mentorProfile.google_token_expiry).getTime()
        : null,
    });
    refreshAndPersistTokens(oauth2Client, mentorProfileId);

    const sessionStart = new Date(scheduledDate);
    const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000);

    const { data: { user: menteeUser } } = await supabase.auth.admin.getUserById(req.user.id);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const { data: event } = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `Bridge Mentorship: ${sessionType.replace(/_/g, ' ')}`,
        description: message || 'Mentorship session booked via Bridge.',
        start: { dateTime: sessionStart.toISOString() },
        end: { dateTime: sessionEnd.toISOString() },
        attendees: menteeUser?.email ? [{ email: menteeUser.email }] : [],
      },
    });

    res.json({ eventId: event.id });
  } catch (err) {
    console.error('Calendar event error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
