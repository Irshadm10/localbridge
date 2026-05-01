import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Sun, Moon, Monitor } from 'lucide-react';
import { COMPANY_EMAIL, mailtoHref } from '../config/contact';
import { applyAppearance, APPEARANCE_STORAGE_KEY } from '../utils/appearance';

const linkClass =
  'text-sm text-white transition-colors duration-200 hover:text-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-sm';

function useCurrentTheme() {
  const [theme, setThemeState] = useState('light');
  useEffect(() => {
    try {
      const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
      if (raw) {
        const o = JSON.parse(raw);
        setThemeState(o?.theme || 'light');
      }
    } catch { /* ignore */ }
  }, []);
  return [theme, setThemeState];
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [theme, setThemeState] = useCurrentTheme();

  function handleTheme(t) {
    setThemeState(t);
    applyAppearance({ theme: t });
  }

  return (
    <footer className="relative z-10 mt-auto overflow-hidden border-t border-orange-500/18 bg-gradient-to-b from-[#111009] via-stone-950 to-[#070604] text-stone-400">

      {/* Luminous top hairline */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/65 to-transparent" />

      {/* Ambient top glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_140%_65%_at_50%_-25%,rgba(234,88,12,0.13),transparent_52%)]" />

      {/* Grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.07] mix-blend-overlay" />

      {/* ── Newsletter banner ── */}
      <div className="relative border-b border-white/[0.055]">
        <div className="mx-auto max-w-bridge px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[1.05rem] font-bold text-stone-100 tracking-tight">Stay in the loop</p>
              <p className="mt-1 text-sm text-stone-400">Mentor spotlights, career resources, product updates. No spam, ever.</p>
            </div>
            {subscribed ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/22 bg-emerald-500/[0.09] px-5 py-3 text-sm font-medium text-emerald-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                You're subscribed!
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setEmail(''); setSubscribed(true); }}
                className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full min-w-0 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-3 text-sm text-stone-100 placeholder:text-stone-600 outline-none transition focus:border-orange-400/45 focus:bg-white/[0.06] sm:w-60"
                />
                <button
                  type="submit"
                  className="btn-sheen shrink-0 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_22px_-4px_rgba(234,88,12,0.5)] transition hover:shadow-[0_8px_34px_-4px_rgba(234,88,12,0.72)] hover:brightness-105"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="relative mx-auto max-w-bridge px-4 py-14 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">

          {/* ── Brand column ── */}
          <div className="space-y-5 lg:col-span-4">
            <Link to="/" className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-lg font-bold text-white shadow-[0_8px_24px_-4px_rgba(234,88,12,0.55)] transition group-hover:shadow-[0_14px_36px_-4px_rgba(234,88,12,0.8)] group-hover:brightness-110">
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/28 to-transparent opacity-55 transition group-hover:opacity-85" />
                <span className="relative">B</span>
              </span>
              <span className="font-display text-xl font-semibold tracking-tight text-stone-50">Bridge</span>
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-stone-300">
              Book real practitioners by the hour — people who've already done the job you're trying to do.
            </p>

            {/* Social links */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                {
                  label: 'X / Twitter', href: '#',
                  icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
                },
                {
                  label: 'LinkedIn', href: '#',
                  icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
                },
                {
                  label: 'Instagram', href: '#',
                  icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="2" width="20" height="20" rx="5"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
                },
                {
                  label: 'YouTube', href: '#',
                  icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg>,
                },
              ].map((s) => (
                <a
                  key={s.label} href={s.href} aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.055] bg-white/[0.03] text-white transition hover:border-orange-500/22 hover:bg-orange-500/[0.09]"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Theme switcher */}
            <div className="pt-1">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white">Display mode</p>
              <div className="inline-flex items-center rounded-xl border border-white/[0.065] bg-white/[0.025] p-1 gap-0.5">
                {[
                  { value: 'light',  label: 'Light',  Icon: Sun     },
                  { value: 'system', label: 'System', Icon: Monitor  },
                  { value: 'dark',   label: 'Dark',   Icon: Moon    },
                ].map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    onClick={() => handleTheme(value)}
                    title={label}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold transition-all duration-200 ${
                      theme === value
                        ? 'bg-orange-500/18 text-orange-400 shadow-[inset_0_1px_0_rgba(251,146,60,0.12)]'
                        : 'text-white hover:text-orange-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Platform ── */}
          <div className="lg:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/65">Platform</p>
            <ul className="mt-4 space-y-3">
              {[
                { label: 'Browse Mentors', to: '/mentors'   },
                { label: 'AI Matching',    to: '/mentors'   },
                { label: 'Resume Review',  to: '/resume'    },
                { label: 'Pricing',        to: '/pricing'   },
                { label: 'Dashboard',      to: '/dashboard' },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className={linkClass}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* ── Company ── */}
          <div className="lg:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/65">Company</p>
            <ul className="mt-4 space-y-3">
              {[
                { label: 'About',          to: '/about'     },
                { label: 'Blog',           to: '/blog'      },
                { label: 'Careers',        to: '/careers'   },
                { label: 'Trust & Safety', to: '/trust'     },
                { label: 'Community',      to: '/community' },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className={linkClass}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div className="lg:col-span-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/65">Get in touch</p>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3 text-stone-300">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-orange-400/65" aria-hidden />
                <a href={mailtoHref()} className="transition-colors hover:text-white">{COMPANY_EMAIL}</a>
              </li>
              <li className="flex items-start gap-3 text-stone-300">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-orange-400/65" aria-hidden />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3 text-stone-300">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-400/65" aria-hidden />
                <span>San Francisco, CA</span>
              </li>
            </ul>

            {/* Platform status */}
            <div className="mt-6 inline-flex items-center gap-2.5 rounded-xl border border-white/[0.055] bg-white/[0.03] px-4 py-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              </span>
              <span className="text-[11px] font-semibold text-stone-300">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative border-t border-white/[0.045]">
        <div className="mx-auto flex max-w-bridge flex-col items-center justify-between gap-4 px-4 py-5 text-xs text-white sm:flex-row sm:px-6 lg:px-8 xl:px-10">
          <p className="shrink-0">© {new Date().getFullYear()} Bridge. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {[
              { label: 'Privacy', to: '/privacy' },
              { label: 'Terms',   to: '/terms'   },
              { label: 'Cookies', to: '/cookies' },
              { label: 'Help',    to: '/help'    },
              { label: 'Contact', to: '/contact' },
            ].map(({ label, to }) => (
              <Link key={to} to={to} className="text-white transition-colors hover:text-orange-200">{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
