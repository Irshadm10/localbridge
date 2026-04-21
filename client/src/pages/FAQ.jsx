import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
    const [open, setOpen] = useState(null);
    const faqs = [
        { q: 'How does the platform work?', a: 'Browse mentors by expertise, book a session that fits your schedule, and meet over video. Payment is handled securely through the platform.' },
        { q: 'How are mentors vetted?', a: 'Every mentor goes through a multi-step review process including credential verification, a portfolio review, and a live interview with our team.' },
        { q: 'What if I\'m not satisfied with a session?', a: 'We offer a satisfaction guarantee. If a session doesn\'t meet expectations, contact support within 48 hours for a full refund.' },
        { q: 'Can I become a mentor?', a: 'Yes. Apply through our mentor application page. We review applications on a rolling basis and typically respond within 10 business days.' },
        { q: 'How is pricing determined?', a: 'Mentors set their own rates based on experience and demand. Sessions range from $50 to $500+ per hour.' },
        { q: 'Do you offer refunds?', a: 'Yes, within 48 hours of a completed session if you\'re unsatisfied, or anytime before a scheduled session begins.' },
        { q: 'Can I reschedule a session?', a: 'Yes, up to 24 hours before the scheduled time at no cost. Later changes may incur a fee at the mentor\'s discretion.' },
        { q: 'Is my data secure?', a: 'All data is encrypted in transit and at rest. We\'re SOC 2 compliant and never share personal information with third parties.' },
    ];
    return (
        <div className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold mb-10">Frequently Asked Questions</h1>
            <div className="space-y-3">
                {faqs.map((faq, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg">
                        <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between items-center p-5 text-left">
                            <span className="font-semibold">{faq.q}</span>
                            <ChevronDown className={`transition-transform ${open === i ? 'rotate-180' : ''}`} size={20} />
                        </button>
                        {open === i && <p className="px-5 pb-5 text-gray-700">{faq.a}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}