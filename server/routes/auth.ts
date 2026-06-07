import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db/index.js';
import { signToken, authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Register
router.post('/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  if (!email?.includes('@')) return res.status(400).json({ error: 'Enter a valid email' });
  if (password?.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) return res.status(400).json({ error: 'An account with this email already exists' });

  const id = crypto.randomUUID();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const memberSince = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Generate random avatar
  const bgColors = ['#ffb618', '#164686', '#8bd3dd', '#f582ae', '#b8e986'];
  const bg = bgColors[Math.floor(Math.random() * bgColors.length)];
  const initial = name.trim().charAt(0).toUpperCase() || 'C';
  const avatarUrl = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="100" fill="${bg}"/><text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="80" font-weight="700" fill="white">${initial}</text></svg>`)}`;

  db.prepare('INSERT INTO users (id, name, email, password, avatar_url, member_since) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, name.trim(), normalizedEmail, hashedPassword, avatarUrl, memberSince);

  // Seed default checklist for new user
  const defaultItems = [
    'Passport', 'Visa Documentation', 'Social Security Card',
    'Proof of Address', 'Driver\'s License', 'Health Insurance Card',
    'Bank Account Statement', 'Employment Letter', 'I-94 Record',
    'Vaccination Records', 'Rental Agreement', 'Tax ID (ITIN)',
  ];
  const insertItem = db.prepare('INSERT INTO document_checklist (id, user_id, name, checked, sort_order) VALUES (?, ?, ?, 0, ?)');
  defaultItems.forEach((item, i) => {
    insertItem.run(crypto.randomUUID(), id, item, i);
  });

  const token = signToken(id);
  res.json({
    token,
    user: { id, name: name.trim(), email: normalizedEmail, avatarUrl, memberSince },
  });
});

// Login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Email or password is incorrect' });
  }

  const token = signToken(user.id);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url,
      memberSince: user.member_since,
      role: user.role || 'user',
    },
  });
});

// Get current user
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT id, name, email, avatar_url, member_since, role FROM users WHERE id = ?').get(req.userId!) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url,
    memberSince: user.member_since,
    role: user.role || 'user',
  });
});

// Update profile
router.put('/profile', authMiddleware, (req: AuthRequest, res: Response) => {
  const { name, avatarUrl } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

  db.prepare('UPDATE users SET name = ?, avatar_url = ? WHERE id = ?')
    .run(name.trim(), avatarUrl || '', req.userId!);

  const user = db.prepare('SELECT id, name, email, avatar_url, member_since, role FROM users WHERE id = ?').get(req.userId!) as any;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url,
    memberSince: user.member_since,
    role: user.role || 'user',
  });
});

// Change password
router.put('/password', authMiddleware, (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.userId!) as any;
  if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  if (newPassword?.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.userId!);
  res.json({ success: true });
});

// Forgot password - request reset token
router.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email?.includes('@')) {
    return res.status(400).json({ error: 'Enter a valid email' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail) as any;

  // Don't reveal if email exists or not for security
  if (!user) {
    return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  }

  // Generate reset token
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  // Store reset token
  db.prepare('INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)')
    .run(crypto.randomUUID(), user.id, token, expiresAt);

  // In production, send email here
  console.log(`Password reset token for ${normalizedEmail}: ${token}`);

  res.json({
    message: 'If an account exists with this email, a reset link has been sent.',
    token, // For demo purposes only - remove in production
  });
});

// Reset password with token
router.post('/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Reset token is required' });
  }
  if (newPassword?.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Find valid reset token
  const reset = db.prepare(`
    SELECT user_id FROM password_resets
    WHERE token = ? AND expires_at > datetime('now') AND used = 0
  `).get(token) as any;

  if (!reset) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  // Update password
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?')
    .run(hashedPassword, reset.user_id);

  // Mark token as used
  db.prepare('UPDATE password_resets SET used = 1 WHERE token = ?')
    .run(token);

  res.json({ message: 'Password has been reset successfully' });
});

export default router;
