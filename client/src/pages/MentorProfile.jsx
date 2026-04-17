import { useParams, Link } from 'react-router-dom';
import mockMentors from '../api/mockMentors';

export default function MentorProfile() {
    const { id } = useParams();

    const mentor = mockMentors.find((m) => String(m.id) === String(id));

    if (!mentor) {
        return (
            <main className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-semibold text-stone-900 mb-4">
                    Mentor Not Found
                </h1>
                <p className="text-stone-600 mb-6">
                    We couldn&apos;t find the mentor profile you were looking for.
                </p>
                <Link
                    to="/mentors"
                    className="inline-block px-6 py-3 rounded-full bg-stone-900 text-amber-50 hover:bg-stone-700 transition-colors"
                >
                    Back to Mentors
                </Link>
            </main>
        );
    }

    return (
        <main className="max-w-4xl mx-auto px-6 py-12">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                    {/* Left Side */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-semibold text-stone-900 mb-2">
                            {mentor.name}
                        </h1>

                        <p className="text-lg text-stone-700 mb-1">
                            {mentor.title}
                        </p>

                        <p className="text-stone-500 mb-4">
                            {mentor.company}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {mentor.expertise?.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium"
                                >
                  {tag}
                </span>
                            ))}
                        </div>

                        <p className="text-stone-700 leading-relaxed mb-6">
                            {mentor.bio}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                                <p className="text-sm text-stone-500">Rating</p>
                                <p className="text-lg font-semibold text-stone-900">
                                    ⭐ {mentor.rating}
                                </p>
                            </div>

                            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                                <p className="text-sm text-stone-500">Experience</p>
                                <p className="text-lg font-semibold text-stone-900">
                                    {mentor.years_experience} years
                                </p>
                            </div>

                            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                                <p className="text-sm text-stone-500">Sessions</p>
                                <p className="text-lg font-semibold text-stone-900">
                                    1:1 Mentorship
                                </p>
                            </div>
                        </div>

                        <button className="px-6 py-3 rounded-full bg-stone-900 text-amber-50 hover:bg-stone-700 transition-colors">
                            Book a Session
                        </button>

                        <p className="mt-2 text-sm text-stone-500">
                            Pro plan required for unlimited sessions.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}