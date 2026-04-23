import { useState, useMemo } from 'react';
import { Search, X, Plus, HelpCircle, ArrowRight } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';

const FAQS = [
    { cat: 'Getting Started', q: 'How does Bridge work?', a: 'Browse 2,400+ vetted mentors by industry, role, or skill. Pick a session format, book an available time slot, and meet over video. Payment is handled securely — you only pay when the session is confirmed.' },
    { cat: 'Getting Started', q: 'Do I need an account to browse?', a: 'No. You can browse the full directory, read profiles, and view reviews without signing up. An account is only required when you book your first session.' },
    { cat: 'Getting Started', q: 'How are mentors vetted?', a: 'Every mentor goes through identity verification, credential review, a portfolio assessment, and a live interview with our team. Fewer than 20% of applicants are approved.' },
    { cat: 'Booking', q: 'How far in advance can I book?', a: 'Up to 60 days in advance. Most mentors open their calendar 2–4 weeks out.' },
    { cat: 'Booking', q: 'Can I reschedule a session?', a: 'Yes, free of charge up to 24 hours before the scheduled time. Later changes may incur a fee at the mentor\u2019s discretion.' },
    { cat: 'Booking', q: 'What if the mentor doesn\u2019t show up?', a: 'Full automatic refund within 24 hours, plus a credit toward your next booking. We take this seriously.' },
    { cat: 'Payment', q: 'How is pricing determined?', a: 'Mentors set their own rates based on experience and demand. Sessions range from $25 to $250+ per hour. The price is shown on every profile before you book.' },
    { cat: 'Payment', q: 'What payment methods do you accept?', a: 'All major credit and debit cards, Apple Pay, Google Pay. We do not store your card details — all payments are processed through Stripe.' },
    { cat: 'Payment', q: 'Do you offer refunds?', a: 'Yes. Full refund anytime before a session begins. Full refund within 48 hours of a completed session if you\u2019re unsatisfied — no questions asked.' },
    { cat: 'Mentors', q: 'Can I become a mentor?', a: 'Yes. Apply through our mentor application page. We review applications on a rolling basis and typically respond within 10 business days.' },
    { cat: 'Mentors', q: 'How much do mentors earn?', a: 'Mentors keep 85% of every session fee. Top mentors on the platform earn $5,000–$15,000 per month in side income.' },
    { cat: 'Privacy', q: 'Is my data secure?', a: 'All data is encrypted in transit and at rest. We\u2019re SOC 2 Type II compliant and never sell personal information to third parties.' },
    { cat: 'Privacy', q: 'Can I stay anonymous?', a: 'Your real name is only shared with mentors you book. You can use a display name publicly. Session transcripts are private to you.' },
];

const CATEGORIES = ['All', ...new Set(FAQS.map((f) => f.cat))];

export default function FAQ() {
    const [open, setOpen] = useState(null);
    const [cat, setCat] = useState('All');
    const [search, setSearch] = useState('');
    const filtered = useMemo(() => {
        return FAQS.filter(
            (f) =>
                (cat === 'All' || f.cat === cat) &&
                (search === '' ||
                    f.q.toLowerCase().includes(search.toLowerCase()) ||
                    f.a.toLowerCase().includes(search.toLowerCase())),
        );
    }, [cat, search]);

    return (
        <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[45vmax] w-[80vmax] -translate-x-1/2 opacity-60 dark:opacity-80"
                style={{
                    background:
                        'conic-gradient(from 190deg at 50% 50%, rgba(251,146,60,0.14), rgba(253,230,138,0.1), rgba(234,88,12,0.18), rgba(251,146,60,0.14))',
                    filter: 'blur(100px)',
                }}
            />

            <div className="relative mx-auto max-w-4xl">
                <Reveal className="mb-12 text-center">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 shadow-sm backdrop-blur-md">
                        <HelpCircle className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-secondary)]">Help center</span>
                    </div>
                    <h1 className="font-display text-[2.5rem] font-bold leading-[1.08] tracking-[-0.012em] text-[var(--bridge-text)] sm:text-[3.25rem] lg:text-[3.75rem]">
                        Questions,{' '}
                        <span className="italic text-gradient-bridge">answered</span>.
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[var(--bridge-text-secondary)]">
                        Can&apos;t find what you&apos;re looking for?{' '}
                        <a href="/contact" className={`inline-flex items-center gap-1 font-semibold text-orange-700 underline decoration-orange-300/60 underline-offset-4 transition hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200 ${focusRing} rounded-sm`}>
                            Contact support
                            <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                    </p>
                </Reveal>

                <Reveal delay={80}>
                    <div className="relative mb-5 group">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--bridge-text-faint)] transition group-focus-within:text-orange-500" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search questions…"
                            className="w-full rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] py-4 pl-12 pr-12 text-base text-[var(--bridge-text)] shadow-bridge-tile placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:shadow-[0_0_0_4px_rgba(251,146,60,0.2)]"
                        />
                        {search ? (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className={`absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--bridge-text-muted)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] ${focusRing}`}
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>
                </Reveal>

                <div className="mb-8 flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCat(c)}
                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                                cat === c
                                    ? 'border-transparent bg-gradient-to-r from-stone-900 to-stone-800 text-amber-50 shadow-[0_6px_20px_-6px_rgba(28,25,23,0.45)] dark:from-orange-500 dark:to-amber-500 dark:text-stone-950 dark:shadow-[0_8px_22px_-6px_rgba(234,88,12,0.5)]'
                                    : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)] hover:-translate-y-0.5 hover:border-orange-300/70 hover:shadow-md'
                            } ${focusRing}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {filtered.map((faq, i) => {
                        const isOpen = open === i;
                        return (
                            <Reveal key={faq.q} delay={i * 40}>
                                <div
                                    className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                                        isOpen
                                            ? 'border-orange-300/60 bg-gradient-to-br from-[var(--bridge-surface)] via-[var(--bridge-surface)] to-orange-50/30 shadow-bridge-card dark:to-orange-500/[0.04]'
                                            : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-tile hover:-translate-y-0.5 hover:border-orange-300/50 hover:shadow-bridge-card'
                                    }`}
                                >
                                    {isOpen ? (
                                        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-orange-400/20 to-transparent blur-3xl" />
                                    ) : null}
                                    <button
                                        onClick={() => setOpen(isOpen ? null : i)}
                                        className={`relative flex w-full items-center justify-between gap-4 p-5 text-left ${focusRing}`}
                                    >
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-300">{faq.cat}</p>
                                            <p className="mt-1 font-display text-base font-semibold text-[var(--bridge-text)] sm:text-lg">{faq.q}</p>
                                        </div>
                                        <span
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                                                isOpen
                                                    ? 'rotate-45 border-orange-300/70 bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_4px_14px_-2px_rgba(234,88,12,0.55)]'
                                                    : 'border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-muted)]'
                                            }`}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </span>
                                    </button>
                                    {isOpen ? (
                                        <div className="relative border-t border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/50 px-5 pb-5 pt-4">
                                            <p className="leading-relaxed text-[var(--bridge-text-secondary)]">{faq.a}</p>
                                        </div>
                                    ) : null}
                                </div>
                            </Reveal>
                        );
                    })}
                    {filtered.length === 0 ? (
                        <div className="relative overflow-hidden rounded-2xl border border-dashed border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)]/60 px-8 py-14 text-center">
                            <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-300/25 to-transparent blur-3xl" />
                            <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_10px_30px_-6px_rgba(234,88,12,0.5)]">
                                <HelpCircle className="h-6 w-6" />
                            </div>
                            <p className="relative font-display text-lg font-semibold text-[var(--bridge-text)]">No matches.</p>
                            <p className="relative mt-1 text-sm text-[var(--bridge-text-muted)]">Try a different search or category.</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </main>
    );
}
