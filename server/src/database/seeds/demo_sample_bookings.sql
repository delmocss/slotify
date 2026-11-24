-- =====================================================================================
-- Slotify: sample bookings for the public demo template ("demo-negocio")
--
-- Why: every demo login receives a private copy of the "demo-negocio" business. If the
-- template has no bookings, the dashboard, the chart and the bookings list look empty.
-- This script gives the template ~19 realistic bookings around today and removes the
-- leftover test service "hola".
--
-- How to run: Supabase dashboard -> project "slotify" -> SQL Editor -> paste -> Run.
-- It is safe to run more than once: previous sample bookings (codes SLT-DEMO..) are
-- replaced, nothing else is touched. It runs in one transaction: if anything fails,
-- nothing is changed.
--
-- Only the template business is affected. Visitors' sandboxes copy the template when
-- they log in, so sandboxes that already exist will not get the new bookings (they
-- expire after 24 h); every new demo login will.
--
-- Bookings are spread over the last 9 days and the next 3, dates relative to the day the
-- script is run (rerun it from time to time to keep the demo looking recent). Services
-- are taken from the template's ACTIVE services, cycling through them.
-- =====================================================================================

BEGIN;

-- 0. Guard: stop if the template does not exist.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM businesses WHERE slug = 'demo-negocio') THEN
    RAISE EXCEPTION 'Template business "demo-negocio" not found: nothing was changed';
  END IF;
END $$;

-- 1. Remove the leftover test service (its bookings, if any, go with it: ON DELETE CASCADE).
DELETE FROM services
WHERE business_id = (SELECT id FROM businesses WHERE slug = 'demo-negocio')
  AND lower(trim(name)) = 'hola';

-- 2. Remove the sample bookings of a previous run (re-runnable).
DELETE FROM bookings
WHERE business_id = (SELECT id FROM businesses WHERE slug = 'demo-negocio')
  AND booking_code LIKE 'SLT-DEMO%';

-- 3. Insert the sample bookings.
WITH tpl AS (
  SELECT id FROM businesses WHERE slug = 'demo-negocio'
),
svc AS (
  SELECT s.id,
         s.duration_minutes,
         row_number() OVER (ORDER BY s.created_at, s.name) - 1 AS rn,
         count(*)     OVER ()                                 AS n
  FROM services s, tpl
  WHERE s.business_id = tpl.id AND s.is_active
),
people (i, client_name, client_email) AS (
  VALUES
    (0,  'Ana Pérez',        'ana.perez@example.com'),
    (1,  'Luis García',      'luis.garcia@example.com'),
    (2,  'María López',      'maria.lopez@example.com'),
    (3,  'Carlos Ruiz',      'carlos.ruiz@example.com'),
    (4,  'Elena Martín',     'elena.martin@example.com'),
    (5,  'Pablo Sanz',       'pablo.sanz@example.com'),
    (6,  'Lucía Díaz',       'lucia.diaz@example.com'),
    (7,  'Javier Moreno',    'javier.moreno@example.com'),
    (8,  'Carmen Torres',    'carmen.torres@example.com'),
    (9,  'Sergio Navarro',   'sergio.navarro@example.com'),
    (10, 'Laura Gil',        'laura.gil@example.com'),
    (11, 'Andrés Romero',    'andres.romero@example.com'),
    (12, 'Paula Vega',       'paula.vega@example.com'),
    (13, 'Diego Ortega',     'diego.ortega@example.com'),
    (14, 'Marta Castillo',   'marta.castillo@example.com'),
    (15, 'Raúl Herrera',     'raul.herrera@example.com'),
    (16, 'Nuria Campos',     'nuria.campos@example.com'),
    (17, 'Iván Prieto',      'ivan.prieto@example.com'),
    (18, 'Silvia Ramos',     'silvia.ramos@example.com')
),
plan (i, day_offset, start_time, status) AS (
  VALUES
    (0,  -9, TIME '10:00', 'confirmed'),
    (1,  -8, TIME '09:30', 'confirmed'),
    (2,  -8, TIME '12:00', 'confirmed'),
    (3,  -7, TIME '16:00', 'cancelled'),
    (4,  -6, TIME '10:30', 'confirmed'),
    (5,  -6, TIME '17:00', 'confirmed'),
    (6,  -5, TIME '11:00', 'confirmed'),
    (7,  -4, TIME '09:00', 'confirmed'),
    (8,  -3, TIME '13:00', 'confirmed'),
    (9,  -3, TIME '16:30', 'cancelled'),
    (10, -2, TIME '10:00', 'confirmed'),
    (11, -2, TIME '12:30', 'confirmed'),
    (12, -1, TIME '09:30', 'confirmed'),
    (13, -1, TIME '15:00', 'confirmed'),
    (14,  0, TIME '11:00', 'confirmed'),
    (15,  0, TIME '16:00', 'confirmed'),
    (16,  1, TIME '10:00', 'confirmed'),
    (17,  2, TIME '12:00', 'confirmed'),
    (18,  3, TIME '09:30', 'cancelled')
)
INSERT INTO bookings
  (business_id, service_id, booking_code, cancel_token, client_name, client_email,
   date, start_time, end_time, status)
SELECT tpl.id,
       svc.id,
       'SLT-DEMO' || lpad(plan.i::text, 2, '0'),
       replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
       people.client_name,
       people.client_email,
       CURRENT_DATE + plan.day_offset,
       plan.start_time,
       (plan.start_time + make_interval(mins => svc.duration_minutes))::time,
       plan.status::booking_status
FROM plan
JOIN people ON people.i = plan.i
CROSS JOIN tpl
JOIN svc ON svc.rn = plan.i % (SELECT count(*) FROM svc);

-- 4. Sanity check: refuse to commit if no bookings were created (e.g. no active services).
DO $$
DECLARE
  created int;
BEGIN
  SELECT count(*) INTO created
  FROM bookings k JOIN businesses b ON b.id = k.business_id
  WHERE b.slug = 'demo-negocio' AND k.booking_code LIKE 'SLT-DEMO%';

  IF created = 0 THEN
    RAISE EXCEPTION 'No sample bookings were created (does the template have active services?): nothing was changed';
  END IF;
END $$;

COMMIT;

-- 5. Result (read-only): what the template looks like now.
SELECT s.name AS service,
       s.is_active,
       count(k.id) FILTER (WHERE k.status = 'confirmed') AS confirmed,
       count(k.id) FILTER (WHERE k.status = 'cancelled') AS cancelled
FROM services s
JOIN businesses b ON b.id = s.business_id AND b.slug = 'demo-negocio'
LEFT JOIN bookings k ON k.service_id = s.id
GROUP BY s.id, s.name, s.is_active
ORDER BY s.name;
