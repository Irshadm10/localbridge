const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const SESSION_TYPE_MAP = {
  career_advice: 'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review: 'Resume Review',
  networking: 'Networking',
};

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(503).json({ error: 'Stripe secret key is not configured on the server.' });
  }

  const stripe = new Stripe(stripeKey);

  try {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required.' });

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (checkoutSession.status !== 'complete') {
      return res.status(400).json({ error: 'Checkout is not completed yet.' });
    }
    if (checkoutSession.mode === 'payment' && checkoutSession.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment is not marked as paid yet.' });
    }

    const sync = await syncToSupabase(checkoutSession);

    return res.status(200).json({
      ok: true,
      type: checkoutSession.metadata?.type ?? null,
      sessionId: checkoutSession.id,
      synced: sync.synced,
      sync_error: sync.error ?? null,
    });
  } catch (err) {
    console.error('[finalize-checkout]', err);
    return res.status(500).json({ error: err.message || 'Could not finalize checkout.' });
  }
};

async function syncToSupabase(session) {
  const db = getSupabase();
  if (!db) return { synced: false, error: 'Supabase credentials missing.' };

  const meta = session.metadata || {};
  if (meta.type === 'subscription') return syncSubscription(db, meta, session);
  if (meta.type === 'mentor_booking') return syncBooking(db, meta, session);
  return { synced: false, error: 'Unknown checkout type.' };
}

async function syncSubscription(db, meta, session) {
  if (!meta.userId || !meta.planName) return { synced: false, error: 'Missing metadata.' };

  const { data: row, error: selErr } = await db
    .from('user_settings').select('settings').eq('user_id', meta.userId).maybeSingle();
  if (selErr) return { synced: false, error: selErr.message };

  const prev = row?.settings && typeof row.settings === 'object' ? row.settings : {};
  const settings = {
    ...prev,
    subscription_plan: meta.planName,
    subscription_status: 'active',
    stripe_checkout_session_id: session.id,
    stripe_customer_id: session.customer ? String(session.customer) : null,
    stripe_subscription_id: session.subscription
      ? String(session.subscription.id ?? session.subscription) : null,
    stripe_paid_at: new Date().toISOString(),
  };

  const { error } = await db.from('user_settings').upsert(
    { user_id: meta.userId, settings, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
  if (error) return { synced: false, error: error.message };
  return { synced: true };
}

async function syncBooking(db, meta, session) {
  const { userId, mentorId, sessionTypeKey, scheduledDate } = meta;
  if (!userId || !mentorId || !sessionTypeKey || !scheduledDate) {
    return { synced: false, error: 'Missing booking metadata.' };
  }
  if (!SESSION_TYPE_MAP[sessionTypeKey]) return { synced: false, error: 'Invalid session type key.' };

  const marker = `[stripe_session:${session.id}]`;
  const { data: existing, error: lookupErr } = await db
    .from('sessions').select('id')
    .eq('mentee_id', userId).eq('mentor_id', mentorId)
    .eq('session_type', sessionTypeKey).eq('scheduled_date', scheduledDate)
    .like('message', `${marker}%`).maybeSingle();
  if (lookupErr) return { synced: false, error: lookupErr.message };
  if (existing?.id) return { synced: true };

  const userMessage = (meta.message || '').trim();
  const fullMessage = userMessage ? `${marker}\n\n${userMessage}` : marker;

  const { error } = await db.from('sessions').insert({
    mentee_id: userId, mentor_id: mentorId,
    session_type: sessionTypeKey, scheduled_date: scheduledDate,
    status: 'pending', message: fullMessage,
  });
  if (error) return { synced: false, error: error.message };
  return { synced: true };
}
