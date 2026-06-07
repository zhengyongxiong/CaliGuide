import { Router, Response } from 'express';
import crypto from 'crypto';
import db from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all events (public)
router.get('/', (req: AuthRequest, res: Response) => {
  const { category, type, status } = req.query;
  let query = `
    SELECT e.*,
      u.name as creator_name,
      (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id AND status = 'registered') as registration_count,
      (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id AND user_id = ? AND status = 'registered') as is_registered
    FROM events e
    JOIN users u ON e.created_by = u.id
    WHERE 1=1
  `;
  const params: any[] = [req.userId || null];

  if (category && category !== 'all') {
    query += ' AND e.category = ?';
    params.push(category);
  }
  if (type && type !== 'all') {
    query += ' AND e.type = ?';
    params.push(type);
  }
  if (status && status !== 'all') {
    query += ' AND e.status = ?';
    params.push(status);
  } else {
    query += " AND e.status != 'cancelled'";
  }

  query += ' ORDER BY e.start_date ASC';
  const events = db.prepare(query).all(...params);
  res.json(events);
});

// Get single event
router.get('/:id', (req: AuthRequest, res: Response) => {
  const event = db.prepare(`
    SELECT e.*,
      u.name as creator_name,
      (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id AND status = 'registered') as registration_count,
      (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id AND user_id = ? AND status = 'registered') as is_registered
    FROM events e
    JOIN users u ON e.created_by = u.id
    WHERE e.id = ?
  `).get(req.userId || null, req.params.id) as any;

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Get registered users
  const registrations = db.prepare(`
    SELECT u.id, u.name, u.avatar_url, er.registered_at
    FROM event_registrations er
    JOIN users u ON er.user_id = u.id
    WHERE er.event_id = ? AND er.status = 'registered'
    ORDER BY er.registered_at ASC
  `).all(req.params.id);

  res.json({ ...event, registrations });
});

// Register for event
router.post('/:id/register', authMiddleware, (req: AuthRequest, res: Response) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id) as any;

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (event.status === 'cancelled' || event.status === 'completed') {
    return res.status(400).json({ error: 'Event is not available for registration' });
  }

  // Check if already registered
  const existing = db.prepare(
    "SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ? AND status = 'registered'"
  ).get(req.params.id, req.userId);

  if (existing) {
    return res.status(400).json({ error: 'Already registered' });
  }

  // Check max participants
  if (event.max_participants > 0) {
    const currentCount = (db.prepare(
      "SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ? AND status = 'registered'"
    ).get(req.params.id) as any).count;

    if (currentCount >= event.max_participants) {
      return res.status(400).json({ error: 'Event is full' });
    }
  }

  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO event_registrations (id, event_id, user_id) VALUES (?, ?, ?)'
  ).run(id, req.params.id, req.userId);

  // Update participant count
  db.prepare(
    "UPDATE events SET current_participants = (SELECT COUNT(*) FROM event_registrations WHERE event_id = ? AND status = 'registered') WHERE id = ?"
  ).run(req.params.id, req.params.id);

  res.json({ success: true, id });
});

// Cancel registration
router.post('/:id/cancel', authMiddleware, (req: AuthRequest, res: Response) => {
  db.prepare(
    "UPDATE event_registrations SET status = 'cancelled' WHERE event_id = ? AND user_id = ? AND status = 'registered'"
  ).run(req.params.id, req.userId);

  // Update participant count
  db.prepare(
    "UPDATE events SET current_participants = (SELECT COUNT(*) FROM event_registrations WHERE event_id = ? AND status = 'registered') WHERE id = ?"
  ).run(req.params.id, req.params.id);

  res.json({ success: true });
});

// Get user's registered events
router.get('/user/registered', authMiddleware, (req: AuthRequest, res: Response) => {
  const events = db.prepare(`
    SELECT e.*, er.registered_at, er.status as registration_status
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    WHERE er.user_id = ? AND er.status = 'registered'
    ORDER BY e.start_date ASC
  `).all(req.userId);
  res.json(events);
});

// Get user's volunteer hours
router.get('/user/volunteer-hours', authMiddleware, (req: AuthRequest, res: Response) => {
  const hours = db.prepare(`
    SELECT vh.*, e.title as event_title, e.start_date
    FROM volunteer_hours vh
    JOIN events e ON vh.event_id = e.id
    WHERE vh.user_id = ?
    ORDER BY e.start_date DESC
  `).all(req.userId);

  const totalHours = hours.reduce((sum: number, h: any) => sum + h.hours, 0);

  res.json({ hours, totalHours });
});

export default router;
