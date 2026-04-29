import { createClient } from '@supabase/supabase-js';
import { getStripe } from './_lib/stripeClient.js';
import { getPublicOrigin } from './_lib/publicOrigin.js';

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured on the server.' });
  }

  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required.' });

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (checkoutSession.status !== 'complete') {
      return res.status(400).json({ error: 'Checkout is not completed yet.' });
    }

    if (checkoutSession.mode === 'payment' && checkoutSession.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment is not marked as paid yet.' });
    }

    const supabase = getSupabaseAdmin();
    const meta = checkoutSession.metadata ?? {};
    let sync = { synced: false, error: 'Unknown type' };
    let bridgeSessionId = null;

    if (meta.type === 'subscription' && supabase) {
      const { data: row } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', meta.userId)
        .maybeSingle();

      const prev = row?.settings && typeof row.settings === 'object' ? row.settings : {};
      const settings = {
        ...prev,
        subscription_plan: meta.planName,
        subscription_status: 'active',
        stripe_checkout_session_id: checkoutSession.id,
        stripe_customer_id: checkoutSession.customer ? String(checkoutSession.customer) : null,
        stripe_subscription_id: checkoutSession.subscription
          ? String(checkoutSession.subscription.id ?? checkoutSession.subscription)
          : null,
        stripe_paid_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('user_settings').upsert(
        { user_id: meta.userId, settings, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
      sync = error ? { synced: false, error: error.message } : { synced: true };
    }

    if (meta.type === 'mentor_booking' && supabase) {
      const marker = `[stripe_session:${checkoutSession.id}]`;
      const { data: existing } = await supabase
        .from('sessions')
        .select('id')
        .eq('mentee_id', meta.userId)
        .eq('mentor_id', meta.mentorId)
        .eq('session_type', meta.sessionTypeKey)
        .eq('scheduled_date', meta.scheduledDate)
        .like('message', `${marker}%`)
        .maybeSingle();

      bridgeSessionId = existing?.id ?? null;

      if (existing?.id) {
        sync = { synced: true };
      } else {
        const userMessage = (meta.message || '').trim();
        const fullMessage = userMessage ? `${marker}\n\n${userMessage}` : marker;
        const { data: inserted, error } = await supabase
          .from('sessions')
          .insert({
            mentee_id: meta.userId,
            mentor_id: meta.mentorId,
            session_type: meta.sessionTypeKey,
            scheduled_date: meta.scheduledDate,
            status: 'pending',
            message: fullMessage,
          })
          .select('id')
          .maybeSingle();
        sync = error ? { synced: false, error: error.message } : { synced: true };
        if (!error && inserted?.id) bridgeSessionId = inserted.id;
      }

      if (sync.synced) {
        const baseUrl = getPublicOrigin();
        fetch(`${baseUrl}/api/calendar-book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mentor_profile_id: meta.mentorId,
            mentee_email: checkoutSession.customer_email || undefined,
            session_type: meta.sessionTypeKey,
            scheduled_date: meta.scheduledDate,
            duration_minutes: 60,
            bridge_session_id: bridgeSessionId,
          }),
        }).catch((err) => console.error('calendar-book fire-and-forget failed:', err));
      }
    }

    return res.json({ ok: true, type: meta.type ?? null, sessionId: checkoutSession.id, bridge_session_id: bridgeSessionId, ...sync });
  } catch (error) {
    console.error('Finalize checkout error:', error);
    res.status(500).json({ error: error?.message || 'Could not finalize checkout.' });
  }
}
