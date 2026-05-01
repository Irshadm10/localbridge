/**
 * POST /api/cancellations — authenticated users submit a cancellation request.
 * Server enforces the 3-per-calendar-month limit using the admin client.
 */

import { Router } from 'express';
import { getSupabaseAdmin } from '../lib/supabaseAdmin.js';

const router = Router();

const MONTHLY_LIMIT = 3;

function admin() {
  const client = getSupabaseAdmin();
  if (!client) throw new Error('Supabase admin client not configured');
  return client;
}

// ── POST /api/cancellations ──────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const sb = admin();

    // Verify token
    const { data: { user }, error: authErr } = await sb.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

    const { session_id, reason, details } = req.body;
    if (!session_id || !reason) {
      return res.status(400).json({ error: 'session_id and reason are required' });
    }

    // Load the session
    const { data: session, error: sessErr } = await sb
      .from('sessions')
      .select('id, status, mentee_id, mentor_id')
      .eq('id', session_id)
      .single();
    if (sessErr || !session) return res.status(404).json({ error: 'Session not found' });

    if (!['pending', 'accepted'].includes(session.status)) {
      return res.status(400).json({ error: 'Session cannot be cancelled in its current state' });
    }

    // Determine requester role
    let requester_role = null;
    if (session.mentee_id === user.id) {
      requester_role = 'mentee';
    } else {
      // Check if user is the mentor
      const { data: mp } = await sb
        .from('mentor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (mp && session.mentor_id === mp.id) requester_role = 'mentor';
    }
    if (!requester_role) return res.status(403).json({ error: 'You are not a participant in this session' });

    // Check for existing pending request on this session from this user
    const { data: existing } = await sb
      .from('cancellation_requests')
      .select('id')
      .eq('session_id', session_id)
      .eq('requester_id', user.id)
      .eq('status', 'pending')
      .maybeSingle();
    if (existing) {
      return res.status(409).json({ error: 'A cancellation request for this session is already pending' });
    }

    // Enforce monthly limit: count non-denied requests this calendar month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count } = await sb
      .from('cancellation_requests')
      .select('*', { count: 'exact', head: true })
      .eq('requester_id', user.id)
      .neq('status', 'denied')
      .gte('created_at', monthStart.toISOString());

    if ((count ?? 0) >= MONTHLY_LIMIT) {
      return res.status(429).json({
        error: `You have reached the ${MONTHLY_LIMIT} cancellation request limit for this month. You can submit again next month.`,
        limit: MONTHLY_LIMIT,
        used: count,
      });
    }

    // Insert the request
    const { data: cr, error: insertErr } = await sb
      .from('cancellation_requests')
      .insert({
        session_id,
        requester_id: user.id,
        requester_role,
        reason,
        details: details || null,
        status: 'pending',
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    res.status(201).json({
      id: cr.id,
      status: 'pending',
      remaining: MONTHLY_LIMIT - (count + 1),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
