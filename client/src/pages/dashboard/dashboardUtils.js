/**
 * dashboardUtils — **pure functions & constants** (no React, no side effects)
 *
 * Linked from:
 * - `dashboardShared.jsx` — session type icons/labels, avatar hashing, date formatting on cards.
 * - `MentorDashboardContent.jsx` / `MenteeDashboardContent.jsx` — `formatSessionDate`, avatar helpers where needed.
 * - `Dashboard.jsx` — `getFirstName`, `getTimeGreeting`, `getTodayLabel` for the sticky header only.
 *
 * Source of truth for session type metadata: `constants/sessionTypes.js` → `SESSION_TYPES`.
 */

import { SESSION_TYPES } from '../../constants/sessionTypes';

/** Maps `session.session_type` string → row from SESSION_TYPES (icons, accent classes). */
export const SESSION_TYPE_MAP = Object.fromEntries(SESSION_TYPES.map((t) => [t.key, t]));

/** Deterministic pastel pairs for placeholder avatars (hash of display name). */
export const AVATAR_COLORS = [
  'bg-violet-200 text-violet-800',
  'bg-amber-200 text-amber-800',
  'bg-emerald-200 text-emerald-800',
  'bg-sky-200 text-sky-800',
  'bg-rose-200 text-rose-800',
  'bg-indigo-200 text-indigo-800',
  'bg-teal-200 text-teal-800',
  'bg-orange-200 text-orange-800',
];

export function getAvatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export function getInitials(name = '') {
  return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
}

/** Supabase user → short greeting name (metadata full_name, else email local part). */
export function getFirstName(user) {
  const full = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  if (full.trim()) return full.trim().split(/\s+/)[0];
  return user?.email?.split('@')[0] ?? 'there';
}

export function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export function getTodayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** ISO datetime → "Wed, Apr 21 · 3:00 PM" for session cards and hero. */
export function formatSessionDate(iso) {
  if (!iso) return 'No date set';
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
}
