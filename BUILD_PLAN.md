# DOTODO — BUILD PLAN

> **Think it. Do it.**

---

## 1. PRODUCT NAME & MEANING

**DOTODO** — DO + TODO

> **From Todo to Done.**

Primary slogan:

> **DOTODO — Think it. Do it.**

---

## 2. PRODUCT VISION

DOTODO is a production-quality productivity application combining:

- **FreeToDoList** — zero-friction, immediate task capture, no account barrier
- **Todoist** — Inbox, Today, Upcoming, Projects, priorities, labels, recurring tasks, reminders, filters, search
- **FreeTodo** — hierarchical tasks, AI breakdown, natural language, calendar, scheduling
- **DROP-MSG philosophy** — Owner Key identity, persistent device sessions, sharing without accounts, Owner/Editor/Viewer permissions

DOTODO must NOT copy branding, source code, visual design, or exact UI from any reference product.

---

## 3. CORE PHILOSOPHY

> **Simple to start. Powerful when needed.**

```
OPEN DOTODO
    ↓
CREATE SPACE / ACCESS SPACE
    ↓
ADD TASK
    ↓
DONE
```

Everything else progressively reveals itself.

---

## 4. TECH STACK

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 14+ (App Router) | SSR, API routes, server actions, file-based routing |
| **Language** | TypeScript | Type safety, better DX |
| **Frontend** | React 18+ | Component architecture, ecosystem |
| **Styling** | Tailwind CSS | Utility-first, fast development |
| **UI Primitives** | Radix UI | Accessible, unstyled, composable |
| **State (client)** | Zustand | Lightweight, minimal boilerplate |
| **State (server)** | TanStack Query | Caching, optimistic updates, refetching |
| **Database** | MongoDB Atlas | Document model, flexible schema, your existing cluster |
| **ODM** | Mongoose | Schema validation, middleware, proven in Drop |
| **Auth** | Custom Owner Key + HTTP-only sessions | DROP-style, no third-party dependency |
| **Password Hashing** | bcrypt | Proven, configurable rounds |
| **AI** | OpenAI API | GPT-4 for task breakdown, NLP, planning |
| **Real-time** | Socket.IO | Proven in Drop project |
| **Drag & Drop** | @dnd-kit | Accessible, performant |
| **Calendar** | Custom (date-fns) | Full control |
| **Icons** | Lucide React | Clean, tree-shakeable |
| **Animation** | Framer Motion | Micro-interactions |
| **Testing (unit)** | Vitest | Fast, ESM-native |
| **Testing (E2E)** | Playwright | Cross-browser |
| **Email** | Nodemailer | Optional recovery/reminders |
| **Deployment** | Vercel | Next.js native, zero config |

---

## 5. DATABASE SCHEMA (MongoDB / Mongoose)

### 5.1 Owner

```js
{
  _id: ObjectId,
  name: String,              // Required, 1-100 chars
  ownerKeyHash: String,      // bcrypt hash of Owner Key — NEVER store raw
  email: String,             // Optional, added later for recovery
  createdAt: Date,
  updatedAt: Date
}
// Indexes: email (unique, sparse)
```

### 5.2 Space

```js
{
  _id: ObjectId,
  ownerId: ObjectId ref Owner,   // Required
  name: String,                  // Required, 1-100 chars
  createdAt: Date,
  updatedAt: Date
}
// Indexes: ownerId
```

### 5.3 Project

```js
{
  _id: ObjectId,
  spaceId: ObjectId ref Space,   // Required
  name: String,                  // Required, 1-200 chars
  description: String,           // Default ''
  icon: String,                  // Default 'folder'
  color: String,                 // Default '#6366f1'
  position: Number,              // Default 0, for ordering
  archived: Boolean,             // Default false
  createdAt: Date,
  updatedAt: Date
}
// Indexes: spaceId, spaceId+position
```

### 5.4 Label

```js
{
  _id: ObjectId,
  spaceId: ObjectId ref Space,   // Required
  name: String,                  // Required, 1-50 chars
  color: String,                 // Default '#8b5cf6'
  createdAt: Date
}
// Indexes: spaceId
```

### 5.5 Task

```js
{
  _id: ObjectId,
  spaceId: ObjectId ref Space,         // Required
  projectId: ObjectId ref Project,     // Optional, null = Inbox
  parentTaskId: ObjectId ref Task,     // Optional, null = top-level
  title: String,                       // Required, 1-500 chars
  description: String,                 // Default ''
  completed: Boolean,                  // Default false
  priority: Number,                    // 0=none, 1=P4, 2=P3, 3=P2, 4=P1
  dueDate: Date,                       // Optional
  dueTime: String,                     // Optional, 'HH:mm' format
  recurrence: {                        // Optional
    type: String,                      // 'daily'|'weekly'|'monthly'|'yearly'|'weekdays'|'custom'
    interval: Number,                  // Default 1
    daysOfWeek: [Number],              // 0-6, for weekly
    endDate: Date,                     // Optional
  },
  reminderAt: Date,                    // Optional
  estimatedMinutes: Number,            // Optional
  assigneeId: ObjectId ref Owner,      // Optional
  labels: [ObjectId ref Label],        // Array of label IDs
  position: Number,                    // Default 0
  notes: String,                       // Default ''
  completedAt: Date,                   // Set on completion
  archived: Boolean,                   // Default false
  createdAt: Date,
  updatedAt: Date
}
// Indexes: spaceId, projectId, parentTaskId, completed, priority,
//          dueDate, assigneeId, spaceId+completed, spaceId+projectId
```

### 5.6 Session (Device Auth)

```js
{
  _id: ObjectId,
  ownerId: ObjectId ref Owner,     // Required
  tokenHash: String,               // SHA-256 of session token
  deviceName: String,              // Browser/OS info
  ipAddress: String,               // For display only
  expiresAt: Date,                 // Required
  createdAt: Date
}
// Indexes: ownerId, tokenHash (unique), expiresAt (TTL index)
```

### 5.7 ShareLink

```js
{
  _id: ObjectId,
  spaceId: ObjectId ref Space,     // Required
  projectId: ObjectId ref Project, // Optional (null = whole space share)
  tokenHash: String,               // bcrypt hash of share token
  permission: String,              // 'editor' | 'viewer'
  expiresAt: Date,                 // Optional
  createdBy: ObjectId ref Owner,   // Required
  active: Boolean,                 // Default true
  createdAt: Date
}
// Indexes: tokenHash (unique), spaceId
```

### 5.8 SpaceMember

```js
{
  _id: ObjectId,
  spaceId: ObjectId ref Space,     // Required
  ownerId: ObjectId ref Owner,     // Required
  role: String,                    // 'owner' | 'editor' | 'viewer'
  createdAt: Date
}
// Indexes: spaceId+ownerId (unique compound), ownerId
```

### 5.9 Reminder

```js
{
  _id: ObjectId,
  taskId: ObjectId ref Task,       // Required
  remindAt: Date,                  // Required
  sent: Boolean,                   // Default false
  type: String,                    // 'notification' | 'email'
  createdAt: Date
}
// Indexes: taskId, remindAt, sent
```

### 5.10 AiConversation

```js
{
  _id: ObjectId,
  spaceId: ObjectId ref Space,     // Required
  taskId: ObjectId ref Task,       // Optional
  messages: [{                     // Embedded array
    role: String,                  // 'user' | 'assistant'
    content: String,
    createdAt: Date
  }],
  createdAt: Date
}
// Indexes: spaceId
```

### Mongoose Schema File Location

```
src/server/models/
  Owner.js
  Space.js
  Project.js
  Label.js
  Task.js
  Session.js
  ShareLink.js
  SpaceMember.js
  Reminder.js
  AiConversation.js
```

---

## 6. PROJECT STRUCTURE

```
DOTODO/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (providers, fonts)
│   │   ├── page.tsx                    # Landing page
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   ├── create-space/
│   │   │   │   └── page.tsx            # Create Space flow
│   │   │   └── access-space/
│   │   │       └── page.tsx            # Access with Owner Key
│   │   ├── (app)/
│   │   │   ├── layout.tsx              # Authenticated layout (sidebar)
│   │   │   ├── inbox/
│   │   │   │   └── page.tsx
│   │   │   ├── today/
│   │   │   │   └── page.tsx
│   │   │   ├── upcoming/
│   │   │   │   └── page.tsx
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx
│   │   │   ├── completed/
│   │   │   │   └── page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [projectId]/
│   │   │   │       └── page.tsx
│   │   │   ├── ai/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── account/
│   │   │       │   └── page.tsx
│   │   │       ├── space/
│   │   │       │   └── page.tsx
│   │   │       ├── notifications/
│   │   │       │   └── page.tsx
│   │   │       ├── sharing/
│   │   │       │   └── page.tsx
│   │   │       ├── devices/
│   │   │       │   └── page.tsx
│   │   │       ├── privacy/
│   │   │       │   └── page.tsx
│   │   │       ├── export/
│   │   │       │   └── page.tsx
│   │   │       └── shortcuts/
│   │   │           └── page.tsx
│   │   └── s/
│   │       └── [token]/
│   │           └── page.tsx            # Share link access
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── command.tsx
│   │   │   ├── calendar-picker.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── separator.tsx
│   │   │   └── scroll-area.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── quick-add.tsx
│   │   ├── task/
│   │   │   ├── task-item.tsx
│   │   │   ├── task-detail.tsx
│   │   │   ├── task-list.tsx
│   │   │   ├── task-input.tsx
│   │   │   ├── subtask-list.tsx
│   │   │   ├── priority-badge.tsx
│   │   │   └── task-context-menu.tsx
│   │   ├── project/
│   │   │   ├── project-card.tsx
│   │   │   ├── project-header.tsx
│   │   │   └── project-settings.tsx
│   │   ├── views/
│   │   │   ├── inbox-view.tsx
│   │   │   ├── today-view.tsx
│   │   │   ├── upcoming-view.tsx
│   │   │   ├── calendar-view.tsx
│   │   │   ├── completed-view.tsx
│   │   │   └── ai-view.tsx
│   │   ├── focus/
│   │   │   └── focus-mode.tsx
│   │   ├── search/
│   │   │   └── global-search.tsx
│   │   └── share/
│   │       ├── share-dialog.tsx
│   │       └── share-view.tsx
│   │
│   ├── server/
│   │   ├── db.ts                       # Mongoose connection singleton
│   │   ├── auth.ts                     # Owner Key + Session logic
│   │   ├── ai.ts                       # OpenAI integration
│   │   └── models/
│   │       ├── Owner.js
│   │       ├── Space.js
│   │       ├── Project.js
│   │       ├── Label.js
│   │       ├── Task.js
│   │       ├── Session.js
│   │       ├── ShareLink.js
│   │       ├── SpaceMember.js
│   │       ├── Reminder.js
│   │       └── AiConversation.js
│   │
│   ├── api/
│   │   ├── owners/
│   │   │   ├── create/
│   │   │   │   └── route.ts
│   │   │   └── recover/
│   │   │       └── route.ts
│   │   ├── auth/
│   │   │   ├── access/
│   │   │   │   └── route.ts
│   │   │   ├── session/
│   │   │   │   └── route.ts
│   │   │   └── logout/
│   │   │       └── route.ts
│   │   ├── spaces/
│   │   │   └── [spaceId]/
│   │   │       ├── route.ts
│   │   │       ├── projects/
│   │   │       │   └── route.ts
│   │   │       ├── labels/
│   │   │       │   └── route.ts
│   │   │       ├── members/
│   │   │       │   └── route.ts
│   │   │       └── shares/
│   │   │           └── route.ts
│   │   ├── tasks/
│   │   │   ├── route.ts
│   │   │   ├── quick-add/
│   │   │   │   └── route.ts
│   │   │   └── [taskId]/
│   │   │       ├── route.ts
│   │   │       ├── subtasks/
│   │   │       │   └── route.ts
│   │   │       └── complete/
│   │   │           └── route.ts
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   └── [projectId]/
│   │   │       ├── route.ts
│   │   │       └── tasks/
│   │   │           └── route.ts
│   │   ├── share/
│   │   │   ├── create/
│   │   │   │   └── route.ts
│   │   │   └── [token]/
│   │   │       └── route.ts
│   │   ├── ai/
│   │   │   ├── break-down/
│   │   │   │   └── route.ts
│   │   │   ├── plan-day/
│   │   │   │   └── route.ts
│   │   │   └── chat/
│   │   │       └── route.ts
│   │   ├── search/
│   │   │   └── route.ts
│   │   ├── export/
│   │   │   └── route.ts
│   │   └── settings/
│   │       └── route.ts
│   │
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── utils.ts
│   │   ├── crypto.ts
│   │   ├── nlp.ts
│   │   ├── recurrence.ts
│   │   ├── notifications.ts
│   │   └── validations.ts
│   │
│   ├── hooks/
│   │   ├── use-tasks.ts
│   │   ├── use-projects.ts
│   │   ├── use-labels.ts
│   │   ├── use-space.ts
│   │   ├── use-search.ts
│   │   ├── use-offline.ts
│   │   ├── use-keyboard-shortcuts.ts
│   │   └── use-realtime.ts
│   │
│   ├── stores/
│   │   ├── ui-store.ts
│   │   ├── task-store.ts
│   │   └── quick-add-store.ts
│   │
│   ├── providers/
│   │   ├── query-provider.tsx
│   │   ├── theme-provider.tsx
│   │   ├── socket-provider.tsx
│   │   └── toast-provider.tsx
│   │
│   └── types/
│       ├── task.ts
│       ├── project.ts
│       ├── space.ts
│       ├── owner.ts
│       ├── label.ts
│       └── index.ts
│
├── public/
│   ├── favicon.svg
│   └── og-image.png
│
├── tests/
│   ├── unit/
│   │   ├── crypto.test.ts
│   │   ├── nlp.test.ts
│   │   ├── recurrence.test.ts
│   │   └── validations.test.ts
│   ├── api/
│   │   ├── auth.test.ts
│   │   ├── tasks.test.ts
│   │   ├── projects.test.ts
│   │   └── sharing.test.ts
│   └── e2e/
│       ├── landing.spec.ts
│       ├── create-space.spec.ts
│       ├── task-crud.spec.ts
│       └── sharing.spec.ts
│
├── .env.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── README.md
└── BUILD_PLAN.md
```

---

## 7. BUILD PHASES

### PHASE 1 — Foundation (Days 1-2)

**Goal:** Project setup, MongoDB connection, basic auth, landing page.

| # | Task | Details |
|---|------|---------|
| 1.1 | Initialize Next.js project | `npx create-next-app@latest . --typescript --tailwind --app --src-dir` inside cloned repo |
| 1.2 | Install core dependencies | mongoose, bcryptjs, zod, zustand, @tanstack/react-query, lucide-react, framer-motion, date-fns, socket.io-client |
| 1.3 | Install dev dependencies | @types/bcryptjs, vitest, @playwright/test |
| 1.4 | Set up Mongoose connection | `src/server/db.ts` — singleton connection with retry logic |
| 1.5 | Create all Mongoose models | All 10 models as defined in Section 5 |
| 1.6 | Build crypto utilities | Owner Key generation (crypto.randomBytes), SHA-256 session hashing, bcrypt wrapper |
| 1.7 | Build auth module | Session token creation, HTTP-only cookie set/get/validate, middleware |
| 1.8 | Build landing page | DOTODO branding, "Think it. Do it.", Create Space / Access Space |
| 1.9 | Build Create Space flow | Name input → generate Owner Key → show key once (copy + warning) → save hash → create session cookie → redirect |
| 1.10 | Build Access Space flow | Owner Key input → bcrypt compare → create session → redirect to inbox |
| 1.11 | Build auth middleware | Protect `(app)` routes, validate session cookie on every request |
| 1.12 | Set up environment variables | MONGODB_URI, SESSION_SECRET, OPENAI_API_KEY, etc. |
| 1.13 | Create .gitignore | node_modules, .env, .next, etc. |
| 1.14 | Initial commit | All foundation code |

**Deliverable:** User creates Space, gets Owner Key, accesses Space via key, sees empty app shell.

---

### PHASE 2 — Core App Shell (Days 3-4)

**Goal:** Navigation, layout, sidebar, theme, empty states.

| # | Task | Details |
|---|------|---------|
| 2.1 | Build app layout | Sidebar + main content + right panel (task detail) |
| 2.2 | Build sidebar | Inbox, Today, Upcoming, Projects section, Calendar, Completed, AI, Settings |
| 2.3 | Build sidebar mobile variant | Drawer navigation, hamburger toggle |
| 2.4 | Build header | Space name, quick search trigger, quick add trigger |
| 2.5 | Set up TanStack Query | Provider, default stale/cache config |
| 2.6 | Set up Zustand stores | UI state (sidebar open, focus mode, theme), task selection |
| 2.7 | Build UI components | Button, Input, Badge, Skeleton, Toast, Tooltip, Separator, Switch |
| 2.8 | Implement empty states | Inbox, Today, Projects, Completed — each with contextual message |
| 2.9 | Set up global CSS | Design tokens, dark theme as default |
| 2.10 | Build keyboard shortcuts hook | Register shortcuts, skip when input focused |
| 2.11 | Settings page shell | Account, Space, Appearance, Notifications, etc. |

**Deliverable:** Navigable app shell with sidebar, header, empty states, responsive layout.

---

### PHASE 3 — Task System (Days 5-7)

**Goal:** Full task CRUD, inline creation, subtasks, priorities.

| # | Task | Details |
|---|------|---------|
| 3.1 | Build task API routes | POST/GET/PUT/DELETE `/api/tasks` |
| 3.2 | Build task list component | Renders tasks, empty state, loading skeleton |
| 3.3 | Build task item component | Checkbox, title, priority badge, due date, labels |
| 3.4 | Build inline task input | Type title + Enter → create task. No modal. |
| 3.5 | Build task detail panel | Right sidebar, editable fields, slides in on click |
| 3.6 | Implement priorities | P1-P4 badges, quick change dropdown |
| 3.7 | Build subtask API | POST `/api/tasks/:id/subtasks`, hierarchy queries |
| 3.8 | Build subtask list | Indented, collapse/expand, parent progress bar |
| 3.9 | Implement task completion | Toggle, strikethrough animation, completedAt timestamp |
| 3.10 | Implement task ordering | Position field, reorder API, optimistic updates |
| 3.11 | Build useTasks hook | React Query, optimistic updates, cache invalidation |
| 3.12 | Task description | Markdown textarea in detail panel |
| 3.13 | Task notes | Notes field in detail panel |

**Deliverable:** Full task CRUD, priorities, subtasks, inline creation, detail panel.

---

### PHASE 4 — Projects & Labels (Days 8-9)

**Goal:** Project CRUD, label system, project views.

| # | Task | Details |
|---|------|---------|
| 4.1 | Build project API routes | CRUD + project task listing |
| 4.2 | Build project list in sidebar | Clickable, shows task count |
| 4.3 | Build project page | Header (icon, color, name), filtered task list |
| 4.4 | Build project settings | Edit name, description, icon, color, archive, delete |
| 4.5 | Build label API routes | CRUD, assign/remove from tasks |
| 4.6 | Build label picker | Dropdown, create new, assign to task |
| 4.7 | Label filters | Filter tasks by label |
| 4.8 | Inbox page | Shows tasks with no project |
| 4.9 | Default projects | Create Personal, College, Work on space creation |

**Deliverable:** Projects, labels, filtering, Inbox view.

---

### PHASE 5 — Today & Upcoming (Days 10-11)

**Goal:** Smart views, recurrence engine, reminders.

| # | Task | Details |
|---|------|---------|
| 5.1 | Build Today page | Overdue + today's tasks |
| 5.2 | Time-of-day grouping | Morning, Afternoon, Evening, Anytime |
| 5.3 | Overdue section | Highlighted past-due tasks |
| 5.4 | Build Upcoming page | Future tasks by day/week |
| 5.5 | Date navigation | Jump to dates, week picker |
| 5.6 | Reschedule from views | Drag or click to change date |
| 5.7 | Build recurring task engine | Parse recurrence, create next occurrence on complete |
| 5.8 | Recurrence patterns | Daily, weekday, weekly, monthly, yearly |
| 5.9 | Build reminder system | Date/time picker, browser Notification API |
| 5.10 | Reminder checker | Poll reminders, fire browser notifications |

**Deliverable:** Today, Upcoming, recurring tasks, reminders.

---

### PHASE 6 — Calendar (Days 12-13)

**Goal:** Full calendar view with drag-and-drop.

| # | Task | Details |
|---|------|---------|
| 6.1 | Build calendar component | Month view, week view, day view |
| 6.2 | Render tasks on calendar | Dots/bars on dates |
| 6.3 | Create task from calendar | Click slot → create |
| 6.4 | Edit task from calendar | Click task → detail panel |
| 6.5 | Drag-and-drop rescheduling | @dnd-kit integration |
| 6.6 | Date navigation | Today, forward/back |
| 6.7 | Mobile calendar | Swipe, responsive grid |

**Deliverable:** Interactive calendar with drag-and-drop.

---

### PHASE 7 — Quick Add & Search (Days 14-15)

**Goal:** NLP quick add, global search, filters.

| # | Task | Details |
|---|------|---------|
| 7.1 | Build Quick Add modal | Shortcut (N key), type + Enter |
| 7.2 | Build NLP parser | Extract date, time, priority, project, labels from text |
| 7.3 | NLP preview | Show parsed result, allow edit before save |
| 7.4 | Build global search | Cmd/Ctrl + K command palette |
| 7.5 | Search API | MongoDB text index on tasks, projects, labels |
| 7.6 | Build filter bar | Today, Overdue, Priority, Project, Label, Completed |
| 7.7 | Build Completed page | Completed tasks, restore, permanent delete |
| 7.8 | Bulk actions | Select multiple, bulk complete/delete/move |

**Deliverable:** Quick add with NLP, search, filters, bulk actions.

---

### PHASE 8 — Sharing & Permissions (Days 16-17)

**Goal:** Share links, permission system.

| # | Task | Details |
|---|------|---------|
| 8.1 | Build share link API | Create, validate, revoke |
| 8.2 | Build share dialog | Scope, permission level, expiry |
| 8.3 | Build share page | `/s/[token]` — no-account access |
| 8.4 | Permission middleware | Owner/Editor/Viewer enforced server-side |
| 8.5 | Space members API | Add/remove, change role |
| 8.6 | Member management UI | Settings → Members |
| 8.7 | Share security | Rate limiting, token hashing, revocation |
| 8.8 | Viewer mode | Read-only UI, visual indicator |

**Deliverable:** Share links, permissions, no-account access.

---

### PHASE 9 — AI Assistant (Days 18-20)

**Goal:** AI task breakdown, planner, NLP, project assistant.

| # | Task | Details |
|---|------|---------|
| 9.1 | Set up OpenAI integration | API key, client, rate limiting |
| 9.2 | Build AI task breakdown | Task → subtask suggestions → preview → create |
| 9.3 | Build AI daily planner | Today's tasks → suggested schedule |
| 9.4 | Build AI project assistant | Context-aware project help |
| 9.5 | Build AI chat interface | Conversational UI |
| 9.6 | Enhance NLP with AI | Better natural language parsing |
| 9.7 | AI preview before create | Never auto-create |
| 9.8 | AI error handling | Graceful fallback |
| 9.9 | AI context management | Send relevant project/task context |

**Deliverable:** AI task breakdown, planning, natural language.

---

### PHASE 10 — Focus Mode & Polish (Days 21-22)

**Goal:** Focus mode, shortcuts, micro-interactions.

| # | Task | Details |
|---|------|---------|
| 10.1 | Build Focus Mode | Full-screen task, timer, minimal controls |
| 10.2 | Focus timer | Pomodoro or custom |
| 10.3 | Shortcuts reference | Settings section |
| 10.4 | Micro-interactions | Completion animation, hover effects, transitions |
| 10.5 | Toast notifications | All actions |
| 10.6 | Offline detection | Network status, preserve input |
| 10.7 | Error states | Friendly messages, retry |
| 10.8 | Loading states | Skeletons, optimistic updates |
| 10.9 | Responsive polish | Mobile-first, touch targets, bottom sheets |

**Deliverable:** Polished experience with focus mode.

---

### PHASE 11 — Real-time Collaboration (Days 23-24)

**Goal:** Socket.IO for shared spaces.

| # | Task | Details |
|---|------|---------|
| 11.1 | Set up Socket.IO server | Custom Next.js server |
| 11.2 | Socket.IO client provider | React context, reconnection |
| 11.3 | Real-time task updates | Broadcast changes to space members |
| 11.4 | Real-time presence | Who's viewing what |
| 11.5 | Conflict resolution | Last-write-wins or field merge |
| 11.6 | Session management UI | View/revoke devices |
| 11.7 | Session rotation | Token refresh on activity |

**Deliverable:** Real-time collaboration across devices.

---

### PHASE 12 — Data, Privacy, Security (Days 25-26)

**Goal:** Export, privacy, security hardening.

| # | Task | Details |
|---|------|---------|
| 12.1 | JSON export | All space data |
| 12.2 | CSV export | Tasks in CSV |
| 12.3 | Data deletion | Account/space deletion |
| 12.4 | Privacy page | Data practices communication |
| 12.5 | Security audit | All spec requirements |
| 12.6 | Rate limiting | All API endpoints |
| 12.7 | Input validation | Zod on all routes |
| 12.8 | CSRF protection | SameSite cookies |
| 12.9 | XSS prevention | Input sanitization, CSP |
| 12.10 | Secrets audit | No secrets in frontend |

**Deliverable:** Secure app with data export.

---

### PHASE 13 — Testing (Days 27-28)

**Goal:** Unit, API, E2E tests.

| # | Task | Details |
|---|------|---------|
| 13.1 | Unit: crypto utils | Key gen, hashing |
| 13.2 | Unit: NLP parser | Date/time/priority extraction |
| 13.3 | Unit: recurrence engine | All patterns |
| 13.4 | API: auth flow | Create, access, invalid key |
| 13.5 | API: task CRUD | Full lifecycle |
| 13.6 | API: projects | CRUD, task association |
| 13.7 | API: sharing | Create, access, revoke |
| 13.8 | E2E: landing | Renders, CTAs work |
| 13.9 | E2E: create space | Name → key → app |
| 13.10 | E2E: task CRUD | Create, edit, complete, delete |
| 13.11 | E2E: sharing | Share link access |

**Deliverable:** Test suite covering core functionality.

---

### PHASE 14 — Deployment & Final (Days 29-30)

**Goal:** Deploy, polish, docs.

| # | Task | Details |
|---|------|---------|
| 14.1 | Set up Vercel project | Connect repo, env vars |
| 14.2 | Connect MongoDB Atlas | Whitelist Vercel IPs, connection string |
| 14.3 | Performance audit | Lighthouse, Core Web Vitals |
| 14.4 | SEO meta tags | OG tags, title, description |
| 14.5 | Favicon + branding | SVG favicon, app icons |
| 14.6 | Responsive audit | Mobile, tablet, desktop |
| 14.7 | README | Setup, env vars, architecture |
| 14.8 | Final commit | Clean history |

**Deliverable:** DOTODO live.

---

## 8. DESIGN SYSTEM

### Colors (Dark theme default)

```
Background:    #09090b (zinc-950)
Surface:       #18181b (zinc-900)
Surface+1:     #27272a (zinc-800)
Border:        #3f3f46 (zinc-700)
Border+1:      #52525b (zinc-600)

Text:          #fafafa (zinc-50)
Text Muted:    #a1a1aa (zinc-400)
Text Dim:      #71717a (zinc-500)

Primary:       #6366f1 (indigo-500)
Primary+1:     #818cf8 (indigo-400)
Primary Dim:   #4f46e5 (indigo-600)

Success:       #22c55e (green-500)
Warning:       #f59e0b (amber-500)
Danger:        #ef4444 (red-500)

P1:            #ef4444 (red)
P2:            #f97316 (orange)
P3:            #f59e0b (amber)
P4:            #3b82f6 (blue)
```

### Typography

```
Headings:      Inter (variable weight)
Body:          Inter
Mono/Code:     JetBrains Mono
```

### Border Radius

```
Small:  6px    (badges, inputs)
Medium: 8px    (cards, buttons)
Large:  12px   (panels, modals)
Full:   9999px (avatars, pills)
```

---

## 9. ENVIRONMENT VARIABLES

```env
# MongoDB
MONGODB_URI="mongodb+srv://..."

# Auth
SESSION_SECRET="generate-a-32-char-random-string"
SESSION_MAX_AGE_DAYS=30

# AI (optional)
OPENAI_API_KEY="sk-..."

# Email (optional)
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=587
EMAIL_USER=""
EMAIL_PASS=""
EMAIL_FROM="noreply@dotodo.app"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 10. SECURITY RULES

### Owner Key

- Generate using `crypto.randomBytes(8)` → hex string (e.g., `D7K4-X92M`)
- Store only bcrypt hash in MongoDB
- Rate-limit access attempts (5 per minute per IP)
- Never return raw key after initial creation
- Never expose in logs, URLs, or frontend error output

### Sessions

- Generate random token, store SHA-256 hash in DB
- Set as HTTP-only, Secure, SameSite=Strict cookie
- TTL index on `expiresAt` for auto-cleanup
- Support: remember device, revoke current, revoke all

### Share Links

- Generate random token, store bcrypt hash
- Rate-limit share access attempts
- Support expiry, revocation, permission levels
- Never expose Owner credentials through shares

### API

- Validate all input with Zod
- Rate-limit all endpoints
- No secrets in frontend code
- Sanitize all user input
- Use CORS appropriately

---

## 11. BUILD ORDER SUMMARY

```
Phase 1:  Foundation          ██░░░░░░░░░░░░░░░░░░  Days 1-2
Phase 2:  App Shell           ████░░░░░░░░░░░░░░░░  Days 3-4
Phase 3:  Task System         ██████░░░░░░░░░░░░░░  Days 5-7
Phase 4:  Projects & Labels   ████████░░░░░░░░░░░░  Days 8-9
Phase 5:  Today & Upcoming    ██████████░░░░░░░░░░  Days 10-11
Phase 6:  Calendar            ████████████░░░░░░░░  Days 12-13
Phase 7:  Quick Add & Search  ██████████████░░░░░░  Days 14-15
Phase 8:  Sharing             ████████████████░░░░  Days 16-17
Phase 9:  AI Assistant        ██████████████████░░  Days 18-20
Phase 10: Polish              ████████████████████  Days 21-22
Phase 11: Real-time           ████████████████████  Days 23-24
Phase 12: Security            ████████████████████  Days 25-26
Phase 13: Testing             ████████████████████  Days 27-28
Phase 14: Deploy              ████████████████████  Days 29-30
```

**Total: ~30 working days to production-ready MVP.**

---

## 12. REFERENCE PRODUCTS (Conceptual only)

| Product | What We Take | What We Don't Take |
|---------|-------------|-------------------|
| FreeToDoList | Zero-friction, simplicity, immediate capture | UI, code, branding |
| Todoist | Inbox/Today/Upcoming, projects, priorities, labels, recurring, filters | UI, code, branding, proprietary features |
| FreeTodo | AI breakdown, NLP, calendar, scheduling, hierarchy | UI, code, branding |
| DROP | Owner Key, no-account access, sharing, sessions, permissions | UI, code, branding |

DOTODO must have its own identity.
