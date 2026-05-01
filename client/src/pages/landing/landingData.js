export const AVATAR_GRAD = {
  amber: 'from-amber-400 to-orange-500',
  emerald: 'from-emerald-400 to-teal-500',
  sky: 'from-sky-400 to-blue-500',
  rose: 'from-rose-400 to-pink-500',
  violet: 'from-violet-400 to-purple-500',
  teal: 'from-teal-400 to-emerald-500',
  orange: 'from-orange-400 to-rose-500',
  pink: 'from-pink-400 to-rose-500',
};

export const ACTIVITY = [
  { ini: 'TN', name: 'Tyler N.', tone: 'amber', text: 'booked Interview Prep', with: 'Maya Chen', time: '2m ago' },
  { ini: 'PS', name: 'Priya S.', tone: 'emerald', text: 'landed a Staff PM role', time: '1h ago', win: true },
  { ini: 'LK', name: 'Liam K.', tone: 'sky', text: 'booked Resume Review', with: 'Jordan R.', time: '5m ago' },
  { ini: 'AM', name: 'Aisha M.', tone: 'rose', text: 'accepted an offer at Figma', time: '3h ago', win: true },
  { ini: 'JD', name: 'James D.', tone: 'violet', text: 'booked Career Advice', with: 'Elena Voss', time: '8m ago' },
  { ini: 'SR', name: 'Sofia R.', tone: 'teal', text: 'left a 5-star review', with: 'Marcus Lee', time: '11m ago' },
  { ini: 'KH', name: 'Kai H.', tone: 'orange', text: 'booked a Networking call', with: 'Tom Rodriguez', time: '15m ago' },
  { ini: 'NP', name: 'Nina P.', tone: 'pink', text: 'made the switch from finance', time: '6h ago', win: true },
];

export const MENTORS_ROW1 = [
  { name: 'Maya Chen', title: 'Director of Product', co: 'Linear', tags: ['PM Strategy', 'Promotion'], rate: 95, rating: 4.9, sessions: 86, tone: 'amber', online: true },
  { name: 'Jordan Reeves', title: 'Ex-FAANG Recruiter', co: 'Google', tags: ['Interview Prep', 'Offers'], rate: 60, rating: 4.8, sessions: 142, tone: 'orange' },
  { name: 'Elena Voss', title: 'RN → UX Designer', co: 'IDEO', tags: ['Career Switch', 'Portfolio'], rate: 45, rating: 5.0, sessions: 58, tone: 'rose', online: true },
  { name: 'Marcus Lee', title: 'Engineering Manager', co: 'Stripe', tags: ['EM Path', 'System Design'], rate: 120, rating: 4.9, sessions: 203, tone: 'sky' },
  { name: 'Dr. Aisha Park', title: 'Biotech Founder', co: 'Stanford', tags: ['Fundraising', 'Science Biz'], rate: 150, rating: 4.7, sessions: 37, tone: 'violet', online: true },
  { name: 'Tom Rodriguez', title: 'VP of Sales', co: 'Salesforce', tags: ['Enterprise Sales', 'SDR→AE'], rate: 55, rating: 4.8, sessions: 95, tone: 'teal' },
];

export const MENTORS_ROW2 = [
  { name: 'Sarah Kim', title: 'Head of Design', co: 'Airbnb', tags: ['Design Systems', 'Leadership'], rate: 85, rating: 4.9, sessions: 64, tone: 'pink', online: true },
  { name: 'Raj Patel', title: 'Principal Engineer', co: 'Meta', tags: ['Architecture', 'Staff Eng'], rate: 110, rating: 4.8, sessions: 118, tone: 'emerald' },
  { name: 'Camille Dubois', title: 'Brand Strategist', co: 'Nike', tags: ['Brand', 'Creative Strategy'], rate: 70, rating: 5.0, sessions: 43, tone: 'rose' },
  { name: 'Alex Wong', title: 'Growth Lead', co: 'Notion', tags: ['Growth', 'Retention'], rate: 90, rating: 4.7, sessions: 77, tone: 'amber' },
  { name: 'Diana Ferreira', title: 'Data Science Manager', co: 'Spotify', tags: ['ML', 'Analytics'], rate: 100, rating: 4.9, sessions: 52, tone: 'sky' },
  { name: 'Omar Hassan', title: 'Startup Founder', co: 'YC W23', tags: ['Fundraising', '0→1'], rate: 130, rating: 4.8, sessions: 29, tone: 'teal' },
];

export const OUTCOMES = [
  { result: 'Got the offer', metric: '+32% comp', name: 'Tyler N.', role: 'Senior Engineer', tone: 'amber', quote: 'Two sessions with a former FAANG recruiter. She rewrote my "tell me about yourself" in ten minutes. Offer came a week later.' },
  { result: 'Changed industries', metric: 'Banking → PM', name: 'Priya S.', role: 'Ex-Analyst, now PM', tone: 'emerald', quote: 'I was terrified to leave finance. One session with someone who made the exact same jump saved me six months of second-guessing.' },
  { result: 'Got promoted', metric: 'IC → Staff', name: 'Jordan E.', role: 'Staff Engineer', tone: 'sky', quote: "Stuck at Senior for four years. My mentor called out exactly which work didn't count. Promoted in the next cycle." },
  { result: 'Landed dream role', metric: 'PM at Stripe', name: 'Anika R.', role: 'Product Manager', tone: 'violet', quote: 'I had 12 final rounds in my career and bombed 11. After two sessions on frameworks and positioning, I closed my dream offer.' },
  { result: '+$70k jump', metric: 'Negotiated comp', name: 'Marcus W.', role: 'Staff Engineer', tone: 'rose', quote: "My mentor walked me through every comp negotiation lever I didn't know existed. I left $70k on the table at my last job." },
  { result: 'YC W24 batch', metric: 'Founded startup', name: 'Lina O.', role: 'Founder & CEO', tone: 'teal', quote: "I needed someone who'd actually raised — not a coach. Two calls and I had a deck investors actually opened." },
];

export const BRANDS = ['Stripe', 'Linear', 'Figma', 'Notion', 'Vercel', 'Airbnb', 'Anthropic', 'Spotify', 'Meta', 'Google', 'OpenAI', 'Salesforce'];

export const WHY_ROWS = [
  { label: 'You get a response', dm: '~10% reply rate', coaching: 'Always', bridge: 'Always — mentors opt in' },
  { label: "They've done your job", dm: 'Maybe', coaching: 'Rarely', bridge: "Yes — that's the filter" },
  { label: 'Structured session', dm: 'No', coaching: 'Yes', bridge: 'Yes — 4 named formats' },
  { label: 'Price shown upfront', dm: '—', coaching: 'Often hidden', bridge: 'On every profile' },
  { label: 'Real unfiltered reviews', dm: 'No', coaching: 'Curated only', bridge: 'All reviews, unfiltered' },
  { label: 'Commitment', dm: 'None', coaching: 'Multi-session pkg', bridge: 'One session at a time' },
];
