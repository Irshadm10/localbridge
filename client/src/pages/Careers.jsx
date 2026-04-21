export default function Careers() {
    const jobs = [
        { title: 'Senior Full-Stack Engineer', location: 'Remote', type: 'Full-time' },
        { title: 'Product Designer', location: 'San Francisco', type: 'Full-time' },
        { title: 'Community Manager', location: 'Remote', type: 'Full-time' },
        { title: 'Growth Marketing Lead', location: 'New York', type: 'Full-time' },
    ];
    return (
        <div className="max-w-4xl mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold mb-6">Careers</h1>
            <p className="text-lg text-gray-700 mb-10">Join a team that's reshaping how people grow. We're hiring thoughtful, driven people who want to build something that matters.</p>

            <h2 className="text-2xl font-semibold mb-6">Open Roles</h2>
            <div className="space-y-4">
                {jobs.map((job, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-5 hover:border-gray-400 transition">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold">{job.title}</h3>
                                <p className="text-gray-600 text-sm mt-1">{job.location} · {job.type}</p>
                            </div>
                            <button className="text-blue-600 font-medium">Apply →</button>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="text-2xl font-semibold mt-12 mb-4">Why Work Here</h2>
            <ul className="space-y-2 text-gray-700">
                <li>• Competitive salary and equity</li>
                <li>• Comprehensive health, dental, and vision coverage</li>
                <li>• Unlimited PTO with a 3-week minimum</li>
                <li>• $2,000 annual learning stipend</li>
                <li>• Remote-first with optional office access</li>
            </ul>
        </div>
    );
}