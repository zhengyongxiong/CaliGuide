# Phase 9: User Feedback System

## Objective
Collect and manage user feedback.

## Tasks

### 9.1 Create Feedback Table
**File**: `server/db/index.ts`

```sql
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('bug', 'feature', 'general', 'other')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'reviewed', 'resolved')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 9.2 Create Feedback API
**File**: `server/routes/feedback.ts`

```typescript
import { Router, Response } from 'express';
import crypto from 'crypto';
import db from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Submit feedback
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const { category, subject, message } = req.body;
  
  if (!subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }
  
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO feedback (id, user_id, category, subject, message) VALUES (?, ?, ?, ?, ?)'
  ).run(id, req.userId, category || 'general', subject.trim(), message.trim());
  
  res.json({ success: true, id });
});

// Get user's feedback
router.get('/my', authMiddleware, (req: AuthRequest, res: Response) => {
  const feedback = db.prepare(
    'SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.userId);
  res.json(feedback);
});

export default router;
```

### 9.3 Create Feedback Form Component
**File**: `src/components/FeedbackForm.tsx`

### 9.4 Add Feedback to Settings
Update Profile.tsx Settings section to include feedback option.

### 9.5 Add i18n Translations
Add feedback-related translations to all 5 languages.

## Verification
- [ ] Feedback form works
- [ ] Feedback stored in database
- [ ] Users can view their feedback
