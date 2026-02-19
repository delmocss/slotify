CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================
-- BUSINESSES
-- ==========================
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================
-- SERVICES
-- ==========================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_services_business_id ON services(business_id);

-- ==========================
-- WORKING HOURS
-- ==========================
CREATE TABLE working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CHECK (start_time < end_time)
);

CREATE INDEX idx_working_hours_business_id ON working_hours(business_id);

-- ==========================
-- BOOKINGS
-- ==========================
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled');

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    booking_code TEXT UNIQUE NOT NULL,
    cancel_token TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status booking_status DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT NOW(),
    CHECK (start_time < end_time)
);

CREATE INDEX idx_bookings_business_date ON bookings(business_id, date);
