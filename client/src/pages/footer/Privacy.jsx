import Reveal from '../../components/Reveal';
const SECTIONS = [
        { id: 'collection', title: '1. Information We Collect', body: `We collect three types of data:\n\n**Directly from you** — account details (name, email, password), profile information, payment data, and any content you submit (messages, reviews, session notes).\n\n**Generated through use** — session history, booking patterns, preferences, and platform activity.\n\n**Technical data** — IP address, browser type, device identifiers, and usage logs.` },
        { id: 'usage', title: '2. How We Use Information', body: `We use your data to: operate the platform, match you with mentors, process payments, send transactional communications, improve our services, detect fraud, and comply with legal obligations.\n\nWe do not sell personal data to third parties. Ever.` },
        { id: 'sharing', title: '3. Data Sharing', body: `We share data only with: mentors you've booked (limited profile info relevant to the session), service providers who help us operate (Stripe for payments, AWS for hosting), and authorities when legally compelled.\n\nAll service providers are bound by data processing agreements.` },
        { id: 'rights', title: '4. Your Rights', body: `You can access, correct, export, or delete your personal data at any time through your account settings or by emailing privacy@bridge.com.\n\nResidents of the EU, UK, California, and other jurisdictions have additional rights under GDPR, CCPA, and similar laws — including the right to data portability and the right to object to processing.` },
        { id: 'security', title: '5. Security', body: `Industry-standard encryption (AES-256), access controls, and regular third-party security audits. We are SOC 2 Type II compliant.\n\nNo system is perfectly secure, but we treat your data with the same care we'd treat our own.` },
        { id: 'cookies', title: '6. Cookies', body: `We use cookies for authentication, preferences, and analytics. See our Cookie Policy for the full breakdown.` },
        { id: 'retention', title: '7. Data Retention', body: `We retain account data while your account is active. If you delete your account, personal data is removed within 30 days, except where retention is legally required (e.g., tax records).` },
        { id: 'children', title: '8. Children', body: `Bridge is not for users under 18. We do not knowingly collect data from minors. If you believe a minor has created an account, email privacy@bridge.com and we'll remove it immediately.` },
        { id: 'changes', title: '9. Changes', body: `We may update this policy. Material changes will be communicated via email at least 30 days before taking effect.` },
        { id: 'contact', title: '10. Contact', body: `Questions about privacy? Email privacy@bridge.com or write to:\n\nBridge Privacy Office\n525 Market Street, Suite 1200\nSan Francisco, CA 94105` },
];

export default function Privacy() {
        return (
            <main className="relative min-h-screen bg-gradient-to-b from-[#fffaf3] via-[#fff4e3] to-[#fffaf3] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                            <Reveal className="mb-12">
                                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Legal</p>
                                    <h1 className="mt-3 font-display text-4xl font-semibold text-stone-900 sm:text-5xl">Privacy Policy</h1>
                                    <p className="mt-3 text-sm text-stone-500">Last updated: April 21, 2026</p>
                            </Reveal>

                            <div className="grid gap-10 lg:grid-cols-12">
                                    <aside className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
                                            <nav className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm">
                                                    <p className="mb-3 px-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">Contents</p>
                                                    <ul className="space-y-0.5">
                                                            {SECTIONS.map((s) => (
                                                                <li key={s.id}><a href={`#${s.id}`} className="block rounded-lg px-2 py-1.5 text-sm text-stone-700 transition hover:bg-orange-50/60 hover:text-orange-800">{s.title}</a></li>
                                                            ))}
                                                    </ul>
                                            </nav>
                                    </aside>

                                    <article className="space-y-10 lg:col-span-9">
                                            {SECTIONS.map((s) => (
                                                <section key={s.id} id={s.id} className="scroll-mt-24">
                                                        <h2 className="font-display text-2xl font-semibold text-stone-900">{s.title}</h2>
                                                        <div className="mt-4 space-y-4 leading-relaxed text-stone-700">
                                                                {s.body.split('\n\n').map((p, i) => (
                                                                    <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-stone-900">$1</strong>') }} />
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