# 💬 Real-Time Chat Application

Modern chat UI built with **Next.js 15**, **React 19**, **TypeScript**, **Socket.io**, and **MongoDB**. It supports multi-device messaging, reactions, profile management, and a colorful Tailwind-driven interface.

---

## 🗺️ Application Overview

```
┌──────────────┐    Login/Signup    ┌──────────────┐    Start Chat    ┌──────────────┐
│   Welcome    │ ────────────────▶ │   Login      │ ───────────────▶ │   Chat List  │
└──────────────┘                   └──────────────┘                  └──────────────┘
        ▲                                 │                                 │
        │        Logout/Profile           │   Select Contact                │
        └─────────────────────────────────┘─────────────────────────────────┘
        │
┌──────────────┐
│   Profile    │
└──────────────┘
```



---

## 🌟 Highlights
- **Secure auth** — Email/username flows backed by JWT+bcrypt.
- **Realtime messaging** — Socket.io delivery receipts, reactions, and delete-for-everyone controls.
- **People & sessions** — Favorites, presence, profile editing, remote session revocation.
- **Polished UI** — Tailwind v4 gradients, modern layouts, works across browsers/devices.

## ✨ Features
- Real-time 1:1 chat with synchronized dual-pane view and delivery receipts.
- Emoji catalog, quick reactions, and inline reaction management.
- Message tools: keyword search, delete for me/everyone, and clear-thread actions.
- Contact utilities: favorites, detailed profile panels, and online/offline indicators.
- Session management: track or revoke active devices, view socket health, and monitor status.
- Auth flows with signup/login, JWT middleware, and multi-device persistence.

---


## 🧰 Tech Stack
| Layer           | Technologies                                                      |
| -------------- | ----------------------------------------------------------------- |
| UI framework   | Next.js 15 App Router, React 19, TypeScript 5                     |
| Styling        | Tailwind CSS v4, custom CSS modules, PostCSS                      |
| Real-time      | Socket.io 4 (client + Node server, separate backend on 3006)      |
| Data & auth    | MongoDB Atlas with Mongoose 8, JWT, bcryptjs                      |
| Tooling        | Node.js 20+, npm 10+, ESLint 9, Turbopack/Next build              |
| Dev scripts    | `dev` (frontend), `dev:socket` (backend), `dev:all` (both)        |

---

## 🚀 Development Workflow

**Recommended:**

- Run the frontend (Next.js) and backend (Socket.IO) as separate processes for best reliability.
- Use `npm run dev:all` to start both servers concurrently for local development.
       - Frontend: http://localhost:3001
       - Backend (Socket.IO): http://localhost:3006
- For production, deploy frontend and backend as separate services or use a reverse proxy.


---


## 🏗 Architecture Overview


```
┌───────────────┐
│   Browser     │
│  (User/App)   │
└──────┬────────┘
       │  HTTP/API/WebSocket
       ▼
┌────────────────────┐
│  Next.js Server    │
│ (API & Socket.io)  │
└──────┬─────────────┘
       │  DB Queries
       ▼
┌───────────────┐
│   MongoDB     │
│  (Database)   │
└───────────────┘
       ▲
       │
       │  WebSocket (Real-time Messaging)
       └───────────────┐
                       │
┌──────────────────────┴─────────────────────┐
│              (Back to Browser)             │
└────────────────────────────────────────────┘
```

---

## 📁 Project Structure
```
Real-Time-Chat-Application/
├── app/
│   ├── components/
│   │   ├── Chat.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── Connections.tsx
│   │   ├── ConnectionsPanel.tsx
│   │   ├── DemoConnections.tsx
│   │   ├── Favorites.tsx
│   │   ├── Message.tsx
│   │   ├── MessageContextMenu.tsx
│   │   ├── ModernChatInterface.tsx
│   │   ├── Profile.tsx
│   │   ├── ReactionBar.tsx
│   │   ├── ReactionButton.tsx
│   │   ├── ReactionSender.tsx
│   │   ├── Sidebar.tsx
│   │   └── UserSearch.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts
│       │   └── signup/
│       │       └── route.ts
│       ├── health/
│       │   └── route.ts
│       ├── messages/
│       │   ├── route.ts
│       │   ├── [id]/
│       │   │   ├── everyone/
│       │   │   │   └── route.ts
│       │   │   ├── me/
│       │   │   │   └── route.ts
│       │   │   └── reactions/
│       │   │       └── route.ts
│       │   └── clear/
│       │       └── route.ts
│       ├── socket-status/
│       │   └── route.ts
│       └── users/
│           ├── [id]/
│           │   └── route.ts
│           ├── favorites/
│           │   └── route.ts
│           ├── online/
│           │   └── route.ts
│           ├── profile/
│           │   └── route.ts
│           ├── search/
│           │   └── route.ts
│           ├── sessions/
│           │   └── route.ts
│           └── status/
│               └── route.ts
├── lib/
│   ├── config.ts
│   ├── mongodb.js
│   ├── mongodb.ts
│   ├── socket-client.ts
│   └── socket.ts
├── models/
│   ├── Message.js
│   ├── Message.ts
│   ├── User.js
│   └── User.ts
├── public/
│   └── screenshots/
├── scripts/
│   ├── remove-users.js
│   └── test-mongodb-connection.js
├── types/
│   └── index.ts
├── clean-database.js
├── clear-auth.html
├── clear-auth.js
├── env.example
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── server.js
├── setup-env.js
└── tsconfig.json
```

---

## ✅ Prerequisites
- Node.js 20+ (required)
- npm 10+ (required)
- MongoDB Atlas (or any reachable Mongo instance)

---

## 🚀 Getting Started

```bash
git clone https://github.com/Subhajyoti-Maity/Real-Time-Chat-Application.git
cd Real-Time-Chat-Application
npm install
npm run setup   # guides you through .env.local
```

Manual `.env.local` fallback (never commit this file):

```env
MONGODB_URI="mongodb+srv://<USER>:<PASSWORD>@cluster/chat_app"
JWT_SECRET="replace_me" # use a long random string in real deployments
SOCKET_PORT=3006
NEXT_PUBLIC_SOCKET_PORT=3006
```

---

## 🧪 Running Locally

### Run both processes during development:

```bash
npm run dev        # Next.js UI + API (defaults to http://localhost:3001)
npm run dev:socket # Socket server (http://localhost:3006)
```

Or run both together (recommended):

```bash
npm run dev:all    # Runs both Next.js and Socket.io servers concurrently
```
---

## ⚠️ Error Handling & UX

- Login errors (e.g., wrong password) are shown as friendly messages only—no error overlay or crash.
- If you see a "Disconnected from chat server" banner, ensure the backend socket server is running on port 3006.
- All user-facing errors are handled gracefully for a smooth experience.

---

Create two demo accounts via `/signup`, log in on different browsers, and chat instantly.

---

## 🖼 Demo Clips (Quick Tour)
Add more **JPEG**s under `public/screenshots/` and drop new rows in this compact gallery.

| View | Preview | Focus |
| --- | --- | --- |
| Sign-in | <img src="./public/screenshots/sign-in.jpeg" alt="Sign in" width="220" /> | Username/email login with gradient CTA + session reminder. |
| Create account | <img src="./public/screenshots/create-account.jpeg" alt="Create account" width="220" /> | Onboarding with helper copy and password confirmation. |
| Dual chat | <img src="./public/screenshots/dual-chat.jpeg" alt="Dual chat" width="220" /> | Sender/receiver panes proving live sync in both directions. |
| Quick actions | <img src="./public/screenshots/quick-actions.jpg" alt="Quick actions" width="220" /> | Contact action sheet for view profile, clear chat, archive, etc. |
| Reactions | <img src="./public/screenshots/send-reaction.jpeg" alt="Reactions" width="220" /> | Emoji picker + inline chips for immediate feedback. |
| Search | <img src="./public/screenshots/search-messages.jpeg" alt="Search" width="220" /> | Keyword search while composing so context never leaves. |
| Dashboard | <img src="./public/screenshots/home-dashboard.jpeg" alt="Dashboard" width="220" /> | Post-login overview with presence, favorites, and socket status. |

---

## 🔧 Available Scripts
| Command | Purpose |
| --- | --- |
| `npm run setup` | Generate `.env.local` interactively. |
| `npm run dev` | Next.js dev server (frontend + APIs). |
| `npm run dev:socket` | Standalone Socket.io server on `SOCKET_PORT`. |
| `npm run build` | Production build via Next.js/Turbopack. |
| `npm run start` | Run the compiled app (requires `npm run build`). |
| `npm run lint` | ESLint checks. |
| `node scripts/remove-users.js` | Delete seeded or test users + their messages. |
| `node clean-database.js` | Full DB cleanup (use with caution). |

---

## 📡 API Surface (selected)
| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/auth/signup` | POST | Create a new user + initial session. |
| `/api/auth/login` | POST | Authenticate and issue JWT + refresh session list. |
| `/api/users/profile` | PUT | Update profile metadata. |
| `/api/users/search` | GET | Find other users to connect with. |
| `/api/users/sessions` | GET/DELETE | Inspect or revoke active sessions. |
| `/api/users/favorites` | GET/POST/DELETE | Manage favorite contacts. |
| `/api/messages` | GET/POST | Fetch or send chat messages. |
| `/api/messages/[id]/me` | DELETE | Delete message for the requesting user. |
| `/api/messages/[id]/everyone` | DELETE | Delete message globally. |
| `/api/socket-status` | GET | Check websocket health from the UI. |

---

## 🛠 Troubleshooting
- **Cannot connect to MongoDB** → verify connection string / IP whitelist in Atlas.
- **Socket keeps disconnecting** → ensure `dev:socket` server is running; confirm ports aren’t blocked by firewalls.
- **JWT errors** → delete stale cookies/localStorage tokens and log in again.
- **Port already in use** → `npx kill-port 3001 3006` (adjust as needed).
- **Images missing in README** → confirm each referenced `.jpg` exists in `public/screenshots/`.

---

## 🤝 Contributing
1. Fork & branch (`git checkout -b feature/<idea>`).
2. Build + add tests where it makes sense.
3. Run `npm run lint`, `npm run dev`, and `npm run dev:socket` to ensure clean output.
4. Submit a PR with a short summary + setup notes.

---

## ✍️ Author
- Subhajyoti Maity -
---

