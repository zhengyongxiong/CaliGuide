import { Router, Response } from 'express';
import db from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all guides
router.get('/', (req: AuthRequest, res: Response) => {
  const { category, search } = req.query;
  let query = 'SELECT id, title, category, description, image_url, read_time, fee FROM guides WHERE 1=1';
  const params: any[] = [];

  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ? OR category LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY created_at DESC';
  const guides = db.prepare(query).all(...params);
  res.json(guides);
});

// Get single guide
router.get('/:id', (req: AuthRequest, res: Response) => {
  const guide = db.prepare('SELECT * FROM guides WHERE id = ?').get(req.params.id);
  if (!guide) return res.status(404).json({ error: 'Guide not found' });

  // Parse JSON fields
  const g = guide as any;
  g.steps = JSON.parse(g.steps || '[]');
  g.documents = JSON.parse(g.documents || '[]');
  g.faq = JSON.parse(g.faq || '[]');

  res.json(guide);
});

// Save/unsave guide
router.post('/:id/save', authMiddleware, (req: AuthRequest, res: Response) => {
  const guideId = req.params.id;
  const userId = req.userId!;

  const existing = db.prepare('SELECT 1 FROM saved_guides WHERE user_id = ? AND guide_id = ?').get(userId, guideId);
  if (existing) {
    db.prepare('DELETE FROM saved_guides WHERE user_id = ? AND guide_id = ?').run(userId, guideId);
    res.json({ saved: false });
  } else {
    db.prepare('INSERT INTO saved_guides (user_id, guide_id) VALUES (?, ?)').run(userId, guideId);
    res.json({ saved: true });
  }
});

// Get saved guides
router.get('/user/saved', authMiddleware, (req: AuthRequest, res: Response) => {
  const guides = db.prepare(`
    SELECT g.id, g.title, g.category, g.image_url, g.read_time, sg.saved_at
    FROM saved_guides sg JOIN guides g ON sg.guide_id = g.id
    WHERE sg.user_id = ? ORDER BY sg.saved_at DESC
  `).all(req.userId!);
  res.json(guides);
});

export default router;
