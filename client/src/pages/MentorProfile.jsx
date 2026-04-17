import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMentorById } from '../api/mentors';
import { createSession } from '../api/sessions';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SessionTypeCard, { SESSION_TYPES } from '../components/SessionTypeCard';

function BookingModal({ mentor, onClose }) {
    const [selectedType, setSelectedType] = useState(null);
    const [scheduledDate, setScheduledDate] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null); // { ok: bool, message: string }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!selectedType) return;

        setSubmitting(true);
        setResult(null);

        const { error } = await createSession(
            mentor.id,
            selectedType.key,
            scheduledDate || null,
            message || null,
        );

        setSubmitting(false);

        if (error) {
            setResult({ ok: false, message: error.message ?? 'Something went wrong. Please try again.' });
        } else {
            setResult({ ok: true, message: 'Session booked! Your mentor will confirm shortly.' });
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <div>
                        <h2 className="text-xl font-semibold text-stone-900">Book a Session</h2>
                        <p className="text-sm text-stone-500 mt-0.5">with {mentor.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600 transition-colors text-2xl leading-none"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                {result?.ok ? (
                    <div className="p-8 text-center">
                        <div className="text-4xl mb-4">🎉</div>
                        <p className="text-lg font-semibold text-stone-900 mb-2">You&apos;re all set!</p>
                        <p className="text-stone-600 mb-6">{result.message}</p>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-full bg-stone-900 text-amber-50 hover:bg-stone-700 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                        {/* Session type */}
                        <div>
                            <p className="text-sm font-medium text-stone-700 mb-3">Select session type</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {SESSION_TYPES.map((type) => (
                                    <SessionTypeCard
                                        key={type.key}
                                        type={type}
                                        selected={selectedType?.key === type.key}
                                        onClick={() => setSelectedType(type)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Date/time */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1.5" htmlFor="scheduled-date">
                                Preferred date &amp; time <span className="text-stone-400 font-normal">(optional)</span>
                            </label>
                            <input
                                id="scheduled-date"
                                type="datetime-local"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1.5" htmlFor="booking-message">
                                Message <span className="text-stone-400 font-normal">(optional)</span>
                            </label>
                            <textarea
                                id="booking-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                placeholder="Tell your mentor what you'd like to focus on..."
                                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                            />
                        </div>

                        {result && !result.ok && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                {result.message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={!selectedType || submitting}
                            className="w-full px-6 py-3 rounded-full bg-stone-900 text-amber-50 hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Booking…' : 'Confirm Booking'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

function avatarColor(name = '') {
    const palette = [
        'bg-amber-400',
        'bg-orange-400',
        'bg-rose-400',
        'bg-pink-400',
        'bg-violet-400',
        'bg-indigo-400',
        'bg-teal-400',
        'bg-emerald-400',
        'bg-cyan-400',
        'bg-sky-400',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
}

function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');
}

export default function MentorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getMentorById(id).then(({ data }) => {
            if (!cancelled) {
                setProfile(data);
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, [id]);

    function handleBookClick() {
        if (!user) {
            navigate('/login');
        } else {
            setShowModal(true);
        }
    }

    if (loading) {
        return (
            <main className="max-w-5xl mx-auto px-6 py-12">
                <LoadingSpinner label="Loading mentor profile…" />
            </main>
        );
    }

    if (!profile?.mentor) {
        return (
            <main className="max-w-5xl mx-auto px-6 py-12 text-center">
                <p className="text-stone-500 text-lg">Mentor not found.</p>
                <Link to="/mentors" className="mt-4 inline-block text-amber-700 hover:underline">
                    ← Back to Mentors
                </Link>
            </main>
        );
    }

    const mentor = profile.mentor;
    const reviews = profile.reviews;

    const avatarBg = avatarColor(mentor.name);
    const mentorInitials = initials(mentor.name);

    return (
        <>
            <main className="max-w-5xl mx-auto px-6 py-10">

                {/* Back link */}
                <Link
                    to="/mentors"
                    className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-8"
                >
                    ← Back to Mentors
                </Link>

                {/* Hero */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                        {/* Avatar */}
                        <div
                            className={`w-20 h-20 rounded-full flex-shrink-0 flex items-center justify-center text-white text-2xl font-bold ${avatarBg}`}
                            aria-hidden="true"
                        >
                            {mentorInitials}
                        </div>

                        {/* Name / title / availability */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-stone-900 leading-tight">
                                    {mentor.name}
                                </h1>
                                {mentor.available && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                        Available for sessions
                                    </span>
                                )}
                            </div>
                            {mentor.title && (
                                <p className="text-lg text-stone-700 font-medium">
                                    {mentor.title}
                                </p>
                            )}
                            {mentor.company && (
                                <p className="text-stone-500 mt-0.5">
                                    {mentor.company}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="mt-8 grid grid-cols-3 gap-4">
                        <div className="rounded-xl bg-amber-50 border border-amber-100 px-5 py-4">
                            <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-1">Rating</p>
                            <p className="text-xl font-bold text-stone-900">
                                {mentor.rating != null ? `⭐ ${mentor.rating}` : '—'}
                            </p>
                        </div>
                        <div className="rounded-xl bg-amber-50 border border-amber-100 px-5 py-4">
                            <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-1">Experience</p>
                            <p className="text-xl font-bold text-stone-900">
                                {mentor.years_experience != null ? `${mentor.years_experience} years` : '—'}
                            </p>
                        </div>
                        <div className="rounded-xl bg-amber-50 border border-amber-100 px-5 py-4">
                            <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-1">Total Sessions</p>
                            <p className="text-xl font-bold text-stone-900">
                                {mentor.total_sessions != null ? `${mentor.total_sessions} sessions` : '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Two-column body */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* Left: bio + expertise */}
                    <div className="flex-1 min-w-0 flex flex-col gap-6">

                        {/* About */}
                        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
                            <h2 className="text-lg font-semibold text-stone-900 mb-4">About</h2>
                            <p className="text-stone-700 leading-relaxed">
                                {mentor.bio || 'No bio available.'}
                            </p>
                        </section>

                        {/* Expertise */}
                        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
                            <h2 className="text-lg font-semibold text-stone-900 mb-4">Areas of Expertise</h2>
                            {mentor.expertise?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {mentor.expertise.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-medium"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-stone-400 text-sm">No expertise tags listed.</p>
                            )}
                        </section>

                        {/* Reviews placeholder */}
                        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
                            <h2 className="text-lg font-semibold text-stone-900 mb-4">Reviews</h2>
                            <div className="flex flex-col items-center py-8 text-center text-stone-400">
                                <span className="text-4xl mb-3">💬</span>
                                <p className="font-medium text-stone-500">Reviews coming soon</p>
                                <p className="text-sm mt-1">Be the first to leave a review after your session.</p>
                            </div>
                        </section>
                    </div>

                    {/* Right: sticky booking card */}
                    <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-6">
                        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col gap-5">
                            <div>
                                <h2 className="text-lg font-semibold text-stone-900 mb-1">Book a Session</h2>
                                <p className="text-sm text-stone-500">Choose a session type when booking</p>
                            </div>

                            {/* Session type list */}
                            <ul className="flex flex-col gap-2">
                                {SESSION_TYPES.map((type) => (
                                    <li key={type.key} className="flex items-center gap-3 text-sm text-stone-700">
                                        <span className="text-base">{type.icon}</span>
                                        <span className="flex-1">{type.name}</span>
                                        <span className="text-xs text-stone-400">{type.duration}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={handleBookClick}
                                className="w-full py-3 rounded-full bg-stone-900 text-amber-50 font-medium hover:bg-stone-700 transition-colors"
                            >
                                Book a Session
                            </button>

                            <p className="text-xs text-stone-400 text-center leading-relaxed">
                                Pro plan required for unlimited sessions.
                            </p>
                        </div>
                    </aside>
                </div>
            </main>

            {showModal && (
                <BookingModal mentor={mentor} onClose={() => setShowModal(false)} />
            )}
        </>
    );
}
