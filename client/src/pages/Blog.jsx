export default function Blog() {
    const posts = [
        { title: 'How to Find the Right Mentor', date: 'Apr 15, 2026', excerpt: 'A practical guide to identifying mentors who will actually move the needle on your career.' },
        { title: 'The Science of Skill Transfer', date: 'Apr 8, 2026', excerpt: 'What neuroscience tells us about how expertise actually passes from one person to another.' },
        { title: 'Pricing Your Expertise as a Mentor', date: 'Mar 30, 2026', excerpt: 'How top mentors on our platform think about value, pricing, and positioning.' },
        { title: 'From Junior to Senior in 18 Months', date: 'Mar 22, 2026', excerpt: 'A case study in accelerated career growth through structured mentorship.' },
    ];
    return (
        <div className="max-w-4xl mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold mb-10">Blog</h1>
            <div className="space-y-8">
                {posts.map((post, i) => (
                    <article key={i} className="border-b border-gray-200 pb-8">
                        <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                        <h2 className="text-2xl font-semibold mb-3 hover:text-blue-600 cursor-pointer">{post.title}</h2>
                        <p className="text-gray-700">{post.excerpt}</p>
                        <button className="text-blue-600 font-medium mt-3">Read more →</button>
                    </article>
                ))}
            </div>
        </div>
    );
}