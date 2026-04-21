# Bridge

Bridge is a mentorship platform built to connect job seekers and recent graduates with established professionals for one-on-one career support. Users can browse mentors, book sessions for services like career advice, interview prep, resume reviews, and networking guidance, then leave reviews based on their experience.

The platform was built with React, Vite, and Tailwind CSS on the frontend, with Supabase handling authentication and the Postgres database. The app is deployed on Vercel, with automatic deployment from the main branch.


## Project Structure

```
bridge/
├── client/   # React + Vite + Tailwind CSS
└── server/   # Express.js API
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies

```bash
# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### Configure environment

```bash
cp server/.env server/.env
# Fill in the values in server/.env
```

### Run the apps

**Client** (http://localhost:5173):
```bash
cd client && npm run dev
```

**Server** (http://localhost:3000):
```bash
cd server && npm run dev
```
