/**
 * Delivers every Bridge report (contact / feedback / bug / Trust & Safety)
 * **directly** to the company inbox — no backend deploy, no mail client popup.
 *
 * Transport: Web3Forms (https://web3forms.com) — a free client-side relay
 * that accepts a JSON POST from the browser and forwards it to a target email.
 * Instant delivery, no confirmation dance, unlimited submissions on the free
 * tier (sandbox limit: 250/mo; upgrade is free and immediate if ever needed).
 *
 * Setup (one-time, ~30 seconds):
 *   1. Open https://web3forms.com/ and enter mentors.bridge@gmail.com.
 *   2. Web3Forms emails an **Access Key** to that address instantly.
 *   3. Add the key to the client env file (client/.env):
 *        VITE_WEB3FORMS_ACCESS_KEY=your-key-here
 *   4. Restart `npm run dev`. That's it — every report from every form on the
 *      site flows into mentors.bridge@gmail.com, from every visitor.
 */

import { COMPANY_EMAIL } from '../config/contact';

const ENDPOINT = 'https://api.web3forms.com/submit';
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

const KIND_LABELS = {
  bug: 'Bug report',
  feedback: 'Feedback',
  safety: 'Trust & Safety report',
  contact: 'Contact request',
};

/**
 * @typedef SupportEmailInput
 * @property {'contact' | 'feedback' | 'bug' | 'safety'} kind
 * @property {string} ticketId
 * @property {string} subject
 * @property {string} body
 * @property {string} [replyTo]
 * @property {string} [fromName]
 * @property {Record<string, unknown>} [meta]
 */

/**
 * Post a support report to the company inbox.
 * Resolves with `{ ok: true, ticketId }` or throws with a user-safe message.
 *
 * @param {SupportEmailInput} input
 */
export async function sendSupportEmail(input) {
  if (!input?.body?.trim()) {
    throw new Error('Message is required.');
  }

  if (!ACCESS_KEY) {
    throw new Error(
      'Reports inbox is not configured yet. Please set VITE_WEB3FORMS_ACCESS_KEY in the client .env file.',
    );
  }

  const kindLabel = KIND_LABELS[input.kind] || 'Contact request';

  const metaLines = Object.entries(input.meta || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  const formattedMessage = [
    `Ticket ID: ${input.ticketId}`,
    `Type: ${kindLabel}`,
    input.fromName ? `From: ${input.fromName}` : null,
    input.replyTo ? `Reply-to: ${input.replyTo}` : 'Reply-to: (anonymous)',
    metaLines ? `\n— Details —\n${metaLines}` : null,
    '',
    '— Message —',
    input.body,
  ]
    .filter(Boolean)
    .join('\n');

  const payload = {
    access_key: ACCESS_KEY,
    to: COMPANY_EMAIL,
    subject: input.subject || `[Bridge] [#${input.ticketId}] ${kindLabel}`,
    from_name: input.fromName || `Bridge ${kindLabel}`,
    replyto: input.replyTo || undefined,
    email: input.replyTo || undefined,
    name: input.fromName || undefined,
    message: formattedMessage,
    ticket_id: input.ticketId,
    kind: kindLabel,
    ...(input.meta || {}),
  };

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Couldn't reach the mail service. Check your connection and try again.",
    );
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* Web3Forms always returns JSON, but stay defensive. */
  }

  if (!res.ok || data?.success === false) {
    throw new Error(
      data?.message || 'Could not deliver your message. Please try again.',
    );
  }

  return { ok: true, ticketId: input.ticketId, id: data?.data?.id ?? null };
}
