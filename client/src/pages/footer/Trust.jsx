import { useState } from 'react';
import { ShieldCheck, Lock, CreditCard, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';
import { generateTicketId } from '../../config/contact';
import { sendSupportEmail } from '../../api/supportEmail';

export default function Trust() {
    const [form, setForm] = useState({ type: 'Conduct issue', description: '', contact: '' });
    const [sent, setSent] = useState(false);
    const [ticketId, setTicketId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const pillars = [
        { title: 'Verified mentors', desc: 'Identity, credentials, and portfolio verified. Under 20% of applicants pass.', stat: '< 20%', Icon: ShieldCheck, hue: 'from-orange-500 to-amber-500' },
        { title: 'Encrypted in transit and at rest', desc: 'AES-256 encryption. SOC 2 Type II compliant.', stat: 'SOC 2', Icon: Lock, hue: 'from-sky-500 to-indigo-500' },
        { title: 'PCI-compliant payments', desc: 'Stripe handles all card processing. We never see your card number.', stat: 'PCI-DSS', Icon: CreditCard, hue: 'from-violet-500 to-fuchsia-500' },
        { title: 'Satisfaction guarantee', desc: '48-hour full refund window on every completed session.', stat: '48 hrs', Icon: Clock, hue: 'from-emerald-500 to-teal-500' },
    ];
    const standards = [
        'Respectful communication in all interactions',
        'No discrimination based on race, gender, sexuality, religion, or background',
        'No sharing of confidential information outside the platform',
        'No solicitation of services outside Bridge\'s payment system',
        'Honest representation of credentials and experience',
        'Prompt cancellation if unable to attend',
    ];

    async function submit(e) {
        e.preventDefault();
        if (!form.description.trim() || submitting) return;
        const id = generateTicketId('SAFE');
        const subject = `[Bridge Trust & Safety] [#${id}] ${form.type}`;

        setSubmitting(true);
        setSubmitError(null);
        try {
            await sendSupportEmail({
                kind: 'safety',
                ticketId: id,
                subject,
                body: form.description,
                replyTo: form.contact || undefined,
                meta: {
                    Concern: form.type,
                    'Reply to': form.contact || '(anonymous)',
                    Page: typeof window !== 'undefined' ? window.location.href : '',
                    Submitted: new Date().toISOString(),
                },
            });
            setTicketId(id);
            setSent(true);
        } catch (err) {
            setSubmitError(err?.message || 'Could not submit your report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

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
                        <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-secondary)]">Trust &amp; Safety</span>
                    </div>
                    <h1 className="font-display text-[2.75rem] font-bold leading-[1.08] tracking-[-0.012em] text-[var(--bridge-text)] sm:text-[3.5rem] lg:text-[4rem]">
                        Your safety isn&apos;t{' '}
                        <span className="font-editorial italic text-gradient-bridge">optional</span>.
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--bridge-text-secondary)]">
                        Here&apos;s exactly how we protect the community, the technical measures we enforce, and how to report anything that doesn&apos;t feel right.
                    </p>
                </Reveal>

                <div className="mb-16 grid gap-5 md:grid-cols-2">
                    {pillars.map((p, i) => (
                        <Reveal key={p.title} delay={i * 80}>
                            <div className="group relative overflow-hidden rounded-[1.5rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-tile transition-all duration-500 hover:-translate-y-1 hover:shadow-bridge-card">
                                <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-orange-400/15 to-transparent opacity-0 blur-3xl transition group-hover:opacity-100" />
                                <div className="relative flex items-start gap-4">
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${p.hue} text-white shadow-[0_10px_26px_-6px_rgba(234,88,12,0.4)] transition group-hover:scale-[1.04]`}>
                                        <p.Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <p className="font-display text-lg font-semibold text-[var(--bridge-text)]">{p.title}</p>
                                            <span className="shrink-0 rounded-full border border-orange-200/70 bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-orange-900 dark:border-orange-400/30 dark:bg-orange-500/15 dark:text-orange-200">
                                                {p.stat}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm leading-relaxed text-[var(--bridge-text-secondary)]">{p.desc}</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal>
                    <div className="relative mb-12 overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-8 shadow-bridge-card sm:p-10">
                        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-orange-400/15 to-transparent blur-3xl" />
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-700 dark:text-orange-300">Community standards</p>
                        <h2 className="mt-3 font-display text-3xl font-bold text-[var(--bridge-text)] sm:text-4xl">
                            What we expect from <span className="font-editorial italic text-gradient-bridge">everyone</span>.
                        </h2>
                        <ul className="relative mt-7 grid gap-3 sm:grid-cols-2">
                            {standards.map((s) => (
                                <li key={s} className="flex items-start gap-3 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-4 transition hover:-translate-y-0.5 hover:border-orange-300/50 hover:shadow-bridge-tile">
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-[0_4px_12px_-2px_rgba(16,185,129,0.5)]">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    </span>
                                    <span className="text-sm leading-relaxed text-[var(--bridge-text-secondary)]">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Reveal>

                <Reveal delay={80}>
                    <div className="relative overflow-hidden rounded-[1.75rem] border border-orange-300/40 bg-gradient-to-br from-orange-50 via-amber-50/60 to-white p-8 shadow-bridge-card dark:border-orange-400/25 dark:from-orange-500/10 dark:via-amber-500/5 dark:to-[var(--bridge-surface)] sm:p-10">
                        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-orange-400/30 to-amber-300/15 blur-3xl" />
                        <div className="relative flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-[0_10px_26px_-4px_rgba(239,68,68,0.45)]">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-700 dark:text-orange-300">Report a concern</p>
                                <h2 className="mt-2 font-display text-3xl font-bold text-[var(--bridge-text)]">
                                    Something off? <span className="font-editorial italic text-gradient-bridge">Tell us</span>.
                                </h2>
                                <p className="mt-2 text-[var(--bridge-text-secondary)]">
                                    All reports are confidential and reviewed within 4 hours. You can report anonymously by leaving contact info blank.
                                </p>
                            </div>
                        </div>
                        {sent ? (
                            <div className="relative mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-300/50 bg-[var(--bridge-surface)] p-6 shadow-bridge-tile dark:border-emerald-400/30">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-[0_8px_20px_-4px_rgba(16,185,129,0.5)]">
                                    <CheckCircle2 className="h-5 w-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="font-display text-lg font-semibold text-[var(--bridge-text)]">Report received</p>
                                    <p className="text-sm text-[var(--bridge-text-secondary)]">Our team will review within 4 hours.</p>
                                </div>
                                {ticketId && (
                                    <div className="flex flex-col items-start gap-0.5 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-2">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-muted)]">Ticket</span>
                                        <code className="font-mono text-sm font-semibold tracking-wide text-[var(--bridge-text)]">#{ticketId}</code>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={submit} className="relative mt-7 space-y-5">
                                <div>
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">Type of concern</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className="w-full rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-4 py-3.5 text-sm text-[var(--bridge-text)] shadow-inner outline-none transition focus:border-orange-400 focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                                    >
                                        <option>Conduct issue</option>
                                        <option>Harassment or discrimination</option>
                                        <option>Misrepresented credentials</option>
                                        <option>Payment or fraud issue</option>
                                        <option>Privacy violation</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">What happened?</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Describe what happened — the more detail, the faster we can help."
                                        className="w-full resize-none rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-4 py-3.5 text-sm text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">
                                        Your email{' '}
                                        <span className="text-[10px] font-medium normal-case text-[var(--bridge-text-faint)]">
                                            (optional — leave blank to report anonymously)
                                        </span>
                                    </label>
                                    <input
                                        type="email"
                                        value={form.contact}
                                        onChange={(e) => setForm({ ...form, contact: e.target.value })}
                                        className="w-full rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-4 py-3.5 text-sm text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                                    />
                                </div>
                                {submitError && (
                                    <div role="alert" className="rounded-2xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-100">
                                        {submitError}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`btn-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-rose-500 px-8 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-6px_rgba(239,68,68,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_-8px_rgba(239,68,68,0.65)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${focusRing}`}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="h-4 w-4" />
                                            Submit report
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </Reveal>
            </div>
        </main>
    );
}