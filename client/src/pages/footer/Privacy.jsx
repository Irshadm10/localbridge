import { Shield } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';

const SECTIONS = [
        { id: 'collection', title: '1. Information We Collect', body: `We collect three types of data:\n\n**Directly from you** — account details (name, email, password), profile information, payment data, and any content you submit (messages, reviews, session notes).\n\n**Generated through use** — session history, booking patterns, preferences, and platform activity.\n\n**Technical data** — IP address, browser type, device identifiers, and usage logs.` },
        { id: 'usage', title: '2. How We Use Information', body: `We use your data to: operate the platform, match you with mentors, process payments, send transactional communications, improve our services, detect fraud, and comply with legal obligations.\n\nWe do not sell personal data to third parties. Ever.` },
        { id: 'sharing', title: '3. Data Sharing', body: `We share data only with: mentors you've booked (limited profile info relevant to the session), service providers who help us operate (Stripe for payments, AWS for hosting), and authorities when legally compelled.\n\nAll service providers are bound by data processing agreements.` },
        { id: 'rights', title: '4. Your Rights', body: `You can access, correct, export, or delete your personal data at any time through your account settings or by emailing mentors.bridge@gmail.com.\n\nResidents of the EU, UK, California, and other jurisdictions have additional rights under GDPR, CCPA, and similar laws — including the right to data portability and the right to object to processing.` },
        { id: 'security', title: '5. Security', body: `Industry-standard encryption (AES-256), access controls, and regular third-party security audits. We are SOC 2 Type II compliant.\n\nNo system is perfectly secure, but we treat your data with the same care we'd treat our own.` },
        { id: 'cookies', title: '6. Cookies', body: `We use cookies for authentication, preferences, and analytics. See our Cookie Policy for the full breakdown.` },
        { id: 'retention', title: '7. Data Retention', body: `We retain account data while your account is active. If you delete your account, personal data is removed within 30 days, except where retention is legally required (e.g., tax records).` },
        { id: 'children', title: '8. Children', body: `Bridge is not for users under 18. We do not knowingly collect data from minors. If you believe a minor has created an account, email mentors.bridge@gmail.com and we'll remove it immediately.` },
        { id: 'changes', title: '9. Changes', body: `We may update this policy. Material changes will be communicated via email at least 30 days before taking effect.` },
        { id: 'contact', title: '10. Contact', body: `Questions about privacy? Email mentors.bridge@gmail.com or write to:\n\nBridge Privacy Office\n525 Market Street, Suite 1200\nSan Francisco, CA 94105` },
];

export default function Privacy() {
        return (
            <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
                    <div
                        aria-hidden
                        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40vmax] w-[80vmax] -translate-x-1/2 opacity-40 dark:opacity-60"
                        style={{
                            background:
                                'conic-gradient(from 240deg at 50% 50%, rgba(251,146,60,0.12), rgba(253,230,138,0.08), rgba(234,88,12,0.14), rgba(251,146,60,0.12))',
                            filter: 'blur(90px)',
                        }}
                    />
                    <div className="relative mx-auto max-w-bridge">
                            <Reveal className="mb-14 max-w-3xl">
                                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-3.5 py-1.5 shadow-sm backdrop-blur-md">
                                            <Shield className="h-3.5 w-3.5 text-orange-500" />
                                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-secondary)]">Legal</span>
                                    </div>
                                    <h1 className="font-display text-[2.75rem] font-bold leading-[1.08] tracking-[-0.012em] text-[var(--bridge-text)] sm:text-[3.5rem] lg:text-[4rem]">
                                            Privacy <span className="font-editorial italic text-gradient-bridge">policy</span>
                                    </h1>
                                    <p className="mt-4 text-sm font-medium text-[var(--bridge-text-muted)]">Last updated: April 21, 2026</p>
                            </Reveal>

                            <div className="grid gap-10 lg:grid-cols-12">
                                    <aside className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
                                            <nav className="relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-4 shadow-bridge-tile backdrop-blur-md">
                                                    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent" />
                                                    <p className="mb-3 px-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-muted)]">Contents</p>
                                                    <ul className="space-y-0.5">
                                                            {SECTIONS.map((s) => (
                                                                <li key={s.id}>
                                                                        <a href={`#${s.id}`} className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm font-medium text-[var(--bridge-text-secondary)] transition hover:bg-orange-50/60 hover:text-orange-800 dark:hover:bg-orange-500/10 dark:hover:text-orange-300">
                                                                                <span>{s.title}</span>
                                                                                <span aria-hidden className="text-xs opacity-0 transition group-hover:opacity-70">→</span>
                                                                        </a>
                                                                </li>
                                                            ))}
                                                    </ul>
                                            </nav>
                                    </aside>

                                    <article className="space-y-10 lg:col-span-9">
                                            {SECTIONS.map((s) => (
                                                <section key={s.id} id={s.id} className="scroll-mt-24 rounded-[1.5rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-tile sm:p-8">
                                                        <h2 className="font-display text-2xl font-semibold text-[var(--bridge-text)]">{s.title}</h2>
                                                        <div className="mt-4 space-y-4 leading-relaxed text-[var(--bridge-text-secondary)]">
                                                                {s.body.split('\n\n').map((p, i) => (
                                                                    <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--bridge-text)]">$1</strong>') }} />
                                                                ))}
                                                        </div>
                                                </section>
                                            ))}
                                    </article>
                            </div>
                    </div>
            </main>
        );
}