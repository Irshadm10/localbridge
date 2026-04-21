import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMySession, updateSessionStatus } from "../api/sessions";
import { getMentorById } from "../api/mentors";
import supabase from "../api/supabase";
import LoadingSpinner from "../components/LoadingSpinner";

const SESSION_TYPE_ICONS = {
  "career-advice":      { icon: "💼", label: "Career Advice" },
  "mock-interview":     { icon: "🎤", label: "Mock Interview" },
  "resume-review":      { icon: "📄", label: "Resume Review" },
  "code-review":        { icon: "💻", label: "Code Review" },
  "general-mentorship": { icon: "🌱", label: "General Mentorship" },
  "networking":         { icon: "🤝", label: "Networking" },
  "skill-building":     { icon: "🛠️", label: "Skill Building" },
  default:              { icon: "📅", label: "Session" },
};

function getSessionTypeInfo(type) {
  if (!type) return SESSION_TYPE_ICONS.default;
  const key = type.toLowerCase().replace(/\s+/g, "-");
  return SESSION_TYPE_ICONS[key] || { icon: "📅", label: type };
}

function StatusBadge({ status }) {
  const styles = {
    pending:   "bg-amber-100 text-amber-800 border border-amber-200",
    accepted:  "bg-green-100 text-green-800 border border-green-200",
    declined:  "bg-red-100 text-red-800 border border-red-200",
    completed: "bg-stone-100 text-stone-600 border border-stone-200",
    cancelled: "bg-stone-100 text-stone-500 border border-stone-200",
  };
  const labels = { pending: "Pending", accepted: "Accepted", declined: "Declined", completed: "Completed", cancelled: "Cancelled" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

function StatCard({ icon, value, label, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-5 py-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-stone-800 leading-none">{value}</p>
        <p className="text-xs text-stone-500 mt-1 font-medium tracking-wide">{label}</p>
      </div>
    </div>
  );
}

function SessionCard({ session, isMentor, onAccept, onDecline, onCancel, actionLoading }) {
  const typeInfo = getSessionTypeInfo(session.session_type);
  const otherName = isMentor ? session.mentee_name || "Mentee" : session.mentor_name || "Mentor";
  const formattedDate = session.scheduled_date
    ? new Date(session.scheduled_date).toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      })
    : "TBD";

  const now = new Date();
  const isPast = session.scheduled_date && new Date(session.scheduled_date) < now;
  const showActions = !isPast && session.status !== "completed" && session.status !== "declined" && session.status !== "cancelled";

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-5 py-4 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
        {typeInfo.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <p className="font-semibold text-stone-800 text-sm">{otherName}</p>
          <StatusBadge status={session.status} />
        </div>
        <p className="text-xs text-stone-500">{typeInfo.label}</p>
        <p className="text-xs text-stone-400 mt-0.5">🗓 {formattedDate}</p>
      </div>
      {showActions && (
        <div className="flex gap-2 flex-shrink-0">
          {isMentor && session.status === "pending" && (
            <>
              <button onClick={() => onAccept(session.id)} disabled={actionLoading === session.id}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                {actionLoading === session.id ? "…" : "Accept"}
              </button>
              <button onClick={() => onDecline(session.id)} disabled={actionLoading === session.id}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                Decline
              </button>
            </>
          )}
          {!isMentor && session.status === "pending" && (
            <button onClick={() => onCancel(session.id)} disabled={actionLoading === session.id}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
              {actionLoading === session.id ? "…" : "Cancel"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.user_metadata?.role || "mentee";
  const isMentor = role === "mentor";
  const firstName = user?.user_metadata?.first_name || user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [mentorProfileId, setMentorProfileId] = useState(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        let rawSessions = [];

        if (isMentor) {
          const { data: profileData, error: profileError } = await supabase
            .from("mentor_profiles").select("id").eq("user_id", user.id).single();
          if (profileError) throw profileError;
          const mpId = profileData.id;
          setMentorProfileId(mpId);

          const { data, error: sessErr } = await supabase
            .from("sessions").select("*, mentee:mentee_id(id, raw_user_meta_data)").eq("mentor_id", mpId);
          if (sessErr) throw sessErr;

          rawSessions = (data || []).map((s) => ({
            ...s,
            mentee_name:
              s.mentee?.raw_user_meta_data?.first_name
                ? `${s.mentee.raw_user_meta_data.first_name} ${s.mentee.raw_user_meta_data.last_name || ""}`.trim()
                : s.mentee?.raw_user_meta_data?.full_name || s.mentee_name || "Mentee",
          }));
        } else {
          let data;
          try {
            data = await getMySession(user.id);
          } catch {
            const { data: d, error: e } = await supabase.from("sessions").select("*").eq("mentee_id", user.id);
            if (e) throw e;
            data = d || [];
          }

          const uniqueMentorIds = [...new Set((data || []).map((s) => s.mentor_id).filter(Boolean))];
          const mentorMap = {};
          await Promise.all(uniqueMentorIds.map(async (mid) => {
            try { const m = await getMentorById(mid); if (m) mentorMap[mid] = m; } catch {}
          }));

          rawSessions = (data || []).map((s) => {
            const m = mentorMap[s.mentor_id];
            return {
              ...s,
              mentor_name: m ? m.full_name || `${m.first_name || ""} ${m.last_name || ""}`.trim() || "Mentor" : s.mentor_name || "Mentor",
              mentor_title: m?.title || m?.headline || "",
              mentor_company: m?.company || "",
            };
          });
        }
        setSessions(rawSessions);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load your dashboard. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchData();
  }, [user, isMentor]);

  const now = new Date();

  const upcomingSessions = useMemo(() =>
    sessions.filter((s) =>
      (s.status === "pending" || s.status === "accepted") &&
      (!s.scheduled_date || new Date(s.scheduled_date) >= now)
    ).sort((a, b) => {
      if (!a.scheduled_date) return 1;
      if (!b.scheduled_date) return -1;
      return new Date(a.scheduled_date) - new Date(b.scheduled_date);
    }), [sessions]);

  const pastSessions = useMemo(() =>
    sessions.filter((s) =>
      s.status === "completed" || s.status === "cancelled" || s.status === "declined" ||
      (s.scheduled_date && new Date(s.scheduled_date) < now && s.status !== "pending" && s.status !== "accepted")
    ).sort((a, b) => new Date(b.scheduled_date || 0) - new Date(a.scheduled_date || 0)),
  [sessions]);

  const visibleHistory = showAllHistory ? pastSessions : pastSessions.slice(0, 10);
  const totalSessions = sessions.length;
  const completedCount = sessions.filter((s) => s.status === "completed").length;

  const uniqueMentors = useMemo(() => [...new Set(sessions.map((s) => s.mentor_id).filter(Boolean))], [sessions]);

  const mentorCards = useMemo(() => {
    const seen = new Set();
    return sessions.filter((s) => s.mentor_id && !seen.has(s.mentor_id) && !seen.add(s.mentor_id))
      .map((s) => ({ mentor_id: s.mentor_id, name: s.mentor_name || "Mentor", title: s.mentor_title || "", company: s.mentor_company || "" }));
  }, [sessions]);

  const menteeCards = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      if (!s.mentee_id) return;
      if (!map[s.mentee_id]) map[s.mentee_id] = { name: s.mentee_name || "Mentee", count: 0 };
      map[s.mentee_id].count += 1;
    });
    return Object.entries(map).map(([id, v]) => ({ id, ...v }));
  }, [sessions]);

  async function handleStatusUpdate(sessionId, status) {
    setActionLoading(sessionId);
    try {
      await updateSessionStatus(sessionId, status);
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, status } : s));
    } catch (err) {
      alert("Failed to update session. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center shadow-sm">
        <p className="text-3xl mb-3">⚠️</p>
        <p className="text-stone-700 font-medium">{error}</p>
        <button onClick={() => window.location.reload()}
          className="mt-4 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 tracking-tight">
              Welcome back, <span className="text-amber-600">{firstName}</span> 👋
            </h1>
            <p className="text-stone-400 text-sm mt-1">{today}</p>
          </div>
          {isMentor && mentorProfileId && (
            <Link to={`/mentors/${mentorProfileId}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl transition-colors">
              👤 View My Profile
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="📊" value={totalSessions} label="Total Sessions" accent="bg-stone-100" />
          <StatCard icon="📅" value={upcomingSessions.length} label="Upcoming" accent="bg-amber-50" />
          <StatCard icon="✅" value={completedCount} label="Completed" accent="bg-green-50" />
          {isMentor
            ? <StatCard icon="⭐" value="—" label="Avg. Rating" accent="bg-yellow-50" />
            : <StatCard icon="🧑‍🏫" value={uniqueMentors.length} label="Mentors Worked With" accent="bg-blue-50" />
          }
        </div>

        {/* Upcoming Sessions */}
        <section>
          <h2 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-amber-400 rounded-full inline-block"></span>
            Upcoming Sessions
          </h2>
          {upcomingSessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-sm">
              <p className="text-3xl mb-3">🗓</p>
              <p className="text-stone-600 font-medium">No upcoming sessions.</p>
              {!isMentor && (
                <p className="text-stone-400 text-sm mt-1">
                  <Link to="/mentors" className="text-amber-600 hover:underline font-semibold">Browse mentors</Link> to book your first one!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <SessionCard key={session.id} session={session} isMentor={isMentor}
                  actionLoading={actionLoading}
                  onAccept={(id) => handleStatusUpdate(id, "accepted")}
                  onDecline={(id) => handleStatusUpdate(id, "declined")}
                  onCancel={(id) => handleStatusUpdate(id, "cancelled")}
                />
              ))}
            </div>
          )}
        </section>

        {/* Session History */}
        <section>
          <h2 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-stone-400 rounded-full inline-block"></span>
            Session History
          </h2>
          {pastSessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-sm">
              <p className="text-3xl mb-3">📭</p>
              <p className="text-stone-500 text-sm">No past sessions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleHistory.map((session) => (
                <SessionCard key={session.id} session={session} isMentor={isMentor}
                  actionLoading={null} onAccept={null} onDecline={null} onCancel={null}
                />
              ))}
              {pastSessions.length > 10 && (
                <button onClick={() => setShowAllHistory((v) => !v)}
                  className="w-full py-2.5 text-sm font-semibold text-stone-500 hover:text-stone-700 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-colors">
                  {showAllHistory ? "Show less ↑" : `View all ${pastSessions.length} sessions →`}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Mentee: Your Mentors */}
        {!isMentor && mentorCards.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-400 rounded-full inline-block"></span>
              Your Mentors
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentorCards.map((m) => (
                <div key={m.mentor_id} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-lg font-bold text-amber-800">
                    {(m.name || "M")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{m.name}</p>
                    {m.title && <p className="text-xs text-stone-500 mt-0.5">{m.title}</p>}
                    {m.company && <p className="text-xs text-stone-400">{m.company}</p>}
                  </div>
                  <Link to={`/mentors/${m.mentor_id}`}
                    className="mt-auto inline-block text-center px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs rounded-xl border border-amber-200 transition-colors">
                    Book Again →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mentee: Find a Mentor CTA */}
        {!isMentor && totalSessions < 3 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-stone-800">🌱 You're just getting started!</p>
              <p className="text-stone-500 text-sm mt-1">Browse our mentors to find the right fit for your goals.</p>
            </div>
            <Link to="/mentors"
              className="flex-shrink-0 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm">
              Browse Mentors →
            </Link>
          </div>
        )}

        {/* Mentor: Your Mentees */}
        {isMentor && menteeCards.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-green-400 rounded-full inline-block"></span>
              Your Mentees
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menteeCards.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-200 to-green-400 flex items-center justify-center text-lg font-bold text-green-800 flex-shrink-0">
                    {(m.name || "M")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{m.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{m.count} session{m.count !== 1 ? "s" : ""} together</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mentor: Profile CTA */}
        {isMentor && mentorProfileId && (
          <div className="bg-gradient-to-r from-stone-50 to-amber-50 rounded-2xl border border-stone-200 p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-stone-800">✨ Your Mentor Profile</p>
              <p className="text-stone-500 text-sm mt-1">Keep your profile up to date to attract the right mentees.</p>
            </div>
            <Link to={`/mentors/${mentorProfileId}`}
              className="flex-shrink-0 px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm">
              View Profile →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
