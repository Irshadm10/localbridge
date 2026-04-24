import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLAN_PRICES = {
  Starter: 1200,
  Pro: 1900,
  Premium: 4900,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { planName, userId, userEmail } = req.body;

  if (!PLAN_PRICES[planName]) {
    return res.status(400).json({ error: 'Invalid plan selected.' });
  }

  try {
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
        userId: String(userId ?? ''),
        planName: String(planName ?? ''),
      },
      return_url: `${process.env.CLIENT_URL}/pricing?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    res.status(500).json({ error: 'Could not create subscription checkout.' });
  }
}
