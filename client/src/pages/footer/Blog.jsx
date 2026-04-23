import { useState } from 'react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';

const POSTS = [
    { id: 1, category: 'Career', readTime: '6 min', title: 'How to Find the Right Mentor', date: 'Apr 15, 2026', author: 'Sarah Chen', excerpt: 'A practical guide to identifying mentors who will actually move the needle on your career.', body: `Finding a mentor is less about prestige and more about fit. The best mentors aren't the most famous — they're the ones who've walked your exact next step.\n\nStart by writing down the specific transition you're trying to make. "Get promoted" is too vague. "Go from senior IC to staff engineer at a Series B" is actionable. Now search for people who made that exact move in the last three years.\n\nWhen you reach out, skip the flattery. Lead with what you're trying to figure out and why you think they specifically can help. Keep it to five sentences. Book one session. See if it works. Don't commit to a six-month program with someone you've never met.\n\nThe best mentor relationships are built session by session, not signed up for.` },
    { id: 2, category: 'Craft', readTime: '8 min', title: 'The Science of Skill Transfer', date: 'Apr 8, 2026', author: 'Dr. Marcus Webb', excerpt: 'What neuroscience tells us about how expertise actually passes from one person to another.', body: `Expertise doesn't transfer through lectures. It transfers through apprenticeship — a fact neuroscience has confirmed repeatedly over the last two decades.\n\nWhen an expert explains their reasoning out loud while working through a real problem, the learner's brain activates patterns that reading about the same work can't produce. This is why a single 45-minute session watching someone debug your actual code teaches more than a 10-hour course.\n\nThe implication for careers is clear: optimize for apprenticeship-style learning. Book sessions where the mentor is reacting to your specific situation, not delivering a prepared lecture.` },
    { id: 3, category: 'Mentors', readTime: '5 min', title: 'Pricing Your Expertise as a Mentor', date: 'Mar 30, 2026', author: 'Elena Voss', excerpt: 'How top mentors on our platform think about value, pricing, and positioning.', body: `The mentors earning the most on Bridge aren't the ones charging the least. They're the ones charging enough to filter for serious mentees.\n\nWe analyzed booking data across 2,400 mentors. The sweet spot for most is $80-$150 per session — high enough to signal expertise, low enough to be accessible. Below $40, mentors report more no-shows and less prepared mentees. Above $200, booking velocity drops sharply unless the mentor has a strong external profile.\n\nStart in the middle of your market. Raise rates 15% every time you hit 80% booked.` },
    { id: 4, category: 'Stories', readTime: '7 min', title: 'From Junior to Senior in 18 Months', date: 'Mar 22, 2026', author: 'Jordan E.', excerpt: 'A case study in accelerated career growth through structured mentorship.', body: `Eighteen months ago I was a junior engineer stuck in tickets. Today I lead a team of four. Here's what changed.\n\nI stopped reading career advice on Twitter and started booking monthly sessions with a staff engineer who'd made the same jump. First session, she told me which of my work was promotion-bait and which was just busywork. I'd been doing mostly busywork.\n\nThe specifics of what she said aren't the point. The point is that one person who'd been there could diagnose my situation in 30 minutes in a way no amount of self-reflection had.` },
    { id: 5, category: 'Product', readTime: '4 min', title: 'Why We Built Single-Session Bookings', date: 'Mar 10, 2026', author: 'Sarah Chen', excerpt: 'The thinking behind our core product decision: one session at a time.', body: `Every other mentorship platform sells packages. We sell single sessions. Here's why.\n\nCommitment is the enemy of trying. When people have to buy a 3-month package to meet a mentor, most don't. When they can book 45 minutes for $60, they do. And once they've had one good session, they book again — on their terms.\n\nPackages serve the platform's revenue model. Single sessions serve the user's actual need.` },
    { id: 6, category: 'Career', readTime: '9 min', title: 'The Real Cost of Cold DMs', date: 'Feb 28, 2026', author: 'Priya Sharma', excerpt: 'Why "just reach out on LinkedIn" is terrible advice, and what actually works.', body: `The average cold LinkedIn DM to a senior professional gets a 4% response rate. We know because we measured it.\n\nHere's what happens when a busy executive opens a cold outreach message: they scan for three things in under five seconds. Who are you, what do you want, and why should they care. Most DMs fail all three tests simultaneously.\n\nThe fix isn't a better template. The fix is a platform where the ask is pre-negotiated and the mentor has already opted in.` },
];

const CATEGORIES = ['All', 'Career', 'Craft', 'Mentors', 'Stories', 'Product'];

export default function Blog() {
    const [category, setCategory] = useState('All');
    const [open, setOpen] = useState(null);
    const filtered = category === 'All' ? POSTS : POSTS.filter((p) => p.category === category);
    const active = POSTS.find((p) => p.id === open);

    if (active) {
        return (
            <main className={`${pageShell} px-4 py-16 sm:px-6 sm:py-20 lg:px-8`}>
                <article className="mx-auto max-w-3xl">
                    <button onClick={() => setOpen(null)} className={`mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 transition hover:text-orange-900 ${focusRing} rounded`}>
                        ← Back to blog
                    </button>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">{active.category} · {active.readTime} read</p>
                    <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-stone-900 sm:text-5xl">{active.title}</h1>
                    <p className="mt-5 text-sm text-stone-500">By {active.author} · {active.date}</p>
                    <div className="mt-8 space-y-5 text-lg leading-relaxed text-stone-700">
                        {active.body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                </article>
            </main>
        );
    }

    return (
        <main className={`${pageShell} px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
            <div className="mx-auto max-w-5xl">
                <Reveal className="mb-10 max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Blog</p>
                    <h1 className="mt-3 font-display text-4xl font-bold text-stone-900 sm:text-5xl">Essays on careers, craft, and mentorship.</h1>
                </Reveal>

                <div className="mb-8 flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                        <button key={c} onClick={() => setCategory(c)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${category === c ? 'border-stone-900 bg-stone-900 text-amber-50' : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'} ${focusRing}`}>{c}</button>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {filtered.map((post, i) => (
                        <Reveal key={post.id} delay={i * 50}>
                            <button onClick={() => setOpen(post.id)} className={`group h-full w-full overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-bridge-card ${focusRing}`}>
                                <div className="mb-4 h-40 rounded-xl bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200" />
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-700">{post.category} · {post.readTime}</p>
                                <h2 className="mt-3 font-display text-xl font-semibold text-stone-900 group-hover:text-orange-800">{post.title}</h2>
                                <p className="mt-3 text-sm leading-relaxed text-stone-600">{post.excerpt}</p>
                                <p className="mt-4 text-xs text-stone-500">{post.author} · {post.date}</p>
                            </button>
                        </Reveal>
                    ))}
                </div>
            </div>
        </main>
    );
}