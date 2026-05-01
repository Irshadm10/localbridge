/**
 * Express app — shared between local dev server and Vercel serverless function.
 * Does NOT call app.listen() — that's done by server/index.js for local dev.
 * Vercel imports this directly via api/server.js.
 *
 * MySQL-dependent legacy routes (auth, mentors, sessions) are mounted only
 * in server/index.js so they never load in the Vercel build (mysql2 is not
 * in root node_modules).
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import stripeRoutes from './routes/stripe.js';
import calendarRoutes from './routes/calendar.js';
import googleAuthRoutes from './routes/googleAuth.js';
import devRoutes from './routes/dev.js';
import cancellationsRoute from './routes/cancellations.js';
import { getSupabaseAdmin } from './lib/supabaseAdmin.js';
import createSubscriptionCheckout from '../api/create-subscription-checkout.js';
import createBookingCheckout from '../api/create-booking-checkout.js';
import finalizeCheckoutHandler from '../api/finalize-checkout.js';

const app = express();

function wrapApiHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
}

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_PROD,
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin requests (origin is undefined) and listed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json());

// Stripe — same handlers as Vercel `api/*.js` (lightweight; avoids serverless loading full Express + googleapis graph)
app.post('/api/create-subscription-checkout', wrapApiHandler(createSubscriptionCheckout));
app.post('/api/create-booking-checkout', wrapApiHandler(createBookingCheckout));
app.post('/api/finalize-checkout', wrapApiHandler(finalizeCheckoutHandler));

// ── Routes ────────────────────────────────────────────────────────────────────
// Google OAuth — must be at /auth/google so the redirect URI matches
app.use('/auth/google', googleAuthRoutes);

// Calendar — availability + booking
app.use('/calendar', calendarRoutes);

// Stripe checkout
app.use('/api/stripe', stripeRoutes);

// Developer portal API
app.use('/api/dev', devRoutes);

// Cancellation requests
app.use('/api/cancellations', cancellationsRoute);

// User names — mentor dashboard uses this to get mentee names (admin client bypasses RLS)
app.post('/api/user-names', async (req, res) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const adminClient = getSupabaseAdmin();
    if (!adminClient) return res.status(503).json({ error: 'Service unavailable' });

    const { data: { user }, error: authErr } = await adminClient.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) return res.json({});

    const nameMap = {};

    // Primary: user_profiles.personal_info.full_name (admin bypasses RLS)
    const { data: profiles } = await adminClient
      .from('user_profiles')
      .select('user_id, personal_info')
      .in('user_id', userIds);
    if (profiles) {
      profiles.forEach(p => {
        const name = p.personal_info?.full_name;
        if (name) nameMap[p.user_id] = name;
      });
    }

    // Fallback: auth.users.user_metadata.full_name (set at registration)
    const missing = userIds.filter(id => !nameMap[id]);
    await Promise.all(missing.map(async id => {
      const { data: { user: u } } = await adminClient.auth.admin.getUserById(id);
      if (u?.user_metadata?.full_name) nameMap[id] = u.user_metadata.full_name;
    }));

    res.json(nameMap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api', (_req, res) => res.json({ ok: true, service: 'Bridge API' }));

export default app;
