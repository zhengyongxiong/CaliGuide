# Phase 8: Content Moderation

## Objective
Implement post/reply moderation workflow.

## Tasks

### 8.1 Create Report API
**File**: `server/routes/forum.ts`

Add report endpoint:

```typescript
// Report a post
router.post('/:id/report', authMiddleware, (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  const postId = req.params.id;
  
  if (!reason?.trim()) {
    return res.status(400).json({ error: 'Reason is required' });
  }
  
  // Check if already reported by this user
  const existing = db.prepare(
    'SELECT id FROM reports WHERE reporter_id = ? AND post_id = ? AND status = ?'
  ).get(req.userId, postId, 'pending');
  
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
  
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO reports (id, reporter_id, reply_id, reason) VALUES (?, ?, ?, ?)'
  ).run(id, req.userId, replyId, reason.trim());
  
  res.json({ success: true, message: 'Report submitted' });
});
```

### 8.2 Add Hide/Delete to Admin
**File**: `server/routes/admin.ts`

```typescript
// Hide a post
router.put('/posts/:id/hide', (req: AuthRequest, res: Response) => {
  db.prepare('UPDATE forum_posts SET hidden = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Delete a post
router.delete('/posts/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM forum_replies WHERE post_id = ?').run(req.params.id);
  db.prepare('DELETE FROM forum_posts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});
```

### 8.3 Update Forum UI
Add report button to posts and replies.

### 8.4 Create Admin Dashboard Page
**File**: `src/pages/AdminDashboard.tsx`

## Verification
- [ ] Report API works
- [ ] Admin can moderate content
- [ ] Dashboard shows reports
