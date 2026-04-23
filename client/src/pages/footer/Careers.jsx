import { useState } from 'react';
import { Briefcase, MapPin, ArrowRight, Globe, DollarSign, Gem, Coffee, Heart, BookOpen, Home } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';

const PERK_ICONS = [Globe, Gem, Coffee, Heart, BookOpen, Home];

export default function Careers() {
    const [filter, setFilter] = useState('All');
    const jobs = [
        { title: 'Senior Full-Stack Engineer', team: 'Engineering', location: 'Remote', type: 'Full-time', salary: '$180k–$240k' },
        { title: 'Product Designer', team: 'Design', location: 'San Francisco', type: 'Full-time', salary: '$150k–$200k' },
        { title: 'Community Manager', team: 'Community', location: 'Remote', type: 'Full-time', salary: '$90k–$130k' },
        { title: 'Growth Marketing Lead', team: 'Growth', location: 'New York', type: 'Full-time', salary: '$160k–$210k' },
        { title: 'Senior Backend Engineer', team: 'Engineering', location: 'Remote', type: 'Full-time', salary: '$180k–$240k' },
        { title: 'Trust & Safety Specialist', team: 'Operations', location: 'Remote', type: 'Full-time', salary: '$95k–$135k' },
    ];
    const teams = ['All', ...new Set(jobs.map((j) => j.team))];
    const filtered = filter === 'All' ? jobs : jobs.filter((j) => j.team === filter);
    const perks = [
        { title: 'Fully remote', desc: 'Work from anywhere. Optional office in SF.' },
        { title: 'Competitive equity', desc: 'Meaningful ownership from day one.' },
        { title: 'Unlimited PTO', desc: '3-week minimum. We mean it.' },
        { title: 'Health, dental, vision', desc: 'Top-tier coverage for you and dependents.' },
        { title: 'Learning stipend', desc: '$2,000 annually for books, courses, conferences.' },
        { title: 'Home office budget', desc: '$1,500 to set up your workspace right.' },
    ];

    return (
        <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[45vmax] w-[80vmax] -translate-x-1/2 opacity-55 dark:opacity-80"
                style={{
                    background:
                        'conic-gradient(from 220deg at 50% 50%, rgba(251,146,60,0.14), rgba(253,230,138,0.1), rgba(234,88,12,0.18), rgba(251,146,60,0.14))',
                    filter: 'blur(100px)',
                }}
            />
            <div className="relative mx-auto max-w-5xl">
                <Reveal className="mb-14 max-w-3xl">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 shadow-sm backdrop-blur-md">
                        <Briefcase className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-secondary)]">Careers at Bridge</span>
                    </div>
                    <h1 className="font-display text-[2.75rem] font-bold leading-[1.08] tracking-[-0.012em] text-[var(--bridge-text)] sm:text-[3.5rem] lg:text-[4rem]">
                        Build the platform careers are{' '}
                        <span className="italic text-gradient-bridge">actually</span> built on.
                    </h1>
                    <p className="mt-5 text-lg leading-relaxed text-[var(--bridge-text-secondary)]">
                        We&apos;re small, deliberate, and moving fast. If you want to ship work that changes lives, we should talk.
                    </p>
                </Reveal>

                <Reveal delay={80}>
                    <div className="mb-8 flex flex-wrap gap-2">
                        {teams.map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                                    filter === t
                                        ? 'border-transparent bg-gradient-to-r from-stone-900 to-stone-800 text-amber-50 shadow-[0_6px_20px_-6px_rgba(28,25,23,0.45)] dark:from-orange-500 dark:to-amber-500 dark:text-stone-950 dark:shadow-[0_8px_22px_-6px_rgba(234,88,12,0.5)]'
                                        : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)] hover:-translate-y-0.5 hover:border-orange-300/70 hover:shadow-md'
                                } ${focusRing}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </Reveal>

                <div className="mb-16 space-y-3">
                    {filtered.map((job, i) => (
                        <Reveal key={job.title} delay={i * 60}>
                            <div className="group relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 shadow-bridge-tile transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300/70 hover:shadow-bridge-card sm:p-6">
                                <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-gradient-to-br from-orange-400/15 to-transparent opacity-0 blur-3xl transition group-hover:opacity-100" />
                                <div aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-orange-400 to-amber-300 opacity-0 transition group-hover:opacity-100" />
                                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-secondary)]">
                                            {job.team}
                                        </div>
                                        <p className="mt-2 font-display text-xl font-semibold text-[var(--bridge-text)]">{job.title}</p>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--bridge-text-secondary)]">
                                            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                                            <span className="h-1 w-1 rounded-full bg-[var(--bridge-text-faint)]" aria-hidden />
                                            <span>{job.type}</span>
                                            <span className="h-1 w-1 rounded-full bg-[var(--bridge-text-faint)]" aria-hidden />
                                            <span className="inline-flex items-center gap-1 font-semibold text-orange-700 dark:text-orange-300">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                {job.salary}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className={`btn-sheen group/btn shrink-0 inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-amber-50 shadow-[0_8px_22px_-6px_rgba(28,25,23,0.4)] transition hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-[0_12px_28px_-8px_rgba(28,25,23,0.5)] dark:bg-gradient-to-r dark:from-orange-500 dark:to-amber-500 dark:text-stone-950 ${focusRing}`}
                                    >
                                        Apply
                                        <ArrowRight className="h-4 w-4 transition group-hover/btn:translate-x-0.5" />
                                    </button>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                    {filtered.length === 0 ? (
                        <div className="relative overflow-hidden rounded-2xl border border-dashed border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)]/60 p-12 text-center">
                            <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-300/25 to-transparent blur-3xl" />
                            <p className="relative text-sm text-[var(--bridge-text-muted)]">No open roles in this team right now. Check back soon.</p>
                        </div>
                    ) : null}
                </div>

                <Reveal>
                    <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-8 shadow-bridge-card sm:p-10">
                        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-300/10 blur-3xl" />
                        <p className="relative text-xs font-bold uppercase tracking-[0.22em] text-orange-700 dark:text-orange-300">Why work here</p>
                        <h2 className="relative mt-2 font-display text-3xl font-bold text-[var(--bridge-text)] sm:text-4xl">
                            Perks we <span className="italic text-gradient-bridge">actually</span> invest in.
                        </h2>
                        <div className="relative mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {perks.map((p, i) => {
                                const Icon = PERK_ICONS[i] ?? Globe;
                                return (
                                    <div
                                        key={p.title}
                                        className="group flex items-start gap-3 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300/60 hover:shadow-bridge-tile"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_6px_18px_-4px_rgba(234,88,12,0.4)] transition group-hover:scale-[1.06]">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-[var(--bridge-text)]">{p.title}</p>
                                            <p className="mt-1 text-sm leading-relaxed text-[var(--bridge-text-secondary)]">{p.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Reveal>
            </div>
        </main>
    );
}
