# Local development, deployment and demo mode

## Local Development

### Clone repository

- git clone https://github.com/delmocss/slotify
- cd slotify

---

### Backend Setup

```bash
cd server
npm install
cp .env.example .env     # then fill in the values
```

Create the tables by running `server/src/database/schema.sql` against an empty Postgres database.
To upgrade a database created before the multi-tenant release, apply the files in
`server/src/database/migrations/` in order instead (they keep existing data). Migration `004` drops a legacy `no_past_booking` check (`date >= CURRENT_DATE`) that some older databases carry: it stops past bookings from being updated (e.g. cancelled) and rejects the demo's sample bookings. It is safe to run on any database.

Environment variables (`server/.env`):

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `JWT_SECRET` | yes | at least 32 characters, e.g. `openssl rand -base64 48` |
| `CORS_ORIGIN` | recommended | frontend origin(s), comma-separated. If unset, any origin is accepted (a warning is logged) |
| `PORT` | no | defaults to 4000 |
| `DEMO_EMAIL` | no | public demo account whose logins get a private sandbox copy (default `demo@demo.com`) |
| `DEMO_SLUG` | no | slug of the template business copied for each demo login (default `demo-negocio`) |

The server refuses to start if `DATABASE_URL` or `JWT_SECRET` are missing or invalid.

`CORS_ORIGIN` must match the exact origin the frontend is served from. The dev server runs on `http://localhost:3000` (it is the value in `.env.example`); a different port or host (for example opening the HTML with Live Server on `127.0.0.1:5500`) is blocked by CORS.

```bash
npm run dev     # http://localhost:4000
npm test        # unit tests, no database needed
```

The demo account and its template business are ordinary data: register `demo@demo.com` with the business name "Demo Negocio" (its slug becomes `demo-negocio`) and add some services if you want to try the sandbox locally.

---

### Frontend Setup

```bash
cd client
npm install
npm run dev     # http://localhost:3000
```

Optionally set `VITE_API_URL` (defaults to `http://localhost:4000`).

---

## Deployment Guide

### Database

Recommended providers:

- Supabase
- Neon
- Railway PostgreSQL

Steps:
1. Create PostgreSQL instance
2. Run `server/src/database/schema.sql`
3. Add connection string to backend environment

---

### Backend Deployment (Render / Railway)

1. Connect GitHub repository
2. Configure environment variables:
   - DATABASE_URL
   - JWT_SECRET (32+ characters)
   - CORS_ORIGIN (your Vercel URL, without trailing slash)
3. Root directory: `server`
4. Build command: `npm install && npm run build`
5. Start command: `npm run start`
6. Health check path: `/health` (`/health/db` also queries the database)

---

### Demo mode (private sandboxes)

Logging in with the public demo account (`DEMO_EMAIL`, default `demo@demo.com`) never shows shared data: each login creates a **private, throwaway copy** of the template business (`DEMO_SLUG`, default `demo-negocio`) with its own user, services, working hours and bookings. Visitors can add, edit and delete anything without affecting anyone else. Copies are deleted automatically 24 hours after creation (their token expires at the same time) and are capped at 300 active copies. Bookings of the template are slid forward so the newest one lands on today.

To give the template realistic bookings (and remove the leftover test service), run `server/src/database/seeds/demo_sample_bookings.sql` in the database SQL editor (on databases that still have the legacy `no_past_booking` check, run migration `004` first; the script stops with a clear message otherwise). It is safe to re-run. If copying the template's bookings is ever refused by the database, the demo login still works, just without bookings.

### Keeping the free tier alive

Supabase pauses free projects after 7 days without activity, and Render puts free services to sleep after 15 minutes. The scheduled workflow `.github/workflows/keep-alive.yml` calls `GET /health/db` (which runs `SELECT 1`) every day, so the database counts as active and the service is warm. If the check fails, the run turns red and GitHub e-mails you. GitHub disables scheduled workflows after 60 days without repository activity; any push re-enables it.

### Frontend Deployment (Vercel)

1. Import repository, root directory `client`
2. VITE_API_URL=https://your-render-backend-url
3. Deploy

---
