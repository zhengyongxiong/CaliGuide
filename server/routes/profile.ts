import { Router, Response } from 'express';
import crypto from 'crypto';
import db from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get document checklist
router.get('/checklist', authMiddleware, (req: AuthRequest, res: Response) => {
  const items = db.prepare(
    'SELECT id, name, checked, sort_order FROM document_checklist WHERE user_id = ? ORDER BY sort_order'
  ).all(req.userId!);
  res.json(items.map((item: any) => ({ ...item, checked: !!item.checked })));
});

// Add checklist item
router.post('/checklist', authMiddleware, (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM document_checklist WHERE user_id = ?')
    .get(req.userId!) as any;
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO document_checklist (id, user_id, name, checked, sort_order) VALUES (?, ?, ?, 0, ?)')
    .run(id, req.userId!, name.trim(), (maxOrder?.max ?? -1) + 1);

  res.json({ id, name: name.trim(), checked: false, sort_order: (maxOrder?.max ?? -1) + 1 });
});

// Toggle checklist item
router.put('/checklist/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const item = db.prepare('SELECT checked FROM document_checklist WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId!) as any;
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const newChecked = item.checked ? 0 : 1;
  db.prepare('UPDATE document_checklist SET checked = ? WHERE id = ?').run(newChecked, req.params.id);
  res.json({ id: req.params.id, checked: !!newChecked });
});

// Delete checklist item
router.delete('/checklist/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM document_checklist WHERE id = ? AND user_id = ?').run(req.params.id, req.userId!);
  res.json({ success: true });
});

// Get settings (placeholder - extend as needed)
router.get('/settings', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT name, email, avatar_url FROM users WHERE id = ?').get(req.userId!) as any;
  res.json({
    language: 'en',
    notifications: true,
    darkMode: false,
    user: { name: user.name, email: user.email, avatarUrl: user.avatar_url },
  });
});

// Update settings
router.put('/settings', authMiddleware, (req: AuthRequest, res: Response) => {
  // For now, just return success. Extend with actual settings storage.
  res.json({ success: true });
});

export default router;
