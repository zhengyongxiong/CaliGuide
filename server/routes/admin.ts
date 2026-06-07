import { Router, Response } from 'express';
import crypto from 'crypto';
import db from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = Router();

// ============ Public Routes (No Auth Required) ============

// Get active announcements (public)
router.get('/public/announcements', (_req: AuthRequest, res: Response) => {
  const announcements = db.prepare(`
    SELECT * FROM announcements
    WHERE active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))
    ORDER BY created_at DESC
  `).all();
  res.json(announcements);
});

// Apply auth and admin middleware to all remaining routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Helper: Log admin action
function logAction(adminId: string, action: string, targetType?: string, targetId?: string, details?: string) {
  db.prepare(
    'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)'
  ).run(adminId, action, targetType || null, targetId || null, details || null);
}

// ============ Dashboard Stats ============

router.get('/stats', (req: AuthRequest, res: Response) => {
  const stats = {
    totalUsers: (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count,
    activeUsers: (db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'").get() as any).count,
    disabledUsers: (db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'disabled'").get() as any).count,
    totalPosts: (db.prepare('SELECT COUNT(*) as count FROM forum_posts').get() as any).count,
    pendingPosts: (db.prepare("SELECT COUNT(*) as count FROM forum_posts WHERE status = 'pending'").get() as any).count,
    approvedPosts: (db.prepare("SELECT COUNT(*) as count FROM forum_posts WHERE status = 'approved'").get() as any).count,
    totalReplies: (db.prepare('SELECT COUNT(*) as count FROM forum_replies').get() as any).count,
    totalGuides: (db.prepare('SELECT COUNT(*) as count FROM guides').get() as any).count,
    publishedGuides: (db.prepare("SELECT COUNT(*) as count FROM guides WHERE status = 'published'").get() as any).count,
    pendingReports: (db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'").get() as any).count,
    totalFeedback: (db.prepare('SELECT COUNT(*) as count FROM feedback').get() as any).count,
    newFeedback: (db.prepare("SELECT COUNT(*) as count FROM feedback WHERE status = 'new'").get() as any).count,
  };
  res.json(stats);
});

// ============ User Management ============

router.get('/users', (req: AuthRequest, res: Response) => {
  const { status, search } = req.query;
  let query = 'SELECT id, name, email, role, status, member_since, created_at, last_login FROM users WHERE 1=1';
  const params: any[] = [];

  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    query += ' AND (name LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC';
  const users = db.prepare(query).all(...params);
  res.json(users);
});

router.put('/users/:id/status', (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!['active', 'disabled', 'banned'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const user = db.prepare('SELECT id, name FROM users WHERE id = ?').get(req.params.id) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  logAction(req.userId!, 'update_user_status', 'user', req.params.id, `Changed ${user.name} status to ${status}`);

  res.json({ success: true });
});

router.put('/users/:id/role', (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  logAction(req.userId!, 'update_user_role', 'user', req.params.id, `Changed role to ${role}`);

  res.json({ success: true });
});

// ============ Post Moderation ============

router.get('/posts/pending', (req: AuthRequest, res: Response) => {
  const posts = db.prepare(`
    SELECT p.*, u.name as author_name, u.email as author_email
    FROM forum_posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.status = 'pending'
    ORDER BY p.created_at DESC
  `).all();
  res.json(posts);
});

router.get('/posts/all', (req: AuthRequest, res: Response) => {
  const { status, category } = req.query;
  let query = `
    SELECT p.*, u.name as author_name, u.email as author_email,
    (SELECT COUNT(*) FROM forum_replies WHERE post_id = p.id) as reply_count
    FROM forum_posts p
    JOIN users u ON p.author_id = u.id WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'all') {
    query += ' AND p.status = ?';
    params.push(status);
  }
  if (category && category !== 'all') {
    query += ' AND p.category = ?';
    params.push(category);
  }

  query += ' ORDER BY p.created_at DESC LIMIT 100';
  const posts = db.prepare(query).all(...params);
  res.json(posts);
});

router.put('/posts/:id/status', (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected', 'hidden'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.prepare('UPDATE forum_posts SET status = ?, moderated_at = datetime(\'now\'), moderated_by = ? WHERE id = ?')
    .run(status, req.userId, req.params.id);

  logAction(req.userId!, 'moderate_post', 'post', req.params.id, `Changed status to ${status}`);

  res.json({ success: true });
});

router.put('/posts/:id/pin', (req: AuthRequest, res: Response) => {
  const { pinned } = req.body;
  db.prepare('UPDATE forum_posts SET pinned = ? WHERE id = ?').run(pinned ? 1 : 0, req.params.id);
  logAction(req.userId!, pinned ? 'pin_post' : 'unpin_post', 'post', req.params.id);

  res.json({ success: true });
});

router.delete('/posts/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM forum_replies WHERE post_id = ?').run(req.params.id);
  db.prepare('DELETE FROM forum_posts WHERE id = ?').run(req.params.id);
  logAction(req.userId!, 'delete_post', 'post', req.params.id);

  res.json({ success: true });
});

// ============ Reply Moderation ============

router.put('/replies/:id/status', (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected', 'hidden'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.prepare('UPDATE forum_replies SET status = ? WHERE id = ?').run(status, req.params.id);
  logAction(req.userId!, 'moderate_reply', 'reply', req.params.id, `Changed status to ${status}`);

  res.json({ success: true });
});

router.delete('/replies/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM forum_replies WHERE id = ?').run(req.params.id);
  logAction(req.userId!, 'delete_reply', 'reply', req.params.id);

  res.json({ success: true });
});

// ============ Guide Management ============

router.get('/guides', (req: AuthRequest, res: Response) => {
  const guides = db.prepare('SELECT * FROM guides ORDER BY created_at DESC').all();
  res.json(guides);
});

router.post('/guides', (req: AuthRequest, res: Response) => {
  const { title, category, description, content, image_url, read_time, fee, steps, documents, faq } = req.body;

  if (!title?.trim() || !category?.trim() || !description?.trim()) {
    return res.status(400).json({ error: 'Title, category, and description are required' });
  }

  const id = `guide-${crypto.randomUUID().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO guides (id, title, category, description, content, image_url, read_time, fee, steps, documents, faq)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title.trim(), category.trim(), description.trim(), content || '', image_url || '', read_time || '', fee || '', JSON.stringify(steps || []), JSON.stringify(documents || []), JSON.stringify(faq || []));

  logAction(req.userId!, 'create_guide', 'guide', id);

  const guide = db.prepare('SELECT * FROM guides WHERE id = ?').get(id);
  res.json(guide);
});

router.put('/guides/:id', (req: AuthRequest, res: Response) => {
  const { title, category, description, content, image_url, read_time, fee, steps, documents, faq, status } = req.body;

  db.prepare(`
    UPDATE guides SET title = ?, category = ?, description = ?, content = ?, image_url = ?,
    read_time = ?, fee = ?, steps = ?, documents = ?, faq = ?, status = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(title, category, description, content, image_url, read_time, fee, JSON.stringify(steps), JSON.stringify(documents), JSON.stringify(faq), status || 'published', req.params.id);

  logAction(req.userId!, 'update_guide', 'guide', req.params.id);

  const guide = db.prepare('SELECT * FROM guides WHERE id = ?').get(req.params.id);
  res.json(guide);
});

router.delete('/guides/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM guides WHERE id = ?').run(req.params.id);
  logAction(req.userId!, 'delete_guide', 'guide', req.params.id);

  res.json({ success: true });
});

// ============ Announcement Management ============

router.get('/announcements', (req: AuthRequest, res: Response) => {
  const announcements = db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all();
  res.json(announcements);
});

router.post('/announcements', (req: AuthRequest, res: Response) => {
  const { title, content, type, expires_at } = req.body;

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO announcements (id, title, content, type, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, title.trim(), content.trim(), type || 'info', expires_at || null);

  logAction(req.userId!, 'create_announcement', 'announcement', id);

  res.json({ success: true, id });
});

router.put('/announcements/:id', (req: AuthRequest, res: Response) => {
  const { title, content, type, active, expires_at } = req.body;

  db.prepare(
    'UPDATE announcements SET title = ?, content = ?, type = ?, active = ?, expires_at = ? WHERE id = ?'
  ).run(title, content, type, active ? 1 : 0, expires_at, req.params.id);

  logAction(req.userId!, 'update_announcement', 'announcement', req.params.id);

  res.json({ success: true });
});

router.delete('/announcements/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
  logAction(req.userId!, 'delete_announcement', 'announcement', req.params.id);

  res.json({ success: true });
});

// ============ Reports ============

router.get('/reports', (req: AuthRequest, res: Response) => {
  const reports = db.prepare(`
    SELECT r.*,
      u.name as reporter_name,
      fp.title as post_title,
      fp.content as post_content
    FROM reports r
    JOIN users u ON r.reporter_id = u.id
    LEFT JOIN forum_posts fp ON r.post_id = fp.id
    ORDER BY r.created_at DESC
  `).all();
  res.json(reports);
});

router.put('/reports/:id', (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!['pending', 'reviewed', 'dismissed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, req.params.id);
  logAction(req.userId!, 'update_report', 'report', req.params.id, `Changed status to ${status}`);

  res.json({ success: true });
});

// ============ Feedback ============

router.get('/feedback', (req: AuthRequest, res: Response) => {
  const feedback = db.prepare(`
    SELECT f.*, u.name as user_name, u.email as user_email
    FROM feedback f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `).all();
  res.json(feedback);
});

router.put('/feedback/:id', (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!['new', 'reviewed', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.prepare('UPDATE feedback SET status = ? WHERE id = ?').run(status, req.params.id);
  logAction(req.userId!, 'update_feedback', 'feedback', req.params.id, `Changed status to ${status}`);

  res.json({ success: true });
});

// ============ Admin Logs ============

router.get('/logs', (req: AuthRequest, res: Response) => {
  const logs = db.prepare(`
    SELECT l.*, u.name as admin_name
    FROM admin_logs l
    JOIN users u ON l.admin_id = u.id
    ORDER BY l.created_at DESC
    LIMIT 100
  `).all();
  res.json(logs);
});

// ============ Event Management ============

router.get('/events', (req: AuthRequest, res: Response) => {
  const events = db.prepare(`
    SELECT e.*,
      u.name as creator_name,
      (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id AND status = 'registered') as registration_count
    FROM events e
    JOIN users u ON e.created_by = u.id
    ORDER BY e.start_date DESC
  `).all();
  res.json(events);
});

router.post('/events', (req: AuthRequest, res: Response) => {
  const { title, description, type, category, location, online_link, start_date, end_date, max_participants, image_url } = req.body;

  if (!title?.trim() || !description?.trim() || !start_date) {
    return res.status(400).json({ error: 'Title, description, and start date are required' });
  }

  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO events (id, title, description, type, category, location, online_link, start_date, end_date, max_participants, image_url, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title.trim(), description.trim(), type || 'online', category || 'meetup', location || '', online_link || '', start_date, end_date || null, max_participants || 0, image_url || '', req.userId);

  logAction(req.userId!, 'create_event', 'event', id);

  res.json({ success: true, id });
});

router.put('/events/:id', (req: AuthRequest, res: Response) => {
  const { title, description, type, category, location, online_link, start_date, end_date, max_participants, image_url, status } = req.body;

  db.prepare(`
    UPDATE events SET title = ?, description = ?, type = ?, category = ?, location = ?, online_link = ?,
    start_date = ?, end_date = ?, max_participants = ?, image_url = ?, status = ?
    WHERE id = ?
  `).run(title, description, type, category, location, online_link, start_date, end_date, max_participants, image_url, status || 'upcoming', req.params.id);

  logAction(req.userId!, 'update_event', 'event', req.params.id);

  res.json({ success: true });
});

router.delete('/events/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM event_registrations WHERE event_id = ?').run(req.params.id);
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  logAction(req.userId!, 'delete_event', 'event', req.params.id);

  res.json({ success: true });
});

router.get('/events/:id/registrations', (req: AuthRequest, res: Response) => {
  const registrations = db.prepare(`
    SELECT er.*, u.name, u.email, u.avatar_url
    FROM event_registrations er
    JOIN users u ON er.user_id = u.id
    WHERE er.event_id = ?
    ORDER BY er.registered_at ASC
  `).all(req.params.id);
  res.json(registrations);
});

// Verify volunteer hours
router.put('/volunteer-hours/:id/verify', (req: AuthRequest, res: Response) => {
  const { hours } = req.body;
  db.prepare('UPDATE volunteer_hours SET verified = 1, verified_by = ?, hours = ? WHERE id = ?')
    .run(req.userId, hours, req.params.id);
  logAction(req.userId!, 'verify_volunteer_hours', 'volunteer', req.params.id);

  res.json({ success: true });
});

export default router;
