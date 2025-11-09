# Confession Wall (Bun + Hono + SQLite + Vue + Tailwind)

Fullstack app:
- Backend: Bun + Hono + Drizzle ORM + SQLite (`bun:sqlite`)
- Frontend: Vite + Vue 3 + Tailwind + Material Symbols, font Poppins

## Quick Start

```bash
# Backend
bun install
cp .env.example .env
bun run scripts/seed.ts
bun run dev   # http://localhost:8080/health

# Frontend
cd web
bun install
bun run dev   # http://localhost:5173  (proxy -> :8080)
```

### Admin
- Delete requires Bearer token. Default in `.env.example` → `supersecretadmin`.

### Endpoints
- `GET /health`
- `GET /api/confessions?q=...`
- `POST /api/confessions` `{ name?: string; message: string }`
- `POST /api/confessions/:id/vote` `{ value: 1 | -1 }`
- `DELETE /api/confessions/:id` (Authorization: Bearer ADMIN_TOKEN)

### Build Frontend
```bash
cd web
bun run build
bun run preview
```

## Extra Features
- WebSocket live update (`/ws`) for create/vote/approve/reject/delete
- Moderation queue: `status` = APPROVED | PENDING | REJECTED
- CSV export: `/api/confessions/export.csv?q=&status=`
- Honeypot anti-spam + bad-words filter
- Pagination + infinite scroll
- Refreshed glassmorphism UI with built-in search, auto-load-on-scroll, and stored admin token field
- Dockerfiles + docker-compose
