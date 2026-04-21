-- ============================================================
-- Step 1: Assign tiers and session rates to existing mentors
-- Uses email as the stable unique key (matches mentor_seed_generated.sql)
-- ============================================================

-- Technology mentors
UPDATE public.mentor_profiles SET tier = 'expert',      session_rate = 145 WHERE email = 'priya0@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 110 WHERE email = 'marcus1@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'elite',       session_rate = 220 WHERE email = 'elena2@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 85  WHERE email = 'jordan3@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'expert',      session_rate = 135 WHERE email = 'sofia4@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 100 WHERE email = 'dev5@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 80  WHERE email = 'amelia6@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 90  WHERE email = 'ryan7@bridge.demo';

-- Finance mentors
UPDATE public.mentor_profiles SET tier = 'expert',      session_rate = 140 WHERE email = 'victoria8@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 85  WHERE email = 'james9@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 105 WHERE email = 'nadia10@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 115 WHERE email = 'thomas11@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'expert',      session_rate = 165 WHERE email = 'isabelle12@bridge.demo';

-- Healthcare mentors
UPDATE public.mentor_profiles SET tier = 'expert',      session_rate = 155 WHERE email = 'dr13@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'expert',      session_rate = 135 WHERE email = 'dr14@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'elite',       session_rate = 185 WHERE email = 'robert15@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 110 WHERE email = 'laura16@bridge.demo';

-- Marketing mentors
UPDATE public.mentor_profiles SET tier = 'expert',      session_rate = 130 WHERE email = 'olivia17@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 90  WHERE email = 'hugo18@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 100 WHERE email = 'chloe19@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'elite',       session_rate = 240 WHERE email = 'danielle20@bridge.demo';

-- Data Science mentors
UPDATE public.mentor_profiles SET tier = 'expert',      session_rate = 150 WHERE email = 'wei21@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'expert',      session_rate = 140 WHERE email = 'fatima22@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 80  WHERE email = 'greg23@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 105 WHERE email = 'yuki24@bridge.demo';

-- Education mentors
UPDATE public.mentor_profiles SET tier = 'expert',      session_rate = 160 WHERE email = 'dr25@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'expert',      session_rate = 135 WHERE email = 'michael26@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 105 WHERE email = 'rachel27@bridge.demo';

-- Law mentors
UPDATE public.mentor_profiles SET tier = 'expert',      session_rate = 145 WHERE email = 'andrew28@bridge.demo';
UPDATE public.mentor_profiles SET tier = 'established', session_rate = 75  WHERE email = 'sana29@bridge.demo';


-- ============================================================
-- Step 2: Insert 15 new mentors spread across all 4 tiers
-- ============================================================

INSERT INTO public.mentor_profiles
  (user_id, name, email, title, company, industry, bio, years_experience, expertise, rating, total_sessions, available, tier, session_rate)
VALUES

-- Rising (0–4 yrs, $40–$70)
(gen_random_uuid(), 'Caleb Torres', 'caleb.torres@bridge.demo',
 'Junior Data Analyst', 'Spotify', 'data science',
 'I joined Spotify fresh out of a data bootcamp and have spent two years building dashboards and SQL pipelines for the editorial team. I went from zero domain knowledge to owning a weekly metrics report used by VPs. I help aspiring analysts structure their first job search, polish take-home projects, and get comfortable talking about data in interviews.',
 2, '["SQL", "Python", "Dashboards", "Analytics", "Job Search"]'::jsonb,
 4.51, 38, true, 'rising', 50),

(gen_random_uuid(), 'Maya Johnson', 'maya.johnson@bridge.demo',
 'Software Engineer', 'Shopify', 'technology',
 'I graduated from a CS program two years ago and landed at Shopify through an internship I almost did not apply for. I work on the checkout team and have done two performance-focused projects that got me recognized in a mid-year review. I love helping new grads navigate the offer process, negotiate offers for the first time, and survive their first on-call rotation.',
 3, '["Ruby on Rails", "JavaScript", "Internship Recruiting", "New Grad", "On-Call"]'::jsonb,
 4.48, 52, true, 'rising', 55),

(gen_random_uuid(), 'Prashant Kumar', 'prashant.kumar@bridge.demo',
 'Compliance Analyst', 'KPMG', 'law',
 'I started in audit and pivoted to regulatory compliance after noticing how little junior staff understood the why behind rules. Four years in, I work on financial services compliance engagements and help law students and early-career professionals figure out whether advisory work fits them better than traditional practice. Sessions are honest about what the job actually looks like day to day.',
 4, '["Regulatory Compliance", "Financial Services", "Advisory", "Career Direction"]'::jsonb,
 4.45, 29, true, 'rising', 60),

-- Established (5–9 yrs, $75–$120)
(gen_random_uuid(), 'Hannah Moore', 'hannah.moore@bridge.demo',
 'Product Marketing Manager', 'HubSpot', 'marketing',
 'I have run launches for three major HubSpot product lines and trained more junior PMMs than I can count. My background in agency copywriting means I think about messaging differently than pure product people. I help PMMs build launch checklists that hold up under pressure and develop positioning they can defend to skeptical sales teams.',
 6, '["Product Marketing", "Positioning", "Launch Planning", "Sales Enablement"]'::jsonb,
 4.66, 88, true, 'established', 90),

(gen_random_uuid(), 'Diego Reyes', 'diego.reyes@bridge.demo',
 'Senior Backend Engineer', 'Twilio', 'technology',
 'I build and operate the APIs that developers call millions of times a day at Twilio. Seven years in distributed systems has taught me how to reason about failure modes, design clean contracts, and write runbooks that actually help during an incident. I help engineers preparing for senior-level design rounds and developers moving from frontend to backend.',
 7, '["API Design", "Distributed Systems", "Incident Response", "System Design Interviews"]'::jsonb,
 4.71, 117, true, 'established', 95),

(gen_random_uuid(), 'Lena Fischer', 'lena.fischer@bridge.demo',
 'Data Scientist', 'Booking.com', 'data science',
 'I run A/B experiments for one of the highest-traffic travel platforms in the world. Eight years of working with massive, messy data has made me opinionated about experiment design, statistical rigor, and how to communicate uncertainty to stakeholders who just want a number. I help data scientists moving from academia or from less experiment-heavy companies.',
 8, '["A/B Testing", "Experimentation", "Statistics", "Causal Inference", "Stakeholder Communication"]'::jsonb,
 4.69, 142, true, 'established', 110),

(gen_random_uuid(), 'Samuel Okeke', 'samuel.okeke@bridge.demo',
 'Senior Financial Analyst', 'Bain Capital', 'finance',
 'I model growth-equity investments and mentor analysts breaking into private markets from investment banking or consulting. Five years in PE-adjacent work means I know which Excel habits impress and which get you flagged in a case study. I am direct about interview timelines and help people build deal experience on paper before they have it in practice.',
 5, '["Financial Modeling", "Growth Equity", "Case Studies", "PE Recruiting"]'::jsonb,
 4.57, 76, true, 'established', 85),

(gen_random_uuid(), 'Kezia White', 'kezia.white@bridge.demo',
 'Senior Instructional Designer', 'Udemy', 'education',
 'I have built courses taken by more than half a million learners across technical and professional development topics. Nine years in ed-tech gives me a clear view of what makes content stick versus what looks polished but teaches nothing. I work with subject-matter experts who want to turn their knowledge into scalable learning products.',
 9, '["Instructional Design", "Course Development", "Learning Science", "Ed-Tech"]'::jsonb,
 4.62, 134, true, 'established', 105),

-- Expert (10–15 yrs, $125–$175)
(gen_random_uuid(), 'Dr. Rajesh Gupta', 'rajesh.gupta@bridge.demo',
 'Medical Director', 'Moderna', 'healthcare',
 'I lead a clinical development team working on mRNA therapeutics and transitioned from academic medicine twelve years ago. I advise MDs and PhDs on moving into biopharma from clinical or research settings. Expect a clear-eyed view of what medical directors actually do versus what the job posting claims, and practical coaching on regulatory and cross-functional dynamics.',
 12, '["Clinical Development", "mRNA", "Biopharma", "MD to Industry", "Medical Affairs"]'::jsonb,
 4.78, 196, true, 'expert', 160),

(gen_random_uuid(), 'Caroline Svensson', 'caroline.svensson@bridge.demo',
 'Senior Counsel', 'Airbnb', 'law',
 'I cover regulatory and product legal for a global marketplace and have navigated everything from housing law challenges to payment regulation across forty markets. Eleven years split between big law and in-house means I can speak both languages. I help attorneys make the firm-to-in-house transition without underselling their value in a commercial role.',
 11, '["In-House Transition", "Regulatory", "Product Counsel", "Global Markets", "Negotiation"]'::jsonb,
 4.74, 218, true, 'expert', 145),

(gen_random_uuid(), 'Ama Asante', 'ama.asante@bridge.demo',
 'Director of Engineering', 'Coinbase', 'technology',
 'I run a team of forty engineers across three time zones working on trading infrastructure. I moved from staff engineer to director in three years and have coached many engineers through the same transition. I focus on scope creation, organizational influence, and how to lead during regulatory ambiguity — a skill crypto requires more than most industries.',
 13, '["Engineering Leadership", "Staff to Director", "Crypto Infrastructure", "Org Design", "Scope"]'::jsonb,
 4.82, 267, true, 'expert', 165),

(gen_random_uuid(), 'Pieter van den Berg', 'pieter.berg@bridge.demo',
 'Investment Director', 'KKR', 'finance',
 'I have done buyout deals in Europe and the US for fourteen years and led diligence on more than twenty transactions. I coach professionals breaking into private equity from investment banking, consulting, or corporate finance. I am known for being direct: I will tell you exactly where your LBO model breaks and how your deal narrative would land in an investment committee.',
 14, '["Private Equity", "LBO", "Buyouts", "Investment Committee", "Diligence"]'::jsonb,
 4.85, 331, true, 'expert', 170),

(gen_random_uuid(), 'Grace Nakamura', 'grace.nakamura@bridge.demo',
 'Head of Growth Marketing', 'Shopify', 'marketing',
 'I have scaled Shopify merchant acquisition through paid, SEO, and lifecycle channels across North America and APAC for ten years. I help growth marketers move from tactical execution to strategic ownership and coach senior ICs preparing for their first manager role. I am particularly useful if you want to understand how performance marketing connects to brand at scale.',
 10, '["Growth Marketing", "Paid Acquisition", "SEO", "Lifecycle Marketing", "Manager Transition"]'::jsonb,
 4.76, 249, true, 'expert', 130),

-- Elite (15+ yrs, $180–$250)
(gen_random_uuid(), 'Dr. Patricia Walsh', 'patricia.walsh@bridge.demo',
 'Chief Medical Officer', 'Roche', 'healthcare',
 'I have led clinical strategy at three major pharmaceutical companies over eighteen years, including two pivotal trial programs that reached approval. I work with senior medical leaders on executive presence, board communication, and navigating the politics of large matrix organizations in regulated industries. Sessions are high-trust and direct. I expect you to come prepared.',
 18, '["CMO Coaching", "Clinical Strategy", "Executive Presence", "Board Communication", "Pharma Leadership"]'::jsonb,
 4.93, 472, true, 'elite', 230),

(gen_random_uuid(), 'Bernard Okafor', 'bernard.okafor@bridge.demo',
 'Managing Director', 'BlackRock', 'finance',
 'Twenty years in asset management, the last eight as an MD leading a multi-strategy team. I advise senior finance professionals on leadership transitions, succession planning, and building the executive presence that gets you into the right rooms. I also coach MDs and partners considering portfolio career moves or independent advisory roles after institutional careers.',
 20, '["Asset Management", "MD Coaching", "Executive Transitions", "Portfolio Career", "Leadership"]'::jsonb,
 4.91, 508, true, 'elite', 245);
