import { useState, useEffect } from 'react';
import { devFetch } from './devAuth.js';
import { AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_CFG = {
  pending:  { label: 'Pending',  cls: 'bg-amber-500/12 text-amber-400 ring-amber-500/20',   dot: 'bg-amber-400'  },
  approved: { label: 'Approved', cls: 'bg-emerald-500/12 text-emerald-400 ring-emerald-500/20', dot: 'bg-emerald-400' },
  denied:   { label: 'Denied',   cls: 'bg-red-500/12 text-red-400 ring-red-500/20',          dot: 'bg-red-400'    },
};

const REASON_LABELS = {
  scheduling_conflict: 'Scheduling conflict',
  personal_emergency:  'Personal emergency',
  no_longer_needed:    'No longer needed',
  found_alternative:   'Found alternative',
  technical_issues:    'Technical issues',
  other:               'Other',
};

const TYPE_LABELS = {
  career_advice:  'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review:  'Resume Review',
  networking:     'Networking',
};

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function DevCancellations() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('pending');
  const [expanded, setExpanded] = useState(null);
  const [acting, setActing]     = useState(null);
  const [denyNote, setDenyNote] = useState('');
  const [denyTarget, setDenyTarget] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await devFetch(`/cancellations${filter ? `?status=${filter}` : ''}`);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch { setRequests([]); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]); // eslint-disable-line

  async function handleApprove(id) {
    if (!window.confirm('Approve this cancellation? The session will be marked cancelled and, if the mentor requested it, the mentee gets 2 weeks of Pro.')) return;
    setActing(id);
    try {
      await devFetch(`/cancellations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'approve' }),
      });
      await load();
    } finally { setActing(null); }
  }

  async function handleDeny(id, note) {
    setActing(id);
    try {
      await devFetch(`/cancellations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'deny', reviewer_note: note }),
      });
      setDenyTarget(null);
      setDenyNote('');
      await load();
    } finally { setActing(null); }
  }

  const pending  = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const denied   = requests.filter(r => r.status === 'denied').length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">Review Queue</p>
          <h1 className="mt-1 font-display text-2xl font-black text-white">Cancellation Requests</h1>
          <p className="mt-1 text-sm text-stone-400">Review, approve, or deny user-submitted cancellation requests.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border border-white/8 px-4 py-2 text-xs font-bold text-stone-400 hover:text-white transition">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending',  value: pending,  cls: 'text-amber-400',   icon: Clock        },
          { label: 'Approved', value: approved, cls: 'text-emerald-400', icon: CheckCircle  },
          { label: 'Denied',   value: denied,   cls: 'text-red-400',     icon: XCircle      },
        ].map(({ label, value, cls, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-white/6 bg-[#0d0d14] p-4">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${cls}`} />
              <span className="text-xs font-semibold text-stone-400">{label}</span>
            </div>
            <p className={`mt-2 font-display text-3xl font-black tabular-nums ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['pending', 'approved', 'denied', ''].map(s => (
          <button key={s}
            onClick={() => setFilter(s)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filter === s
                ? 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/25'
                : 'text-stone-500 hover:text-stone-300 hover:bg-white/4'
            }`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-stone-500 text-sm">Loading…</div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-500 text-sm gap-2">
          <AlertTriangle className="h-8 w-8 opacity-40" />
          No {filter || ''} requests
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => {
            const isExp = expanded === r.id;
            const cfg   = STATUS_CFG[r.status] || STATUS_CFG.pending;
            const session = r.sessions;
            const mentorName = session?.mentor_profiles?.name || '—';
            const sessionType = TYPE_LABELS[session?.session_type] || session?.session_type || '—';
            const sessionDate = fmtDate(session?.scheduled_date);
            const isDenyOpen = denyTarget === r.id;

            return (
              <div key={r.id} className="rounded-2xl border border-white/6 bg-[#0d0d14] overflow-hidden">
                {/* Row */}
                <button
                  type="button"
                  onClick={() => setExpanded(isExp ? null : r.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition"
                >
                  {/* Status */}
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ring-1 shrink-0 ${cfg.cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">
                      {r.requester_name} <span className="font-normal text-stone-400">({r.requester_role})</span>
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                      {sessionType} with {mentorName} · {sessionDate}
                    </p>
                  </div>

                  {/* Reason */}
                  <span className="hidden sm:block shrink-0 text-[11px] text-stone-400">
                    {REASON_LABELS[r.reason] || r.reason}
                  </span>

                  {/* Submitted */}
                  <span className="hidden md:block shrink-0 text-[10px] text-stone-600">
                    {fmtDate(r.created_at)}
                  </span>

                  {isExp ? <ChevronUp className="h-4 w-4 text-stone-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-stone-500 shrink-0" />}
                </button>

                {/* Expanded detail */}
                {isExp && (
                  <div className="border-t border-white/6 px-5 py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-500 mb-1">Session type</p>
                        <p className="text-stone-200">{sessionType}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-500 mb-1">Scheduled</p>
                        <p className="text-stone-200">{sessionDate}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-500 mb-1">Mentor</p>
                        <p className="text-stone-200">{mentorName}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-500 mb-1">Requested by</p>
                        <p className="text-stone-200">{r.requester_name} <span className="text-stone-500">({r.requester_role})</span></p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-500 mb-1">Reason</p>
                        <p className="text-stone-200">{REASON_LABELS[r.reason] || r.reason}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-500 mb-1">Submitted</p>
                        <p className="text-stone-200">{fmtDate(r.created_at)}</p>
                      </div>
                    </div>

                    {r.details && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-500 mb-1">Additional details</p>
                        <p className="text-xs text-stone-300 leading-relaxed italic">"{r.details}"</p>
                      </div>
                    )}

                    {r.reviewer_note && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-500 mb-1">Reviewer note</p>
                        <p className="text-xs text-stone-300 leading-relaxed">{r.reviewer_note}</p>
                      </div>
                    )}

                    {r.requester_role === 'mentor' && r.status === 'pending' && (
                      <div className="rounded-xl border border-sky-500/20 bg-sky-500/8 px-4 py-3">
                        <p className="text-xs font-semibold text-sky-400">
                          Approving this will automatically grant the mentee a 2-week Pro plan as compensation.
                        </p>
                      </div>
                    )}

                    {r.free_plan_granted && (
                      <div className="rounded-xl border border-violet-500/20 bg-violet-500/8 px-4 py-3">
                        <p className="text-xs font-semibold text-violet-400">Free Pro plan was granted to the mentee.</p>
                      </div>
                    )}

                    {/* Actions — only for pending */}
                    {r.status === 'pending' && (
                      <div className="space-y-3 pt-1">
                        {!isDenyOpen ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApprove(r.id)}
                              disabled={acting === r.id}
                              className="flex items-center gap-2 rounded-xl bg-emerald-500/12 px-5 py-2.5 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/20 transition disabled:opacity-50"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              {acting === r.id ? 'Processing…' : 'Approve'}
                            </button>
                            <button
                              onClick={() => setDenyTarget(r.id)}
                              disabled={acting === r.id}
                              className="flex items-center gap-2 rounded-xl bg-red-500/12 px-5 py-2.5 text-xs font-bold text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/20 transition disabled:opacity-50"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Deny
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.18em] text-stone-400">
                                Reason for denial (shown to user)
                              </label>
                              <textarea
                                value={denyNote}
                                onChange={e => setDenyNote(e.target.value)}
                                rows={2}
                                placeholder="e.g. Policy violation, insufficient reason, rescheduling is preferred…"
                                className="w-full resize-none rounded-xl bg-white/[0.05] px-4 py-3 text-xs text-white placeholder:text-stone-600 ring-1 ring-white/8 focus:outline-none focus:ring-orange-500/40"
                              />
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleDeny(r.id, denyNote)}
                                disabled={acting === r.id}
                                className="flex items-center gap-2 rounded-xl bg-red-500/12 px-5 py-2.5 text-xs font-bold text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/20 transition disabled:opacity-50"
                              >
                                {acting === r.id ? 'Processing…' : 'Confirm deny'}
                              </button>
                              <button
                                onClick={() => { setDenyTarget(null); setDenyNote(''); }}
                                className="rounded-xl px-5 py-2.5 text-xs font-bold text-stone-500 hover:text-stone-300 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
