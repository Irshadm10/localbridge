import supabase from './supabase';

export async function getCalendarAuthUrl(mentorProfileId) {
  const res = await fetch(
    `/api/google-auth?mentor_profile_id=${encodeURIComponent(mentorProfileId)}`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to get calendar auth URL');
  }
  const { url } = await res.json();
  return url;
}

export async function getMentorAvailability(mentorProfileId, date) {
  try {
    const res = await fetch('/api/calendar-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentor_profile_id: mentorProfileId, date }),
    });
    if (!res.ok) return { busy: [] };
    return res.json();
  } catch {
    return { busy: [] };
  }
}

export async function bookCalendarEvent(payload) {
  const res = await fetch('/api/calendar-book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to book calendar event');
  }
  return res.json();
}

export async function checkCalendarConnection(mentorProfileId) {
  const { data, error } = await supabase
    .from('mentor_profiles')
    .select('calendar_connected')
    .eq('id', mentorProfileId)
    .single();
  if (error || !data) return false;
  return data.calendar_connected === true;
}
