import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import mentorRoutes from './routes/mentors.js';
import sessionRoutes from './routes/sessions.js';
import calendarRoutes from './routes/calendar.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/calendar', calendarRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Bridge API is running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
