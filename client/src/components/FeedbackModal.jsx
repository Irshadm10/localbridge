import { useState, useEffect, useCallback } from 'react';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const focusRingWhite = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900';

const CATEGORIES = [
    { key: 'bug', label: 'Bug report', icon: '🐛', desc: 'Something broken or not working' },
    { key: 'ux', label: 'User experience', icon: '✨', desc: 'Confusing, slow, or could be smoother' },
    { key: 'feature', label: 'Feature request', icon: '💡', desc: 'Something you wish existed' },
    { key: 'mentor', label: 'Mentor feedback', icon: '👤', desc: 'About a mentor or session' },
    { key: 'billing', label: 'Billing / subscription', icon: '💳', desc: 'Payment, plans, or invoices' },
    { key: 'content', label: 'Content / copy', icon: '📝', desc: 'Typos, unclear wording, or docs' },
    { key: 'other', label: 'Other', icon: '💬', desc: 'Doesn\'t fit anywhere else' },
];

const SENTIMENTS = [
    { key: 'love', emoji: '😍', label: 'Love it' },
    { key: 'good', emoji: '🙂', label: 'Good' },
    { key: 'meh', emoji: '😐', label: 'Meh' },
    { key: 'bad', emoji: '😞', label: 'Frustrated' },
];

export default function FeedbackModal({ open, onClose }) {
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState(null);
    const [sentiment, setSentiment] = useState(null);
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleClose = useCallback(() => {
        onClose();
        setTimeout(() => {
            setStep(1); setCategory(null); setSentiment(null); setMessage(''); setEmail(''); setSent(false);
        }, 200);
    }, [onClose]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open, handleClose]);

    if (!open) return null;

    function submit() {
        const payload = {
            category: category?.key,
            sentiment: sentiment?.key,
            message,
            email: email || null,
            url: window.location.pathname,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
        };
        console.log('[Feedback]', payload);
        setSent(true);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
            <button type="button" className="absolute inset-0 bg-stone-950/70 backdrop-blur-[2px]" aria-label="Close" onClick={handleClose} />
            <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-stone-200/90 sm:rounded-3xl">
                {sent ? (
                    <div className="flex flex-col items-center px-8 py-14 text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-4xl text-white shadow-lg">✓</div>
                        <h2 className="font-display text-2xl font-semibold text-stone-900">Thanks for the feedback</h2>
                        <p className="mt-3 max-w-sm leading-relaxed text-stone-600">Every piece of feedback gets read. If you left your email, we'll follow up when relevant.</p>
                        <button type="button" onClick={handleClose} className={`mt-8 rounded-2xl bg-stone-900 px-10 py-3 text-sm font-semibold text-amber-50 shadow-lg transition hover:bg-stone-800 ${focusRing}`}>Done</button>
                    </div>
                ) : (
                    <>
                        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 px-6 pb-6 pt-6 sm:px-7">
                            <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl" />
                            <div className="relative flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/90">Share feedback · Step {step} of 3</p>
                                    <h2 id="feedback-title" className="mt-1.5 font-display text-xl font-semibold text-white">
                                        {step === 1 && 'What kind of feedback?'}
                                        {step === 2 && 'How\'s it going overall?'}
                                        {step === 3 && 'Tell us more'}
                                    </h2>
                                </div>
                                <button type="button" onClick={handleClose} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20 ${focusRingWhite}`} aria-label="Close">×</button>
                            </div>
                            <div className="relative mt-4 flex gap-1.5">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className={`h-1 flex-1 rounded-full transition ${n <= step ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-white/10'}`} />
                                ))}
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-7">
                            {step === 1 && (
                                <div className="space-y-2">
                                    {CATEGORIES.map((c) => (
                                        <button
                                            key={c.key}
                                            type="button"
                                            onClick={() => { setCategory(c); setStep(2); }}
                                            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition ${category?.key === c.key ? 'border-orange-400 bg-orange-50/60' : 'border-stone-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'} ${focusRing}`}
                                        >
                                            <span className="text-2xl">{c.icon}</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-stone-900">{c.label}</p>
                                                <p className="text-xs text-stone-500">{c.desc}</p>
                                            </div>
                                            <svg className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" /></svg>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {SENTIMENTS.map((s) => (
                                        <button
                                            key={s.key}
                                            type="button"
                                            onClick={() => { setSentiment(s); setStep(3); }}
                                            className={`flex flex-col items-center gap-2 rounded-xl border py-5 transition ${sentiment?.key === s.key ? 'border-orange-400 bg-orange-50/60' : 'border-stone-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'} ${focusRing}`}
                                        >
                                            <span className="text-4xl">{s.emoji}</span>
                                            <span className="text-xs font-semibold text-stone-700">{s.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                    <div className="rounded-xl border border-stone-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-3.5">
                                        <p className="text-xs text-stone-500">You're reporting</p>
                                        <p className="mt-1 text-sm font-semibold text-stone-900">{category?.icon} {category?.label} · {sentiment?.emoji} {sentiment?.label}</p>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">Your feedback</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={5}
                                            placeholder="What happened? What did you expect? The more specific, the better."
                                            className={`w-full resize-none rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 ${focusRing}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">Email <span className="font-normal normal-case text-stone-400">(optional — only if you want a reply)</span></label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={`w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 ${focusRing}`} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <footer className="shrink-0 border-t border-stone-200/80 bg-white/95 px-6 py-4 sm:px-7">
                            <div className="flex items-center justify-between gap-3">
                                {step > 1 ? (
                                    <button type="button" onClick={() => setStep(step - 1)} className={`text-sm font-semibold text-stone-600 transition hover:text-stone-900 ${focusRing} rounded`}>← Back</button>
                                ) : <span />}
                                {step === 3 ? (
                                    <button type="button" onClick={submit} disabled={!message.trim()} className={`rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}>Send feedback</button>
                                ) : <span />}
                            </div>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
}