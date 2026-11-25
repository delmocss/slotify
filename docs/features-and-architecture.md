# Features, architecture and security

## Project Structure

```text
slotify/
├── client/                  # React + Vite + TypeScript
│   └── src/
│       ├── app/             # router and providers
│       ├── components/      # shared UI components
│       ├── features/        # auth, dashboard, landing, public-booking, services, working-hours
│       ├── lib/             # axios instance, helpers, i18n (en/es dictionaries)
│       └── types/
│
└── server/                  # Express + PostgreSQL
    ├── src/
    │   ├── config/          # env validation, db pool
    │   ├── middlewares/     # auth, validation, errors, rate limits
    │   ├── modules/         # analytics, auth, availability, bookings, public, services, working-hours
    │   ├── database/        # schema.sql (fresh install), migrations/ (upgrade path), seeds/ (demo data)
    │   └── utils/           # jwt, hashing, csv, errors
    └── tests/               # Vitest + Supertest (unit) and tests/integration (real Postgres)

.github/workflows/           # ci.yml (lint, build, tests) and keep-alive.yml (daily DB ping)
```

### Design Principles

- Separation of concerns
- Feature-based organization
- Explicit typing
- Destructive actions ask for confirmation (deleting a service also removes its bookings)
- Clear public vs authenticated boundaries

---

## Architectural Considerations

- Tenant-scoped queries prevent data leakage between organizations.
- Registration is atomic: user, organization, membership and business are created in a single
  transaction (rolled back on any failure) and public slugs are collision-safe.
- Schema changes ship as numbered SQL migrations that preserve existing data.
- Services can be deactivated (soft toggle, hidden from the public page) or deleted.
- Separation between public and authenticated routes.
- Explicit typing to prevent runtime inconsistencies.

---

## Core Functional Features

### Public Booking Flow

- Service selection
- Smart slot generation
- Time grouping (Morning / Afternoon / Evening)
- Fully booked state handling
- Unique booking code generation
- Secure public cancellation via token
- Professional confirmation screen

---

### Business Dashboard

- Revenue metrics (total and current month) and bookings of the last 7 days
- Booking activity chart and cancel rate
- Filters by status, date and client
- Bookings list (table on desktop, cards on phones and tablets)
- CSV export by date range
- Services: create, edit, delete (with confirmation) and activate / deactivate, with inline validation
- Working hours per weekday, with several time ranges
- Cancel bookings from the dashboard

---

### Availability Engine

- Dynamic slot generation
- Conflict detection
- Status-based filtering (confirmed vs cancelled)
- Non-overlapping time slots

---

### Analytics

- Total revenue and current-month revenue
- Booking volume of the last 7 days (same window as the chart)
- Cancel rate = cancelled / (confirmed + cancelled)
- Range-based CSV export (validated dates, spreadsheet-formula-safe)

---

### UX & Product Considerations

- Skeleton loading states
- Explicit empty states
- Animated transitions
- Clear booking progression
- SaaS-style dark theme
- Responsive design: phones, tablets, desktops and window resizing
- English / Spanish interface with a persistent language switch
- Custom calendar date picker
- Copyable booking codes

---

## Security & Robustness

- JWT-based authentication (HS256 pinned, secret validated at startup)
- CORS restricted to the configured frontend origin (`CORS_ORIGIN`)
- Security headers with `helmet`
- Rate limiting: general API, login/register (brute force) and public bookings/cancellation (spam)
- Secure cancellation tokens (crypto-based)
- Race-safe booking creation (Postgres advisory lock per business/service/day)
- Strict TypeScript (no `any`)
- Centralized error middleware
- Tenant-scoped queries with a live membership/role check on every request
- Malformed or oversized JSON bodies are rejected with 400/413, not 500
