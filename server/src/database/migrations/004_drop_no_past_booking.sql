-- 004: drop the legacy CHECK (date >= CURRENT_DATE) on bookings.
--
-- Some databases created before the numbered migrations carry a constraint called
-- "no_past_booking" that schema.sql never had. It is harmful:
--   * Postgres re-checks every CHECK on UPDATE, so once a booking's date has passed it can
--     no longer be modified at all: cancelling yesterday's booking from the dashboard fails
--     with 23514 (a 500 in the API).
--   * It rejects any booking dated in the past, which the demo template and its sandbox
--     copies (see demo-sandbox.service.ts) legitimately contain.
-- It is also redundant: the API already refuses to create bookings for past dates and past
-- time slots (bookings.service.ts, "Cannot book past dates / time slots").
--
-- Idempotent: safe to run on databases that do not have the constraint.

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS no_past_booking;
