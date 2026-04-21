import { useState } from 'react';
import Reveal from '../../components/Reveal';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

const EVENTS = [
    { date: 'May 8, 2026', city: 'San Francisco', title: 'Career pivots: Finance to tech', spots: 12 },
    { date: 'May 14, 2026', city: 'New York', title: 'Negotiation workshop with ex-FAANG recruiters', spots: 8 },
    { date: 'May 22, 2026', city: 'London', title: 'Breaking into product management', spots: 18 },
    { date: 'Jun 3, 2026', city: 'Remote', title: 'AMA: Founders who raised in 2025', spots: 150 },
    { date: 'Jun 12, 2026', city: 'Austin', title: 'Engineering leadership roundtable', spots: 15 },
];

export default function Community() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [rsvps, setRsvps] = useState({});
    const stats = [
        { n: '50,000+', label: 'Active members' },
        { n: '2,400+', label: 'Expert mentors' },
        { n: '120', label: 'Countries' },
        { n: '4,800+', label: 'Sessions booked' },
    ];

    function subscribe(e) {
        e.preventDefault();
        if (email) setSubscribed(true);
    }

    return (
        <main className="relative min-h-screen bg-gradient-to-b from-[#fffaf3] via-[#fff4e3] to-[#fffaf3] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <Reveal className="mb-12 max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Community</p>
                    <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-stone-900 sm:text-5xl">More than a directory. A <span className="italic text-gradient-bridge">place</span>.</h1>
                    <p className="mt-5 text-lg text-stone-600">50,000 people pushing each other forward. Here's how to plug in.</p>
                </Reveal>

                <div className="mb-16 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {stats.map((s, i) => (
                        <Reveal key={s.label} delay={i * 50}>
                            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 text-center shadow-sm">
                                <p className="font-display text-3xl font-semibold text-gradient-bridge">{s.n}</p>
                                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-stone-500">{s.label}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal>
                    <div className="mb-14">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Upcoming events</p>
                        <h2 className="mt-3 font-display text-3xl font-semibold text-stone-900">Meet the community in person.</h2>
                        <div className="mt-6 space-y-3">
                            {EVENTS.map((e, i) => (
                                <div key={i} className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm transition hover:border-orange-300/70">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex gap-4">
                                            <div className="shrink-0 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 px-4 py-2 text-center">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-800">{e.date.split(',')[0].split(' ')[0]}</p>
                                                <p className="font-display text-xl font-semibold text-stone-900">{e.date.split(' ')[1].replace(',', '')}</p>
                                            </div>
                                            <div>
                                                <p className="font-display text-lg font-semibold text-stone-900">{e.title}</p>
                                                <p className="mt-1 text-sm text-stone-600">{e.city} · {e.spots - (rsvps[i] ? 1 : 0)} spots left</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setRsvps({ ...rsvps, [i]: !rsvps[i] })} className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition ${rsvps[i] ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-900 text-amber-50 hover:bg-stone-800'} ${focusRing}`}>
                                            {rsvps[i] ? '✓ RSVP\'d' : 'RSVP'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>

                <div className="grid gap-5 md:grid-cols-2">
                    <Reveal>
                        <div className="h-full rounded-[1.75rem] border border-stone-200/90 bg-white p-8 shadow-bridge-card">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Discord</p>
                            <h3 className="mt-3 font-display text-2xl font-semibold text-stone-900">Real-time conversations.</h3>
                            <p className="mt-3 leading-relaxed text-stone-600">Peer support, weekly AMAs with top mentors, and channels organized by industry. 24/7 conversation with people further along your path.</p>
                            <a href="#" className={`mt-6 inline-flex rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-amber-50 transition hover:bg-stone-800 ${focusRing}`}>Join Discord →</a>
                        </div>
                    </Reveal>
                    <Reveal delay={80}>
                        <div className="h-full rounded-[1.75rem] border border-orange-200/70 bg-gradient-to-br from-orange-50/60 to-amber-50/40 p-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Newsletter</p>
                            <h3 className="mt-3 font-display text-2xl font-semibold text-stone-900">Weekly, actually useful.</h3>
                            <p className="mt-3 leading-relaxed text-stone-600">Insights from mentors, community highlights, early access to new features. Sent Sundays. Unsubscribe anytime.</p>
                            {subscribed ? (
                                <p className="mt-6 rounded-xl bg-white p-4 font-semibold text-emerald-800">✓ Subscribed. Check your inbox.</p>
                            ) : (
                                <form onSubmit={subscribe} className="mt-6 flex gap-2">
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={`flex-1 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm ${focusRing}`} />
                                    <button type="submit" className={`shrink-0 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-orange-500 hover:to-amber-400 ${focusRing}`}>Subscribe</button>
                                </form>
                            )}
                        </div>
                    </Reveal>
                </div>
            </div>
        </main>
    );
}