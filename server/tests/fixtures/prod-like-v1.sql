-- Replica del esquema HIBRIDO de produccion (Supabase, comprobado 2026-11-06)
-- con datos de ejemplo: businesses.id != organization_id en todas las filas.
-- Solo para probar migraciones en local. Todas las claves: demo1234.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE, password_hash text NOT NULL, created_at timestamp DEFAULT now());
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL, created_at timestamp DEFAULT now());
CREATE TABLE organization_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  created_at timestamp DEFAULT now(), UNIQUE (organization_id, user_id));
CREATE TABLE businesses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL, email text NOT NULL UNIQUE, password_hash text NOT NULL,
  created_at timestamp DEFAULT now(), slug text UNIQUE,
  organization_id uuid NOT NULL);           -- sin FK, como en produccion
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL, duration_minutes int NOT NULL CHECK (duration_minutes > 0),
  price numeric NOT NULL CHECK (price >= 0), created_at timestamp DEFAULT now(),
  is_active boolean DEFAULT true, slug text NOT NULL, UNIQUE (business_id, slug));
CREATE TABLE working_hours (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week int NOT NULL, start_time time NOT NULL, end_time time NOT NULL,
  CHECK (start_time < end_time));
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  client_name text NOT NULL, client_email text NOT NULL, date date NOT NULL,
  start_time time NOT NULL, end_time time NOT NULL,
  status booking_status DEFAULT 'confirmed', created_at timestamp DEFAULT now(),
  booking_code varchar UNIQUE, cancel_token varchar UNIQUE,
  CHECK (start_time < end_time));
CREATE INDEX idx_services_business_id ON services(business_id);
CREATE INDEX idx_working_hours_business_id ON working_hours(business_id);
CREATE INDEX idx_bookings_business_date ON bookings(business_id, date);
CREATE UNIQUE INDEX unique_booking_per_slot
  ON bookings(business_id, service_id, date, start_time) WHERE status = 'confirmed';

-- Datos: 8 negocios, cada uno con una organizacion de id DISTINTO (como en produccion)
DO $$
DECLARE
  rows text[] := ARRAY[
    'Demo Negocio|demo@demo.com|demo-negocio',
    'Mi negocio|test@test.com|mi-negocio',
    'El Corte Clásico|elcorteclasico@negocio.com|el-corte-clásico',
    'Alma Zen|almazen@negocio.com|alma-zen',
    'Patitas Felices|patitasfelices@negocio.com|patitas-felices',
    'Autoescuela Vía Libre|vialibre@negocio.com|autoescuela-vía-libre',
    'Luz & Sombra|luzysombra@negocio.com|luz-&-sombra',
    'Movimiento Vital|movimientovital@negocio.com|movimiento-vital'];
  r text; nm text; em text; sl text; pw text; uid uuid; oid uuid; bid uuid; sid uuid; i int;
BEGIN
  pw := crypt('demo1234', gen_salt('bf', 10));
  FOREACH r IN ARRAY rows LOOP
    nm := split_part(r, '|', 1); em := split_part(r, '|', 2); sl := split_part(r, '|', 3);
    INSERT INTO users (email, password_hash) VALUES (em, pw) RETURNING id INTO uid;
    INSERT INTO organizations (name) VALUES (nm) RETURNING id INTO oid;
    INSERT INTO organization_members (organization_id, user_id, role) VALUES (oid, uid, 'owner');
    INSERT INTO businesses (name, email, password_hash, slug, organization_id)
      VALUES (nm, em, pw, sl, oid) RETURNING id INTO bid;
    FOR i IN 1..3 LOOP
      INSERT INTO services (business_id, name, duration_minutes, price, slug)
        VALUES (bid, 'Servicio ' || i, 30 * i, 10 * i, 'servicio-' || i) RETURNING id INTO sid;
      INSERT INTO bookings (business_id, service_id, client_name, client_email, date, start_time, end_time,
                            status, booking_code, cancel_token)
        VALUES (bid, sid, 'Cliente ' || i, 'c' || i || '@x.com', DATE '2026-02-22' + i, '10:00', '10:30',
                CASE WHEN i = 3 THEN 'cancelled' ELSE 'confirmed' END::booking_status,
                'BK' || replace(bid::text, '-', '') || i, 'CT' || replace(bid::text, '-', '') || i);
    END LOOP;
    FOR i IN 1..5 LOOP
      INSERT INTO working_hours (business_id, day_of_week, start_time, end_time)
        VALUES (bid, i, '09:00', '17:00');
    END LOOP;
  END LOOP;
END $$;

-- Las reservas de ejemplo son pasadas: el CHECK de produccion se crea DESPUES, como
-- NOT VALID, igual que en produccion (filas antiguas lo incumplen y nadie las toca).
ALTER TABLE bookings ADD CONSTRAINT no_past_booking CHECK (date >= CURRENT_DATE) NOT VALID;
