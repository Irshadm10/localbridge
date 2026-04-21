import Reveal from '../../components/Reveal';

const SECTIONS = [
        { id: 'acceptance', title: '1. Acceptance of Terms', body: `By accessing or using Bridge, you agree to be bound by these Terms. If you don't agree, don't use the service. We may update these Terms; continued use after updates constitutes acceptance.` },
        { id: 'eligibility', title: '2. Eligibility', body: `You must be at least 18 years old and capable of entering a binding contract under applicable law. Mentors must meet additional verification requirements outlined in the Mentor Agreement.` },
        { id: 'accounts', title: '3. Accounts', body: `You're responsible for maintaining the security of your credentials and for all activity under your account. Notify us immediately of any unauthorized use. We reserve the right to suspend accounts that violate these Terms.` },
        { id: 'payment', title: '4. Payments and Refunds', body: `Session fees are charged at booking and held until 24 hours after the session completes.\n\n**Refunds**: Full refund anytime before a session begins. Full refund within 48 hours of a completed session if you're unsatisfied. Subscription fees are non-refundable except where required by law.` },
        { id: 'conduct', title: '5. User Conduct', body: `You agree not to: harass or discriminate against other users, share illegal or infringing content, attempt to circumvent platform payments, misrepresent credentials or identity, scrape or automate platform access, or use the service for any unlawful purpose.\n\nViolations may result in account suspension, termination, or legal action.` },
        { id: 'ip', title: '6. Intellectual Property', body: `All platform content, trademarks, and code are owned by Bridge or our licensors. User-generated content (messages, reviews, notes) remains yours, but you grant Bridge a worldwide, royalty-free license to display it on the platform as necessary to operate the service.` },
        { id: 'mentors', title: '7. Mentors Are Independent Contractors', body: `Mentors on Bridge are independent contractors, not employees or agents of Bridge. We facilitate the connection but do not direct, supervise, or guarantee the content, quality, or outcome of any session.` },
        { id: 'disclaimers', title: '8. Disclaimers', body: `The service is provided "as is" and "as available." We don't guarantee specific outcomes from mentorship sessions. To the extent permitted by law, we disclaim all warranties, express or implied.` },
        { id: 'liability', title: '9. Limitation of Liability', body: `To the maximum extent permitted by law, Bridge's total liability is limited to the amount you paid in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.` },
        { id: 'indemnity', title: '10. Indemnification', body: `You agree to indemnify and hold Bridge harmless from claims, damages, and expenses arising from your violation of these Terms or misuse of the platform.` },
        { id: 'termination', title: '11. Termination', body: `We may suspend or terminate accounts that violate these Terms. You can close your account at any time through settings. Termination doesn't relieve either party of obligations incurred before termination.` },
        { id: 'disputes', title: '12. Dispute Resolution', body: `Disputes will be resolved through binding arbitration under the rules of the American Arbitration Association, except for small-claims court actions and injunctive relief. Class-action waiver applies.` },
        { id: 'governing', title: '13. Governing Law', body: `These Terms are governed by the laws of the State of California, without regard to conflict-of-law principles. Exclusive venue for any court actions: San Francisco County, California.` },
        { id: 'contact', title: '14. Contact', body: `Questions about these Terms? Email legal@bridge.com.` },
];

export default function Terms() {
        return (
            <main className="relative min-h-screen bg-gradient-to-b from-[#fffaf3] via-[#fff4e3] to-[#fffaf3] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                            <Reveal className="mb-12">
                                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Legal</p>
                                    <h1 className="mt-3 font-display text-4xl font-semibold text-stone-900 sm:text-5xl">Terms of Use</h1>
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