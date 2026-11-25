# SaaS vs CRUD, known limitations and next steps

## SaaS vs CRUD: conceptual difference

This project intentionally goes beyond CRUD.

### CRUD Application

- Basic create/read/update/delete
- No business constraints
- No product-level logic
- No analytics or reporting

### SaaS Application (Slotify Approach)

- Business rules (conflict detection, past-slot protection, race-safe bookings)
- Smart availability engine
- Public + private flows
- Secure cancellation mechanism
- Revenue tracking
- Export functionality
- Service soft activation

Slotify was designed with SaaS thinking, not simple data manipulation.

## Known Limitations

- **No timezone support:** "past slot" checks for today use the server clock (UTC on Render).
- **Availability is per service:** two different services can be booked at the same time (there is no staff/resource model).
- **No email notifications:** the booking code and cancellation link are only shown on the confirmation screen.
- **No frontend tests** yet.
- **Demo copies are temporary:** a demo session is deleted after 24 hours; anything created with a real account is permanent.
- **Error messages from the API** are translated when they are known; any other message is shown as received (in English).

---

## Production-Ready Improvements

If evolving this into a production SaaS:

- Email confirmation integration
- Stripe payment flow
- Per-role permissions (owner / admin / member roles are stored, but every member currently has the same access)
- Organization switcher in the UI (the data model already supports several organizations per user)
- Business branding (logo and colors)
- Timezone support
- File upload storage (S3 / Supabase Storage)
- Dockerization
- End-to-end and frontend tests

