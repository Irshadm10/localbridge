const Stripe = require('stripe');

const SESSION_TYPE_MAP = {
  career_advice: 'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review: 'Resume Review',
  networking: 'Networking',
};
const SESSION_TYPE_KEY_FROM_NAME = Object.fromEntries(
  Object.entries(SESSION_TYPE_MAP).map(([k, v]) => [v, k]),
);

function toMeta(v, max = 500) {
  if (v == null) return '';
  const s = String(v);
  return s.length > max ? s.slice(0, max) : s;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return res.status(503).json({ error: 'Stripe secret key is not configured on the server.' });
  }

  const stripe = new Stripe(key);

  try {
    const {
      userId, userEmail, mentorId, mentorName,
      sessionType, sessionTypeKey, scheduledDate,
      sessionPrice, message,
    } = req.body || {};

    const safePrice = Number(sessionPrice);
    if (!safePrice || safePrice <= 0) {
      return res.status(400).json({ error: 'Invalid mentor session price.' });
    }

    const typeKey = sessionTypeKey || SESSION_TYPE_KEY_FROM_NAME[sessionType];
    if (!typeKey || !SESSION_TYPE_MAP[typeKey]) {
      return res.status(400).json({ error: 'Invalid session type.' });
    }

    const host = req.headers.host || '';
    const proto = host.startsWith('localhost') ? 'http' : 'https';
    const clientUrl = process.env.CLIENT_URL || `${proto}://${host}`;

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      mode: 'payment',
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Session with ${mentorName}`,
              description: `${sessionType} mentor booking`,
            },
            unit_amount: Math.round(safePrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'mentor_booking',
        userId: toMeta(userId),
        mentorId: toMeta(mentorId),
        mentorName: toMeta(mentorName),
        sessionTypeKey: toMeta(typeKey),
        sessionTypeName: toMeta(sessionType),
        scheduledDate: toMeta(scheduledDate),
        sessionPrice: toMeta(safePrice),
        message: toMeta(message, 350),
      },
      return_url: `${clientUrl}/mentors/${mentorId}?session_id={CHECKOUT_SESSION_ID}`,
    });

    return res.status(200).json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('[create-booking-checkout]', err);
    return res.status(500).json({ error: err.message || 'Could not create booking checkout.' });
  }
};
