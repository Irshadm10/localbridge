import { Cookie, Shield, Settings, BarChart3, Megaphone } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';

const TYPES = [
  {
    Icon: Shield,
    hue: 'from-emerald-500 to-teal-500',
    title: 'Essential cookies',
    body: 'Required for authentication, security, and core functionality. These can\u2019t be disabled.',
  },
  {
    Icon: Settings,
    hue: 'from-sky-500 to-indigo-500',
    title: 'Preference cookies',
    body: 'Remember your settings like language and theme.',
  },
  {
    Icon: BarChart3,
    hue: 'from-orange-500 to-amber-500',
    title: 'Analytics cookies',
    body: 'Help us understand usage patterns so we can improve the platform. We use aggregated, anonymized data.',
  },
  {
    Icon: Megaphone,
    hue: 'from-fuchsia-500 to-rose-500',
    title: 'Marketing cookies',
    body: 'Used with your consent to measure ad effectiveness. You can opt out anytime.',
  },
];

export default function Cookies() {
  return (
    <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40vmax] w-[80vmax] -translate-x-1/2 opacity-40 dark:opacity-60"
        style={{
          background:
            'conic-gradient(from 150deg at 50% 50%, rgba(251,146,60,0.12), rgba(253,230,138,0.08), rgba(234,88,12,0.14), rgba(251,146,60,0.12))',
          filter: 'blur(90px)',
        }}
      />
      <div className="relative mx-auto max-w-3xl">
        <Reveal className="mb-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 shadow-sm backdrop-blur-md">
            <Cookie className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-secondary)]">Legal</span>
          </div>
          <h1 className="font-display text-[2.75rem] font-bold leading-[1.08] tracking-[-0.012em] text-[var(--bridge-text)] sm:text-[3.25rem]">
            Cookie <span className="font-editorial italic text-gradient-bridge">policy</span>
          </h1>
          <p className="mt-4 text-sm font-medium text-[var(--bridge-text-muted)]">Last updated: April 21, 2026</p>
        </Reveal>

        <section className="rounded-[1.5rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-tile sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-[var(--bridge-text)]">What are cookies</h2>
          <p className="mt-3 leading-relaxed text-[var(--bridge-text-secondary)]">
            Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and understand how you use it.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="mb-5 font-display text-2xl font-semibold text-[var(--bridge-text)]">Types we use</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {TYPES.map((t) => (
              <div
                key={t.title}
                className="group relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 shadow-bridge-tile transition-all duration-500 hover:-translate-y-0.5 hover:shadow-bridge-card"
              >
                <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-orange-400/15 to-transparent opacity-0 blur-2xl transition group-hover:opacity-100" />
                <div className={`relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${t.hue} text-white shadow-[0_8px_22px_-4px_rgba(234,88,12,0.35)] transition group-hover:scale-[1.04]`}>
                  <t.Icon className="h-5 w-5" />
                </div>
                <p className="relative mt-4 font-display text-lg font-semibold text-[var(--bridge-text)]">{t.title}</p>
                <p className="relative mt-1.5 text-sm leading-relaxed text-[var(--bridge-text-secondary)]">{t.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-tile sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-[var(--bridge-text)]">Managing cookies</h2>
          <p className="mt-3 leading-relaxed text-[var(--bridge-text-secondary)]">
            You can control cookies through your browser settings or our preferences center. Note that disabling essential cookies will break core features.
          </p>
        </section>

        <section className="mt-6 rounded-[1.5rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-tile sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-[var(--bridge-text)]">Third-party cookies</h2>
          <p className="mt-3 leading-relaxed text-[var(--bridge-text-secondary)]">
            We work with trusted partners (payment processors, analytics providers) who may set their own cookies. Each has its own privacy policy.
          </p>
        </section>

        <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-orange-300/40 bg-gradient-to-br from-orange-50 via-amber-50/60 to-white p-7 shadow-bridge-tile dark:border-orange-400/25 dark:from-orange-500/10 dark:via-amber-500/5 dark:to-[var(--bridge-surface)] sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-[var(--bridge-text)]">Contact</h2>
          <p className="mt-3 leading-relaxed text-[var(--bridge-text-secondary)]">
            Questions? Email{' '}
            <a href="mailto:mentors.bridge@gmail.com" className="font-semibold text-orange-700 underline decoration-orange-300/60 underline-offset-4 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200">
              mentors.bridge@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
