# CaliGuide

California Immigration Guide - A multilingual platform for newcomers to California.

## Features

- 📚 **Guides**: 12+ comprehensive guides for immigrants
- 💬 **Community Forum**: Ask questions and get answers
- 🤖 **AI Chatbot**: Get instant help with immigration questions
- 📅 **Events**: Join community events and volunteer opportunities
- 🌐 **Multilingual**: Support for 5 languages (English, Chinese, Spanish)
- 👤 **User Profiles**: Track your progress and documents
- 🔔 **Notifications**: Stay updated with platform announcements
- 📊 **Admin Dashboard**: Manage content and users

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express.js + SQLite
- **Authentication**: JWT + bcrypt
- **AI**: Google Gemini API
- **Animations**: Framer Motion

## Quick Start

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd CaliGuide

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your GEMINI_API_KEY

# Seed the database
npm run seed

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## Deployment to Render (Free)

### Option 1: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml` and deploy

### Option 2: Manual Setup

1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: caliguide
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `JWT_SECRET`: A random secret string
   - `NODE_ENV`: production
7. Click "Create Web Service"

### Test Account

After deployment, you can login with:
- **Email**: alice@caliguide.com
- **Password**: hello123

## Project Structure

```
CaliGuide/
├── server/              # Backend
│   ├── db/             # Database (SQLite)
│   ├── middleware/      # Auth middleware
│   └── routes/         # API routes
├── src/                # Frontend
│   ├── components/     # React components
│   ├── context/        # React context
│   ├── i18n/           # Internationalization
│   ├── lib/            # Utilities
│   └── pages/          # Page components
├── server.ts           # Express server entry
├── package.json        # Dependencies
├── render.yaml         # Render deployment config
├── Dockerfile          # Docker config
└── docker-compose.yml  # Docker Compose config
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Guides
- `GET /api/guides` - List all guides
- `GET /api/guides/:id` - Get guide details
- `POST /api/guides/:id/save` - Save guide

### Forum
- `GET /api/forum` - List posts
- `POST /api/forum` - Create post
- `GET /api/forum/:id` - Get post with replies
- `POST /api/forum/:id/reply` - Add reply

### Events
- `GET /api/events` - List events
- `POST /api/events/:id/register` - Register for event
- `POST /api/events/:id/cancel` - Cancel registration

### Chat
- `POST /api/chat` - Send message to AI

### Admin
- `GET /api/admin/stats` - Get statistics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/posts` - Manage posts
- `GET /api/admin/events` - Manage events
- `GET /api/admin/guides` - Manage guides

## Features Overview

### For Immigrants
- 📚 Step-by-step guides for DMV, banking, housing, healthcare
- 💬 Community forum to ask questions
- 🤖 AI chatbot for instant answers
- 📅 Events and volunteer opportunities
- 📋 Document checklist with export
- ⏰ Reminders for important dates

### For Admins
- 📊 Data dashboard with statistics
- ✅ Post moderation and approval
- 👥 User management
- 📢 Announcement system
- 📝 Feedback management
- 📈 Data export (CSV)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

- 📧 Email: support@caliguide.com
- 💬 Chat: Use the in-app CaliBot
- ❓ Help: Visit the Help Center in the app
