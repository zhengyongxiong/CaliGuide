import { Router, Response } from 'express';
import crypto from 'crypto';
import db from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all approved posts (public)
router.get('/', (req: AuthRequest, res: Response) => {
  const { category, search, tag } = req.query;
  let query = `
    SELECT p.*, u.name as author_name, u.avatar_url as author_avatar,
    (SELECT COUNT(*) FROM forum_replies WHERE post_id = p.id AND status = 'approved') as reply_count
    FROM forum_posts p JOIN users u ON p.author_id = u.id
    WHERE p.status = 'approved'
  `;
  const params: any[] = [];

  if (category && category !== 'all') {
    query += ' AND p.category = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (p.title LIKE ? OR p.content LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (tag) {
    query += ' AND p.tags LIKE ?';
    params.push(`%${tag}%`);
  }

  query += ' ORDER BY p.pinned DESC, p.created_at DESC LIMIT 50';
  const posts = db.prepare(query).all(...params);

  const result = posts.map((p: any) => ({
    ...p,
    tags: JSON.parse(p.tags || '[]'),
    time: formatTimeAgo(p.created_at),
  }));

  res.json(result);
});

// Get single post with replies
router.get('/:id', (req: AuthRequest, res: Response) => {
  const post = db.prepare(`
    SELECT p.*, u.name as author_name, u.avatar_url as author_avatar
    FROM forum_posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?
  `).get(req.params.id) as any;

  if (!post) return res.status(404).json({ error: 'Post not found' });

  // Increment views
  db.prepare('UPDATE forum_posts SET views = views + 1 WHERE id = ?').run(req.params.id);

  const replies = db.prepare(`
    SELECT r.*, u.name as author_name, u.avatar_url as author_avatar
    FROM forum_replies r JOIN users u ON r.author_id = u.id
    WHERE r.post_id = ? ORDER BY r.created_at ASC
  `).all(req.params.id);

  res.json({
    ...post,
    tags: JSON.parse(post.tags || '[]'),
    time: formatTimeAgo(post.created_at),
    replies: (replies as any[]).map((r: any) => ({
      ...r,
      time: formatTimeAgo(r.created_at),
    })),
  });
});

// Create post (default: pending approval)
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, content, category, tags } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
  if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });

  const id = crypto.randomUUID();
  db.prepare('INSERT INTO forum_posts (id, author_id, title, content, category, tags, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.userId!, title.trim(), content.trim(), category || 'General', JSON.stringify(tags || []), 'pending');

  const post = db.prepare(`
    SELECT p.*, u.name as author_name, u.avatar_url as author_avatar
    FROM forum_posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?
  `).get(id) as any;

  res.json({
    ...post,
    tags: JSON.parse(post.tags || '[]'),
    time: formatTimeAgo(post.created_at),
    reply_count: 0,
  });
});

// Create reply
router.post('/:id/reply', authMiddleware, (req: AuthRequest, res: Response) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });

  const post = db.prepare('SELECT id FROM forum_posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const id = crypto.randomUUID();
  db.prepare('INSERT INTO forum_replies (id, post_id, author_id, content) VALUES (?, ?, ?, ?)')
    .run(id, req.params.id, req.userId!, content.trim());

  const reply = db.prepare(`
    SELECT r.*, u.name as author_name, u.avatar_url as author_avatar
    FROM forum_replies r JOIN users u ON r.author_id = u.id WHERE r.id = ?
  `).get(id) as any;

  res.json({
    ...reply,
    time: formatTimeAgo(reply.created_at),
  });
});

// Get user's posts
router.get('/user/posts', authMiddleware, (req: AuthRequest, res: Response) => {
  const posts = db.prepare(`
    SELECT p.*, u.name as author_name, u.avatar_url as author_avatar,
    (SELECT COUNT(*) FROM forum_replies WHERE post_id = p.id) as reply_count
    FROM forum_posts p JOIN users u ON p.author_id = u.id
    WHERE p.author_id = ? ORDER BY p.created_at DESC
  `).all(req.userId!);

  res.json(posts.map((p: any) => ({
    ...p,
    tags: JSON.parse(p.tags || '[]'),
    time: formatTimeAgo(p.created_at),
  })));
});

// Report a post
router.post('/:id/report', authMiddleware, (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  const postId = req.params.id;

  if (!reason?.trim()) {
    return res.status(400).json({ error: 'Reason is required' });
  }

  // Check if post exists
  const post = db.prepare('SELECT id FROM forum_posts WHERE id = ?').get(postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // Check if already reported by this user
  const existing = db.prepare(
    "SELECT id FROM reports WHERE reporter_id = ? AND post_id = ? AND status = 'pending'"
  ).get(req.userId, postId);

  if (existing) {
    return res.status(400).json({ error: 'You have already reported this post' });
  }

  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO reports (id, reporter_id, post_id, reason) VALUES (?, ?, ?, ?)'
  ).run(id, req.userId, postId, reason.trim());

  res.json({ success: true, message: 'Report submitted' });
});

// Report a reply
router.post('/replies/:id/report', authMiddleware, (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  const replyId = req.params.id;

  if (!reason?.trim()) {
    return res.status(400).json({ error: 'Reason is required' });
  }

  // Check if reply exists
  const reply = db.prepare('SELECT id FROM forum_replies WHERE id = ?').get(replyId);
  if (!reply) {
    return res.status(404).json({ error: 'Reply not found' });
  }

  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO reports (id, reporter_id, reply_id, reason) VALUES (?, ?, ?, ?)'
  ).run(id, req.userId, replyId, reason.trim());

  res.json({ success: true, message: 'Report submitted' });
});

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default router;
