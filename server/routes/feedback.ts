import { Router, Response } from 'express';
import crypto from 'crypto';
import db from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Submit feedback
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const { category, subject, message } = req.body;

  if (!subject?.trim()) {
    return res.status(400).json({ error: 'Subject is required' });
  }
  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const validCategories = ['bug', 'feature', 'general', 'other'];
  const feedbackCategory = validCategories.includes(category) ? category : 'general';

  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO feedback (id, user_id, category, subject, message) VALUES (?, ?, ?, ?, ?)'
  ).run(id, req.userId, feedbackCategory, subject.trim(), message.trim());

  res.json({ success: true, id });
});

// Get user's feedback
router.get('/my', authMiddleware, (req: AuthRequest, res: Response) => {
  const feedback = db.prepare(
    'SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.userId);
  res.json(feedback);
});

// Get feedback by ID (user can only see their own)
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const feedback = db.prepare(
    'SELECT * FROM feedback WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId) as any;

  if (!feedback) {
    return res.status(404).json({ error: 'Feedback not found' });
  }

  res.json(feedback);
});

export default router;
