# DOTODO

> **Think it. Do it.**

From Todo to Done.

DOTODO is a production-quality productivity application with zero-friction task capture, AI-assisted planning, and DROP-style ownership — no mandatory accounts, no passwords, just your Owner Key.

## Tech Stack

- **Next.js 14+** (App Router, TypeScript)
- **React 18+** with Tailwind CSS
- **MongoDB** (Mongoose ODM)
- **Radix UI** for accessible components
- **Zustand** + **TanStack Query** for state
- **Socket.IO** for real-time collaboration
- **OpenAI** for AI task breakdown and planning
- **@dnd-kit** for drag-and-drop
- **Framer Motion** for animations

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- OpenAI API key (optional, for AI features)

### Setup

```bash
git clone https://github.com/ParasGavali/DOTODO.git
cd DOTODO
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
MONGODB_URI="mongodb+srv://..."
SESSION_SECRET="a-random-32-char-string"
SESSION_MAX_AGE_DAYS=30
NEXT_PUBLIC_APP_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."          # Optional
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## How It Works

1. **Create a Space** — Enter your name, get an Owner Key
2. **Save your Key** — It won't be shown again
3. **Access your Space** — Enter your Owner Key to log in
4. **Add Tasks** — Type and press Enter. Done.
5. **Organize Later** — Projects, labels, priorities, dates

## Features

- Zero-friction task capture
- Inbox, Today, Upcoming, Calendar views
- Projects and labels
- Subtask hierarchy
- Recurring tasks and reminders
- AI task breakdown and daily planning
- Natural language task creation
- Focus mode with timer
- Secure sharing without accounts
- Real-time collaboration
- Dark theme by default
- Keyboard shortcuts
- Mobile-responsive
- Data export (JSON/CSV)

## Project Plan

See [BUILD_PLAN.md](BUILD_PLAN.md) for the complete project plan including:

- Full database schema
- Project structure
- 14 build phases
- Design system
- Security rules

## License

Private — All rights reserved.
