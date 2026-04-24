import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import mentorRoutes from './routes/mentors.js';
import sessionRoutes from './routes/sessions.js';
import calendarRoutes from './routes/calendar.js';
import googleAuthRoutes from './routes/googleAuth.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5175']
  : ['http://localhost:5173', 'http://localhost:5175'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Google OAuth — must be accessible without /api prefix so the redirect URI matches
app.use('/auth/google', googleAuthRoutes);

// Calendar — availability + booking
app.use('/calendar', calendarRoutes);

// Legacy routes (kept for other features)
app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/sessions', sessionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Bridge API is running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
