-- ============================================================
-- Mentor profile enrichment v2 — matched to actual DB names
-- Elena Vasquez already updated — skipped here
-- Run in chunks if Supabase times out
-- Tier values: rising / established / expert / elite
-- ============================================================

-- 1. Aisha Patel
UPDATE mentor_profiles SET
  title = 'Product Manager, Growth',
  company = 'Spotify',
  industry = 'Technology',
  bio = 'I lead growth product at Spotify and help aspiring PMs break into the role from engineering, consulting, or non-traditional backgrounds. We work on structuring your thinking for PM interviews, building a product portfolio that stands out, and understanding how growth metrics drive decision-making at consumer tech companies. I have interviewed hundreds of PM candidates and I know exactly where most people lose the offer. Come with a specific role you are targeting and we will reverse-engineer what it takes to get it.',
  years_experience = 8,
  expertise = '["Product Management", "Growth Metrics", "PM Interviews", "Consumer Tech", "Career Transitions", "A/B Testing"]'::jsonb,
  rating = 4.76,
  total_sessions = 112,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=9',
  linkedin_url = 'https://linkedin.com/in/aisha-patel',
  location = 'New York, NY',
  education = '[{"school": "Cornell University", "degree": "B.S.", "field": "Information Science", "year_graduated": 2016}]'::jsonb,
  work_experience = '[{"company": "Spotify", "title": "Product Manager, Growth", "start_year": 2021, "end_year": null, "description": "Owning listener acquisition and activation experiments across the free tier globally."}, {"company": "HubSpot", "title": "Associate Product Manager", "start_year": 2018, "end_year": 2021, "description": "Built features for the CRM product used by over 100,000 small businesses."}, {"company": "Deloitte", "title": "Business Technology Analyst", "start_year": 2016, "end_year": 2018, "description": "Delivered technology strategy engagements for financial services clients."}]'::jsonb,
  languages = ARRAY['English', 'Gujarati'],
  session_price = 95,
  response_time = 'Usually responds within 24 hours',
  booking_count = 72,
  featured = false,
  tier = 'established'
WHERE name = 'Aisha Patel';

-- 2. Amara Diallo
UPDATE mentor_profiles SET
  title = 'Senior UX Designer',
  company = 'Airbnb',
  industry = 'Design',
  bio = 'I design trust and safety experiences at Airbnb and mentor designers who want to break into product design at consumer tech companies. We work on portfolio curation, design critique, and how to communicate your design decisions in cross-functional settings where engineers and PMs push back. I am especially useful for designers transitioning from agency or graphic design backgrounds who feel intimidated by the product design interview process. Bring your portfolio and we will make it something that gets callbacks.',
  years_experience = 7,
  expertise = '["Product Design", "UX Research", "Design Systems", "Portfolio Review", "Figma", "Agency to In-House Transition"]'::jsonb,
  rating = 4.68,
  total_sessions = 88,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=16',
  linkedin_url = 'https://linkedin.com/in/amara-diallo',
  location = 'San Francisco, CA',
  education = '[{"school": "Rhode Island School of Design", "degree": "B.F.A.", "field": "Graphic Design", "year_graduated": 2017}]'::jsonb,
  work_experience = '[{"company": "Airbnb", "title": "Senior UX Designer", "start_year": 2021, "end_year": null, "description": "Designing trust and safety flows that protect hosts and guests across 220+ countries."}, {"company": "Dropbox", "title": "UX Designer", "start_year": 2019, "end_year": 2021, "description": "Contributed to the redesign of Dropbox Paper and the core file management experience."}, {"company": "IDEO", "title": "Design Researcher", "start_year": 2017, "end_year": 2019, "description": "Conducted qualitative research and facilitated co-design workshops for healthcare and fintech clients."}]'::jsonb,
  languages = ARRAY['English', 'French'],
  session_price = 85,
  response_time = 'Usually responds within a few hours',
  booking_count = 56,
  featured = false,
  tier = 'established'
WHERE name = 'Amara Diallo';

-- 3. Anika Patel
UPDATE mentor_profiles SET
  title = 'Investment Banking Analyst',
  company = 'Morgan Stanley',
  industry = 'Finance',
  bio = 'I recently completed the analyst program at Morgan Stanley in the TMT group and mentor undergraduates navigating the investment banking recruiting cycle for the first time. We cover networking outreach, technical prep, and how to hold your own in superday interviews without burning out in the process. I remember exactly what it felt like to be in your position — overwhelmed by the process and unsure where to start — and I will help you build a clear and realistic plan. I am especially effective with candidates from non-target schools.',
  years_experience = 3,
  expertise = '["Investment Banking Recruiting", "Technical Interview Prep", "Networking Strategy", "Financial Modeling Basics", "Non-Target Schools", "Resume Review"]'::jsonb,
  rating = 4.52,
  total_sessions = 38,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=23',
  linkedin_url = 'https://linkedin.com/in/anika-patel',
  location = 'New York, NY',
  education = '[{"school": "University of Michigan", "degree": "B.B.A.", "field": "Finance", "year_graduated": 2022}]'::jsonb,
  work_experience = '[{"company": "Morgan Stanley", "title": "Investment Banking Analyst", "start_year": 2022, "end_year": null, "description": "Executing M&A and equity transactions in the technology, media, and telecom coverage group."}, {"company": "Goldman Sachs", "title": "Summer Analyst", "start_year": 2021, "end_year": 2021, "description": "Supported the healthcare investment banking team on pitch materials and financial models."}]'::jsonb,
  languages = ARRAY['English', 'Hindi'],
  session_price = 55,
  response_time = 'Usually responds within a few hours',
  booking_count = 24,
  featured = false,
  tier = 'rising'
WHERE name = 'Anika Patel';

-- 4. Camille Fontaine
UPDATE mentor_profiles SET
  title = 'Director of Strategy',
  company = 'L''Oreal',
  industry = 'Marketing',
  bio = 'I lead global brand strategy at L''Oreal and mentor professionals entering consumer goods marketing from consulting or business school. Sessions focus on brand positioning, translating consumer insight into campaign briefs, and navigating the matrix structures that define large CPG organizations. I have seen many strong candidates stumble in case interviews because they think like consultants but not like brand managers — I help you make that shift. If you are targeting roles at beauty or consumer brands, I will give you a clear picture of what those teams actually value.',
  years_experience = 11,
  expertise = '["Brand Strategy", "Consumer Goods", "CPG Marketing", "Campaign Briefs", "Case Interview Prep", "Matrix Organizations"]'::jsonb,
  rating = 4.71,
  total_sessions = 102,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=44',
  linkedin_url = 'https://linkedin.com/in/camille-fontaine',
  location = 'Paris, France',
  education = '[{"school": "ESSEC Business School", "degree": "M.S.", "field": "Marketing", "year_graduated": 2013}, {"school": "Universite Paris-Dauphine", "degree": "B.A.", "field": "Economics", "year_graduated": 2011}]'::jsonb,
  work_experience = '[{"company": "L''Oreal", "title": "Director of Strategy", "start_year": 2020, "end_year": null, "description": "Leading global brand strategy for the luxury division across European and Asian markets."}, {"company": "Unilever", "title": "Senior Brand Manager", "start_year": 2016, "end_year": 2020, "description": "Managed brand P&L and campaign execution for personal care lines in Western Europe."}, {"company": "Bain & Company", "title": "Associate Consultant", "start_year": 2013, "end_year": 2016, "description": "Delivered consumer and retail strategy engagements for FMCG clients."}]'::jsonb,
  languages = ARRAY['English', 'French'],
  session_price = 130,
  response_time = 'Usually responds within 24 hours',
  booking_count = 68,
  featured = false,
  tier = 'established'
WHERE name = 'Camille Fontaine';

-- 5. Carlos Mendez
UPDATE mentor_profiles SET
  title = 'Staff Engineer, Platform',
  company = 'Shopify',
  industry = 'Technology',
  bio = 'I build the merchant platform infrastructure at Shopify and coach engineers on the path from senior to staff — a transition that is more political and organizational than technical. We work on how to identify the right problems, build influence without authority, and write design documents that actually drive alignment. I work across three time zones every day and can help you navigate the complexity of remote-first engineering culture. If you are a strong senior engineer who is not sure what is missing, I will help you figure that out.',
  years_experience = 13,
  expertise = '["Platform Engineering", "Staff+ Career Growth", "Technical Influence", "Design Documents", "Remote Engineering Culture", "Ruby on Rails"]'::jsonb,
  rating = 4.83,
  total_sessions = 148,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=33',
  linkedin_url = 'https://linkedin.com/in/carlos-mendez',
  location = 'Mexico City, Mexico',
  education = '[{"school": "Instituto Tecnologico de Monterrey", "degree": "B.S.", "field": "Computer Science", "year_graduated": 2011}]'::jsonb,
  work_experience = '[{"company": "Shopify", "title": "Staff Engineer", "start_year": 2019, "end_year": null, "description": "Designing and building the merchant platform infrastructure powering millions of storefronts worldwide."}, {"company": "Stripe", "title": "Senior Software Engineer", "start_year": 2015, "end_year": 2019, "description": "Contributed to payments infrastructure and the Ruby API client libraries."}, {"company": "Groupon", "title": "Software Engineer", "start_year": 2011, "end_year": 2015, "description": "Built deal discovery and inventory management services for the Latin American market."}]'::jsonb,
  languages = ARRAY['English', 'Spanish'],
  session_price = 120,
  response_time = 'Usually responds within 24 hours',
  booking_count = 96,
  featured = false,
  tier = 'established'
WHERE name = 'Carlos Mendez';

-- 6. Daniel Osei
UPDATE mentor_profiles SET
  title = 'Venture Capital Associate',
  company = 'Andreessen Horowitz',
  industry = 'Finance',
  bio = 'I evaluate early-stage investments at a16z and help founders and operators understand how venture investors think about markets, teams, and traction. Sessions are useful if you are raising a seed round for the first time, preparing for a VC associate interview, or trying to understand what makes a pitch compelling versus forgettable. I came from a startup founding background before joining the VC side, so I can speak to both perspectives honestly. If you want unfiltered feedback on your pitch or your fund-targeting strategy, I will give it to you.',
  years_experience = 7,
  expertise = '["Venture Capital", "Startup Fundraising", "Pitch Deck Review", "VC Career Recruiting", "Early Stage Investing", "Market Sizing"]'::jsonb,
  rating = 4.79,
  total_sessions = 118,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=53',
  linkedin_url = 'https://linkedin.com/in/daniel-osei',
  location = 'San Francisco, CA',
  education = '[{"school": "London School of Economics", "degree": "M.S.", "field": "Finance", "year_graduated": 2018}, {"school": "University of Ghana", "degree": "B.S.", "field": "Economics", "year_graduated": 2016}]'::jsonb,
  work_experience = '[{"company": "Andreessen Horowitz", "title": "Venture Capital Associate", "start_year": 2021, "end_year": null, "description": "Sourcing and evaluating early-stage investments across fintech and enterprise software."}, {"company": "Paystack", "title": "Co-founder & COO", "start_year": 2018, "end_year": 2021, "description": "Built operations and partnerships for a payments startup serving African merchants before acquisition."}, {"company": "Goldman Sachs", "title": "Analyst", "start_year": 2016, "end_year": 2018, "description": "Worked in the investment banking division covering TMT clients."}]'::jsonb,
  languages = ARRAY['English', 'Twi'],
  session_price = 140,
  response_time = 'Usually responds within 24 hours',
  booking_count = 80,
  featured = true,
  tier = 'established'
WHERE name = 'Daniel Osei';

-- 7. David Kim
UPDATE mentor_profiles SET
  title = 'Senior Data Scientist',
  company = 'Netflix',
  industry = 'Technology',
  bio = 'I build recommendation models at Netflix and mentor data scientists who want to move from analytics into machine learning or from academic research into industry. We work on project framing, communication with non-technical stakeholders, and the practical difference between a model that scores well and one that ships. I am also useful for people preparing for data science interviews at streaming and consumer internet companies. If you have strong math skills but are struggling to translate that into impact, I can help you close that gap.',
  years_experience = 9,
  expertise = '["Recommendation Systems", "Machine Learning", "Python", "A/B Testing", "DS Interview Prep", "Research to Industry Transition"]'::jsonb,
  rating = 4.81,
  total_sessions = 134,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=11',
  linkedin_url = 'https://linkedin.com/in/david-kim',
  location = 'Los Gatos, CA',
  education = '[{"school": "Carnegie Mellon University", "degree": "Ph.D.", "field": "Machine Learning", "year_graduated": 2015}, {"school": "Seoul National University", "degree": "B.S.", "field": "Mathematics", "year_graduated": 2010}]'::jsonb,
  work_experience = '[{"company": "Netflix", "title": "Senior Data Scientist", "start_year": 2018, "end_year": null, "description": "Building and evaluating recommendation algorithms that drive content discovery for 250M+ subscribers."}, {"company": "Twitter", "title": "Data Scientist", "start_year": 2015, "end_year": 2018, "description": "Developed ranking models for the home timeline and notifications product."}]'::jsonb,
  languages = ARRAY['English', 'Korean'],
  session_price = 125,
  response_time = 'Usually responds within 24 hours',
  booking_count = 90,
  featured = false,
  tier = 'established'
WHERE name = 'David Kim';

-- 8. Diane Foster
UPDATE mentor_profiles SET
  title = 'Chief People Officer',
  company = 'Asana',
  industry = 'Consulting',
  bio = 'I lead people strategy at a high-growth SaaS company and mentor HR professionals and operators who want to move into Chief of Staff, HRBP, or people leadership roles. We work on how to build credibility with skeptical engineering leaders, how to design performance systems that actually improve performance, and how to position your people experience as a strategic function rather than a cost center. I have built HR teams from scratch at two companies and I know what founders and boards actually look for when they hire for people roles.',
  years_experience = 16,
  expertise = '["People Strategy", "HRBP", "Performance Management", "Organizational Design", "Chief of Staff", "HR Leadership"]'::jsonb,
  rating = 4.73,
  total_sessions = 162,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=48',
  linkedin_url = 'https://linkedin.com/in/diane-foster',
  location = 'San Francisco, CA',
  education = '[{"school": "University of Southern California", "degree": "M.S.", "field": "Human Resources Management", "year_graduated": 2008}, {"school": "UCLA", "degree": "B.A.", "field": "Psychology", "year_graduated": 2006}]'::jsonb,
  work_experience = '[{"company": "Asana", "title": "Chief People Officer", "start_year": 2020, "end_year": null, "description": "Leading talent, culture, and organizational design for a 1,500-person globally distributed company."}, {"company": "Lyft", "title": "VP People Operations", "start_year": 2016, "end_year": 2020, "description": "Built the HR function from 200 to 5,000 employees during Lyft''s hypergrowth phase."}, {"company": "Google", "title": "Senior HRBP", "start_year": 2010, "end_year": 2016, "description": "Supported engineering and product organizations through rapid international expansion."}]'::jsonb,
  languages = ARRAY['English'],
  session_price = 170,
  response_time = 'Usually responds within 24 hours',
  booking_count = 115,
  featured = false,
  tier = 'elite'
WHERE name = 'Diane Foster';

-- 9. Dr. Lena Kim
UPDATE mentor_profiles SET
  title = 'Medical Director, Digital Therapeutics',
  company = 'Headspace Health',
  industry = 'Healthcare',
  bio = 'I oversee clinical evidence and product strategy for digital mental health tools and mentor physicians and researchers entering the digital health space. We work on translating clinical expertise into product requirements, building credibility with engineering and design teams, and navigating regulatory frameworks for software as a medical device. I made the leap from academic psychiatry into digital health and I understand every step of that transition. If you have clinical depth and want to have broader impact through technology, I can help you find your path.',
  years_experience = 12,
  expertise = '["Digital Mental Health", "Clinical Product Strategy", "SaMD Regulation", "Psychiatry", "Medicine to Tech Transition", "Evidence Generation"]'::jsonb,
  rating = 4.77,
  total_sessions = 98,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=3',
  linkedin_url = 'https://linkedin.com/in/lena-kim',
  location = 'Boston, MA',
  education = '[{"school": "Harvard Medical School", "degree": "M.D.", "field": "Psychiatry", "year_graduated": 2012}, {"school": "University of California, Berkeley", "degree": "B.S.", "field": "Cognitive Science", "year_graduated": 2008}]'::jsonb,
  work_experience = '[{"company": "Headspace Health", "title": "Medical Director", "start_year": 2020, "end_year": null, "description": "Overseeing clinical evidence strategy and regulatory affairs for digital mental health products."}, {"company": "Massachusetts General Hospital", "title": "Staff Psychiatrist", "start_year": 2015, "end_year": 2020, "description": "Practiced inpatient and outpatient psychiatry while conducting research on technology-assisted therapy."}, {"company": "McLean Hospital", "title": "Psychiatry Resident", "start_year": 2012, "end_year": 2015, "description": "Completed residency training with a focus on mood disorders and digital intervention research."}]'::jsonb,
  languages = ARRAY['English', 'Korean'],
  session_price = 150,
  response_time = 'Usually responds within 24 hours',
  booking_count = 64,
  featured = false,
  tier = 'established'
WHERE name = 'Dr. Lena Kim';

-- 10. Ethan Zhao
UPDATE mentor_profiles SET
  title = 'Engineering Manager, Infrastructure',
  company = 'Databricks',
  industry = 'Technology',
  bio = 'I manage infrastructure engineering at Databricks and coach engineers and early managers on technical leadership in fast-moving data platform companies. We work on how to scope large projects with many dependencies, how to build a team culture that ships without burning out, and how to communicate infrastructure investments to product-focused leadership. I was a strong IC who found the transition to management harder than expected and I mentor with that experience in mind. If you are a new manager or thinking about becoming one, I will give you a realistic picture.',
  years_experience = 10,
  expertise = '["Engineering Management", "Data Infrastructure", "Apache Spark", "New Manager Coaching", "Technical Roadmapping", "Team Culture"]'::jsonb,
  rating = 4.74,
  total_sessions = 118,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=18',
  linkedin_url = 'https://linkedin.com/in/ethan-zhao',
  location = 'San Francisco, CA',
  education = '[{"school": "University of Illinois Urbana-Champaign", "degree": "M.S.", "field": "Computer Science", "year_graduated": 2014}, {"school": "Zhejiang University", "degree": "B.S.", "field": "Software Engineering", "year_graduated": 2012}]'::jsonb,
  work_experience = '[{"company": "Databricks", "title": "Engineering Manager", "start_year": 2021, "end_year": null, "description": "Managing a team building the runtime infrastructure for the Databricks Lakehouse platform."}, {"company": "Palantir", "title": "Senior Software Engineer", "start_year": 2017, "end_year": 2021, "description": "Built data pipeline infrastructure for large enterprise and government deployments."}, {"company": "LinkedIn", "title": "Software Engineer", "start_year": 2014, "end_year": 2017, "description": "Contributed to the distributed data infrastructure powering LinkedIn''s analytics systems."}]'::jsonb,
  languages = ARRAY['English', 'Mandarin'],
  session_price = 115,
  response_time = 'Usually responds within 24 hours',
  booking_count = 78,
  featured = false,
  tier = 'established'
WHERE name = 'Ethan Zhao';

-- 11. Fatima Al-Hassan
UPDATE mentor_profiles SET
  title = 'Senior Consultant, Healthcare Strategy',
  company = 'McKinsey & Company',
  industry = 'Consulting',
  bio = 'I advise hospital systems and health insurance companies on strategy at McKinsey and mentor consultants and MBA students preparing for healthcare-focused case interviews. We work on structuring healthcare market analyses, understanding the payer-provider dynamic, and how to position yourself credibly for health sector roles without a clinical background. I am also helpful for clinicians who want to transition into consulting without an MBA. Most of my mentees leave sessions with a clearer sense of where they fit in the healthcare ecosystem and what to do next.',
  years_experience = 8,
  expertise = '["Healthcare Strategy", "Payer-Provider Dynamics", "Case Interview Prep", "MBA Recruiting", "Clinician to Consulting Transition", "Health Systems"]'::jsonb,
  rating = 4.69,
  total_sessions = 108,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=56',
  linkedin_url = 'https://linkedin.com/in/fatima-al-hassan',
  location = 'Chicago, IL',
  education = '[{"school": "University of Chicago Booth School of Business", "degree": "M.B.A.", "field": "Strategy & Healthcare", "year_graduated": 2018}, {"school": "American University of Beirut", "degree": "B.S.", "field": "Biology", "year_graduated": 2014}]'::jsonb,
  work_experience = '[{"company": "McKinsey & Company", "title": "Senior Consultant", "start_year": 2020, "end_year": null, "description": "Leading healthcare strategy engagements for health systems and payers across the US and Middle East."}, {"company": "McKinsey & Company", "title": "Consultant", "start_year": 2018, "end_year": 2020, "description": "Delivered operating model redesign and market entry projects for healthcare clients."}, {"company": "Pfizer", "title": "Clinical Research Associate", "start_year": 2014, "end_year": 2016, "description": "Supported phase II-III clinical trials across oncology and immunology programs."}]'::jsonb,
  languages = ARRAY['English', 'Arabic'],
  session_price = 110,
  response_time = 'Usually responds within 24 hours',
  booking_count = 72,
  featured = false,
  tier = 'established'
WHERE name = 'Fatima Al-Hassan';

-- 12. Grace Okonkwo
UPDATE mentor_profiles SET
  title = 'VP of Marketing',
  company = 'Flutterwave',
  industry = 'Marketing',
  bio = 'I lead marketing for one of Africa''s fastest-growing fintech companies and mentor marketers who want to build careers in emerging markets or at mission-driven startups. We cover go-to-market strategy in high-growth, resource-constrained environments, managing agencies across multiple markets, and building personal brand as a marketing leader. I am especially useful if you are considering roles outside of the traditional US/EU tech corridor. I will be honest about what those careers look like and how to position yourself for them.',
  years_experience = 11,
  expertise = '["Fintech Marketing", "Emerging Markets GTM", "Brand Building", "Agency Management", "Multi-Market Campaigns", "Startup Marketing"]'::jsonb,
  rating = 4.66,
  total_sessions = 88,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=64',
  linkedin_url = 'https://linkedin.com/in/grace-okonkwo',
  location = 'Lagos, Nigeria',
  education = '[{"school": "Lagos Business School", "degree": "M.B.A.", "field": "Marketing", "year_graduated": 2015}, {"school": "University of Lagos", "degree": "B.S.", "field": "Mass Communication", "year_graduated": 2012}]'::jsonb,
  work_experience = '[{"company": "Flutterwave", "title": "VP of Marketing", "start_year": 2021, "end_year": null, "description": "Leading brand, demand generation, and partner marketing across 30+ African markets."}, {"company": "Interswitch", "title": "Head of Brand Marketing", "start_year": 2017, "end_year": 2021, "description": "Built the consumer brand and launched payment products across West Africa."}, {"company": "Publicis Groupe", "title": "Account Manager", "start_year": 2015, "end_year": 2017, "description": "Managed campaigns for FMCG and telecoms clients across Nigeria and Ghana."}]'::jsonb,
  languages = ARRAY['English', 'Yoruba'],
  session_price = 90,
  response_time = 'Usually responds within 24 hours',
  booking_count = 58,
  featured = false,
  tier = 'established'
WHERE name = 'Grace Okonkwo';

-- 13. James Okafor
UPDATE mentor_profiles SET
  title = 'Software Engineer, ML Platform',
  company = 'Uber',
  industry = 'Technology',
  bio = 'I build machine learning platform tooling at Uber and mentor engineers who want to move into ML engineering from traditional software roles. We work on the practical skills that separate ML engineers from data scientists — feature stores, model serving, monitoring, and the infrastructure decisions that make models reliable in production. I also help people prepare for ML engineering interviews at companies with mature ML stacks. If you write software well and want to move into the ML space, I can give you a realistic roadmap.',
  years_experience = 7,
  expertise = '["ML Platform Engineering", "Feature Stores", "Model Serving", "Python", "ML Interview Prep", "SWE to MLE Transition"]'::jsonb,
  rating = 4.71,
  total_sessions = 92,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=21',
  linkedin_url = 'https://linkedin.com/in/james-okafor',
  location = 'San Francisco, CA',
  education = '[{"school": "Georgia Institute of Technology", "degree": "M.S.", "field": "Computer Science", "year_graduated": 2017}, {"school": "University of Lagos", "degree": "B.S.", "field": "Computer Engineering", "year_graduated": 2015}]'::jsonb,
  work_experience = '[{"company": "Uber", "title": "Software Engineer, ML Platform", "start_year": 2020, "end_year": null, "description": "Building Michelangelo ML platform components including feature stores and real-time model serving."}, {"company": "Palantir", "title": "Forward Deployed Engineer", "start_year": 2017, "end_year": 2020, "description": "Deployed data infrastructure and ML pipelines for government and financial services clients."}]'::jsonb,
  languages = ARRAY['English', 'Yoruba'],
  session_price = 90,
  response_time = 'Usually responds within 24 hours',
  booking_count = 60,
  featured = false,
  tier = 'established'
WHERE name = 'James Okafor';

-- 14. James Whitfield
UPDATE mentor_profiles SET
  title = 'Director, Corporate Development',
  company = 'Salesforce',
  industry = 'Finance',
  bio = 'I lead M&A and strategic investments at Salesforce and mentor professionals trying to break into corporate development from investment banking or consulting. We work on understanding the buyside M&A process, how to evaluate strategic fit versus financial returns, and how to navigate internal stakeholder dynamics that are very different from a bank. I have closed deals ranging from $50M tuck-ins to billion-dollar platform acquisitions and I know what separates strong corpdev candidates from the field. If you are eyeing a move from banking into tech M&A, I will tell you exactly what that takes.',
  years_experience = 14,
  expertise = '["Corporate Development", "M&A Strategy", "Tech M&A", "Buyside Process", "Strategic Fit Analysis", "IB to CorpDev Transition"]'::jsonb,
  rating = 4.84,
  total_sessions = 155,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=59',
  linkedin_url = 'https://linkedin.com/in/james-whitfield',
  location = 'San Francisco, CA',
  education = '[{"school": "Wharton School, University of Pennsylvania", "degree": "M.B.A.", "field": "Finance", "year_graduated": 2013}, {"school": "Duke University", "degree": "B.S.", "field": "Economics", "year_graduated": 2010}]'::jsonb,
  work_experience = '[{"company": "Salesforce", "title": "Director, Corporate Development", "start_year": 2019, "end_year": null, "description": "Leading strategic acquisitions and minority investments across CRM, AI, and data analytics."}, {"company": "Cisco", "title": "Senior Manager, Corporate Development", "start_year": 2015, "end_year": 2019, "description": "Executed acquisitions in enterprise networking and cybersecurity."}, {"company": "Morgan Stanley", "title": "Associate, Investment Banking", "start_year": 2013, "end_year": 2015, "description": "Advised technology clients on M&A transactions and equity offerings."}]'::jsonb,
  languages = ARRAY['English'],
  session_price = 155,
  response_time = 'Usually responds within 24 hours',
  booking_count = 106,
  featured = true,
  tier = 'elite'
WHERE name = 'James Whitfield';

-- 15. Jordan Rivers
UPDATE mentor_profiles SET
  title = 'Senior Product Designer',
  company = 'Stripe',
  industry = 'Design',
  bio = 'I design developer-facing products at Stripe and mentor designers who want to work on complex, technical products where the user is often an engineer. We work on how to think about information density, progressive disclosure, and API documentation as a design surface — skills that most design programs never teach. I also help designers prepare for whiteboard critiques and portfolio reviews at fintech and developer tools companies. If you are a strong visual designer who wants to grow into more complex problem spaces, I will help you get there.',
  years_experience = 8,
  expertise = '["Developer Product Design", "Information Architecture", "Design Critiques", "Fintech UX", "Portfolio Review", "Technical User Research"]'::jsonb,
  rating = 4.78,
  total_sessions = 122,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=36',
  linkedin_url = 'https://linkedin.com/in/jordan-rivers',
  location = 'San Francisco, CA',
  education = '[{"school": "Savannah College of Art and Design", "degree": "B.F.A.", "field": "Interaction Design", "year_graduated": 2016}]'::jsonb,
  work_experience = '[{"company": "Stripe", "title": "Senior Product Designer", "start_year": 2020, "end_year": null, "description": "Designing the Stripe Dashboard and developer documentation experience used by millions of developers."}, {"company": "Twilio", "title": "Product Designer", "start_year": 2017, "end_year": 2020, "description": "Led design for the Twilio Console and messaging product API documentation."}, {"company": "Huge Inc.", "title": "UX Designer", "start_year": 2016, "end_year": 2017, "description": "Designed digital experiences for retail and media clients."}]'::jsonb,
  languages = ARRAY['English'],
  session_price = 105,
  response_time = 'Usually responds within a few hours',
  booking_count = 82,
  featured = false,
  tier = 'established'
WHERE name = 'Jordan Rivers';

-- 16. Kwame Asante
UPDATE mentor_profiles SET
  title = 'Founder & CEO',
  company = 'Kora',
  industry = 'Technology',
  bio = 'I founded and run a fintech startup serving African diaspora communities and mentor first-time founders navigating pre-seed and seed fundraising. Sessions cover pitch narrative, investor targeting, and how to talk about traction honestly when your numbers are still early. I have raised from both US and African VCs and I understand what different investor types care about. I am especially useful for founders building in emerging markets or underrepresented communities who feel like the standard playbook was not written for them.',
  years_experience = 9,
  expertise = '["Startup Fundraising", "Fintech", "Founder Coaching", "Pitch Narrative", "Emerging Market Startups", "Pre-seed & Seed Rounds"]'::jsonb,
  rating = 4.62,
  total_sessions = 76,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=69',
  linkedin_url = 'https://linkedin.com/in/kwame-asante',
  location = 'Accra, Ghana',
  education = '[{"school": "Harvard Business School", "degree": "M.B.A.", "field": "Entrepreneurial Management", "year_graduated": 2016}, {"school": "University of Ghana", "degree": "B.S.", "field": "Computer Science", "year_graduated": 2013}]'::jsonb,
  work_experience = '[{"company": "Kora", "title": "Founder & CEO", "start_year": 2019, "end_year": null, "description": "Building cross-border payment infrastructure for the African diaspora with operations in 12 countries."}, {"company": "Google", "title": "Product Manager", "start_year": 2016, "end_year": 2019, "description": "Led emerging markets product strategy for Google Pay in Sub-Saharan Africa."}]'::jsonb,
  languages = ARRAY['English', 'Twi'],
  session_price = 100,
  response_time = 'Usually responds within 24 hours',
  booking_count = 50,
  featured = false,
  tier = 'established'
WHERE name = 'Kwame Asante';

-- 17. Linda Park
UPDATE mentor_profiles SET
  title = 'VP of Engineering',
  company = 'Spotify',
  industry = 'Technology',
  bio = 'I have led three engineering organizations across 15 years and work with senior ICs and directors navigating the VP path and executive presence. Sessions focus on how to lead without being in every meeting, how to build a team identity that attracts strong people, and how to influence product and business strategy from an engineering seat. I am direct and move fast — I will tell you where your thinking has gaps and what to do about it. If you are already a strong manager and want to figure out what director and VP actually looks like, I am the right person to talk to.',
  years_experience = 17,
  expertise = '["Executive Engineering Leadership", "VP Career Path", "Org Design", "Engineering Strategy", "Stakeholder Management", "Director to VP Coaching"]'::jsonb,
  rating = 5.0,
  total_sessions = 143,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=26',
  linkedin_url = 'https://linkedin.com/in/linda-park',
  location = 'Stockholm, Sweden',
  education = '[{"school": "KAIST", "degree": "M.S.", "field": "Computer Science", "year_graduated": 2007}, {"school": "Yonsei University", "degree": "B.S.", "field": "Computer Science", "year_graduated": 2005}]'::jsonb,
  work_experience = '[{"company": "Spotify", "title": "VP of Engineering", "start_year": 2019, "end_year": null, "description": "Leading 4 engineering teams across personalization and podcast infrastructure serving 600M+ users."}, {"company": "King", "title": "Director of Engineering", "start_year": 2015, "end_year": 2019, "description": "Led engineering for the mobile games platform powering Candy Crush and 200+ titles."}, {"company": "Ericsson", "title": "Senior Software Engineer", "start_year": 2009, "end_year": 2015, "description": "Built distributed systems for telecom infrastructure across Europe and Asia."}]'::jsonb,
  languages = ARRAY['English', 'Korean', 'Swedish'],
  session_price = 225,
  response_time = 'Usually responds within 24 hours',
  booking_count = 0,
  featured = true,
  tier = 'elite'
WHERE name = 'Linda Park';

-- 18. Marco Rossi
UPDATE mentor_profiles SET
  title = 'Head of Growth',
  company = 'Revolut',
  industry = 'Finance',
  bio = 'I run user acquisition and referral programs for one of Europe''s largest neobanks and mentor growth professionals and operators at fintech startups. Sessions cover channel strategy, viral coefficient math, and how to build a growth team from scratch without hiring a bunch of generalists who can''t ship. I am especially useful for people moving from traditional banking or payments into growth roles at challenger banks. I will give you a realistic picture of what fintech growth actually looks like on the inside.',
  years_experience = 9,
  expertise = '["Fintech Growth", "User Acquisition", "Referral Programs", "Growth Team Building", "Challenger Banks", "Channel Strategy"]'::jsonb,
  rating = 4.67,
  total_sessions = 96,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=43',
  linkedin_url = 'https://linkedin.com/in/marco-rossi',
  location = 'London, UK',
  education = '[{"school": "Bocconi University", "degree": "M.S.", "field": "Finance", "year_graduated": 2015}, {"school": "University of Bologna", "degree": "B.A.", "field": "Economics", "year_graduated": 2013}]'::jsonb,
  work_experience = '[{"company": "Revolut", "title": "Head of Growth", "start_year": 2020, "end_year": null, "description": "Owning user acquisition and referral strategy across 35 markets, growing MAU from 12M to 40M."}, {"company": "TransferWise", "title": "Growth Manager", "start_year": 2017, "end_year": 2020, "description": "Built referral and partner acquisition channels across Southern Europe."}, {"company": "Bain & Company", "title": "Associate Consultant", "start_year": 2015, "end_year": 2017, "description": "Delivered financial services and consumer strategy engagements across Italy and the UK."}]'::jsonb,
  languages = ARRAY['English', 'Italian'],
  session_price = 115,
  response_time = 'Usually responds within 24 hours',
  booking_count = 64,
  featured = false,
  tier = 'established'
WHERE name = 'Marco Rossi';

-- 19. Marcus Webb
UPDATE mentor_profiles SET
  title = 'Senior Software Engineer',
  company = 'GitHub',
  industry = 'Technology',
  bio = 'I build developer tooling at GitHub and mentor engineers who want to contribute to open source, land jobs at developer tools companies, or grow their technical reputation outside of their day job. We work on how to pick meaningful open source projects, how to write code that gets merged, and how to turn public contributions into a career asset that opens doors. I am also useful for engineers preparing for GitHub-style interviews or looking to transition from enterprise to product engineering. If you want to be known for what you build, not just where you work, I can help you get started.',
  years_experience = 8,
  expertise = '["Open Source", "Developer Tooling", "Ruby", "Git", "Technical Reputation Building", "Enterprise to Product Engineering"]'::jsonb,
  rating = 4.65,
  total_sessions = 84,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=29',
  linkedin_url = 'https://linkedin.com/in/marcus-webb',
  location = 'Atlanta, GA',
  education = '[{"school": "Morehouse College", "degree": "B.S.", "field": "Computer Science", "year_graduated": 2016}]'::jsonb,
  work_experience = '[{"company": "GitHub", "title": "Senior Software Engineer", "start_year": 2020, "end_year": null, "description": "Building code review and collaboration features for GitHub.com used by 100M+ developers."}, {"company": "IBM", "title": "Software Engineer", "start_year": 2016, "end_year": 2020, "description": "Developed enterprise DevOps tooling and contributed to IBM''s open source initiatives."}]'::jsonb,
  languages = ARRAY['English'],
  session_price = 80,
  response_time = 'Usually responds within a few hours',
  booking_count = 54,
  featured = false,
  tier = 'rising'
WHERE name = 'Marcus Webb';

-- 20. Nina Kowalski
UPDATE mentor_profiles SET
  title = 'Product Lead, Enterprise',
  company = 'Notion',
  industry = 'Technology',
  bio = 'I lead enterprise product at Notion and mentor PMs who want to move from consumer into B2B or enterprise roles. We work on understanding the procurement and buying cycle, building for multiple personas within the same product, and how to talk to customers in enterprise sales motions without losing the craft of the product. I have done PLG and traditional sales-led enterprise and I can help you understand the tradeoffs clearly. If you are a PM who wants to go deeper into the enterprise side of SaaS, I can give you a realistic map of what that looks like.',
  years_experience = 10,
  expertise = '["Enterprise Product Management", "PLG to Enterprise", "B2B SaaS", "Procurement & Buying Cycles", "Multi-Persona Products", "Sales-Led GTM"]'::jsonb,
  rating = 4.75,
  total_sessions = 118,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=38',
  linkedin_url = 'https://linkedin.com/in/nina-kowalski',
  location = 'New York, NY',
  education = '[{"school": "Warsaw School of Economics", "degree": "M.S.", "field": "Business Administration", "year_graduated": 2014}, {"school": "University of Warsaw", "degree": "B.A.", "field": "Informatics and Econometrics", "year_graduated": 2012}]'::jsonb,
  work_experience = '[{"company": "Notion", "title": "Product Lead, Enterprise", "start_year": 2022, "end_year": null, "description": "Owning the enterprise product roadmap including admin controls, SSO, and compliance features."}, {"company": "Dropbox", "title": "Senior Product Manager", "start_year": 2018, "end_year": 2022, "description": "Led B2B product for Dropbox Business, serving teams from 10 to 10,000+ employees."}, {"company": "Zalando", "title": "Product Manager", "start_year": 2014, "end_year": 2018, "description": "Built logistics and seller platform features for one of Europe''s largest e-commerce companies."}]'::jsonb,
  languages = ARRAY['English', 'Polish'],
  session_price = 110,
  response_time = 'Usually responds within 24 hours',
  booking_count = 78,
  featured = false,
  tier = 'established'
WHERE name = 'Nina Kowalski';

-- 21. Omar Abdullah
UPDATE mentor_profiles SET
  title = 'Software Engineer II',
  company = 'Microsoft',
  industry = 'Technology',
  bio = 'I work on the Azure developer experience team and mentor new grads and early-career engineers getting their footing at large tech companies. We work on how to ramp quickly, build relationships with senior engineers, and make your contributions visible without being annoying about it. I also help people prepare for Microsoft-style behavioral and coding interviews. I am a few years into my career and I remember exactly what it felt like to be new — I will give you advice that is grounded in recent experience, not how things worked a decade ago.',
  years_experience = 4,
  expertise = '["New Grad Coaching", "Microsoft Interview Prep", "Azure", "Early Career Navigation", "C#", ".NET"]'::jsonb,
  rating = 4.53,
  total_sessions = 44,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=14',
  linkedin_url = 'https://linkedin.com/in/omar-abdullah',
  location = 'Redmond, WA',
  education = '[{"school": "University of Washington", "degree": "B.S.", "field": "Computer Science", "year_graduated": 2021}]'::jsonb,
  work_experience = '[{"company": "Microsoft", "title": "Software Engineer II", "start_year": 2023, "end_year": null, "description": "Building developer experience tooling for the Azure portal used by millions of cloud developers."}, {"company": "Microsoft", "title": "Software Engineer I", "start_year": 2021, "end_year": 2023, "description": "Joined as a new grad on the Azure developer tools team, contributing to CLI and SDK features."}]'::jsonb,
  languages = ARRAY['English', 'Arabic'],
  session_price = 50,
  response_time = 'Usually responds within a few hours',
  booking_count = 28,
  featured = false,
  tier = 'rising'
WHERE name = 'Omar Abdullah';

-- 22. Omar Haddad
UPDATE mentor_profiles SET
  title = 'Principal Consultant, Digital Transformation',
  company = 'Accenture',
  industry = 'Consulting',
  bio = 'I lead digital transformation programs for large enterprises at Accenture and mentor consultants who want to specialize in technology strategy or move into industry roles at the companies they advise. We work on building technical credibility without being a software engineer, managing large programs with many workstreams, and how to position yourself for a director role before you feel ready. I have worked across financial services, telecom, and public sector and I can speak to each of those industries specifically. I am especially useful for consultants who feel like they are getting generalist experience but want to go deeper.',
  years_experience = 13,
  expertise = '["Digital Transformation", "Technology Strategy", "Program Management", "Consulting to Industry Transition", "Enterprise Architecture", "Stakeholder Management"]'::jsonb,
  rating = 4.70,
  total_sessions = 138,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=58',
  linkedin_url = 'https://linkedin.com/in/omar-haddad',
  location = 'Dubai, UAE',
  education = '[{"school": "INSEAD", "degree": "M.B.A.", "field": "Management", "year_graduated": 2014}, {"school": "American University of Beirut", "degree": "B.E.", "field": "Computer Engineering", "year_graduated": 2011}]'::jsonb,
  work_experience = '[{"company": "Accenture", "title": "Principal Consultant", "start_year": 2019, "end_year": null, "description": "Leading digital transformation programs for financial services and government clients across the Middle East."}, {"company": "Accenture", "title": "Senior Consultant", "start_year": 2016, "end_year": 2019, "description": "Delivering enterprise architecture and ERP implementation projects for telecom clients."}, {"company": "Accenture", "title": "Consultant", "start_year": 2014, "end_year": 2016, "description": "Supporting technology strategy and systems integration engagements across the GCC region."}]'::jsonb,
  languages = ARRAY['English', 'Arabic', 'French'],
  session_price = 125,
  response_time = 'Usually responds within 24 hours',
  booking_count = 94,
  featured = false,
  tier = 'established'
WHERE name = 'Omar Haddad';

-- 23. Priya Nair
UPDATE mentor_profiles SET
  title = 'Regulatory Affairs Director',
  company = 'Johnson & Johnson',
  industry = 'Healthcare',
  bio = 'I navigate FDA submissions and global regulatory strategy for medical devices at J&J and mentor scientists and engineers who want to build careers in regulatory affairs. We work on understanding the regulatory pathway for new products, building the documentation skills that regulators actually respond to, and how to position yourself for regulatory roles if you are coming from a research or engineering background. I am especially useful for people targeting roles in medical devices or diagnostics where the regulatory environment is complex and highly consequential.',
  years_experience = 14,
  expertise = '["FDA Regulatory Strategy", "Medical Device Regulation", "510k & PMA Submissions", "Global Regulatory Affairs", "Clinical Evidence", "Regulatory Career Coaching"]'::jsonb,
  rating = 4.72,
  total_sessions = 128,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=6',
  linkedin_url = 'https://linkedin.com/in/priya-nair',
  location = 'New Brunswick, NJ',
  education = '[{"school": "Rutgers University", "degree": "Ph.D.", "field": "Biomedical Engineering", "year_graduated": 2010}, {"school": "IIT Bombay", "degree": "B.Tech.", "field": "Biomedical Engineering", "year_graduated": 2005}]'::jsonb,
  work_experience = '[{"company": "Johnson & Johnson", "title": "Regulatory Affairs Director", "start_year": 2018, "end_year": null, "description": "Leading global regulatory strategy for cardiovascular and orthopedic device product lines."}, {"company": "Medtronic", "title": "Senior Regulatory Affairs Specialist", "start_year": 2013, "end_year": 2018, "description": "Managing 510(k) and PMA submissions for neurostimulation and cardiac rhythm devices."}, {"company": "FDA Center for Devices", "title": "Regulatory Reviewer", "start_year": 2010, "end_year": 2013, "description": "Reviewed premarket submissions for Class II medical devices in the neurology division."}]'::jsonb,
  languages = ARRAY['English', 'Malayalam'],
  session_price = 145,
  response_time = 'Usually responds within 24 hours',
  booking_count = 88,
  featured = false,
  tier = 'elite'
WHERE name = 'Priya Nair';

-- 24. Priya Sharma
UPDATE mentor_profiles SET
  title = 'Data Engineer',
  company = 'Snowflake',
  industry = 'Technology',
  bio = 'I build data infrastructure at Snowflake and mentor engineers transitioning from data analytics into data engineering or from legacy on-premise stacks into modern cloud data platforms. We work on the core skills that define a strong data engineer today — pipeline design, data modeling for analytics, and understanding the tradeoffs between different transformation approaches. I am also helpful for people preparing for data engineering interviews at cloud-native companies. If you work with data but feel like you are always waiting on someone else to build the infrastructure, I can help you close that gap.',
  years_experience = 6,
  expertise = '["Data Engineering", "Snowflake", "dbt", "Pipeline Design", "Cloud Data Platforms", "Analytics to Engineering Transition"]'::jsonb,
  rating = 4.60,
  total_sessions = 68,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=19',
  linkedin_url = 'https://linkedin.com/in/priya-sharma-de',
  location = 'San Mateo, CA',
  education = '[{"school": "University of California, San Diego", "degree": "B.S.", "field": "Data Science", "year_graduated": 2019}]'::jsonb,
  work_experience = '[{"company": "Snowflake", "title": "Data Engineer", "start_year": 2022, "end_year": null, "description": "Building internal data infrastructure and dbt models powering Snowflake''s own revenue analytics."}, {"company": "Instacart", "title": "Analytics Engineer", "start_year": 2019, "end_year": 2022, "description": "Developed the metrics layer and data models supporting growth and marketplace analytics."}]'::jsonb,
  languages = ARRAY['English', 'Hindi'],
  session_price = 70,
  response_time = 'Usually responds within a few hours',
  booking_count = 44,
  featured = false,
  tier = 'rising'
WHERE name = 'Priya Sharma';

-- 25. Rachel Thompson
UPDATE mentor_profiles SET
  title = 'Head of Legal, Privacy & Compliance',
  company = 'Coinbase',
  industry = 'Legal',
  bio = 'I lead privacy and regulatory compliance at Coinbase and mentor attorneys and compliance professionals building careers in crypto and web3 legal. Sessions cover how to navigate the rapidly evolving regulatory environment for digital assets, how to advise product teams who are moving faster than the law, and how to position yourself credibly for in-house roles in an industry where most hiring managers are figuring things out at the same time you are. I am direct about uncertainty — this space changes fast and I will help you think clearly about how to manage that.',
  years_experience = 11,
  expertise = '["Crypto Regulatory Law", "Privacy Law", "GDPR & CCPA", "In-House Legal", "Compliance Programs", "Web3 Legal Careers"]'::jsonb,
  rating = 4.74,
  total_sessions = 115,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=46',
  linkedin_url = 'https://linkedin.com/in/rachel-thompson',
  location = 'San Francisco, CA',
  education = '[{"school": "UC Berkeley School of Law", "degree": "J.D.", "field": "Law", "year_graduated": 2013}, {"school": "University of Michigan", "degree": "B.A.", "field": "Political Science", "year_graduated": 2010}]'::jsonb,
  work_experience = '[{"company": "Coinbase", "title": "Head of Legal, Privacy & Compliance", "start_year": 2020, "end_year": null, "description": "Overseeing privacy, AML compliance, and regulatory affairs for a publicly traded crypto exchange."}, {"company": "Uber", "title": "Senior Privacy Counsel", "start_year": 2016, "end_year": 2020, "description": "Managing global privacy compliance programs and data protection agreements across 70+ markets."}, {"company": "Orrick, Herrington & Sutcliffe", "title": "Associate", "start_year": 2013, "end_year": 2016, "description": "Advised technology clients on privacy law, data security incidents, and regulatory investigations."}]'::jsonb,
  languages = ARRAY['English'],
  session_price = 160,
  response_time = 'Usually responds within 24 hours',
  booking_count = 78,
  featured = false,
  tier = 'elite'
WHERE name = 'Rachel Thompson';

-- 26. Ryan Nakamura
UPDATE mentor_profiles SET
  title = 'Senior Product Manager, Ads',
  company = 'Google',
  industry = 'Technology',
  bio = 'I lead ads product at Google and mentor PMs who want to work on monetization, marketplace, or ads systems at large consumer tech companies. We work on how to think about auction dynamics and advertiser incentives, how to navigate the tension between user experience and revenue, and how to structure a career in ads product without getting typecast. I am also helpful for analysts or engineers who want to move into product management in ads-adjacent roles. If the business model of the internet interests you, I will help you build a career at the center of it.',
  years_experience = 10,
  expertise = '["Ads Product Management", "Auction Systems", "Monetization Strategy", "Marketplace Design", "PM Career Coaching", "Analyst to PM Transition"]'::jsonb,
  rating = 4.80,
  total_sessions = 142,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=31',
  linkedin_url = 'https://linkedin.com/in/ryan-nakamura',
  location = 'Mountain View, CA',
  education = '[{"school": "MIT Sloan School of Management", "degree": "M.B.A.", "field": "Management", "year_graduated": 2015}, {"school": "UC San Diego", "degree": "B.S.", "field": "Economics", "year_graduated": 2013}]'::jsonb,
  work_experience = '[{"company": "Google", "title": "Senior Product Manager, Ads", "start_year": 2019, "end_year": null, "description": "Leading the advertiser bidding experience for Google Search Ads serving billions of queries daily."}, {"company": "Google", "title": "Product Manager", "start_year": 2015, "end_year": 2019, "description": "Built auction quality and spam detection features for the Google Display Network."}]'::jsonb,
  languages = ARRAY['English', 'Japanese'],
  session_price = 135,
  response_time = 'Usually responds within 24 hours',
  booking_count = 96,
  featured = true,
  tier = 'established'
WHERE name = 'Ryan Nakamura';

-- 27. Sarah Chen
UPDATE mentor_profiles SET
  title = 'Principal Designer, Design Systems',
  company = 'Microsoft',
  industry = 'Design',
  bio = 'I lead the Fluent design system at Microsoft and mentor designers who want to specialize in design systems, tokens, and the infrastructure that makes product teams faster. We work on how to build a design system that gets adopted rather than ignored, how to advocate for system investment to skeptical engineering and product leaders, and how to grow your career as a systems-focused designer in an industry that still overvalues pixel-level output. If you are a designer who thinks more about scale and consistency than individual screens, I am the right mentor for you.',
  years_experience = 12,
  expertise = '["Design Systems", "Component Libraries", "Fluent Design", "Design Tokens", "Cross-functional Advocacy", "Systems Thinking"]'::jsonb,
  rating = 4.86,
  total_sessions = 158,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=41',
  linkedin_url = 'https://linkedin.com/in/sarah-chen-design',
  location = 'Seattle, WA',
  education = '[{"school": "Art Center College of Design", "degree": "B.S.", "field": "Interaction Design", "year_graduated": 2012}]'::jsonb,
  work_experience = '[{"company": "Microsoft", "title": "Principal Designer, Design Systems", "start_year": 2018, "end_year": null, "description": "Leading the Fluent design system used by 200+ product teams across Microsoft''s entire product portfolio."}, {"company": "Amazon", "title": "Senior UX Designer", "start_year": 2014, "end_year": 2018, "description": "Built design patterns for the Alexa voice interface and contributed to early Alexa app design."}, {"company": "ZURB", "title": "UX Designer", "start_year": 2012, "end_year": 2014, "description": "Designed responsive web applications and contributed to the Foundation CSS framework."}]'::jsonb,
  languages = ARRAY['English', 'Mandarin'],
  session_price = 140,
  response_time = 'Usually responds within 24 hours',
  booking_count = 108,
  featured = true,
  tier = 'elite'
WHERE name = 'Sarah Chen';

-- 28. Sofia Reyes
UPDATE mentor_profiles SET
  title = 'Chief of Staff',
  company = 'Scale AI',
  industry = 'Consulting',
  bio = 'I serve as Chief of Staff to the CEO at Scale AI and mentor operators and high-performers who want to understand what the CoS role actually involves and how to position themselves for it. Sessions cover how to build operating leverage for a founder or executive, how to run strategic initiatives without direct authority, and how to use a CoS role as a launchpad for a GM or executive path. I am also useful for people who are already in CoS roles and want to navigate the ambiguity better. This role is different at every company and I will help you understand the version that exists at yours.',
  years_experience = 8,
  expertise = '["Chief of Staff", "Executive Operations", "Strategic Initiatives", "High-Performer Coaching", "Operator Career Paths", "Founder Partnership"]'::jsonb,
  rating = 4.69,
  total_sessions = 82,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=49',
  linkedin_url = 'https://linkedin.com/in/sofia-reyes',
  location = 'San Francisco, CA',
  education = '[{"school": "Stanford Graduate School of Business", "degree": "M.B.A.", "field": "Management", "year_graduated": 2019}, {"school": "Universidad Iberoamericana", "degree": "B.A.", "field": "Business Administration", "year_graduated": 2016}]'::jsonb,
  work_experience = '[{"company": "Scale AI", "title": "Chief of Staff", "start_year": 2021, "end_year": null, "description": "Partnering with the CEO on strategic priorities, board communications, and company-wide operating rhythm."}, {"company": "McKinsey & Company", "title": "Business Analyst", "start_year": 2019, "end_year": 2021, "description": "Delivered technology and operations strategy engagements for consumer and tech clients."}]'::jsonb,
  languages = ARRAY['English', 'Spanish'],
  session_price = 105,
  response_time = 'Usually responds within 24 hours',
  booking_count = 52,
  featured = false,
  tier = 'established'
WHERE name = 'Sofia Reyes';

-- 29. Tariq Hassan
UPDATE mentor_profiles SET
  title = 'Senior Software Engineer, Backend',
  company = 'DoorDash',
  industry = 'Technology',
  bio = 'I build logistics and order routing systems at DoorDash and mentor engineers who want to work on marketplace and real-time systems at consumer tech companies. We work on the engineering fundamentals that matter most in these environments — low-latency services, event-driven architecture, and how to reason about consistency in distributed systems when the stakes are a cold pizza. I also help people prepare for backend interviews at delivery and logistics companies. If you want to work on systems where performance directly affects user experience in a measurable way, I will help you get there.',
  years_experience = 7,
  expertise = '["Backend Engineering", "Real-Time Systems", "Event-Driven Architecture", "Marketplace Engineering", "Python", "Go"]'::jsonb,
  rating = 4.64,
  total_sessions = 78,
  available = true,
  image_url = 'https://i.pravatar.cc/300?img=34',
  linkedin_url = 'https://linkedin.com/in/tariq-hassan',
  location = 'San Francisco, CA',
  education = '[{"school": "University of Toronto", "degree": "B.S.", "field": "Computer Science", "year_graduated": 2017}]'::jsonb,
  work_experience = '[{"company": "DoorDash", "title": "Senior Software Engineer", "start_year": 2020, "end_year": null, "description": "Building the order routing and dispatch systems that match millions of deliveries to Dashers in real time."}, {"company": "Shopify", "title": "Software Engineer", "start_year": 2017, "end_year": 2020, "description": "Developed inventory and fulfillment backend services supporting high-volume merchant storefronts."}]'::jsonb,
  languages = ARRAY['English', 'Arabic'],
  session_price = 85,
  response_time = 'Usually responds within a few hours',
  booking_count = 50,
  featured = false,
  tier = 'rising'
WHERE name = 'Tariq Hassan';

-- ============================================================
-- Verification query
-- ============================================================
SELECT
  name, title, company, tier, featured, available,
  location, session_price, rating,
  jsonb_array_length(work_experience) AS work_exp_count,
  jsonb_array_length(education) AS edu_count,
  array_length(languages, 1) AS lang_count
FROM mentor_profiles
WHERE name IN (
  'Aisha Patel', 'Amara Diallo', 'Anika Patel', 'Camille Fontaine',
  'Carlos Mendez', 'Daniel Osei', 'David Kim', 'Diane Foster',
  'Dr. Lena Kim', 'Elena Vasquez', 'Ethan Zhao', 'Fatima Al-Hassan',
  'Grace Okonkwo', 'James Okafor', 'James Whitfield', 'Jordan Rivers',
  'Kwame Asante', 'Linda Park', 'Marco Rossi', 'Marcus Webb',
  'Nina Kowalski', 'Omar Abdullah', 'Omar Haddad', 'Priya Nair',
  'Priya Sharma', 'Rachel Thompson', 'Ryan Nakamura', 'Sarah Chen',
  'Sofia Reyes', 'Tariq Hassan'
)
ORDER BY name;