export async function createBookingCheckout({
  userId,
  userEmail,
  mentorId,
  mentorName,
  /** Display label for Stripe product text */
  sessionTypeName,
  /** `sessions.session_type` check constraint value, e.g. `career_advice` */
  sessionTypeKey,
  scheduledDate,
  sessionPrice,
  message,
}) {
  const res = await fetch('/api/create-booking-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      userEmail,
      mentorId,
      mentorName,
      sessionType: sessionTypeName,
      sessionTypeKey,
      scheduledDate,
      sessionPrice,
      message,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || 'Could not start booking checkout.' };
  return { ok: true, clientSecret: data.clientSecret };
}

export async function createSubscriptionCheckout({ planName, userId, userEmail }) {
  const res = await fetch('/api/create-subscription-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planName, userId, userEmail }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || 'Could not start subscription checkout.' };
  return { ok: true, clientSecret: data.clientSecret };
}

export async function finalizeCheckout(sessionId) {
  const res = await fetch('/api/finalize-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data.error || 'Could not finalize checkout.' };
  }
  return { ok: true, data };
}
