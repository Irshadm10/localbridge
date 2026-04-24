import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import Reveal from '../components/Reveal';
import { focusRing } from '../ui';
import EmbeddedCheckoutPanel from '../components/EmbeddedCheckoutPanel';

const ANNUAL_DISCOUNT = 0.2;

const MENTOR_TIERS = [
  {
    name: 'Rising',
    rateRange: '$40–$70',
    experienceDesc: '0–4 years of experience · Early-career professionals and recent grads who have earned their first real wins.',
    useCases: [
      'First job search and resume polish',
      'Breaking into competitive entry-level roles',
      'Building professional habits and early momentum',
    ],
    cardClass: 'border-emerald-200/60 bg-emerald-50/40',
    accentClass: 'bg-gradient-to-r from-emerald-500/70 via-emerald-400/50 to-emerald-500/70',
    badgeClass: 'bg-emerald-100 text-emerald-800',
  },
  {
    name: 'Established',
    rateRange: '$75–$120',
    experienceDesc: '5–9 years · Mid-career contributors with a proven track record and a clear area of focus.',
    useCases: [
      'Mid-level to senior career transitions',
      'Navigating promotion cycles and leveling up',
      'Changing industries or switching functions',
    ],
    cardClass: 'border-sky-200/60 bg-sky-50/40',
    accentClass: 'bg-gradient-to-r from-sky-500/70 via-sky-400/50 to-sky-500/70',
    badgeClass: 'bg-sky-100 text-sky-800',
  },
  {
    name: 'Expert',
    rateRange: '$125–$175',
    experienceDesc: '10–15 years · Senior leaders with deep functional expertise and meaningful organizational scope.',
    useCases: [
      'Senior or staff-level interview preparation',
      'Executive communication and cross-functional influence',
      'High-stakes career pivots and role expansions',
    ],
    cardClass: 'border-violet-200/60 bg-violet-50/40',
    accentClass: 'bg-gradient-to-r from-violet-500/70 via-violet-400/50 to-violet-500/70',
    badgeClass: 'bg-violet-100 text-violet-800',
  },
  {
    name: 'Elite',
    rateRange: '$180–$250',
    experienceDesc: '15+ years · C-suite executives and industry-defining practitioners at the top of their fields.',
    useCases: [
      'VP and C-suite transition coaching',
      'Board-level presence and strategic positioning',
      'Legacy career decisions, exits, and portfolio moves',
    ],
    cardClass: 'border-amber-300/60 bg-amber-50/50',
    accentClass: 'bg-gradient-to-r from-amber-600/80 via-orange-500/60 to-amber-600/80',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm',
  },
];

function PricingBackdrop() {
  return (
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 top-24 h-[28rem] w-[28rem] rounded-full bg-orange-400/[0.08] blur-3xl dark:bg-orange-500/[0.06]" />
        <div className="absolute -right-20 top-[40%] h-[22rem] w-[22rem] rounded-full bg-amber-300/[0.1] blur-3xl dark:bg-amber-500/[0.05]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-stone-400/[0.06] blur-3xl dark:bg-stone-600/[0.08]" />
        <div
            className="absolute inset-0 opacity-[0.12] dark:opacity-[0.045]"
            style={{
              backgroundImage:
                  'url("data:image/svg+xml,%3Csvg width=\'56\' height=\'56\' viewBox=\'0 0 56 56\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\' fill=\'%23a8a29e\' fill-opacity=\'0.4\'/%3E%3C/svg%3E")',
              backgroundSize: '56px 56px',
            }}
        />
      </div>
  );
}

function formatMoney(n) {
  return n === 0 ? '$0' : `$${n}`;
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
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                highlight
                    ? 'bg-orange-700/90 text-white shadow-sm'
                    : 'bg-[var(--bridge-surface-raised)] text-[var(--bridge-text)] ring-1 ring-[var(--bridge-border)] dark:text-orange-100/90'
            }`}
            aria-label="Included"
        >
        ✓
      </span>
    );
  }
  return (
      <span
          className="inline-flex h-7 w-7 items-center justify-center text-stone-300"
          aria-label="Not included"
      >
      —
    </span>
  );
}

function PricingFaq({ headingId, items }) {
  return (
      <section
          className="relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 shadow-sm ring-1 ring-stone-900/[0.02] sm:p-6"
          aria-labelledby={headingId}
      >
        <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/25 to-transparent"
        />
        <div className="relative flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-orange-700/70 shadow-sm" aria-hidden />
          <h2 id={headingId} className="font-display text-lg font-semibold text-stone-900 sm:text-xl">
            Common questions
          </h2>
        </div>
        <div className="relative mt-4 divide-y divide-[var(--bridge-border)] rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]">
          {items.map((item) => (
              <details key={item.q} className="group px-3 py-0.5 sm:px-4">
                <summary
                    className={`cursor-pointer list-none py-3.5 pr-7 text-sm font-semibold text-stone-900 transition marker:content-none [&::-webkit-details-marker]:hidden ${focusRing} rounded-lg`}
                >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">{item.q}</span>
                <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-stone-500 transition group-open:rotate-180 group-open:border-orange-200/60 group-open:bg-orange-50/50 group-open:text-orange-900/90"
                    aria-hidden
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </span>
                </summary>
                <p className="pb-3.5 text-sm leading-relaxed text-stone-600">{item.a}</p>
              </details>
          ))}
        </div>
      </section>
  );
}

export default function Pricing() {
  const { user } = useAuth();
  const asMentor = user ? isMentorAccount(user) : false;
  const [annual, setAnnual] = useState(false);
  const [billingNote, setBillingNote] = useState(null);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  async function handlePaidClick(planName) {
    setPaymentError('');

    if (!user) {
      setPaymentError('Please log in before subscribing.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPaymentError(data.error || 'Could not start checkout.');
        return;
      }

      setCheckoutClientSecret(data.clientSecret);
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
      <main
          data-route-atmo="pricing"
          className="relative isolate min-h-screen overflow-x-hidden"
          aria-labelledby="pricing-heading"
      >
        <PricingBackdrop />
        {paymentError ? (
            <div className="relative z-[3] mx-auto mt-4 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {paymentError}
            </div>
        ) : null}

        <EmbeddedCheckoutPanel
            clientSecret={checkoutClientSecret}
            onClose={() => setCheckoutClientSecret(null)}
        />

        {billingNote && (
          <div className="relative z-[3] mx-auto max-w-bridge px-4 pt-6 sm:px-6 lg:px-8">
            <p className="rounded-2xl border border-amber-200/80 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-50">
              {billingNote}
            </p>
          </div>
        )}

        <header className="relative z-[2] border-b border-[var(--bridge-border)] bg-[color-mix(in_srgb,var(--bridge-canvas)_82%,transparent)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bridge-canvas)_72%,transparent)]">
          <div className="relative mx-auto max-w-bridge px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
                <li>
                  <Link
                      to="/"
                      className={`rounded-md font-medium text-stone-600 transition hover:text-orange-800 ${focusRing}`}
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden className="text-stone-300">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                  </svg>
                </li>
                <li className="font-medium text-stone-800">Pricing</li>
              </ol>
            </nav>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1
                    id="pricing-heading"
                    className="font-display text-balance text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-[2.5rem] sm:leading-[1.08]"
                >
                  Simple <span className="text-gradient-bridge">pricing</span>, pick what fits
                </h1>
                <p className="mt-2 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
                  Subscription plans cover Bridge platform access and features. Mentor sessions are paid separately based on each mentor’s rate.
                </p>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <div
                    className="relative inline-flex rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-1 shadow-inner backdrop-blur-md"
                    role="group"
                    aria-label="Billing period"
                >
                  {/* Sliding pill indicator */}
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-stone-900 to-stone-800 shadow-[0_8px_22px_-6px_rgba(28,25,23,0.5)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:from-orange-500 dark:to-amber-500 dark:shadow-[0_8px_22px_-6px_rgba(234,88,12,0.55)] ${
                      annual ? 'left-[calc(50%+0px)]' : 'left-1'
                    }`}
                  />
                  <button
                      type="button"
                      onClick={() => setAnnual(false)}
                      className={`relative z-[1] rounded-full px-5 py-1.5 text-sm font-semibold transition ${
                          !annual ? 'text-white dark:text-stone-950' : 'text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]'
                      } ${focusRing}`}
                  >
                    Monthly
                  </button>
                  <button
                      type="button"
                      onClick={() => setAnnual(true)}
                      className={`relative z-[1] rounded-full px-5 py-1.5 text-sm font-semibold transition ${
                          annual ? 'text-white dark:text-stone-950' : 'text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]'
                      } ${focusRing}`}
                  >
                    Annual
                  </button>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-300/50 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-1.5 text-xs font-bold text-orange-900 shadow-sm dark:border-orange-400/30 dark:from-orange-500/15 dark:to-amber-500/10 dark:text-orange-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(251,146,60,0.6)] animate-pulse-soft" aria-hidden />
                  Save {Math.round(ANNUAL_DISCOUNT * 100)}% annual
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-[2] mx-auto max-w-bridge px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4 lg:items-stretch">
            {tiers.map((tier, idx) => {
              const equiv = tierMonthlyEquivalent(tier.monthly, annual);
              const showAnnualNote = annual && tier.monthly > 0;

              return (
                  <Reveal key={tier.name} delay={40 + idx * 40}>
                    <div
                        className={`group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border p-6 shadow-bridge-tile transition-all duration-500 hover:-translate-y-1 hover:shadow-bridge-card sm:p-7 ${
                            tier.primary
                                ? 'border-transparent border-gradient-bridge animate-border-bridge bg-gradient-to-br from-[var(--bridge-surface)] via-[var(--bridge-surface)] to-orange-50/30 shadow-[0_24px_60px_-16px_rgba(234,88,12,0.4)] lg:scale-[1.04] lg:z-[1] dark:to-orange-500/[0.06]'
                                : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] hover:border-orange-300/50'
                        }`}
                    >
                      {tier.primary ? (
                          <div
                              aria-hidden
                              className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-gradient-to-br from-orange-400/30 via-amber-300/15 to-transparent blur-3xl"
                          />
                      ) : null}
                      <div
                          aria-hidden
                          className={`absolute inset-x-0 top-0 z-[1] h-1 ${
                              tier.primary
                                  ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500'
                                  : 'bg-[var(--bridge-border-strong)]'
                          }`}
                      />

                      {tier.badge ? (
                          <span className="absolute right-4 top-4 z-[1] inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_22px_-4px_rgba(234,88,12,0.55)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-white/90 animate-pulse-soft" />
                            {tier.badge}
                          </span>
                      ) : null}

                      <div className="relative z-[1]">
                        <h2 className="font-display text-lg font-semibold text-stone-900 sm:text-xl">{tier.name}</h2>
                        <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-orange-900/70">
                          {tier.tagline}
                        </p>

                        <p className="mt-4 flex flex-wrap items-baseline gap-x-1.5">
                      <span className="font-display text-[2.4rem] font-semibold tabular-nums tracking-tight text-stone-900">
                        {formatMoney(equiv)}
                      </span>
                          <span className="text-sm text-stone-500">/month</span>
                        </p>
                        <p className="mt-1 min-h-[1.25rem] text-xs font-medium text-stone-500">
                          {showAnnualNote
                              ? `Billed annually · save ${Math.round(ANNUAL_DISCOUNT * 100)}%`
                              : tier.monthly === 0
                                  ? 'Forever · no card required'
                                  : 'Billed monthly · cancel anytime'}
                        </p>

                        <p className="mt-4 text-sm leading-relaxed text-stone-600">{tier.blurb}</p>
                      </div>

                      <ul className="relative z-[1] mt-5 flex flex-1 flex-col gap-2.5 text-sm text-stone-700">
                        {tier.features.map((f) => (
                            <li key={f} className="flex gap-2.5">
                        <span
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                tier.primary
                                    ? 'bg-orange-700/85 text-white'
                                    : 'bg-stone-300/60 text-orange-950/90 ring-1 ring-stone-400/40'
                            }`}
                            aria-hidden
                        >
                          ✓
                        </span>
                              <span className="leading-snug">{f}</span>
                            </li>
                        ))}
                      </ul>

                      <p className="relative z-[1] mt-5 text-xs leading-relaxed text-stone-500">
                        Mentor sessions are not included in the subscription price.
                      </p>

                      {tier.href ? (
                          <Link
                              to={tier.href}
                              className={`relative z-[1] mt-7 block w-full rounded-full py-3 text-center text-sm font-semibold transition ${
                                  tier.primary
                                      ? 'btn-sheen bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-[0_12px_32px_-6px_rgba(234,88,12,0.55)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-8px_rgba(234,88,12,0.7)]'
                                      : user
                                          ? 'border-2 border-[var(--bridge-border-strong)] bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-secondary)] hover:-translate-y-0.5 hover:border-orange-300/70 hover:bg-[var(--bridge-surface-raised)]'
                                          : 'border-2 border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)] text-[var(--bridge-text)] hover:-translate-y-0.5 hover:border-orange-400/60 hover:shadow-md'
                              } ${focusRing}`}
                          >
                            {tier.cta}
                          </Link>
                      ) : (
                          <button
                              type="button"
                              onClick={tier.onClick}
                              className={`relative z-[1] mt-7 w-full rounded-full py-3 text-sm font-semibold transition ${
                                  tier.primary
                                      ? 'btn-sheen bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-[0_12px_32px_-6px_rgba(234,88,12,0.55)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-8px_rgba(234,88,12,0.7)]'
                                      : 'border-2 border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)] text-[var(--bridge-text)] hover:-translate-y-0.5 hover:border-orange-400/60 hover:shadow-md'
                              } ${focusRing}`}
                          >
                            {tier.cta}
                          </button>
                      )}
                    </div>
                  </Reveal>
              );
            })}
          </div>

          <p className="mt-6 text-center text-sm text-stone-500">
            Mentor sessions are paid separately during booking based on each mentor’s rate.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
            <Reveal delay={60} className="lg:col-span-8">
              <div className="overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-sm ring-1 ring-stone-900/[0.02]">
                <div className="border-b border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-6 py-5 sm:px-8">
                  <h2 className="font-display text-lg font-semibold text-stone-900 sm:text-xl">Compare plans</h2>
                  <p className="mt-1 text-sm text-stone-600">Bridge platform features, side by side.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                    <tr className="border-b border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]">
                      <th scope="col" className="px-4 py-3.5 font-semibold text-stone-900 sm:px-6">
                        Feature
                      </th>
                      <th scope="col" className="px-2 py-3.5 text-center font-semibold text-stone-800 sm:px-3">
                        Free
                      </th>
                      <th scope="col" className="px-2 py-3.5 text-center font-semibold text-stone-800 sm:px-3">
                        Starter
                      </th>
                      <th scope="col" className="px-2 py-3.5 text-center font-semibold text-orange-950/90 sm:px-3">
                        Pro
                      </th>
                      <th scope="col" className="px-2 py-3.5 text-center font-semibold text-stone-800 sm:px-3">
                        Premium
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                    {comparisonRows.map((row, rIdx) => (
                        <tr
                            key={row.label}
                            className={`border-b border-[var(--bridge-border)] last:border-0 ${rIdx % 2 === 1 ? 'bg-[var(--bridge-surface-muted)]/65' : 'bg-[var(--bridge-canvas)]/40'}`}
                        >
                          <th scope="row" className="max-w-[12rem] px-4 py-3.5 font-normal text-stone-700 sm:max-w-none sm:px-6">
                            {row.label}
                          </th>
                          <td className="px-2 py-3.5 text-center sm:px-3">
                            {typeof row.free === 'boolean' ? (
                                <div className="flex justify-center">
                                  <CheckCell included={row.free} highlight={false} />
                                </div>
                            ) : (
                                <span className="font-medium text-stone-800">{row.free}</span>
                            )}
                          </td>
                          <td className="px-2 py-3.5 text-center sm:px-3">
                            {typeof row.starter === 'boolean' ? (
                                <div className="flex justify-center">
                                  <CheckCell included={row.starter} highlight={false} />
                                </div>
                            ) : (
                                <span className="font-medium text-stone-800">{row.starter}</span>
                            )}
                          </td>
                          <td className="bg-[color-mix(in_srgb,var(--bridge-accent)_16%,var(--bridge-surface))] px-2 py-3.5 text-center sm:px-3">
                            {typeof row.pro === 'boolean' ? (
                                <div className="flex justify-center">
                                  <CheckCell included={row.pro} highlight />
                                </div>
                            ) : (
                                <span className="font-semibold text-stone-900">{row.pro}</span>
                            )}
                          </td>
                          <td className="px-2 py-3.5 text-center sm:px-3">
                            {typeof row.premium === 'boolean' ? (
                                <div className="flex justify-center">
                                  <CheckCell included={row.premium} highlight={false} />
                                </div>
                            ) : (
                                <span className="font-medium text-stone-800">{row.premium}</span>
                            )}
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-4 lg:sticky lg:top-24">
              <PricingFaq headingId="pricing-faq-heading" items={faq} />
            </Reveal>
          </div>

          {/* Mentor tiers — separate from mentee subscription plans above */}
          <div className="mt-16 border-t border-[var(--bridge-border)] pt-14">
            <Reveal delay={60}>
              <div className="mb-8 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/70 bg-orange-50/70 px-3 py-1.5 text-xs font-semibold text-orange-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-600" aria-hidden />
                  How Bridge categorizes mentors
                </span>
                <h2
                    id="mentor-tiers-heading"
                    className="mt-4 font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl"
                >
                  Mentor tiers
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-stone-600">
                  Each mentor is placed in a tier based on their experience and seniority. Session rates are set by each mentor individually and shown on their profile — not by Bridge.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-labelledby="mentor-tiers-heading">
              {MENTOR_TIERS.map((tier, idx) => (
                  <Reveal key={tier.name} delay={40 + idx * 40}>
                    <div
                        className={`group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border p-6 shadow-bridge-tile backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-bridge-card ${tier.cardClass}`}
                    >
                      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/40 opacity-0 blur-2xl transition group-hover:opacity-100 dark:bg-white/5" />
                      <div
                          aria-hidden
                          className={`absolute inset-x-0 top-0 h-1 ${tier.accentClass}`}
                      />
                      <div className="relative">
                        <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${tier.badgeClass}`}
                        >
                          {tier.name}
                        </span>
                        <p className="mt-3 font-display text-xl font-semibold text-stone-900">{tier.rateRange}</p>
                        <p className="text-xs text-stone-500">typical rate per session</p>
                        <p className="mt-3 text-sm leading-snug text-stone-700">{tier.experienceDesc}</p>
                        <ul className="mt-4 flex flex-col gap-2">
                          {tier.useCases.map((uc) => (
                              <li key={uc} className="flex items-start gap-2 text-sm text-stone-600">
                                <span
                                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-stone-200/70 text-[10px] font-bold text-orange-950/90 ring-1 ring-stone-400/40"
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
                  </Reveal>
              ))}
            </div>
          </div>
        </div>
      </main>
  );
}