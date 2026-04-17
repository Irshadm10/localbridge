import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth.js';
import mentorRoutes from './routes/mentors.js';
import sessionRoutes from './routes/sessions.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/sessions', sessionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Bridge API is running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
