import supabase from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return `Bearer ${session.access_token}`;
}

export async function getGoogleCalendarConnectUrl() {
  const auth = await getAuthHeader();
  const res = await fetch(`${API_BASE}/calendar/connect`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || 'Failed to get connect URL');
  }
  return res.json();
}

export async function getMentorAvailability(mentorProfileId) {
  try {
    const res = await fetch(`${API_BASE}/calendar/availability/${mentorProfileId}`);
    if (!res.ok) return { busyTimes: [] };
    return res.json();
  } catch {
    return { busyTimes: [] };
  }
}

export async function createCalendarEvent({ mentorProfileId, sessionType, scheduledDate, message }) {
  try {
    const auth = await getAuthHeader();
    const res = await fetch(`${API_BASE}/calendar/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
      body: JSON.stringify({ mentorProfileId, sessionType, scheduledDate, message }),
    });
    const data = await res.json();
    if (!res.ok) return { data: null, error: data.error || 'Failed to create calendar event' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}
