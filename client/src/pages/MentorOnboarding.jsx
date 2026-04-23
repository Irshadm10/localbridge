import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
    ArrowRight, ArrowLeft, CheckCircle2,
    User, BookOpen, DollarSign, Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import {
    DEFAULT_BIO,
    getMentorOnboardingProfile,
    saveMentorOnboardingStep,
    completeMentorOnboarding,
} from '../api/mentorOnboarding';

const focusRing = 'focus:outline-none focus:ring-2 focus:ring-amber-400/30';

const INDUSTRIES = [
    'technology', 'finance', 'healthcare',
    'marketing', 'data science', 'education', 'law',
];

const STEP_META = [
    { label: 'Professional info', icon: User },
    { label: 'Your story',        icon: BookOpen },
    { label: 'Availability',      icon: DollarSign },
    { label: 'Connect calendar',  icon: Calendar },
];

const inputCls =
    'w-full rounded-2xl border border-stone-200/90 bg-stone-50/50 px-4 py-3.5 text-sm text-stone-900 shadow-inner placeholder:text-stone-400 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30';

const labelCls =
    'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500';

/* ─── Step progress indicator ─────────────────────────────────────────────── */

function StepBar({ current }) {
    return (
        <div className="flex items-start justify-center gap-0">
            {STEP_META.map(({ label }, i) => {
                const num   = i + 1;
                const done  = num < current;
                const active = num === current;
                return (
                    <div key={num} className="flex items-start">
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                    done
                                        ? 'bg-emerald-500 text-white shadow-sm'
                                        : active
                                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                                            : 'bg-stone-100 text-stone-400'
                                }`}
                            >
                                {done ? <CheckCircle2 className="h-4 w-4" /> : num}
                            </div>
                            <span
                                className={`hidden text-[10px] font-semibold sm:block ${
                                    active ? 'text-amber-600' : done ? 'text-emerald-600' : 'text-stone-400'
                                }`}
                            >
                {label}
              </span>
                        </div>
                        {i < STEP_META.length - 1 && (
                            <div
                                className={`mx-2 mt-3.5 h-0.5 w-10 shrink-0 sm:w-16 ${
                                    done ? 'bg-emerald-300' : 'bg-stone-200'
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ─── Card shell ───────────────────────────────────────────────────────────── */

function StepCard({ stepNum, title, Icon, children, footer }) {
    return (
        <div className="overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-[0_24px_60px_-12px_rgba(28,25,23,0.10)] ring-1 ring-amber-100/40">
            <div className="border-b border-stone-100 bg-gradient-to-r from-amber-50/60 to-amber-50/30 px-8 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                        <Icon className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                            Step {stepNum} of 4
                        </p>
                        <h2 className="text-lg font-bold text-stone-900">{title}</h2>
                    </div>
                </div>
            </div>
            <div className="space-y-5 p-8">{children}</div>
            <div className="border-t border-stone-100 px-8 py-5">{footer}</div>
        </div>
    );
}

/* ─── Expertise tag input ─────────────────────────────────────────────────── */

function ExpertiseInput({ tags, onChange }) {
    const [inputVal, setInputVal] = useState('');

    function commit(raw) {
        const tag = raw.trim().toLowerCase();
        if (tag && !tags.includes(tag)) onChange([...tags, tag]);
        setInputVal('');
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit(inputVal);
        } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    }

    return (
        <div className="min-h-[3rem] rounded-2xl border border-stone-200/90 bg-stone-50/50 px-4 py-3 transition focus-within:border-amber-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-400/30">
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900"
                    >
            {tag}
                        <button
                            type="button"
                            onClick={() => onChange(tags.filter((t) => t !== tag))}
                            className="rounded-full text-amber-500 hover:text-amber-900"
                            aria-label={`Remove ${tag}`}
                        >
              ×
            </button>
          </span>
                ))}
                <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => inputVal && commit(inputVal)}
                    placeholder={tags.length === 0 ? 'Type a skill and press Enter…' : 'Add more…'}
                    className="min-w-[10rem] flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
                />
            </div>
        </div>
    );
}

/* ─── Nav buttons ─────────────────────────────────────────────────────────── */

function BackBtn({ onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 ${focusRing}`}
        >
            <ArrowLeft className="h-4 w-4" />
            Back
        </button>
    );
}

function NextBtn({ onClick, saving, label = 'Continue' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={saving}
            className={`flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition disabled:opacity-50 ${focusRing}`}
        >
            {saving ? 'Saving…' : label}
            <ArrowRight className="h-4 w-4" />
        </button>
    );
}

/* ─── Main page ───────────────────────────────────────────────────────────── */

export default function MentorOnboarding() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const isMentor = user?.user_metadata?.role === 'mentor';

    const [step, setStep] = useState(1);
    const [profileId, setProfileId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [error, setError] = useState('');

    // Step 1
    const [name, setName]         = useState('');
    const [title, setTitle]       = useState('');
    const [company, setCompany]   = useState('');
    const [industry, setIndustry] = useState('technology');

    // Step 2
    const [bio, setBio]             = useState('');
    const [expertise, setExpertise] = useState([]);

    // Step 3
    const [yearsExp, setYearsExp]       = useState('');
    const [sessionRate, setSessionRate] = useState('');
    const [available, setAvailable]     = useState(true);

    useEffect(() => {
        if (authLoading || !user || !isMentor) return;

        void (async () => {
            try {
                const profile = await getMentorOnboardingProfile(user.id);
                if (!profile) { setLoadingProfile(false); return; }

                // Already fully set up — send to dashboard
                if (profile.onboarding_complete && profile.calendar_connected) {
                    navigate('/dashboard', { replace: true });
                    return;
                }

                setProfileId(profile.id);
                setName(profile.name ?? '');
                setTitle(profile.title && profile.title !== 'Mentor' ? profile.title : '');
                setCompany(profile.company ?? '');
                setIndustry(profile.industry ?? 'technology');
                const isPlaceholder = !profile.bio || profile.bio.startsWith(DEFAULT_BIO.slice(0, 20));
                setBio(isPlaceholder ? '' : profile.bio);
                setExpertise(Array.isArray(profile.expertise) ? profile.expertise : []);
                setYearsExp(profile.years_experience != null ? String(profile.years_experience) : '');
                setSessionRate(profile.session_rate != null ? String(profile.session_rate) : '');
                setAvailable(profile.available ?? true);

                // Onboarding done but calendar not yet connected — drop into step 4
                if (profile.onboarding_complete) setStep(4);
            } catch (err) {
                setError(err.message ?? 'Could not load your profile.');
            } finally {
                setLoadingProfile(false);
            }
        })();
    }, [user, authLoading, isMentor, navigate]);

    // --- Guards ---
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner message="Loading…" />
            </div>
        );
    }
    if (!user)     return <Navigate to="/login" replace />;
    if (!isMentor) return <Navigate to="/dashboard" replace />;
    if (loadingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner message="Loading your profile…" />
            </div>
        );
    }

    // --- Save helpers ---

    async function save(data) {
        setSaving(true);
        setError('');
        try {
            await saveMentorOnboardingStep(profileId, data);
        } catch (err) {
            setError(err.message ?? 'Failed to save. Please try again.');
            throw err;
        } finally {
            setSaving(false);
        }
    }

    function advance(nextStep) {
        setStep(nextStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Step handlers ---

    async function handleStep1() {
        if (!name.trim())  { setError('Please enter your name.'); return; }
        if (!title.trim()) { setError('Please enter your job title.'); return; }
        try {
            await save({ name: name.trim(), title: title.trim(), company: company.trim() || null, industry });
            advance(2);
        } catch (_) {}
    }

    async function handleStep2() {
        if (bio.trim().length < 30) { setError('Please write at least 30 characters about yourself.'); return; }
        if (expertise.length === 0) { setError('Please add at least one area of expertise.'); return; }
        try {
            await save({ bio: bio.trim(), expertise });
            advance(3);
        } catch (_) {}
    }

    async function handleStep3() {
        if (!yearsExp || isNaN(Number(yearsExp)) || Number(yearsExp) < 0) {
            setError('Please enter your years of experience.');
            return;
        }
        try {
            await save({
                years_experience: Number(yearsExp),
                session_rate: sessionRate ? Number(sessionRate) : null,
                available,
            });
            await completeMentorOnboarding(profileId);
            advance(4);
        } catch (_) {}
    }

    // --- Render ---

    return (
        <main className="relative min-h-screen bg-stone-50" aria-label="Mentor profile setup">
            <PageGutterAtmosphere />

            <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">

                {/* Header */}
                <div className="mb-10 text-center">
          <span className="inline-block rounded-full border border-amber-200/90 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-900 shadow-sm">
            Mentor setup
          </span>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                        Set up your mentor profile
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-stone-500">
                        Complete all four steps. Once you connect Google Calendar you'll go live in the directory.
                    </p>
                </div>

                {/* Step progress bar */}
                <div className="mb-10 flex justify-center">
                    <StepBar current={step} />
                </div>

                {/* Error banner */}
                {error && (
                    <div
                        className="mb-6 rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-900"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {/* ── Step 1: Professional info ── */}
                {step === 1 && (
                    <StepCard
                        stepNum={1}
                        title="Professional info"
                        Icon={User}
                        footer={
                            <div className="flex justify-end">
                                <NextBtn onClick={handleStep1} saving={saving} />
                            </div>
                        }
                    >
                        <div>
                            <label htmlFor="ob-name" className={labelCls}>Full name</label>
                            <input
                                id="ob-name"
                                type="text"
                                autoComplete="name"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(''); }}
                                className={inputCls}
                                placeholder="Alex Rivera"
                            />
                        </div>
                        <div>
                            <label htmlFor="ob-title" className={labelCls}>Job title</label>
                            <input
                                id="ob-title"
                                type="text"
                                value={title}
                                onChange={(e) => { setTitle(e.target.value); setError(''); }}
                                className={inputCls}
                                placeholder="Senior Product Manager"
                            />
                        </div>
                        <div>
                            <label htmlFor="ob-company" className={labelCls}>
                                Company{' '}
                                <span className="normal-case font-normal text-stone-400">(optional)</span>
                            </label>
                            <input
                                id="ob-company"
                                type="text"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className={inputCls}
                                placeholder="Acme Inc."
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Industry</label>
                            <div className="mt-1 flex flex-wrap gap-2">
                                {INDUSTRIES.map((ind) => (
                                    <button
                                        key={ind}
                                        type="button"
                                        onClick={() => setIndustry(ind)}
                                        className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${
                                            industry === ind
                                                ? 'bg-stone-900 text-amber-50 shadow-sm'
                                                : `border border-stone-200 bg-white text-stone-600 hover:border-amber-300/60 ${focusRing}`
                                        }`}
                                    >
                                        {ind}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </StepCard>
                )}

                {/* ── Step 2: Your story ── */}
                {step === 2 && (
                    <StepCard
                        stepNum={2}
                        title="Your story"
                        Icon={BookOpen}
                        footer={
                            <div className="flex items-center justify-between">
                                <BackBtn onClick={() => { setStep(1); setError(''); }} />
                                <NextBtn onClick={handleStep2} saving={saving} />
                            </div>
                        }
                    >
                        <div>
                            <label htmlFor="ob-bio" className={labelCls}>
                                Bio{' '}
                                <span className="normal-case font-normal text-stone-400">(minimum 30 characters)</span>
                            </label>
                            <textarea
                                id="ob-bio"
                                rows={5}
                                value={bio}
                                onChange={(e) => { setBio(e.target.value); setError(''); }}
                                className={`${inputCls} resize-none`}
                                placeholder="I've spent 8 years in product at startups and large tech companies. I care about career transitions, PM frameworks, and helping people break into product without a traditional background…"
                            />
                            <p className="mt-1.5 text-right text-xs text-stone-400">{bio.length} chars</p>
                        </div>
                        <div>
                            <label className={labelCls}>Areas of expertise</label>
                            <ExpertiseInput tags={expertise} onChange={(tags) => { setExpertise(tags); setError(''); }} />
                            <p className="mt-1.5 text-xs text-stone-400">
                                Press Enter or comma after each skill.
                            </p>
                        </div>
                    </StepCard>
                )}

                {/* ── Step 3: Availability & rate ── */}
                {step === 3 && (
                    <StepCard
                        stepNum={3}
                        title="Availability & rate"
                        Icon={DollarSign}
                        footer={
                            <div className="flex items-center justify-between">
                                <BackBtn onClick={() => { setStep(2); setError(''); }} />
                                <NextBtn onClick={handleStep3} saving={saving} />
                            </div>
                        }
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="ob-years" className={labelCls}>Years of experience</label>
                                <input
                                    id="ob-years"
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={yearsExp}
                                    onChange={(e) => { setYearsExp(e.target.value); setError(''); }}
                                    className={inputCls}
                                    placeholder="8"
                                />
                            </div>
                            <div>
                                <label htmlFor="ob-rate" className={labelCls}>
                                    Session rate{' '}
                                    <span className="normal-case font-normal text-stone-400">(optional, USD)</span>
                                </label>
                                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-stone-400">
                    $
                  </span>
                                    <input
                                        id="ob-rate"
                                        type="number"
                                        min="0"
                                        value={sessionRate}
                                        onChange={(e) => setSessionRate(e.target.value)}
                                        className={`${inputCls} pl-8`}
                                        placeholder="50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-50/60 px-5 py-4">
                            <div>
                                <p className="text-sm font-semibold text-stone-800">Available to take sessions</p>
                                <p className="mt-0.5 text-xs text-stone-500">
                                    You can toggle this off anytime from your dashboard.
                                </p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={available}
                                onClick={() => setAvailable((v) => !v)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                                    available ? 'bg-amber-500' : 'bg-stone-200'
                                } ${focusRing}`}
                            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        available ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
                            </button>
                        </div>
                    </StepCard>
                )}

                {/* ── Step 4: Google Calendar (Phase 3 scaffold) ── */}
                {step === 4 && (
                    <div className="overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-[0_24px_60px_-12px_rgba(28,25,23,0.10)] ring-1 ring-amber-100/40">
                        <div className="border-b border-stone-100 bg-gradient-to-r from-amber-50/60 to-amber-50/30 px-8 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                        Step 4 of 4
                                    </p>
                                    <h2 className="text-lg font-bold text-stone-900">
                                        Connect Google Calendar
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5 p-8">
                            {/* Profile complete confirmation */}
                            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-5 py-3.5">
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                                <p className="text-sm font-semibold text-emerald-900">
                                    Profile setup complete — one step left to go live.
                                </p>
                            </div>

                            {/* Calendar connection card */}
                            <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-amber-50/30 p-6 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/60 bg-white shadow-sm">
                                    <Calendar className="h-7 w-7 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-bold text-stone-900">
                                    Google Calendar integration
                                </h3>
                                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-600">
                                    Connect your calendar so new bookings automatically create Google Meet events.
                                    You&apos;ll appear in the mentor directory as soon as this is done.
                                </p>
                                <p className="mt-3 text-xs font-semibold text-amber-700">
                                    Coming soon — credentials are being configured.
                                </p>

                                {/*
                  Phase 3: replace this disabled button with the real OAuth trigger.
                  Call connectGoogleCalendar() from client/src/api/calendar.js.
                  On successful callback, update calendar_connected = true and
                  redirect the mentor to /dashboard.
                */}
                                <button
                                    type="button"
                                    disabled
                                    title="Google Calendar integration coming soon"
                                    className="mx-auto mt-5 flex cursor-not-allowed items-center gap-2.5 rounded-full border border-stone-200/80 bg-white px-6 py-3 text-sm font-semibold text-stone-400 opacity-60 shadow-sm"
                                >
                                    <GoogleIcon />
                                    Connect Google Calendar
                                </button>
                            </div>

                            {/* What you'll get */}
                            <div className="rounded-2xl border border-stone-200/60 bg-stone-50/60 px-5 py-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                                    What happens when it&apos;s connected
                                </p>
                                <ul className="mt-3 space-y-2.5">
                                    {[
                                        'Booking requests automatically create calendar events',
                                        'Google Meet links generated for every session',
                                        'Mentees see the meeting link in their dashboard',
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-sm text-stone-600">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-200 text-stone-500">
                        <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            aria-hidden
                        >
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-stone-100 px-8 py-5">
                            <p className="text-xs text-stone-400">
                                You can connect later — check back when credentials are ready.
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className={`flex items-center gap-2 rounded-full bg-stone-900 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-stone-800 ${focusRing}`}
                            >
                                Go to dashboard
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Skip to dashboard — only visible on steps 1–3 */}
                {step < 4 && (
                    <p className="mt-6 text-center text-xs text-stone-400">
                        Already set this up?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className={`font-semibold text-stone-600 underline hover:text-stone-900 ${focusRing} rounded-sm`}
                        >
                            Go to dashboard
                        </button>
                    </p>
                )}
            </div>
        </main>
    );
}

function GoogleIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    );
}