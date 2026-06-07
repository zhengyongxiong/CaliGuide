import { Router, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import db from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    })
  : null;

// Send message (with history)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!ai) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const userId = req.userId!;

  // Save user message to history
  db.prepare('INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)')
    .run(userId, 'user', message.trim());

  // Load recent history (last 20 messages)
  const history = db.prepare(`
    SELECT role, content FROM chat_history
    WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
  `).all(userId) as { role: string; content: string }[];

  // Reverse to chronological order
  history.reverse();

  // Build Gemini messages array
  const messages = history.map((h) => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }],
  }));

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction:
          'You are CaliBot, a professional immigration assistant for California. You help users with visa status, document preparation, and legal guidance. Be helpful, concise, and professional. Always remind users to consult a qualified immigration attorney for specific legal advice.',
      },
      history: messages.slice(0, -1), // all except the last user message
    });

    const response = await chat.sendMessage({ message: message.trim() });
    const reply = response.text || "I'm sorry, I couldn't process that request.";

    // Save bot reply
    db.prepare('INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)')
      .run(userId, 'bot', reply);

    res.json({ text: reply });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Get chat history
router.get('/history', authMiddleware, (req: AuthRequest, res: Response) => {
  const messages = db.prepare(`
    SELECT role, content, created_at FROM chat_history
    WHERE user_id = ? ORDER BY created_at ASC
  `).all(req.userId!);

  res.json(
    (messages as any[]).map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }))
  );
});

// Clear chat history
router.delete('/history', authMiddleware, (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM chat_history WHERE user_id = ?').run(req.userId!);
  res.json({ success: true });
});

export default router;
