# Bridge — CLAUDE.md

Mentorship platform connecting job seekers with established professionals. React + Vite frontend, Express ESM backend, Supabase (Postgres) database. Deployed on Vercel.

---

## Stack & Key Package Versions

| Layer | Package | Version |
|---|---|---|
| Frontend | react / react-dom | ^19.2.4 |
| Frontend | vite | ^8.0.1 |
| Frontend | tailwindcss | ^4.2.2 |
| Frontend | react-router-dom | ^7.14.1 |
| Frontend | @supabase/supabase-js | ^2.103.3 |
| Frontend | axios | ^1.15.0 |
| Frontend | googleapis | ^171.4.0 |
| Frontend | lucide-react | ^0.400.0 |
| Frontend | motion | ^12.38.0 |
| Backend | express | ^5.2.1 |
| Backend | @supabase/supabase-js | ^2.103.3 |
| Backend | jsonwebtoken | ^9.0.3 |
| Backend | bcrypt | ^6.0.0 |
| Backend | googleapis | ^171.4.0 |
| Backend | express-validator | ^7.3.2 |

---

## Database Schema (Supabase / Postgres)

### `mentor_profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK (NOT the same as auth.users id — see Critical Rules) |
| user_id | uuid | Loose FK → auth.users (no constraint, allows seeding) |
| name | text | required |
| email | text | |
| title, company, industry, bio | text | |
| years_experience | int | |
| expertise | jsonb | array, default `[]` |
| rating | decimal(4,2) | default 0 |
| total_sessions | int | default 0 |
| available | boolean | default true |
| image_url, linkedin_url, github_url, website_url | text | |
| availability_schedule | jsonb | `{"weekly":{"0":["09:00",...],...},"timezone":"UTC"}` |
| tier | text | |
| session_rate | integer | |
| google_refresh_token | text | Google Calendar OAuth token |
| expertise_search | text | generated: `lower(expertise::text)` stored |
| created_at | timestamptz | default now() |
**RLS**: SELECT public (anon), INSERT/UPDATE own user only.

### `sessions`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| mentee_id | uuid | FK → auth.users ON DELETE CASCADE |
| mentor_id | uuid | FK → mentor_profiles ON DELETE RESTRICT |
| session_type | text | enum: `career_advice` `interview_prep` `resume_review` `networking` |
| scheduled_date | timestamptz | |
| status | text | enum: `pending` `accepted` `declined` `completed` `cancelled` |
| message | text | |
| video_room_url | text | Room identifier: `bridge-{sessionId}` (set on accept; truthy = "Join Call" visible) |
| created_at | timestamptz | |
**RLS**: SELECT mentee or mentor (via mentor_profiles join). INSERT authenticated mentees. UPDATE mentor only. Mentee can cancel own.

### `reviews`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| session_id | uuid | FK → sessions ON DELETE CASCADE |
| reviewer_id | uuid | FK → auth.users ON DELETE CASCADE |
| mentor_id | uuid | FK → mentor_profiles ON DELETE CASCADE |
| rating | int | CHECK 1–5 |
| comment | text | |
| created_at | timestamptz | |
**RLS**: SELECT public, INSERT authenticated, DELETE own.

### `favorites`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users ON DELETE CASCADE |
| mentor_id | uuid | FK → mentor_profiles ON DELETE CASCADE |
| created_at | timestamptz | |
**Constraint**: `UNIQUE(user_id, mentor_id)` **RLS**: SELECT/INSERT/DELETE own.

### `user_profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users, UNIQUE |
| personal_info | jsonb | default `{}` |
| experience, education, skills, achievements | jsonb | arrays, default `[]` |
| created_at / updated_at | timestamptz | auto-trigger on UPDATE |
**RLS**: SELECT/INSERT/UPDATE own.

### `user_settings`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users, UNIQUE |
| settings | jsonb | default `{}` |
| created_at / updated_at | timestamptz | |
**RLS**: SELECT/INSERT/UPDATE own.

### `mentee_profiles`
Stores AI onboarding output: `user_id`, `current_position`, `target_role`, `target_industry`, `years_experience`, `top_goals`, `session_types_needed`, `availability`, `bio_summary`, `updated_at`. RLS: own only.

### `ai_usage`
Tracks per-user AI feature consumption: `user_id`, `feature` (`resume_review` limit 1, `mentor_match` limit 3). See `client/src/api/aiUsage.js`.

### Storage
Bucket `resumes` (private). RLS: authenticated user can CRUD files prefixed `{user_id}/`.

---

## Critical Technical Rules

1. **`mentor_profiles.id` ≠ `auth.users.id`** — The mentor profile row has its own UUID PK. `user_id` column is the soft link to auth. Never use `auth.uid()` where a `mentor_profiles.id` (profile UUID) is expected.

2. **`getMentorById(mentorProfileId)` shape** — Queries `mentor_profiles` by `id` (not `user_id`). Returns `{ mentor, reviews: { count: total_sessions, average: rating } }` or `{ data: null, error }`. Callers must destructure `mentor`, not `data`.

3. **`SESSION_TYPES` source of truth** — Defined in `client/src/constants/sessionTypes.js`. Four keys exactly: `career_advice`, `interview_prep`, `resume_review`, `networking`. Server-side validation in `server/routes/sessions.js` mirrors this list. Never add a session type on only one side.

4. **`VITE_` prefix required** — All client-side env vars must be prefixed `VITE_` and accessed via `import.meta.env.VITE_*`. Never use `process.env` in client code.

5. **Never expose server secrets to the client** — `SUPABASE_SERVICE_ROLE_KEY` and `JWT_SECRET` are server-only. Client uses only `VITE_SUPABASE_ANON_KEY`.

6. **Supabase client singleton** — Always import from `client/src/api/supabase.js`. Never instantiate a second client.

7. **AI keys in client env** — `VITE_ANTHROPIC_API_KEY` and `VITE_OPENAI_API_KEY` are used directly in client code (not proxied). Be aware of exposure in browser builds.

8. **Video rooms** — Custom WebRTC video call at `/session/:sessionId/video`. Signaling via Supabase Realtime channel `video:{sessionId}`. Mentor = caller (sends offer), mentee = callee (sends answer). `video_room_url` is set to `bridge-{sessionId}` on accept (truthy flag to show "Join Call").

9. **Google Calendar OAuth** — Refresh token is stored in `mentor_profiles.google_refresh_token`. OAuth routes live in `server/routes/googleAuth.js`; calendar operations in `server/routes/calendar.js`.

---

## Frontend File Map

### `client/src/api/`
| File | Purpose |
|---|---|
| supabase.js | Supabase client singleton (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY) |
| client.js | Axios instance → http://localhost:3001/api with JWT interceptor |
| mentors.js | getMentorById, getAllMentors (search/filter/sort), getFeaturedMentors, getIndustries |
| sessions.js | createSession, getMySession, updateSessionStatus, acceptSession (sets Jitsi URL) |
| reviews.js | createReview, getReviewsForMentor |
| favorites.js | getMyFavorites, toggleFavorite, addToFavorites, removeFromFavorites |
| menteeProfile.js | getMenteeProfile, upsertMenteeProfile, deleteMenteeProfile |
| mentorOnboarding.js | Mentor onboarding CRUD against mentor_profiles |
| calendar.js | getCalendarAuthUrl, getMentorAvailability, bookCalendarEvent, checkCalendarConnection |
| ai.js | callClaude() — direct Anthropic SDK wrapper (claude-sonnet-4-20250514) |
| aiMatching.js | getAIMatchedMentors() — OpenAI-based mentor ranking from mentee profile |
| aiResumeReview.js | getAIResumeReview() — Claude-based resume analysis |
| aiUsage.js | getUsageCount, hasReachedLimit, recordUsage per feature |
| resumeReview.js | saveResumeReview(userId, reviewData) to Supabase |
| resumeStorage.js | uploadResumeFile, removeResumeFile, getResumeSignedUrl (resumes bucket) |
| mockMentors.js | Static mock mentor data for dev |
| supportEmail.js | Feedback/support email send |

### `client/src/components/`
| File | Purpose |
|---|---|
| Navbar.jsx | Top nav with auth state |
| Footer.jsx | App footer |
| LoadingSpinner.jsx | Reusable spinner |
| MentorAvatar.jsx | Mentor photo with fallback |
| SessionTypeCard.jsx | Card for career_advice / interview_prep / resume_review / networking |
| MentorMatchWizard.jsx | Multi-step AI mentor-matching form |
| OnboardingModal.jsx | Mentor onboarding modal (goals, expertise, availability) |
| CalendarConnectButton.jsx | Trigger Google Calendar OAuth |
| CalendarSuccessToast.jsx | Post-OAuth success toast |
| FeedbackFAB.jsx | Floating feedback button |
| FeedbackModal.jsx | Feedback submission form |
| BridgeGlobalAtmosphere.jsx | Global visual theme/atmosphere |
| PageGutterAtmosphere.jsx | Page gutter visual effect |
| MagneticPointer.jsx | Custom cursor animation |
| Reveal.jsx | Scroll-triggered reveal animation |
| ScrollProgress.jsx | Scroll progress bar |

### `client/src/pages/` (top-level)
| File | Purpose |
|---|---|
| Landing.jsx | Public home page |
| Login.jsx | Auth — sign in |
| Register.jsx | Auth — sign up |
| Mentors.jsx | Mentor browse + AI matching |
| MentorProfile.jsx | Individual mentor detail + booking |
| MentorOnboarding.jsx | Mentor signup flow |
| ResumeReview.jsx | AI resume review interface |
| Profile.jsx | User profile page |
| Settings.jsx | User settings |
| VideoCall.jsx | Custom WebRTC video session (Supabase Realtime signaling) |
| About.jsx | About page |
| Pricing.jsx | Pricing tiers |

### `client/src/pages/dashboard/`
| File | Purpose |
|---|---|
| Dashboard.jsx | Container — routes to mentee or mentor view |
| MenteeDashboardContent.jsx | Sessions, favorites, history for mentees |
| MentorDashboardContent.jsx | Incoming requests, schedule, earnings for mentors |
| DashboardSettingsPanel.jsx | In-dashboard settings |
| MentorAvailabilityModal.jsx | Set/edit availability schedule |
| dashboardShared.jsx | Shared constants & utilities |
| dashboardUtils.js | SESSION_TYPE_MAP (type → icon + color metadata) |
| useDashboardData.js | Hook: fetches sessions, profile, reviews |

### `client/src/pages/footer/`
About, Blog, Careers, Community, Contact, Cookies, FAQ, Help, Privacy, Terms, Trust — static informational pages.

---

## What's Fully Working

- Supabase auth (sign up, sign in, session persistence)
- Mentor discovery: browse, search, filter by industry, sort
- Mentor profile detail page with reviews
- Session booking (create, accept/decline, cancel, complete)
- Custom WebRTC video call rooms (peer-to-peer, no 3rd-party service)
- Favorites (add/remove/list)
- AI mentor matching (OpenAI ranking)
- AI resume review (Claude)
- AI onboarding wizard (mentee_profiles)
- Google Calendar OAuth + availability + booking
- Mentor onboarding flow
- Dashboard (mentee + mentor views)
- Resume upload/storage (Supabase bucket)
- 30 seeded mentor profiles across industries
- Landing, About, Pricing, footer static pages

---

## In Progress — Do Not Overwrite

| Branch | Owner | Work |
|---|---|---|
| `feature/dashboard` / `review/omar-dashboard` | **Omar** | Dashboard improvements — do not merge or rebase without coordination |
| `feature/review-system` | **Irshad** | Review system — do not touch `reviews` table logic or ReviewModal |
| `feature/sprint2-mentor-flow` | **Muaz** | Sprint 2 mentor onboarding + profile flow |

---

## Sprint 2 Goals

| Person | Goal |
|---|---|
| Muaz | Mentor profile flow polish, onboarding improvements, calendar integration hardening |
| Omar | Dashboard v2 — session management UI, mentor earnings view |
| Irshad | Review system — post-session review prompt, review display on mentor profile |

---

## Git Rules

- **No direct pushes to `main`** — all changes via PR
- **PRs required** for all feature work; at least one team member must review
- **No credentials in code** — no API keys, tokens, or passwords committed; use `.env` files (already in `.gitignore`)
- Branch naming: `feature/<name>` or `fix/<name>`
- Keep feature branches up to date with `main` via merge (not rebase unless agreed)
- Resolve merge conflicts before requesting review

---

## Environment Variables

### Server (`server/.env`)
```
PORT
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
CLIENT_URL
CLIENT_URL_PROD
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

### Client (`client/.env`)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SERVER_URL
VITE_ANTHROPIC_API_KEY
VITE_OPENAI_API_KEY
```
