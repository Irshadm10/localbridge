import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMentorById } from '../api/mentors';
import { addRecentlyViewedMentor } from '../utils/recentlyViewed';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MentorProfile() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPayload(null);

    void (async () => {
      const { data, error: err } = await getMentorById(id);
      if (cancelled) return;
      setLoading(false);
      if (err) {
        setError(err.message || 'Could not load mentor.');
        return;
      }
      if (!data?.mentor) {
        setError('Mentor not found.');
        return;
      }
      setPayload(data);
      addRecentlyViewedMentor(data.mentor);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <LoadingSpinner label="Loading profile…" className="min-h-[50vh]" />;
  }

  if (error || !payload) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-red-800 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">{error}</p>
        <Link to="/mentors" className="inline-block mt-6 text-sm text-amber-800 font-medium underline">
          ← Back to mentors
        </Link>
      </main>
    );
  }

  const { mentor, reviews } = payload;
  const name = mentor.name ?? 'Mentor';

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/mentors" className="text-sm text-stone-600 hover:text-stone-900 mb-8 inline-block">
        ← Browse mentors
      </Link>

      <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-stone-900">{name}</h1>
        <p className="text-stone-600 mt-1">
          {mentor.title}
          {mentor.company ? ` · ${mentor.company}` : ''}
        </p>
        {mentor.industry ? (
          <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold mt-2">{mentor.industry}</p>
        ) : null}

        {reviews.count > 0 ? (
          <p className="text-sm text-stone-500 mt-4">
            {reviews.count} review{reviews.count === 1 ? '' : 's'}
            {reviews.average != null ? ` · ${reviews.average.toFixed(1)} avg rating` : ''}
          </p>
        ) : (
          <p className="text-sm text-stone-400 mt-4">No reviews yet.</p>
        )}

        {mentor.bio ? <p className="text-stone-700 mt-6 leading-relaxed whitespace-pre-wrap">{mentor.bio}</p> : null}

        {mentor.expertise?.length ? (
          <div className="flex flex-wrap gap-2 mt-6">
            {mentor.expertise.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <p className="text-sm text-stone-500 mt-6">
          {mentor.years_experience} years experience · {mentor.total_sessions} sessions
        </p>
      </div>
    </main>
  );
}
