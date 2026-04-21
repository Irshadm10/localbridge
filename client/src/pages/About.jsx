import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

export default function About() {
    const values = [
        { title: 'Authenticity', desc: 'Real mentors, real experience, real results. No gurus, no grifters.' },
        { title: 'Accessibility', desc: 'Quality mentorship shouldn\'t be reserved for the privileged few.' },
        { title: 'Impact', desc: 'We measure success by the outcomes of our community — not vanity metrics.' },
        { title: 'Trust', desc: 'Every mentor is vetted. Every interaction is protected.' },
    ];
    const team = [
        { name: 'Muaz S'},
        { name: 'Ahmet Y'},
        { name: 'Aayush P'},
        { name: 'Omar A'},
        { name: 'Irshad M' },
    ];

    return (
        <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#fffaf3] via-[#fff4e3] to-[#fffaf3]">
            <section className="relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <Reveal>
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">About Bridge</p>
                        <h1 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
                            Careers change in <span className="italic text-gradient-bridge">conversation</span>, not in courses.
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
                            Bridge exists because the best career advice rarely comes from books — it comes from someone who already did what you're about to try.
                        </p>
                    </Reveal>
                </div>
            </section>

            <section className="px-4 pb-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-2">
                    <Reveal>
                        <div className="rounded-[1.75rem] border border-stone-200/90 bg-white p-8 shadow-bridge-card">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Our mission</p>
                            <h2 className="mt-3 font-display text-2xl font-semibold text-stone-900 sm:text-3xl">Democratize access to the right conversation.</h2>
                            <p className="mt-4 leading-relaxed text-stone-600">The right ten minutes with the right person can alter the trajectory of a life. We're making those ten minutes bookable.</p>
                        </div>
                    </Reveal>
                    <Reveal delay={80}>
                        <div className="rounded-[1.75rem] border border-stone-200/90 bg-white p-8 shadow-bridge-card">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Our story</p>
                            <h2 className="mt-3 font-display text-2xl font-semibold text-stone-900 sm:text-3xl">Started in 2026 with a simple observation.</h2>
                            <p className="mt-4 leading-relaxed text-stone-600">Cold DMs go unanswered. Coaching packages cost thousands. The people with real answers weren't reachable — so we made them reachable, one hour at a time.</p>
                        </div>
                    </Reveal>
                </div>
            </section>

            <section className="border-y border-stone-200/70 bg-gradient-to-b from-white via-amber-50/40 to-white px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <Reveal className="mb-10 max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">What we believe</p>
                        <h2 className="mt-3 font-display text-3xl font-semibold text-stone-900 sm:text-4xl">Values we actually use.</h2>
                    </Reveal>
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                        {values.map((v, i) => (
                            <Reveal key={v.title} delay={i * 60}>
                                <div className="h-full rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-bridge-card">
                                    <p className="font-display text-lg font-semibold text-stone-900">{v.title}</p>
                                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{v.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <Reveal className="mb-10 max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Leadership</p>
                        <h2 className="mt-3 font-display text-3xl font-semibold text-stone-900 sm:text-4xl">The people behind Bridge.</h2>
                    </Reveal>
                    <div className="grid gap-6 md:grid-cols-3">
                        {team.map((m, i) => (
                            <Reveal key={m.name} delay={i * 80}>
                                <div className="rounded-[1.75rem] border border-stone-200/90 bg-white p-6 shadow-sm">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500" />
                                    <p className="mt-4 font-display text-lg font-semibold text-stone-900">{m.name}</p>
                                    <p className="text-sm font-medium text-orange-800">{m.role}</p>
                                    <p className="mt-3 text-sm leading-relaxed text-stone-600">{m.bio}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 pb-24 sm:px-6 lg:px-8">
                <Reveal>
                    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-600 via-amber-500 to-orange-700 px-8 py-14 text-center shadow-bridge-glow sm:px-14">
                        <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">Ready to find your person?</h2>
                        <p className="mt-4 text-lg text-orange-50/95">Free to browse. Pay only when you book.</p>
                        <Link to="/mentors" className={`mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-orange-700 shadow-lg transition hover:bg-orange-50 ${focusRing}`}>Browse mentors</Link>
                    </div>
                </Reveal>
            </section>
        </main>
    );
}
