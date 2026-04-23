import { useState } from 'react';
import { Users, MapPin, Calendar, MessageCircle, Mail, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';

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
        <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[45vmax] w-[80vmax] -translate-x-1/2 opacity-55 dark:opacity-80"
                style={{
                    background:
                        'conic-gradient(from 180deg at 50% 50%, rgba(251,146,60,0.14), rgba(253,230,138,0.1), rgba(234,88,12,0.18), rgba(251,146,60,0.14))',
                    filter: 'blur(100px)',
                }}
            />
            <div className="relative mx-auto max-w-bridge">
                <Reveal className="mb-14 max-w-3xl">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 shadow-sm backdrop-blur-md">
                        <Users className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-secondary)]">Community</span>
                    </div>
                    <h1 className="font-display text-[2.75rem] font-bold leading-[1.08] tracking-[-0.012em] text-[var(--bridge-text)] sm:text-[3.5rem] lg:text-[4rem]">
                        More than a directory. A{' '}
                        <span className="italic text-gradient-bridge">place</span>.
                    </h1>
                    <p className="mt-5 text-lg leading-relaxed text-[var(--bridge-text-secondary)]">
                        50,000 people pushing each other forward. Here&apos;s how to plug in.
                    </p>
                </Reveal>

                <div className="mb-16 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                    {stats.map((s, i) => (
                        <Reveal key={s.label} delay={i * 70}>
                            <div className="group relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 text-center shadow-bridge-tile transition-all duration-500 hover:-translate-y-0.5 hover:shadow-bridge-card">
                                <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-orange-400/15 to-transparent opacity-0 blur-2xl transition group-hover:opacity-100" />
                                <p className="relative font-display text-3xl font-bold text-gradient-bridge">{s.n}</p>
                                <p className="relative mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">{s.label}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal>
                    <div className="mb-16">
                        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-700 dark:text-orange-300">Upcoming events</p>
                                <h2 className="mt-2 font-display text-3xl font-bold text-[var(--bridge-text)] sm:text-4xl">
                                    Meet the community <span className="italic text-gradient-bridge">in person</span>.
                                </h2>
                            </div>
                            <p className="text-sm text-[var(--bridge-text-muted)]">RSVP is free — attendance is not.</p>
                        </div>
                        <div className="space-y-3">
                            {EVENTS.map((e, i) => {
                                const rsvpd = Boolean(rsvps[i]);
                                return (
                                    <div
                                        key={i}
                                        className="group relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 shadow-bridge-tile transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300/70 hover:shadow-bridge-card"
                                    >
                                        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br from-orange-400/15 to-transparent opacity-0 blur-3xl transition group-hover:opacity-100" />
                                        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex gap-4">
                                                <div className="relative flex h-20 w-20 shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-orange-200/70 bg-gradient-to-b from-orange-50 to-amber-50 dark:border-orange-400/25 dark:from-orange-500/15 dark:to-amber-500/5">
                                                    <Calendar className="absolute right-2 top-2 h-3 w-3 text-orange-500" />
                                                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-800 dark:text-orange-200">{e.date.split(',')[0].split(' ')[0]}</p>
                                                    <p className="font-display text-2xl font-semibold text-[var(--bridge-text)]">{e.date.split(' ')[1].replace(',', '')}</p>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-display text-lg font-semibold text-[var(--bridge-text)]">{e.title}</p>
                                                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[var(--bridge-text-muted)]">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {e.city}
                                                        <span className="mx-1 h-1 w-1 rounded-full bg-[var(--bridge-text-faint)]" aria-hidden />
                                                        {e.spots - (rsvpd ? 1 : 0)} spots left
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setRsvps({ ...rsvps, [i]: !rsvps[i] })}
                                                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                                                    rsvpd
                                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_8px_22px_-4px_rgba(16,185,129,0.5)]'
                                                        : 'btn-sheen bg-stone-900 text-amber-50 shadow-[0_8px_22px_-4px_rgba(28,25,23,0.4)] hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-[0_12px_28px_-6px_rgba(28,25,23,0.5)] dark:bg-gradient-to-r dark:from-orange-500 dark:to-amber-500 dark:text-stone-950'
                                                } ${focusRing}`}
                                            >
                                                {rsvpd ? (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        RSVP&apos;d
                                                    </span>
                                                ) : (
                                                    'RSVP'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Reveal>

                <div className="grid gap-5 md:grid-cols-2">
                    <Reveal>
                        <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-orange-400/20 bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 p-8 text-white shadow-bridge-float">
                            <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.12] mix-blend-overlay" />
                            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/25 blur-3xl" />
                            <div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" />
                            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-[0_10px_28px_-4px_rgba(99,102,241,0.55)]">
                                <MessageCircle className="h-5 w-5 text-white" />
                            </div>
                            <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.2em] text-amber-200/90">Discord</p>
                            <h3 className="relative mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
                                Real-time conversations.
                            </h3>
                            <p className="relative mt-3 text-stone-300 leading-relaxed">
                                Peer support, weekly AMAs with top mentors, and channels organized by industry. 24/7 conversation with people further along your path.
                            </p>
                            <a
                                href="#"
                                className={`btn-sheen relative mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_-4px_rgba(99,102,241,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-6px_rgba(99,102,241,0.75)] ${focusRing}`}
                            >
                                Join Discord
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                    </Reveal>

                    <Reveal delay={100}>
                        <div className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-8 shadow-bridge-card">
                            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br from-orange-400/25 to-amber-300/10 blur-3xl" />
                            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_10px_28px_-4px_rgba(234,88,12,0.5)]">
                                <Mail className="h-5 w-5" />
                            </div>
                            <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-300">Newsletter</p>
                            <h3 className="relative mt-2 font-display text-2xl font-semibold text-[var(--bridge-text)] sm:text-3xl">
                                Weekly, <span className="italic text-gradient-bridge">actually useful</span>.
                            </h3>
                            <p className="relative mt-3 text-[var(--bridge-text-secondary)] leading-relaxed">
                                Insights from mentors, community highlights, early access to new features. Sent Sundays. Unsubscribe anytime.
                            </p>
                            {subscribed ? (
                                <div className="relative mt-auto flex items-center gap-3 rounded-2xl border border-emerald-300/50 bg-emerald-50/80 px-4 py-3 dark:border-emerald-400/25 dark:bg-emerald-500/10">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
                                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Subscribed. Check your inbox.</p>
                                </div>
                            ) : (
                                <form onSubmit={subscribe} className="relative mt-auto flex gap-2">
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="flex-1 rounded-full border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] px-5 py-3 text-sm text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:bg-[var(--bridge-surface)] focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                                    />
                                    <button
                                        type="submit"
                                        className={`btn-sheen shrink-0 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_-4px_rgba(234,88,12,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-6px_rgba(234,88,12,0.7)] ${focusRing}`}
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Subscribe
                                    </button>
                                </form>
                            )}
                        </div>
                    </Reveal>
                </div>
            </div>
        </main>
    );
}
