# CaliGuide Codebase Context

## Project Structure
```
/Users/zyx_mac_mini/Downloads/code/CaliGuide/
├── server/                    # Express backend
│   ├── db/                   # SQLite database
│   │   ├── index.ts         # DB connection
│   │   └── seed.ts          # Seed data (4 guides, 3 posts)
│   ├── middleware/
│   │   └── auth.ts          # JWT auth middleware
│   └── routes/
│       ├── auth.ts          # Auth endpoints
│       ├── chat.ts          # Gemini AI chat
│       ├── forum.ts         # Forum CRUD
│       ├── guides.ts        # Guide endpoints
│       └── profile.ts       # Profile & checklist
├── src/
│   ├── components/
│   │   ├── Navigation.tsx   # Bottom nav bar
│   │   └── TopAppBar.tsx    # Top app bar with i18n
│   ├── context/
│   │   └── AuthContext.tsx  # Auth state management
│   ├── i18n/
│   │   └── index.tsx        # I18nProvider (en, zh-CN, zh-TW, yue, es)
│   ├── lib/
│   │   ├── api.ts           # API client
│   │   ├── authStore.ts     # Legacy localStorage auth
│   │   └── avatarUpload.ts  # Avatar file handling
│   ├── pages/
│   │   ├── AuthPage.tsx     # Login/Register
│   │   ├── Chatbot.tsx      # AI chat with history
│   │   ├── Forum.tsx        # Forum with CRUD
│   │   ├── Guide.tsx        # Guide viewer
│   │   ├── Home.tsx         # Home with search
│   │   └── Profile.tsx      # Profile with sections
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx             # Entry point
│   └── types.ts             # TypeScript types
├── server.ts                # Express server entry
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Current State (from REQUIREMENTS.md)
- Phase 2 complete ✅
- All core features implemented
- 5 languages supported (en, zh-CN, zh-TW, yue, es)
- Server-side auth with JWT + bcrypt
- SQLite database for persistence
- Gemini AI chat with history

## Remaining Tasks (P1)
1. **Error Boundary** - Prevent white screens on React errors
2. **Unified Search** - Search both guides and forum posts
3. **Forgot Password** - Email reset flow (mock for now)

## Tech Stack
- React 18 + TypeScript
- Vite + Tailwind CSS 4
- Express + SQLite + JWT
- Gemini 3 Flash API
- Framer Motion animations
