import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

const BASE_QUERY = `
  SELECT
    u.id, u.name, u.email, u.created_at,
    mp.title, mp.company, mp.industry, mp.bio,
    mp.years_experience, mp.expertise, mp.rating, mp.total_sessions
  FROM users u
  JOIN mentor_profiles mp ON u.id = mp.user_id
  WHERE u.role = 'mentor'
`;

// GET /api/mentors
router.get('/', async (req, res) => {
  const { industry, search } = req.query;
  const conditions = [];
  const params = [];

  if (industry) {
    conditions.push('mp.industry = ?');
    params.push(industry);
  }

  if (search) {
    conditions.push('(u.name LIKE ? OR mp.title LIKE ? OR mp.company LIKE ? OR mp.bio LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }

  const where = conditions.length ? ' AND ' + conditions.join(' AND ') : '';

  try {
    const [rows] = await pool.query(BASE_QUERY + where, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mentors', detail: err.message });
  }
});

// GET /api/mentors/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(BASE_QUERY + ' AND u.id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mentor', detail: err.message });
  }
});

export default router;
