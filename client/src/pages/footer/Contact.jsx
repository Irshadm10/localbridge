import { useState } from 'react';
import { Mail, Phone, MapPin, ShieldAlert, CheckCircle2, Send, ArrowRight, Loader2 } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';
import { COMPANY_EMAIL, generateTicketId } from '../../config/contact';
import { sendSupportEmail } from '../../api/supportEmail';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', topic: 'General question', message: '' });
    const [sent, setSent] = useState(false);
    const [ticketId, setTicketId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.email || !form.message || submitting) return;

        const id = generateTicketId();
        const subject = `[${form.topic}] [#${id}] Bridge contact from ${form.name}`;
        const body = [
            `Topic: ${form.topic}`,
            `From: ${form.name} <${form.email}>`,
            '',
            form.message,
        ].join('\n');

        setSubmitting(true);
        setSubmitError(null);
        try {
            await sendSupportEmail({
                kind: 'contact',
                ticketId: id,
                subject,
                body,
                replyTo: form.email,
                fromName: form.name,
                meta: {
                    Topic: form.topic,
                    Name: form.name,
                    Email: form.email,
                    Page: typeof window !== 'undefined' ? window.location.href : '',
                    Submitted: new Date().toISOString(),
                },
            });
            setTicketId(id);
            setSent(true);
        } catch (err) {
            setSubmitError(err?.message || 'Could not send your message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    const cards = [
        { Icon: Mail, eyebrow: 'Email', primary: COMPANY_EMAIL, secondary: 'Reply within 24 hours', hue: 'from-orange-500 to-amber-500' },
        { Icon: Phone, eyebrow: 'Phone', primary: '+1 (555) 123-4567', secondary: 'Mon–Fri, 9am–6pm PT', hue: 'from-sky-500 to-indigo-500' },
        { Icon: MapPin, eyebrow: 'Office', primary: '525 Market Street', secondary: 'San Francisco, CA 94105', hue: 'from-emerald-500 to-teal-500' },
    ];

    return (
        <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[50vmax] w-[80vmax] -translate-x-1/2 opacity-55 dark:opacity-80"
                style={{
                    background:
                        'conic-gradient(from 160deg at 50% 50%, rgba(251,146,60,0.15), rgba(253,230,138,0.1), rgba(234,88,12,0.18), rgba(251,146,60,0.15))',
                    filter: 'blur(100px)',
                }}
            />

            <div className="relative mx-auto max-w-bridge">
                <Reveal className="mb-14 max-w-2xl">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 shadow-sm backdrop-blur-md">
                        <Send className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-secondary)]">Contact support</span>
                    </div>
                    <h1 className="font-display text-[2.5rem] font-bold leading-[1.08] tracking-[-0.012em] text-[var(--bridge-text)] sm:text-[3.25rem] lg:text-[3.75rem]">
                        Reach the humans who can{' '}
                        <span className="font-editorial italic text-gradient-bridge">actually help</span>.
                    </h1>
                    <p className="mt-5 text-lg text-[var(--bridge-text-secondary)]">
                        We respond to every message within 24 hours, usually faster.
                    </p>
                </Reveal>

                <div className="grid gap-6 lg:grid-cols-5">
                    <Reveal className="lg:col-span-2">
                        <div className="space-y-4">
                            {cards.map(({ Icon, eyebrow, primary, secondary, hue }) => (
                                <div
                                    key={eyebrow}
                                    className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 shadow-bridge-tile backdrop-blur-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-bridge-card cursor-glow"
                                >
                                    <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-orange-400/15 to-transparent opacity-0 blur-2xl transition group-hover:opacity-100" />
                                    <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${hue} text-white shadow-[0_8px_22px_-6px_rgba(234,88,12,0.4)] transition-transform duration-500 group-hover:scale-[1.04]`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="relative min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-muted)]">{eyebrow}</p>
                                        <p className="mt-1 font-display text-lg font-semibold text-[var(--bridge-text)]">{primary}</p>
                                        <p className="mt-0.5 text-sm text-[var(--bridge-text-muted)]">{secondary}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="relative flex items-start gap-4 overflow-hidden rounded-2xl border border-red-300/40 bg-gradient-to-br from-red-50 to-orange-50 p-5 shadow-bridge-tile dark:border-red-400/30 dark:from-red-500/10 dark:to-orange-500/10">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-[0_8px_22px_-6px_rgba(239,68,68,0.4)]">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800 dark:text-red-200">Urgent?</p>
                                    <p className="mt-1.5 text-sm leading-relaxed text-red-900/95 dark:text-red-100/90">
                                        For Trust &amp; Safety issues, use the{' '}
                                        <a href="/trust" className="font-bold underline decoration-red-300 underline-offset-2 hover:text-red-950">
                                            Trust &amp; Safety report form
                                        </a>
                                        {' '}— reviewed within 4 hours and routed to{' '}
                                        <span className="font-semibold">{COMPANY_EMAIL}</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={100} className="lg:col-span-3">
                        <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-float backdrop-blur-xl">
                            <div aria-hidden className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
                            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-400/20 blur-3xl" />
                            <div className="relative p-8 sm:p-10">
                                {sent ? (
                                    <div className="py-10 text-center">
                                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_16px_40px_-8px_rgba(16,185,129,0.55)]">
                                            <CheckCircle2 className="h-10 w-10 text-white" />
                                        </div>
                                        <h2 className="mt-6 font-display text-3xl font-bold text-[var(--bridge-text)]">Message sent</h2>
                                        <p className="mt-3 text-[var(--bridge-text-secondary)]">
                                            We&apos;ll be in touch at <span className="font-semibold text-[var(--bridge-text)]">{form.email}</span> shortly.
                                        </p>
                                        {ticketId && (
                                            <div className="mx-auto mt-5 inline-flex flex-col items-center gap-1 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-5 py-3 text-left">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-muted)]">Ticket number</span>
                                                <code className="font-mono text-base font-semibold tracking-wide text-[var(--bridge-text)]">#{ticketId}</code>
                                                <span className="text-[11px] text-[var(--bridge-text-muted)]">Keep this for replies — we&apos;ll reference it in our response.</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                setSent(false);
                                                setTicketId(null);
                                                setForm({ name: '', email: '', topic: 'General question', message: '' });
                                            }}
                                            className={`mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-6 py-3 text-sm font-semibold text-[var(--bridge-text)] transition hover:-translate-y-0.5 hover:border-orange-300/70 hover:shadow-md ${focusRing}`}
                                        >
                                            Send another <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-300">Send us a message</p>
                                            <h2 className="mt-2 font-display text-3xl font-bold text-[var(--bridge-text)]">We read every one</h2>
                                        </div>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">Your name</label>
                                                <input
                                                    required
                                                    value={form.name}
                                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                    className="w-full rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] px-4 py-3.5 text-sm text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:bg-[var(--bridge-surface)] focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">Email</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={form.email}
                                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                    className="w-full rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] px-4 py-3.5 text-sm text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:bg-[var(--bridge-surface)] focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">Topic</label>
                                            <select
                                                value={form.topic}
                                                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                                                className="w-full rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] px-4 py-3.5 text-sm text-[var(--bridge-text)] shadow-inner outline-none transition focus:border-orange-400 focus:bg-[var(--bridge-surface)] focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                                            >
                                                <option>General question</option>
                                                <option>Billing issue</option>
                                                <option>Session problem</option>
                                                <option>Mentor application</option>
                                                <option>Partnership</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">Message</label>
                                            <textarea
                                                required
                                                rows={6}
                                                value={form.message}
                                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                                placeholder="Tell us what's up — the more specific, the better."
                                                className="w-full resize-none rounded-2xl border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] px-4 py-3.5 text-sm text-[var(--bridge-text)] shadow-inner placeholder:text-[var(--bridge-text-faint)] outline-none transition focus:border-orange-400 focus:bg-[var(--bridge-surface)] focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                                            />
                                            <p className="mt-1.5 text-right text-[10px] font-medium text-[var(--bridge-text-faint)]">
                                                {form.message.length} characters
                                            </p>
                                        </div>
                                        {submitError && (
                                            <div role="alert" className="rounded-2xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-100">
                                                {submitError}
                                            </div>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className={`btn-sheen group relative inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 py-4 text-sm font-semibold text-white shadow-[0_14px_36px_-8px_rgba(234,88,12,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-10px_rgba(234,88,12,0.7)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${focusRing}`}
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Sending…
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
                                                    Send message
                                                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </main>
    );
}
