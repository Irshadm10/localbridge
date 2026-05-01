import supabase from './supabase.js';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? '';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function requestCancellation(sessionId, reason, details = '') {
  const token = await getToken();
  if (!token) return { error: 'Not authenticated' };

  const res = await fetch(`${SERVER_URL}/api/cancellations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ session_id: sessionId, reason, details }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error || 'Failed to submit cancellation request', limit: data.limit, used: data.used };
  return { data };
}

export async function getMyCancellationRequests() {
  return supabase
    .from('cancellation_requests')
    .select('id, session_id, requester_role, reason, status, reviewer_note, free_plan_granted, created_at, reviewed_at')
    .order('created_at', { ascending: false });
}

export async function getMonthlyUsedCount() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('cancellation_requests')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'denied')
    .gte('created_at', monthStart.toISOString());

  return count ?? 0;
}

export async function getFreePlanGrant(userId) {
  if (!userId) return null;
  const { data } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.settings?.free_plan_grant ?? null;
}
