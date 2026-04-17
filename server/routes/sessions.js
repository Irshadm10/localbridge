import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/db.js';
import authenticate from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

const SESSION_TYPES = ['career_advice', 'interview_prep', 'resume_review', 'networking'];

// POST /api/sessions
router.post(
  '/',
  [
    body('mentor_id').isInt().withMessage('mentor_id must be an integer'),
    body('session_type').isIn(SESSION_TYPES).withMessage('Invalid session_type'),
    body('scheduled_date').isISO8601().withMessage('scheduled_date must be a valid ISO 8601 date'),
    body('message').optional().isString(),
  ],
  async (req, res) => {
    if (req.user.role !== 'mentee') {
      return res.status(403).json({ error: 'Only mentees can book sessions' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mentor_id, session_type, scheduled_date, message } = req.body;

    try {
      const [mentorCheck] = await pool.query(
        "SELECT id FROM users WHERE id = ? AND role = 'mentor'",
        [mentor_id]
      );
      if (mentorCheck.length === 0) {
        return res.status(404).json({ error: 'Mentor not found' });
      }

      const [result] = await pool.query(
        `INSERT INTO sessions (mentee_id, mentor_id, session_type, scheduled_date, message)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, mentor_id, session_type, scheduled_date, message ?? null]
      );

      res.status(201).json({ id: result.insertId, status: 'pending' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create session', detail: err.message });
    }
  }
);

// GET /api/sessions/me
router.get('/me', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        s.*,
        mentee.name AS mentee_name, mentee.email AS mentee_email,
        mentor.name AS mentor_name, mentor.email AS mentor_email
       FROM sessions s
       JOIN users mentee ON s.mentee_id = mentee.id
       JOIN users mentor ON s.mentor_id = mentor.id
       WHERE s.mentee_id = ? OR s.mentor_id = ?
       ORDER BY s.scheduled_date DESC`,
      [req.user.id, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions', detail: err.message });
  }
});

// PATCH /api/sessions/:id
router.patch(
  '/:id',
  [body('status').isIn(['accepted', 'declined']).withMessage("Status must be 'accepted' or 'declined'")],
  async (req, res) => {
    if (req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can accept or decline sessions' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    try {
      const [rows] = await pool.query(
        'SELECT id, mentor_id FROM sessions WHERE id = ?',
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (rows[0].mentor_id !== req.user.id) {
        return res.status(403).json({ error: 'You do not own this session' });
      }

      await pool.query('UPDATE sessions SET status = ? WHERE id = ?', [status, req.params.id]);
      res.json({ id: Number(req.params.id), status });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update session', detail: err.message });
    }
  }
);

export default router;
