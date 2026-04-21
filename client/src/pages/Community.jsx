export default function Community() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold mb-6">Community</h1>
            <p className="text-lg text-gray-700 mb-10">Join a global network of learners and mentors pushing each other to grow.</p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gray-50 rounded-lg p-6 text-center"><p className="text-3xl font-bold text-blue-600">50,000+</p><p className="text-gray-700 mt-1">Active Members</p></div>
                <div className="bg-gray-50 rounded-lg p-6 text-center"><p className="text-3xl font-bold text-blue-600">2,400+</p><p className="text-gray-700 mt-1">Expert Mentors</p></div>
                <div className="bg-gray-50 rounded-lg p-6 text-center"><p className="text-3xl font-bold text-blue-600">120</p><p className="text-gray-700 mt-1">Countries</p></div>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Ways to Get Involved</h2>
            <div className="space-y-4 mb-10">
                <div className="border border-gray-200 rounded-lg p-5"><h3 className="font-semibold mb-1">Discord Server</h3><p className="text-gray-700">Real-time conversations, peer support, and weekly AMAs with top mentors.</p></div>
                <div className="border border-gray-200 rounded-lg p-5"><h3 className="font-semibold mb-1">Monthly Meetups</h3><p className="text-gray-700">In-person events in 20+ cities. Network, learn, and find your next mentor in person.</p></div>
                <div className="border border-gray-200 rounded-lg p-5"><h3 className="font-semibold mb-1">Newsletter</h3><p className="text-gray-700">Weekly insights from mentors, community highlights, and early access to new features.</p></div>
            </div>
        </div>
    );
}