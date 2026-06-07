import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { rateLimit, sanitizeInput } from "./server/middleware/auth.js";

dotenv.config();

// Import routes
import authRoutes from "./server/routes/auth.js";
import guideRoutes from "./server/routes/guides.js";
import forumRoutes from "./server/routes/forum.js";
import chatRoutes from "./server/routes/chat.js";
import profileRoutes from "./server/routes/profile.js";
import adminRoutes from "./server/routes/admin.js";
import feedbackRoutes from "./server/routes/feedback.js";
import reminderRoutes from "./server/routes/reminders.js";
import eventRoutes from "./server/routes/events.js";

// Import DB initialization
import "./server/db/index.js";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Security middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(sanitizeInput);

  // Rate limiting for auth endpoints
  app.use("/api/auth", rateLimit(50, 15 * 60 * 1000)); // 50 requests per 15 minutes

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/guides", guideRoutes);
  app.use("/api/forum", forumRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/feedback", feedbackRoutes);
  app.use("/api/reminders", reminderRoutes);
  app.use("/api/events", eventRoutes);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
