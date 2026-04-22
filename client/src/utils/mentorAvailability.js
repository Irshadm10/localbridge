/** Shared mentor weekly availability for dashboard editor + public booking (MentorProfile). */

export const BOOKING_TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const DAY_KEYS = ['0', '1', '2', '3', '4', '5', '6'];

export function normalizeAvailabilitySchedule(raw) {
  const weekly = Object.fromEntries(DAY_KEYS.map((k) => [k, []]));
  if (raw && typeof raw === 'object' && raw.weekly && typeof raw.weekly === 'object') {
    for (const k of DAY_KEYS) {
      const arr = raw.weekly[k] ?? raw.weekly[Number(k)];
      if (Array.isArray(arr)) {
        weekly[k] = [...new Set(arr.filter((t) => typeof t === 'string' && BOOKING_TIME_SLOTS.includes(t)))].sort(
          (a, b) => BOOKING_TIME_SLOTS.indexOf(a) - BOOKING_TIME_SLOTS.indexOf(b),
        );
      }
    }
  }
  const tz = raw && typeof raw.timezone === 'string' && raw.timezone.trim() ? raw.timezone.trim() : 'UTC';
  return { weekly, timezone: tz };
}

export function getDayStatus(normalized, date, acceptingBookings) {
  if (acceptingBookings === false) return 'booked';
  const dow = date.getDay();
  const slots = normalized.weekly[String(dow)] ?? [];
  if (slots.length === 0) return 'booked';
  if (slots.length <= 2) return 'limited';
  return 'free';
}

export function buildAvailabilityCalendar(normalized, acceptingBookings, days = 14) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    out.push({ date: d, status: getDayStatus(normalized, d, acceptingBookings) });
  }
  return out;
}

export function getSlotsForDate(normalized, date, acceptingBookings) {
  if (!date || acceptingBookings === false) {
    return BOOKING_TIME_SLOTS.map((time) => ({ time, available: false }));
  }
  const dow = date.getDay();
  const allowed = new Set(normalized.weekly[String(dow)] ?? []);
  return BOOKING_TIME_SLOTS.map((time) => ({ time, available: allowed.has(time) }));
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
