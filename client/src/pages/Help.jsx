export default function Help() {
    const topics = [
        { title: 'Getting Started', items: ['Creating an account', 'Finding a mentor', 'Booking your first session', 'Preparing for a session'] },
        { title: 'Billing & Payments', items: ['Payment methods', 'Refund policy', 'Invoices and receipts', 'Subscription management'] },
        { title: 'Sessions', items: ['Rescheduling a session', 'Canceling a session', 'Technical issues during calls', 'Session recordings'] },
        { title: 'For Mentors', items: ['Becoming a mentor', 'Setting your rates', 'Managing your calendar', 'Payout schedule'] },
    ];
    return (
        <div className="max-w-5xl mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold mb-6">Help Center</h1>
            <p className="text-lg text-gray-700 mb-10">Find answers, guides, and resources to make the most of the platform.</p>
            <div className="grid md:grid-cols-2 gap-6">
                {topics.map((t, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">{t.title}</h2>
                        <ul className="space-y-2">
                            {t.items.map((item, j) => (
                                <li key={j} className="text-blue-600 hover:underline cursor-pointer">→ {item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}