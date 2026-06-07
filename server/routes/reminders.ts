import { Router, Response } from 'express';
import crypto from 'crypto';
import db from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get user's reminders
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const reminders = db.prepare(`
    SELECT * FROM user_reminders
    WHERE user_id = ?
    ORDER BY due_date ASC
  `).all(req.userId);
  res.json(reminders);
});

// Get upcoming reminders (next 7 days)
router.get('/upcoming', authMiddleware, (req: AuthRequest, res: Response) => {
  const reminders = db.prepare(`
    SELECT * FROM user_reminders
    WHERE user_id = ? AND completed = 0 AND due_date <= date('now', '+7 days')
    ORDER BY due_date ASC
  `).all(req.userId);
  res.json(reminders);
});

// Create reminder
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, description, due_date, type } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!due_date) {
    return res.status(400).json({ error: 'Due date is required' });
  }

  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO user_reminders (id, user_id, title, description, due_date, type) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, req.userId, title.trim(), description || '', due_date, type || 'general');

  const reminder = db.prepare('SELECT * FROM user_reminders WHERE id = ?').get(id);
  res.json(reminder);
});

// Update reminder
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, description, due_date, type, completed } = req.body;

  const reminder = db.prepare('SELECT * FROM user_reminders WHERE id = ? AND user_id = ?').get(req.params.id, req.userId) as any;
  if (!reminder) {
    return res.status(404).json({ error: 'Reminder not found' });
  }

  db.prepare(`
    UPDATE user_reminders SET title = ?, description = ?, due_date = ?, type = ?, completed = ?
    WHERE id = ? AND user_id = ?
  `).run(
    title || reminder.title,
    description !== undefined ? description : reminder.description,
    due_date || reminder.due_date,
    type || reminder.type,
    completed !== undefined ? (completed ? 1 : 0) : reminder.completed,
    req.params.id,
    req.userId
  );

  const updated = db.prepare('SELECT * FROM user_reminders WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Delete reminder
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM user_reminders WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

// Mark as completed
router.put('/:id/complete', authMiddleware, (req: AuthRequest, res: Response) => {
  db.prepare('UPDATE user_reminders SET completed = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

export default router;
