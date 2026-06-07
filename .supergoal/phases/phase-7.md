# Phase 7: Admin Role & Dashboard

## Objective
Add admin role and basic moderation dashboard.

## Tasks

### 7.1 Update Database Schema
**File**: `server/db/index.ts`

Add role column to users table:

```sql
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin'));
```

Add reports table:

```sql
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  post_id TEXT,
  reply_id TEXT,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'dismissed')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (reporter_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES forum_posts(id),
  FOREIGN KEY (reply_id) REFERENCES forum_replies(id)
);
```

### 7.2 Create Admin Middleware
**File**: `server/middleware/admin.ts`

```typescript
import { Response, NextFunction } from 'express';
import db from '../db/index.js';
import { AuthRequest } from './auth.js';

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.userId!) as any;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}
```

### 7.3 Create Admin Routes
**File**: `server/routes/admin.ts`

```typescript
import { Router, Response } from 'express';
import db from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = Router();

// Apply auth and admin middleware
router.use(authMiddleware);
router.use(adminMiddleware);

// Get dashboard stats
router.get('/stats', (req: AuthRequest, res: Response) => {
  const stats = {
    totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
    totalPosts: db.prepare('SELECT COUNT(*) as count FROM forum_posts').get().count,
    totalReplies: db.prepare('SELECT COUNT(*) as count FROM forum_replies').get().count,
    pendingReports: db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'").get().count,
  };
  res.json(stats);
});

// Get all reports
router.get('/reports', (req: AuthRequest, res: Response) => {
  const reports = db.prepare(`
    SELECT r.*, u.name as reporter_name, fp.title as post_title
    FROM reports r
    JOIN users u ON r.reporter_id = u.id
    LEFT JOIN forum_posts fp ON r.post_id = fp.id
    ORDER BY r.created_at DESC
  `).all();
  res.json(reports);
});

// Update report status
router.put('/reports/:id', (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

export default router;
```

### 7.4 Update Seed Data
Make test user an admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'alice@caliguide.com';
```

## Verification
- [ ] TypeScript compiles
- [ ] Admin routes work
- [ ] Dashboard shows stats
