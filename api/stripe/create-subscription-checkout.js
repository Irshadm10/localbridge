const Stripe = require('stripe');

const PLAN_PRICES = {
  Starter: 1200,
  Pro: 1900,
  Premium: 4900,
};

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
    const { planName, userId, userEmail } = req.body || {};

    if (!planName || !PLAN_PRICES[planName]) {
      return res.status(400).json({ error: 'Invalid plan selected.' });
    }

    const host = req.headers.host || '';
    const proto = host.startsWith('localhost') ? 'http' : 'https';
    const clientUrl = process.env.CLIENT_URL || `${proto}://${host}`;

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      mode: 'subscription',
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            recurring: { interval: 'month' },
            product_data: {
              name: `${planName} Plan`,
              description: 'Bridge subscription plan',
            },
            unit_amount: PLAN_PRICES[planName],
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'subscription',
        userId: toMeta(userId),
        planName: toMeta(planName),
      },
      return_url: `${clientUrl}/pricing?session_id={CHECKOUT_SESSION_ID}`,
    });

    return res.status(200).json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('[create-subscription-checkout]', err);
    return res.status(500).json({ error: err.message || 'Could not create subscription checkout.' });
  }
};
