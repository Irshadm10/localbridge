import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import Reveal from '../components/Reveal';
import { focusRing } from '../ui';
import EmbeddedCheckoutPanel from '../components/EmbeddedCheckoutPanel';
import { createSubscriptionCheckout, finalizeCheckout } from '../api/stripe';
import CustomCursor from '../components/CustomCursor.jsx';
import { AuroraBg, KineticNumber, Tilt3D, Magnetic } from './dashboard/dashboardCinematic.jsx';

const ANNUAL_DISCOUNT = 0.2;

const MENTOR_TIERS = [
  {
    name: 'Rising',
    rateRange: '$40–$70',
    yearsRange: '0 – 4',
    experienceDesc: 'Early-career professionals and recent grads who have earned their first real wins.',
    useCases: [
      'First job search and resume polish',
      'Breaking into competitive entry-level roles',
      'Building professional habits and early momentum',
    ],
    accent: 'emerald',
    halo: 'rgba(16,185,129,0.30)',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    edgeClass: 'border-emerald-300/35 dark:border-emerald-400/25',
    bgClass: 'bg-gradient-to-br from-emerald-50/40 via-[var(--bridge-surface)] to-emerald-50/20 dark:from-emerald-500/10 dark:via-[var(--bridge-surface)] dark:to-emerald-500/[0.04]',
    accentBar: 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400',
  },
  {
    name: 'Established',
    rateRange: '$75–$120',
    yearsRange: '5 – 9',
    experienceDesc: 'Mid-career contributors with a proven track record and a clear area of focus.',
    useCases: [
      'Mid-level to senior career transitions',
      'Navigating promotion cycles and leveling up',
      'Changing industries or switching functions',
    ],
    accent: 'sky',
    halo: 'rgba(14,165,233,0.30)',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    edgeClass: 'border-sky-300/35 dark:border-sky-400/25',
    bgClass: 'bg-gradient-to-br from-sky-50/40 via-[var(--bridge-surface)] to-sky-50/20 dark:from-sky-500/10 dark:via-[var(--bridge-surface)] dark:to-sky-500/[0.04]',
    accentBar: 'bg-gradient-to-r from-sky-500 via-sky-400 to-blue-400',
  },
  {
    name: 'Expert',
    rateRange: '$125–$175',
    yearsRange: '10 – 15',
    experienceDesc: 'Senior leaders with deep functional expertise and meaningful organizational scope.',
    useCases: [
      'Senior or staff-level interview preparation',
      'Executive communication and cross-functional influence',
      'High-stakes career pivots and role expansions',
    ],
    accent: 'violet',
    halo: 'rgba(139,92,246,0.30)',
    badgeClass: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
    edgeClass: 'border-violet-300/35 dark:border-violet-400/25',
    bgClass: 'bg-gradient-to-br from-violet-50/40 via-[var(--bridge-surface)] to-violet-50/20 dark:from-violet-500/10 dark:via-[var(--bridge-surface)] dark:to-violet-500/[0.04]',
    accentBar: 'bg-gradient-to-r from-violet-500 via-violet-400 to-purple-400',
  },
  {
    name: 'Elite',
    rateRange: '$180–$250',
    yearsRange: '15 +',
    experienceDesc: 'C-suite executives and industry-defining practitioners at the top of their fields.',
    useCases: [
      'VP and C-suite transition coaching',
      'Board-level presence and strategic positioning',
      'Legacy career decisions, exits, and portfolio moves',
    ],
    accent: 'amber',
    halo: 'rgba(234,88,12,0.45)',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_18px_rgba(234,88,12,0.45)]',
    edgeClass: 'border-amber-400/45 ring-1 ring-amber-400/22',
    bgClass: 'bg-gradient-to-br from-amber-50/55 via-[var(--bridge-surface)] to-orange-50/35 dark:from-amber-500/12 dark:via-[var(--bridge-surface)] dark:to-orange-500/8',
    accentBar: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500',
    isElite: true,
  },
];

function formatMoney(n) {
  return n === 0 ? '0' : `${n}`;
}

function tierMonthlyEquivalent(monthly, annual) {
  if (monthly === 0) return 0;
  if (!annual) return monthly;
  return Math.round(monthly * (1 - ANNUAL_DISCOUNT));
}

function CheckCell({ included, highlight }) {
  if (included === true) {
    return (
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-transform duration-300 hover:scale-110 ${
          highlight
            ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_0_14px_rgba(234,88,12,0.55)] ring-1 ring-white/15'
            : 'bg-emerald-500/12 text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-300'
        }`}
        aria-label="Included"
      >
        ✓
      </span>
    );
  }
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-stone-300 dark:text-stone-600"
      aria-label="Not included"
    >
      —
    </span>
  );
}

function PricingFaq({ headingId, items }) {
  return (
    <Tilt3D max={2.5} className="rounded-3xl">
      <section
        className="bd-card-edge relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card sm:p-7"
        aria-labelledby={headingId}
      >
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-400/12 blur-3xl bd-aurora" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-60" />
        <div className="relative flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-65" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
          </span>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">FAQ</p>
        </div>
        <h2 id={headingId} className="relative mt-2 font-display font-black tracking-[-0.025em] text-[var(--bridge-text)]" style={{ fontSize: 'clamp(1.4rem, 2.4vw, 1.85rem)', lineHeight: '1.05' }}>
          Common <span className="text-gradient-bridge italic">questions</span>
        </h2>
        <div className="relative mt-5 overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/60 divide-y divide-[var(--bridge-border)]">
          {items.map((item) => (
            <details key={item.q} className="group px-3 py-0.5 sm:px-4">
              <summary
                data-cursor="hover"
                className={`cursor-pointer list-none py-3.5 pr-7 text-sm font-bold text-[var(--bridge-text)] transition marker:content-none [&::-webkit-details-marker]:hidden ${focusRing} rounded-lg`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">{item.q}</span>
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-muted)] transition-all duration-300 group-open:rotate-180 group-open:border-orange-300/60 group-open:bg-gradient-to-br group-open:from-orange-500/15 group-open:to-amber-500/8 group-open:text-orange-600 dark:group-open:text-orange-300"
                    aria-hidden
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </span>
              </summary>
              <p className="pb-3.5 text-sm leading-relaxed text-[var(--bridge-text-secondary)]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Tilt3D>
  );
}

// ─── Sticky Pricing CTA bar (Pro plan) ──────────────────────────
function StickyPricingBar({ onClick, equivalent, annual }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className={`pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      <div className="pointer-events-auto bd-card-edge relative flex w-full max-w-md items-center gap-3 overflow-hidden rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/92 px-3 py-2 shadow-[0_18px_44px_-12px_rgba(234,88,12,0.5)] backdrop-blur-xl">
        <div aria-hidden className="pointer-events-none absolute -left-12 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-orange-400/22 blur-3xl" />
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-[10px] font-black text-white shadow-[0_0_18px_rgba(234,88,12,0.55)]">PRO</div>
        <div className="relative min-w-0 flex-1">
          <p className="truncate text-[11px] font-black uppercase tracking-[0.16em] text-orange-500">Most popular plan</p>
          <p className="truncate text-[12px] font-bold text-[var(--bridge-text)]">${equivalent}/mo · {annual ? 'billed annually' : 'cancel anytime'}</p>
        </div>
        <Magnetic strength={0.18}>
          <button type="button" onClick={onClick} data-cursor="Choose"
            className="btn-sheen relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2 text-[12px] font-black text-white shadow-[0_8px_20px_-6px_rgba(234,88,12,0.7)] ring-1 ring-white/15 transition-all hover:-translate-y-0.5">
            Choose Pro
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </Magnetic>
      </div>
    </div>,
    document.body,
  );
}

export default function Pricing() {
  const { user } = useAuth();
  const asMentor = user ? isMentorAccount(user) : false;
  const [searchParams, setSearchParams] = useSearchParams();
  const [annual, setAnnual] = useState(false);
  const [billingNote, setBillingNote] = useState(null);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return;

    let cancelled = false;
    void (async () => {
      const result = await finalizeCheckout(sessionId);
      if (cancelled) return;

      if (!result.ok) {
        setPaymentError(result.error || 'Could not verify payment.');
      } else {
        setBillingNote('Subscription payment successful. Your plan is now active.');
      }

      const next = new URLSearchParams(searchParams);
      next.delete('session_id');
      setSearchParams(next, { replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams]);

  async function handlePaidClick(planName) {
    setPaymentError('');

    if (!user) {
      setPaymentError('Please log in before subscribing.');
      return;
    }

    try {
      const result = await createSubscriptionCheckout({
        planName,
        userId: user.id,
        userEmail: user.email,
      });

      if (!result.ok) {
        setPaymentError(result.error || 'Could not start checkout.');
        return;
      }

      setCheckoutClientSecret(result.clientSecret);
    } catch (error) {
      console.error(error);
      setPaymentError('Could not connect to payment server.');
    }
  }

  const tiers = [
    {
      name: 'Free',
      tagline: asMentor ? 'Run sessions on Bridge' : 'Explore the platform',
      monthly: 0,
      blurb: asMentor
        ? 'List your profile, receive mentee requests, and use the mentor dashboard at no platform fee. What mentees pay you per session is separate from Bridge subscriptions.'
        : 'Browse mentors, read reviews, and use the platform at no cost. Mentor sessions are still paid separately during booking.',
      features: asMentor
        ? [
            'Public mentor profile in the directory',
            'Session requests in your dashboard',
            'Accept, decline, and track sessions',
            'Basic platform access',
            'Per-session earnings paid to you when enabled',
          ]
        : [
            'Browse mentor profiles',
            'View ratings and reviews',
            'Save up to 10 mentors',
            'Basic platform access',
            'Mentor sessions booked separately',
          ],
      cta: user ? 'Current plan' : 'Sign up free',
      href: user ? '/dashboard' : '/register',
      primary: false,
    },
    {
      name: 'Starter',
      tagline: 'Extra platform access',
      monthly: 12,
      blurb:
        'For users who want more platform convenience and better account features while still paying mentors separately per session.',
      features: [
        'Everything in Free',
        'Unlimited mentor favorites',
        'Direct messages with mentors',
        'Session recap notes',
        'Calendar sync',
        'Mentor sessions booked separately',
      ],
      cta: 'Choose Starter',
      onClick: () => handlePaidClick('Starter'),
      primary: false,
    },
    {
      name: 'Pro',
      tagline: 'Most active users',
      monthly: 19,
      blurb:
        'Best for active users who want stronger matching, priority platform features, and a better booking experience.',
      features: [
        'Everything in Starter',
        'Priority mentor matching',
        'Priority in mentor request queues',
        'Advanced platform tools',
        'Early access to new mentors',
        'Mentor sessions booked separately',
      ],
      cta: 'Choose Pro',
      onClick: () => handlePaidClick('Pro'),
      primary: true,
      badge: 'Most popular',
    },
    {
      name: 'Premium',
      tagline: 'Highest support level',
      monthly: 49,
      blurb:
        'For users who want the strongest level of platform support and premium account benefits while booking mentor sessions separately.',
      features: [
        'Everything in Pro',
        'Priority human support',
        'Highest platform access tier',
        'Priority scheduling tools',
        'Enhanced account support',
        'Mentor sessions booked separately',
      ],
      cta: 'Choose Premium',
      onClick: () => handlePaidClick('Premium'),
      primary: false,
    },
  ];

  const proEquivalent = tierMonthlyEquivalent(19, annual);

  const comparisonRows = [
    { label: 'Browse directory & profiles', free: true, starter: true, pro: true, premium: true },
    { label: 'View ratings & reviews', free: true, starter: true, pro: true, premium: true },
    { label: 'Mentor favorites', free: '10', starter: 'Unlimited', pro: 'Unlimited', premium: 'Unlimited' },
    { label: 'Direct messages with mentors', free: false, starter: true, pro: true, premium: true },
    { label: 'Session recap notes', free: false, starter: true, pro: true, premium: true },
    { label: 'Calendar sync', free: false, starter: true, pro: true, premium: true },
    { label: 'Priority mentor matching', free: false, starter: false, pro: true, premium: true },
    { label: 'Priority in request queues', free: false, starter: false, pro: true, premium: true },
    { label: 'Early access to new mentors', free: false, starter: false, pro: true, premium: true },
    { label: 'Priority support', free: false, starter: false, pro: false, premium: true },
    { label: 'Mentor sessions booked separately', free: true, starter: true, pro: true, premium: true },
  ];

  const faq = [
    {
      q: 'Can I switch plans later?',
      a: 'Yes. Move up or down between tiers whenever. Upgrades are prorated, downgrades kick in at the next billing cycle.',
    },
    {
      q: 'Do mentors set their own rates?',
      a: 'Yes. Each mentor has their own booking rate shown on their profile. Subscription plans do not include mentor sessions.',
    },
    {
      q: 'Are mentor sessions included in subscriptions?',
      a: 'No. Subscriptions cover Bridge platform access and features. Mentor sessions are paid separately when booked.',
    },
    {
      q: 'Is there a free trial for paid plans?',
      a: 'The Free tier already covers real usage. If we add trials later we’ll say so clearly.',
    },
    {
      q: 'What about refunds?',
      a: 'Cancel anytime and you won’t be billed again. For mid-cycle refunds, contact support — we handle these case by case.',
    },
  ];

  return (
    <>
      <CustomCursor />
      <main
        data-route-atmo="pricing"
        className="relative isolate min-h-screen overflow-x-hidden"
        aria-labelledby="pricing-heading"
      >
        <AuroraBg />

        {paymentError ? (
          <div className="relative z-[3] mx-auto mt-4 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-300">
            {paymentError}
          </div>
        ) : null}

        <EmbeddedCheckoutPanel
          clientSecret={checkoutClientSecret}
          onClose={() => setCheckoutClientSecret(null)}
        />

        {billingNote && (
          <div className="relative z-[3] mx-auto max-w-bridge px-4 pt-6 sm:px-6 lg:px-8">
            <p className="rounded-2xl border border-emerald-300/60 bg-emerald-50/95 px-4 py-3 text-sm font-bold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              {billingNote}
            </p>
          </div>
        )}

        {/* ─── Header — editorial hero with magnetic billing toggle ─── */}
        <header className="relative z-[2] border-b border-[var(--bridge-border)] bg-[color-mix(in_srgb,var(--bridge-canvas)_82%,transparent)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bridge-canvas)_72%,transparent)]">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-60" />
          <div className="relative mx-auto max-w-bridge px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-2 text-[12px] font-bold tracking-wide text-[var(--bridge-text-muted)]">
                <li>
                  <Link
                    to="/"
                    data-cursor="hover"
                    className={`rounded-md font-bold transition hover:text-orange-600 ${focusRing}`}
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden className="text-stone-300">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                  </svg>
                </li>
                <li className="rounded-full bg-orange-500/8 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-[0.14em] text-orange-600 ring-1 ring-orange-500/20 dark:text-orange-300">Pricing</li>
              </ol>
            </nav>

            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <Reveal>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">Pick your plan</p>
                  <h1
                    id="pricing-heading"
                    className="mt-3 font-display font-black tracking-[-0.03em] text-[var(--bridge-text)]"
                    style={{ fontSize: 'clamp(2.4rem, 6vw, 4.8rem)', lineHeight: '0.96' }}
                  >
                    Simple <span className="text-gradient-bridge italic">pricing</span>,<br className="hidden sm:block" /> pick what fits.
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--bridge-text-secondary)] sm:text-lg">
                    Subscription plans cover Bridge platform access and features. Mentor sessions are paid separately based on each mentor’s rate.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className="bd-card-edge relative inline-flex rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-1 shadow-inner backdrop-blur-md"
                    role="group"
                    aria-label="Billing period"
                  >
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-stone-900 to-stone-800 shadow-[0_8px_22px_-6px_rgba(28,25,23,0.5)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:from-orange-500 dark:to-amber-500 dark:shadow-[0_8px_22px_-6px_rgba(234,88,12,0.55)] ${
                        annual ? 'left-[calc(50%+0px)]' : 'left-1'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setAnnual(false)}
                      data-cursor="hover"
                      className={`relative z-[1] rounded-full px-5 py-1.5 text-sm font-black tracking-tight transition ${
                        !annual ? 'text-white dark:text-stone-950' : 'text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]'
                      } ${focusRing}`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnual(true)}
                      data-cursor="hover"
                      className={`relative z-[1] rounded-full px-5 py-1.5 text-sm font-black tracking-tight transition ${
                        annual ? 'text-white dark:text-stone-950' : 'text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]'
                      } ${focusRing}`}
                    >
                      Annual
                    </button>
                  </div>
                  <span className="bd-status-shine relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-orange-300/55 bg-gradient-to-r from-orange-50 to-amber-50 px-3.5 py-1.5 text-xs font-black text-orange-900 shadow-sm dark:border-orange-400/30 dark:from-orange-500/15 dark:to-amber-500/10 dark:text-orange-200">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
                    </span>
                    Save {Math.round(ANNUAL_DISCOUNT * 100)}% annual
                  </span>
                </div>
              </Reveal>
            </div>

            {/* Trust strip */}
            <Reveal delay={180}>
              <div className="mt-8 flex flex-wrap items-center gap-3 text-[11px] font-bold text-[var(--bridge-text-muted)]">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-amber-700 dark:text-amber-300">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" /></svg>
                  4.9 / 5 from <KineticNumber to={2400} ms={900} />+ users
                </span>
                <span className="h-1 w-1 rounded-full bg-[var(--bridge-border-strong)]" />
                <span>No card for Free tier</span>
                <span className="h-1 w-1 rounded-full bg-[var(--bridge-border-strong)]" />
                <span>Cancel any time</span>
                <span className="h-1 w-1 rounded-full bg-[var(--bridge-border-strong)]" />
                <span>Stripe-secured checkout</span>
              </div>
            </Reveal>
          </div>
        </header>

        {/* ─── Tier cards ─── */}
        <div className="relative z-[2] mx-auto max-w-bridge px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4 lg:items-stretch">
            {tiers.map((tier, idx) => {
              const equiv = tierMonthlyEquivalent(tier.monthly, annual);
              const showAnnualNote = annual && tier.monthly > 0;

              return (
                <Reveal key={tier.name} delay={40 + idx * 60}>
                  <Tilt3D max={tier.primary ? 4 : 3} className="h-full rounded-[1.75rem]">
                    <div
                      className={`bd-card-edge group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border p-6 shadow-bridge-tile transition-all duration-500 hover:-translate-y-1 hover:shadow-xl sm:p-7 ${
                        tier.primary
                          ? 'border-transparent border-gradient-bridge animate-border-bridge bg-gradient-to-br from-[var(--bridge-surface)] via-[var(--bridge-surface)] to-orange-50/35 shadow-[0_24px_60px_-16px_rgba(234,88,12,0.45)] lg:scale-[1.04] lg:z-[1] dark:to-orange-500/[0.06]'
                          : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] hover:border-orange-300/60'
                      }`}
                    >
                      {tier.primary ? (
                        <div
                          aria-hidden
                          className="pointer-events-none absolute -right-10 -top-10 h-60 w-60 rounded-full bg-gradient-to-br from-orange-400/35 via-amber-300/20 to-transparent blur-3xl bd-aurora"
                        />
                      ) : null}
                      <div
                        aria-hidden
                        className={`absolute inset-x-0 top-0 z-[1] h-1 ${
                          tier.primary
                            ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 shadow-[0_0_12px_rgba(234,88,12,0.55)]'
                            : 'bg-[var(--bridge-border-strong)]'
                        }`}
                      />

                      <div className="relative z-[1] flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="font-display text-xl font-black tracking-tight text-[var(--bridge-text)] sm:text-2xl">{tier.name}</h2>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
                            {tier.tagline}
                          </p>
                        </div>
                        {tier.badge ? (
                          <span className="bd-status-shine shrink-0 inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_22px_-4px_rgba(234,88,12,0.55)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-white/95 animate-pulse-soft" />
                            {tier.badge}
                          </span>
                        ) : null}
                      </div>
                      <div className="relative z-[1]">

                        <p className="mt-5 flex flex-wrap items-baseline gap-x-1.5">
                          <span className="font-display text-[3rem] font-black tabular-nums tracking-[-0.03em] leading-none text-[var(--bridge-text)]">
                            ${tier.monthly === 0 ? '0' : <KineticNumber to={equiv} ms={900} />}
                          </span>
                          <span className="text-sm font-bold text-[var(--bridge-text-muted)]">/month</span>
                        </p>
                        <p className="mt-1.5 min-h-[1.25rem] text-[11px] font-bold text-[var(--bridge-text-muted)]">
                          {showAnnualNote
                            ? `Billed annually · save ${Math.round(ANNUAL_DISCOUNT * 100)}%`
                            : tier.monthly === 0
                            ? 'Forever · no card required'
                            : 'Billed monthly · cancel anytime'}
                        </p>

                        <p className="mt-4 text-[13px] leading-relaxed text-[var(--bridge-text-secondary)]">{tier.blurb}</p>
                      </div>

                      <ul className="relative z-[1] mt-5 flex flex-1 flex-col gap-2.5 text-[13px] text-[var(--bridge-text)]">
                        {tier.features.map((f) => (
                          <li key={f} className="flex gap-2.5">
                            <span
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-black ring-1 ${
                                tier.primary
                                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white ring-white/15 shadow-[0_0_10px_rgba(234,88,12,0.4)]'
                                  : 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/22 dark:text-emerald-300'
                              }`}
                              aria-hidden
                            >
                              ✓
                            </span>
                            <span className="leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>

                      <p className="relative z-[1] mt-5 text-[11px] font-semibold text-[var(--bridge-text-faint)]">
                        Mentor sessions are not included in the subscription price.
                      </p>

                      <div className="relative z-[1] mt-7">
                        {tier.href ? (
                          <Link
                            to={tier.href}
                            data-cursor={tier.cta}
                            className={`block w-full rounded-full py-3 text-center text-sm font-black transition-all duration-200 ${
                              tier.primary
                                ? 'btn-sheen bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-[0_12px_32px_-6px_rgba(234,88,12,0.6)] ring-1 ring-white/15 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-8px_rgba(234,88,12,0.8)]'
                                : 'border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-raised)] text-[var(--bridge-text-secondary)] hover:border-orange-500/50 hover:text-[var(--bridge-text)] hover:bg-[var(--bridge-surface-raised)] hover:-translate-y-0.5'
                            } ${focusRing}`}
                          >
                            {tier.cta}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={tier.onClick}
                            data-cursor={tier.cta}
                            className={`w-full rounded-full py-3 text-sm font-black transition-all duration-200 ${
                              tier.primary
                                ? 'btn-sheen bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-[0_12px_32px_-6px_rgba(234,88,12,0.6)] ring-1 ring-white/15 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-8px_rgba(234,88,12,0.8)]'
                                : 'border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-raised)] text-[var(--bridge-text-secondary)] hover:border-orange-500/50 hover:text-[var(--bridge-text)] hover:-translate-y-0.5'
                            } ${focusRing}`}
                          >
                            {tier.cta}
                          </button>
                        )}
                      </div>
                    </div>
                  </Tilt3D>
                </Reveal>
              );
            })}
          </div>

          <p className="mt-6 text-center text-[11px] font-bold text-[var(--bridge-text-muted)]">
            Mentor sessions are paid separately during booking based on each mentor’s rate.
          </p>

          {/* ─── Compare plans + FAQ ─── */}
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
            <Reveal delay={60} className="lg:col-span-8">
              <Tilt3D max={2} className="rounded-3xl">
                <div className="bd-card-edge relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-card">
                  <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-orange-400/12 blur-3xl bd-aurora" />
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-50" />
                  <div className="relative border-b border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/70 px-6 py-5 sm:px-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">Side-by-side</p>
                    <h2 className="mt-1 font-display font-black tracking-[-0.025em] text-[var(--bridge-text)]" style={{ fontSize: 'clamp(1.4rem, 2.4vw, 1.9rem)', lineHeight: '1.05' }}>
                      Compare <span className="text-gradient-bridge italic">plans</span>
                    </h2>
                    <p className="mt-1 text-sm text-[var(--bridge-text-secondary)]">Bridge platform features, side by side.</p>
                  </div>
                  <div className="relative overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b-2 border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/50">
                          <th scope="col" className="px-4 py-4 font-black text-[var(--bridge-text)] sm:px-6">
                            Feature
                          </th>
                          <th scope="col" className="px-2 py-4 text-center text-[11px] font-black uppercase tracking-[0.14em] text-[var(--bridge-text-muted)] sm:px-3">
                            Free
                          </th>
                          <th scope="col" className="px-2 py-4 text-center text-[11px] font-black uppercase tracking-[0.14em] text-[var(--bridge-text-muted)] sm:px-3">
                            Starter
                          </th>
                          <th scope="col" className="bg-orange-500/[0.05] px-2 py-4 text-center font-black sm:px-3">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[12px] font-black text-orange-600 tracking-tight dark:text-orange-300">Pro</span>
                              <span className="bd-status-shine relative overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-white">Best</span>
                            </div>
                          </th>
                          <th scope="col" className="px-2 py-4 text-center text-[11px] font-black uppercase tracking-[0.14em] text-[var(--bridge-text-muted)] sm:px-3">
                            Premium
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonRows.map((row, rIdx) => (
                          <tr
                            key={row.label}
                            className={`group/row border-b border-[var(--bridge-border)]/55 last:border-0 transition-colors duration-300 hover:bg-[var(--bridge-surface-muted)]/40 ${rIdx % 2 === 1 ? 'bg-[var(--bridge-surface-muted)]/55' : 'bg-[var(--bridge-canvas)]/40'}`}
                          >
                            <th scope="row" className="max-w-[12rem] px-4 py-4 font-bold text-[var(--bridge-text)] sm:max-w-none sm:px-6">
                              {row.label}
                            </th>
                            <td className="px-2 py-4 text-center sm:px-3">
                              {typeof row.free === 'boolean' ? (
                                <div className="flex justify-center">
                                  <CheckCell included={row.free} highlight={false} />
                                </div>
                              ) : (
                                <span className="font-bold text-[var(--bridge-text-secondary)]">{row.free}</span>
                              )}
                            </td>
                            <td className="px-2 py-4 text-center sm:px-3">
                              {typeof row.starter === 'boolean' ? (
                                <div className="flex justify-center">
                                  <CheckCell included={row.starter} highlight={false} />
                                </div>
                              ) : (
                                <span className="font-bold text-[var(--bridge-text-secondary)]">{row.starter}</span>
                              )}
                            </td>
                            <td className="bg-orange-500/[0.05] px-2 py-4 text-center sm:px-3">
                              {typeof row.pro === 'boolean' ? (
                                <div className="flex justify-center">
                                  <CheckCell included={row.pro} highlight />
                                </div>
                              ) : (
                                <span className="font-black text-orange-600 dark:text-orange-300">{row.pro}</span>
                              )}
                            </td>
                            <td className="px-2 py-4 text-center sm:px-3">
                              {typeof row.premium === 'boolean' ? (
                                <div className="flex justify-center">
                                  <CheckCell included={row.premium} highlight={false} />
                                </div>
                              ) : (
                                <span className="font-bold text-[var(--bridge-text-secondary)]">{row.premium}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Tilt3D>
            </Reveal>

            <Reveal delay={120} className="lg:col-span-4 lg:sticky lg:top-24">
              <PricingFaq headingId="pricing-faq-heading" items={faq} />
            </Reveal>
          </div>

          {/* ─── Mentor tiers ─── */}
          <div className="mt-20 border-t border-[var(--bridge-border)] pt-16">
            <Reveal delay={60}>
              <div className="mb-10 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-300/55 bg-orange-50/70 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-orange-700 dark:border-orange-400/30 dark:bg-orange-500/10 dark:text-orange-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-65" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
                  </span>
                  How Bridge categorizes mentors
                </span>
                <h2
                  id="mentor-tiers-heading"
                  className="mt-4 font-display font-black tracking-[-0.03em] text-[var(--bridge-text)]"
                  style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', lineHeight: '1' }}
                >
                  Mentor <span className="text-gradient-bridge italic">tiers</span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--bridge-text-secondary)]">
                  Each mentor is placed in a tier based on their experience and seniority. Session rates are set by each mentor individually and shown on their profile — not by Bridge.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-labelledby="mentor-tiers-heading">
              {MENTOR_TIERS.map((tier, idx) => (
                <Reveal key={tier.name} delay={40 + idx * 60}>
                  <Tilt3D max={4} className="h-full rounded-[1.75rem]">
                    <div
                      className={`bd-card-edge group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border p-6 shadow-bridge-tile backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${tier.edgeClass} ${tier.bgClass}`}
                    >
                      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl bd-aurora" style={{ background: `radial-gradient(circle, ${tier.halo} 0%, transparent 70%)` }} />
                      <div aria-hidden className={`absolute inset-x-0 top-0 h-1 ${tier.accentBar} ${tier.isElite ? 'shadow-[0_0_14px_rgba(234,88,12,0.6)]' : ''}`} />

                      <div className="relative flex flex-col gap-3">
                        <span
                          className={`bd-status-shine relative inline-flex w-fit items-center gap-1 self-start overflow-hidden rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${tier.badgeClass}`}
                        >
                          {tier.name}
                        </span>

                        <div className="flex items-baseline gap-2">
                          <p className="font-display text-[2.1rem] font-black tabular-nums leading-none tracking-[-0.025em] text-[var(--bridge-text)]">{tier.rateRange}</p>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">typical rate per session</p>

                        <div className="mt-1 flex items-baseline gap-2 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/70 px-3 py-2">
                          <p className="font-display text-base font-black tabular-nums tracking-tight text-[var(--bridge-text)]">{tier.yearsRange}</p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--bridge-text-muted)]">years of experience</p>
                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-[var(--bridge-text-secondary)]">{tier.experienceDesc}</p>

                        <ul className="mt-3 flex flex-col gap-2">
                          {tier.useCases.map((uc) => (
                            <li key={uc} className="flex items-start gap-2 text-[13px] text-[var(--bridge-text)]">
                              <span
                                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/12 text-[10px] font-black text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-300"
                                aria-hidden
                              >
                                ✓
                              </span>
                              <span className="leading-snug">{uc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Tilt3D>
                </Reveal>
              ))}
            </div>

            {/* Final CTA — magnetic mentors browse */}
            <Reveal delay={160}>
              <div className="mt-12 flex justify-center">
                <Magnetic strength={0.16}>
                  <Link
                    to="/mentors"
                    data-cursor="Browse"
                    className={`btn-sheen relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-8 py-3.5 text-sm font-black text-white shadow-[0_14px_36px_-6px_rgba(234,88,12,0.65)] ring-1 ring-white/15 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-6px_rgba(234,88,12,0.85)] ${focusRing}`}
                  >
                    Browse mentors by tier
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                </Magnetic>
              </div>
            </Reveal>
          </div>
        </div>
      </main>

      <StickyPricingBar onClick={() => handlePaidClick('Pro')} equivalent={proEquivalent} annual={annual} />
    </>
  );
}
