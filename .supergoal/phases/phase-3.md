# Phase 3: Forgot Password

## Objective
Implement password reset flow with mock email service.

## Tasks

### 3.1 Database Schema
**File**: `server/db/index.ts`

Add password_resets table:

```sql
CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3.2 API Endpoints
**File**: `server/routes/auth.ts`

Add two new endpoints:

```typescript
// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!user) {
    // Don't reveal if email exists
    return res.json({ message: 'If an account exists, a reset link was sent' });
  }
  
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  
  db.prepare('INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)')
    .run(crypto.randomUUID(), user.id, token, expiresAt);
  
  // In production, send email here
  console.log(`Password reset token for ${email}: ${token}`);
  
  res.json({ message: 'If an account exists, a reset link was sent', token }); // token for demo
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  const reset = db.prepare(`
    SELECT user_id FROM password_resets 
    WHERE token = ? AND expires_at > datetime('now') AND used = 0
  `).get(token);
  
  if (!reset) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
  db.prepare('UPDATE users SET password = ? WHERE id = ?')
    .run(hashedPassword, reset.user_id);
  
  db.prepare('UPDATE password_resets SET used = 1 WHERE token = ?')
    .run(token);
  
  res.json({ message: 'Password reset successful' });
});
```

### 3.3 Frontend - Forgot Password Form
**File**: `src/pages/AuthPage.tsx`

Add forgot password state and form:

```tsx
const [showForgotPassword, setShowForgotPassword] = useState(false);
const [forgotEmail, setForgotEmail] = useState('');
const [resetToken, setResetToken] = useState('');
const [newPassword, setNewPassword] = useState('');
const [forgotMessage, setForgotMessage] = useState('');
const [showResetForm, setShowResetForm] = useState(false);
```

### 3.4 API Client
**File**: `src/lib/api.ts`

Add forgot password endpoints:

```typescript
export const authApi = {
  // ... existing methods
  forgotPassword: (email: string) =>
    request<{ message: string; token?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, newPassword: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
};
```

### 3.5 i18n Translations
Add forgot password text to all 5 language files.

## Verification
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Forgot password form submits
- [ ] Reset token generated
- [ ] Reset password works
- [ ] All i18n translations complete
