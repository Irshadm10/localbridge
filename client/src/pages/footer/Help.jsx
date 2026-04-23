import { useState, useMemo } from 'react';
import { Search, ArrowLeft, ChevronRight, LifeBuoy, MessageCircle, Sparkles, CreditCard, Calendar, GraduationCap } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';

const CATEGORY_META = {
  'Getting Started': { Icon: Sparkles, hue: 'from-orange-500 to-amber-500' },
  Billing: { Icon: CreditCard, hue: 'from-sky-500 to-indigo-500' },
  Sessions: { Icon: Calendar, hue: 'from-emerald-500 to-teal-500' },
  'For Mentors': { Icon: GraduationCap, hue: 'from-violet-500 to-fuchsia-500' },
};

const ARTICLES = {
    'creating-account': { category: 'Getting Started', title: 'Creating an account', body: `Signing up takes under a minute. Click "Sign up" in the top right, enter your email and a password, and confirm your email when our message hits your inbox.\n\nWe never require phone verification or ID upload for mentees. Only mentors go through extended verification.\n\nIf you don't see the confirmation email within 5 minutes, check your spam folder. Still nothing? Contact mentors.bridge@gmail.com.` },
    'finding-mentor': { category: 'Getting Started', title: 'Finding the right mentor', body: `Use the filters on the Mentors page: industry, role, company size, and specific skills. Read the full bio — not just the tagline. The bio is where real mentors distinguish themselves.\n\nCheck their session count and rating, but don't over-weight them. A mentor with 8 sessions and 5.0 rating may be better for your specific situation than one with 200 sessions.\n\nRead at least three reviews before booking.` },
    'first-session': { category: 'Getting Started', title: 'Booking your first session', body: `Click "Book a session" on the mentor's profile. Pick a session format — Career Advice, Interview Prep, Resume Review, or Networking. Choose a date from the calendar, then a time slot.\n\nYou'll see the total price before confirming. Payment is held until 24 hours after the session completes, so if anything goes wrong you get an automatic refund.` },
    'preparing-session': { category: 'Getting Started', title: 'Preparing for a session', body: `Write down the ONE thing you want to walk away knowing. Not five things — one. Share it with the mentor in the booking note 24 hours before.\n\nIf you're sharing documents (resume, code, pitch deck), send them at least 6 hours ahead so the mentor can actually review.\n\nTest your video and audio 10 minutes before. Nothing wastes a session faster than "can you hear me now?"` },
    'payment-methods': { category: 'Billing', title: 'Payment methods', body: `We accept all major credit and debit cards (Visa, Mastercard, Amex, Discover), Apple Pay, and Google Pay. Bank transfers aren't supported for session bookings.\n\nYour card is not charged until the mentor confirms the session. For Pro and Premium subscriptions, you're billed monthly or annually depending on your plan.` },
    'refund-policy': { category: 'Billing', title: 'Refund policy', body: `Before a session: 100% refund, any time.\n\nAfter a session: 100% refund within 48 hours if you're unsatisfied. No explanation required — we take your word for it.\n\nMentor no-shows: Automatic full refund plus credit toward your next booking.` },
    'reschedule': { category: 'Sessions', title: 'Rescheduling a session', body: `Go to your Dashboard → Upcoming Sessions → click the session. Use "Reschedule" to pick a new time from the mentor's availability.\n\nFree up to 24 hours before the session. Inside 24 hours, the mentor may charge a rescheduling fee at their discretion.` },
    'cancel': { category: 'Sessions', title: 'Canceling a session', body: `From your Dashboard, open the session and click "Cancel." Full refund issued if more than 24 hours before the session starts. Inside 24 hours, refunds are at the mentor's discretion.\n\nWe don't penalize occasional cancellations. Repeated last-minute cancellations may limit your ability to book.` },
    'technical': { category: 'Sessions', title: 'Technical issues during a call', body: `If the video call drops, try rejoining from the same link. If problems persist for more than 5 minutes, end the call and message the mentor through the platform — they'll restart or reschedule.\n\nUse Chrome, Safari, or Firefox (latest versions). Mobile works but desktop is more reliable for screen sharing.` },
    'mentor-apply': { category: 'For Mentors', title: 'Becoming a mentor', body: `Apply at /become-a-mentor. You'll need: 5+ years of relevant professional experience, verifiable work history, and ability to commit to at least 2 sessions per month.\n\nThe application includes a portfolio section and a 30-minute interview with our team. Response time: 10 business days.` },
    'mentor-rates': { category: 'For Mentors', title: 'Setting your rates', body: `You set your own rates per session format. Most mentors charge $50–$150 per session. Update rates anytime in your dashboard.\n\nBridge takes a 15% platform fee. You keep 85% of every session fee. Payouts are weekly via Stripe Connect.` },
};

const CATEGORIES = [
    { name: 'Getting Started', icon: '🚀', keys: ['creating-account', 'finding-mentor', 'first-session', 'preparing-session'] },
    { name: 'Billing', icon: '💳', keys: ['payment-methods', 'refund-policy'] },
    { name: 'Sessions', icon: '📅', keys: ['reschedule', 'cancel', 'technical'] },
    { name: 'For Mentors', icon: '👤', keys: ['mentor-apply', 'mentor-rates'] },
];

export default function Help() {
    const [active, setActive] = useState(null);
    const [search, setSearch] = useState('');
    const results = useMemo(() => {
        if (!search) return [];
        const q = search.toLowerCase();
        return Object.entries(ARTICLES).filter(([, a]) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q));
    }, [search]);

    if (active) {
        const article = ARTICLES[active];
        return (
            <main className={`${pageShell} px-4 py-16 sm:px-6 sm:py-20 lg:px-8`}>
                <article className="mx-auto max-w-3xl">
                    <button
                        onClick={() => setActive(null)}
                        className={`mb-8 inline-flex items-center gap-1.5 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 text-sm font-semibold text-[var(--bridge-text-secondary)] shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300/70 hover:text-orange-700 hover:shadow-md dark:hover:text-orange-300 ${focusRing}`}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to help center
                    </button>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-700 dark:text-orange-300">{article.category}</p>
                    <h1 className="mt-3 font-display text-[2.5rem] font-bold leading-[1.08] tracking-[-0.012em] text-[var(--bridge-text)] sm:text-[3.25rem]">
                        {article.title}
                    </h1>
                    <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--bridge-text-secondary)]">
                        {article.body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                    <div className="relative mt-12 overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-gradient-to-br from-[var(--bridge-surface)] via-[var(--bridge-surface)] to-orange-50/30 p-7 shadow-bridge-card dark:to-orange-500/[0.05]">
                        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-orange-400/20 to-transparent blur-3xl" />
                        <div className="relative flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_8px_22px_-4px_rgba(234,88,12,0.45)]">
                                <LifeBuoy className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-display text-lg font-semibold text-[var(--bridge-text)]">Still need help?</p>
                                <p className="mt-1.5 text-sm text-[var(--bridge-text-secondary)]">
                                    Can&apos;t find what you&apos;re looking for?{' '}
                                    <a href="/contact" className="font-semibold text-orange-700 underline decoration-orange-300/60 underline-offset-4 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200">
                                        Contact support
                                    </a>{' '}
                                    — we reply within 24 hours.
                                </p>
                            </div>
                        </div>
                    </div>
                </article>
            </main>
        );
    }

    return (
        <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[45vmax] w-[80vmax] -translate-x-1/2 opacity-55 dark:opacity-80"
                style={{
                    background:
                        'conic-gradient(from 200deg at 50% 50%, rgba(251,146,60,0.14), rgba(253,230,138,0.1), rgba(234,88,12,0.18), rgba(251,146,60,0.14))',
                    filter: 'blur(100px)',
                }}
            />
            <div className="relative mx-auto max-w-5xl">
                <Reveal className="mb-12 text-center">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 shadow-sm backdrop-blur-md">
                        <LifeBuoy className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-secondary)]">Help center</span>
                    </div>
                    <h1 className="font-display text-[2.5rem] font-bold leading-[1.08] tracking-[-0.012em] text-[var(--bridge-text)] sm:text-[3.25rem] lg:text-[3.75rem]">
                        How can we <span className="font-editorial italic text-gradient-bridge">help</span>?
                    </h1>
                </Reveal>

                <Reveal delay={80}>
                    <div className="relative mx-auto mb-14 max-w-2xl group">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--bridge-text-faint)] transition group-focus-within:text-orange-500" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search help articles…"
                            className="w-full rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] py-4 pl-12 pr-4 text-base text-[var(--bridge-text)] shadow-bridge-tile placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:shadow-[0_0_0_4px_rgba(251,146,60,0.2)]"
                        />
                    </div>
                </Reveal>

                {search ? (
                    <div className="space-y-3">
                        <p className="mb-4 text-sm font-semibold text-[var(--bridge-text-muted)]">
                            {results.length} result{results.length !== 1 && 's'}
                        </p>
                        {results.map(([key, a]) => (
                            <button
                                key={key}
                                onClick={() => setActive(key)}
                                className={`group flex w-full items-center gap-4 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 text-left shadow-bridge-tile transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300/70 hover:shadow-bridge-card ${focusRing}`}
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-300">{a.category}</p>
                                    <p className="mt-1 font-display text-lg font-semibold text-[var(--bridge-text)]">{a.title}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-[var(--bridge-text-faint)] transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {CATEGORIES.map((cat, i) => {
                            const meta = CATEGORY_META[cat.name] ?? CATEGORY_META['Getting Started'];
                            return (
                                <Reveal key={cat.name} delay={i * 80}>
                                    <div className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-tile transition-all duration-500 hover:-translate-y-1 hover:shadow-bridge-card cursor-glow">
                                        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br from-orange-400/15 to-transparent opacity-0 blur-3xl transition group-hover:opacity-100" />
                                        <div className="relative flex items-center gap-3">
                                            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.hue} text-white shadow-[0_8px_22px_-4px_rgba(234,88,12,0.4)] transition group-hover:scale-[1.04]`}>
                                                <meta.Icon className="h-5 w-5" />
                                            </div>
                                            <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)]">{cat.name}</h2>
                                        </div>
                                        <ul className="relative mt-5 space-y-1">
                                            {cat.keys.map((k) => (
                                                <li key={k}>
                                                    <button
                                                        onClick={() => setActive(k)}
                                                        className={`group/row flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--bridge-text-secondary)] transition hover:bg-orange-50/60 hover:text-orange-800 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 ${focusRing}`}
                                                    >
                                                        {ARTICLES[k].title}
                                                        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40 transition group-hover/row:translate-x-0.5 group-hover/row:opacity-100" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                )}

                <Reveal delay={300}>
                    <div className="mt-14 flex flex-col items-center gap-3 rounded-[1.75rem] border border-[var(--bridge-border)] bg-gradient-to-br from-[var(--bridge-surface)] via-[var(--bridge-surface)] to-orange-50/30 p-8 text-center shadow-bridge-tile dark:to-orange-500/[0.04] sm:flex-row sm:justify-between sm:text-left">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-amber-50 dark:from-orange-500 dark:to-amber-500 dark:text-stone-950">
                                <MessageCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-display text-lg font-semibold text-[var(--bridge-text)]">Still stuck?</p>
                                <p className="mt-0.5 text-sm text-[var(--bridge-text-muted)]">We reply to every message within 24 hours.</p>
                            </div>
                        </div>
                        <a
                            href="/contact"
                            className={`btn-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-6px_rgba(234,88,12,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_-8px_rgba(234,88,12,0.7)] ${focusRing}`}
                        >
                            Contact support <ChevronRight className="h-4 w-4" />
                        </a>
                    </div>
                </Reveal>
            </div>
        </main>
    );
}