const BASE = import.meta.env.VITE_SERVER_URL || '';

export async function getCalendarAuthUrl(mentorProfileId) {
  const res = await fetch(
    `${BASE}/auth/google?mentor_profile_id=${encodeURIComponent(mentorProfileId)}&json=1`,
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
    const res = await fetch(`${BASE}/calendar/availability`, {
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
  const res = await fetch(`${BASE}/calendar/book`, {
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
