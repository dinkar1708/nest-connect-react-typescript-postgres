# NestConnect

**Project:** nestjs-react-typescript-friend-service

Social networking and chat app – users, friends, real-time messaging.

| Folder | Description |
|--------|--------------|
| `backend-api/` | NestJS API (auth, users, friends, chat) |
| `web/` | React frontend |
| `mobile/` | Mobile app (planned) |

**Quick start:** See `backend-api/README.md`

**Test the web UI:** Run `npm run dev` in `web/`, then open [http://localhost:5173](http://localhost:5173)

**Backend tests:** `cd backend-api && npm test && npm run test:e2e` — 2 unit + 15 e2e (auth, users, friends, chat) ✅

---

## Required Features / Roadmap

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| **Auth** | | | |
| Sign up | ✅ | ✅ | Planned |
| Sign in | ✅ | ✅ | Planned |
| Refresh token | ✅ | — | Planned |
| **Users** | | | |
| Browse users | ✅ | — | Planned |
| User profile | ✅ | — | Planned |
| **Friends** | | | |
| Send friend request | ✅ | — | Planned |
| Accept / reject request | ✅ | — | Planned |
| Friend list | ✅ | — | Planned |
| Remove friend | ✅ | — | Planned |
| **Chat** | | | |
| Send message | ✅ | — | Planned |
| View conversation | ✅ | — | Planned |
| Real-time (WebSocket) | ✅ | — | Planned |
