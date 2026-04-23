/**
 * Company support **inbox** — where Bridge should **receive** reports
 * (contact, feedback, bugs, Trust & Safety). The Edge Function delivers there
 * (see `SUPPORT_TO_EMAIL`); this constant is for UI copy and consistency.
 */
export const COMPANY_EMAIL = 'mentors.bridge@gmail.com';

/** `mailto:` href with optional pre-filled subject / body. */
export function mailtoHref({ subject, body } = {}) {
  const qs = new URLSearchParams();
  if (subject) qs.set('subject', subject);
  if (body) qs.set('body', body);
  const tail = qs.toString();
  return `mailto:${COMPANY_EMAIL}${tail ? `?${tail}` : ''}`;
}

/**
 * Generate a client-side ticket id for a support / feedback submission.
 *
 * Format: `BRG-<YYMMDD>-<6 uppercase alphanumeric chars>` (e.g. `BRG-260422-7F3K2Q`).
 * Short, greppable, and uses `crypto.getRandomValues` when available so two
 * users submitting at the same instant don't collide.
 *
 * @param {string} [prefix="BRG"]
 * @returns {string}
 */
export function generateTicketId(prefix = 'BRG') {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const datePart = `${String(now.getFullYear()).slice(-2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I for readability
  let rand = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    for (const b of bytes) rand += chars[b % chars.length];
  } else {
    for (let i = 0; i < 6; i += 1) rand += chars[Math.floor(Math.random() * chars.length)];
  }

  return `${prefix}-${datePart}-${rand}`;
}
