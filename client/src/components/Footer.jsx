import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { COMPANY_EMAIL, mailtoHref } from '../config/contact';

const linkClass =
  'text-sm text-stone-400 transition-colors hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 rounded-sm';

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="relative z-10 mt-auto border-t border-orange-500/20 bg-gradient-to-b from-stone-900 via-stone-950 to-[#0a0908] text-stone-400 dark:border-orange-500/30 dark:from-[#0c0a09] dark:via-stone-950 dark:to-black">
      {/* Luminous hairline at the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-40%,rgba(234,88,12,0.16),transparent_55%)]"
      />
      {/* Grain for premium feel */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.08] mix-blend-overlay" />
      <div className="relative mx-auto w-full max-w-bridge px-4 py-14 sm:px-6 sm:py-16 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-5 lg:col-span-4">
            <Link to="/" className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 text-lg font-bold text-white shadow-[0_8px_22px_-4px_rgba(234,88,12,0.6)] transition group-hover:shadow-[0_12px_32px_-4px_rgba(234,88,12,0.8)] group-hover:brightness-110">
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent opacity-60 transition group-hover:opacity-90" />
                <span className="relative">B</span>
              </span>
              <span className="font-display text-xl font-semibold tracking-tight text-stone-50 text-glow-bridge">Bridge</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-stone-400">
              Book real practitioners by the hour—people who&apos;ve already done the job you&apos;re trying to do.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { label: 'Facebook', href: '#', d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                { label: 'X', href: '#', x: true },
                { label: 'Instagram', href: '#', ig: true },
                { label: 'LinkedIn', href: '#', li: true },
                { label: 'YouTube', href: '#', yt: true },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.04] text-stone-400 transition hover:border-orange-500/25 hover:bg-orange-500/10 hover:text-amber-300"
                >
                  {s.x ? (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ) : s.ig ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  ) : s.li ? (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  ) : s.yt ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d={s.d} />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/80">Company</p>
            <ul className="mt-4 space-y-3">
              {[
                { label: 'About', to: '/about' },
                { label: 'Mentors', to: '/mentors' },
                { label: 'Pricing', to: '/pricing' },
                { label: 'Careers', to: '/careers' },
                { label: 'Blog', to: '/blog' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/80">Support</p>
            <ul className="mt-4 space-y-3">
              {[
                { label: 'FAQ', to: '/faq' },
                { label: 'Contact', to: '/contact' },
                { label: 'Help', to: '/help' },
                { label: 'Trust & safety', to: '/trust' },
                { label: 'Community', to: '/community' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/80">Stay in the loop</p>
            <p className="mt-3 text-sm text-stone-500">Product updates and mentor spotlights. No spam.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmail('');
              }}
              className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-stone-100 placeholder:text-stone-500 outline-none transition focus:border-orange-400/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(251,146,60,0.22),0_0_24px_rgba(251,146,60,0.2)]"
              />
              <button
                type="submit"
                className="btn-sheen shrink-0 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_-4px_rgba(234,88,12,0.5)] transition hover:shadow-[0_12px_32px_-4px_rgba(234,88,12,0.7)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
              >
                Subscribe
              </button>
            </form>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3 text-stone-400">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-orange-400/80" aria-hidden />
                <a
                  href={mailtoHref()}
                  className="rounded-sm transition hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
                >
                  {COMPANY_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-3 text-stone-400">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-orange-400/80" aria-hidden />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3 text-stone-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-400/80" aria-hidden />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/5">
        <div className="mx-auto flex w-full max-w-bridge flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-stone-500 sm:flex-row sm:px-6 lg:px-8 xl:px-10">
          <p>© {new Date().getFullYear()} Bridge. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { label: 'Privacy', to: '/privacy' },
              { label: 'Terms', to: '/terms' },
              { label: 'Cookies', to: '/cookies' },
            ].map(({ label, to }) => (
              <Link key={to} to={to} className={linkClass}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
