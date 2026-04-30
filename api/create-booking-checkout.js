import { getStripe } from './_lib/stripeClient.js';
import { getPublicOrigin } from './_lib/publicOrigin.js';

const SESSION_TYPE_MAP = {
  career_advice: 'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review: 'Resume Review',
  networking: 'Networking',
};
const SESSION_TYPE_KEY_FROM_NAME = Object.fromEntries(
  Object.entries(SESSION_TYPE_MAP).map(([key, value]) => [value, key]),
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured on the server.' });
  }

  const {
    userId, userEmail, menteeName, mentorId, mentorName,
    sessionType, sessionTypeKey, scheduledDate,
    sessionPrice, message,
  } = req.body;

  const safePrice = Number(sessionPrice);
  if (!safePrice || safePrice <= 0) {
    return res.status(400).json({ error: 'Invalid mentor session price.' });
  }

  const typeKey = sessionTypeKey || SESSION_TYPE_KEY_FROM_NAME[sessionType];
  if (!typeKey || !SESSION_TYPE_MAP[typeKey]) {
    return res.status(400).json({ error: 'Invalid session type.' });
  }

  const origin = getPublicOrigin();

  try {
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
        userId: String(userId ?? ''),
        menteeName: String(menteeName ?? '').slice(0, 500),
        mentorId: String(mentorId ?? ''),
        mentorName: String(mentorName ?? '').slice(0, 500),
        sessionTypeKey: String(typeKey ?? ''),
        sessionTypeName: String(sessionType ?? ''),
        scheduledDate: String(scheduledDate ?? ''),
        sessionPrice: String(safePrice),
        message: String(message ?? '').slice(0, 350),
      },
      return_url: `${origin}/mentors/${mentorId}?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Booking checkout error:', error);
    res.status(500).json({ error: error?.message || 'Could not create booking checkout.' });
  }
}
